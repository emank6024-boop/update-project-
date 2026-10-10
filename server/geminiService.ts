import { GoogleGenAI } from '@google/genai';

// Lazy initialization of Gemini client
let geminiClient: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Helper to prevent hanging API calls
export function callGeminiWithTimeout<T>(promise: Promise<T>, timeoutMs = 15000): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Gemini call timed out after ${timeoutMs}ms`)), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  });
}

// In-memory High-Performance Server Cache with LRU eviction and TTL
export class ServerLRUCache<T> {
  private cache = new Map<string, { value: T; expiry: number }>();
  constructor(private maxEntries = 500, private defaultTtlMs = 60 * 60 * 1000) {}

  get(key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    // Refresh position for LRU
    this.cache.delete(key);
    this.cache.set(key, item);
    return item.value;
  }

  set(key: string, value: T, ttlMs = this.defaultTtlMs): void {
    if (this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, { value, expiry: Date.now() + ttlMs });
  }
}

export const sharedAiCache = new ServerLRUCache<string>(500, 30 * 60 * 1000);

// In-flight request deduplication map to prevent duplicate concurrent API calls
const inFlightRequests = new Map<string, Promise<any>>();

export async function deduplicateRequest<T>(key: string, factory: () => Promise<T>): Promise<T> {
  const existing = inFlightRequests.get(key);
  if (existing) {
    return existing as Promise<T>;
  }
  const promise = factory().finally(() => {
    inFlightRequests.delete(key);
  });
  inFlightRequests.set(key, promise);
  return promise;
}

// Fast low-latency models with generous quota first
export const CANDIDATE_GEMINI_MODELS = [
  'gemini-3.1-flash-lite-preview',
  'gemini-flash-latest',
  'gemini-3-flash-preview',
];

let preferredWorkingModel: string | null = 'gemini-3.1-flash-lite-preview';

// Track rate-limited models (429 / RESOURCE_EXHAUSTED) so we skip them during cooldown
const rateLimitedModels = new Map<string, number>();

export function markModelRateLimited(modelName: string, cooldownMs = 15 * 60 * 1000): void {
  rateLimitedModels.set(modelName, Date.now() + cooldownMs);
  if (preferredWorkingModel === modelName) {
    const nextAvailable = CANDIDATE_GEMINI_MODELS.find((m) => !isModelRateLimited(m));
    preferredWorkingModel = nextAvailable || CANDIDATE_GEMINI_MODELS[0];
  }
}

export function isModelRateLimited(modelName: string): boolean {
  const expiry = rateLimitedModels.get(modelName);
  if (!expiry) return false;
  if (Date.now() > expiry) {
    rateLimitedModels.delete(modelName);
    return false;
  }
  return true;
}

export function getOrderedCandidateModels(): string[] {
  const baseOrder = preferredWorkingModel
    ? [
        preferredWorkingModel,
        ...CANDIDATE_GEMINI_MODELS.filter((m) => m !== preferredWorkingModel),
      ]
    : [...CANDIDATE_GEMINI_MODELS];

  const available = baseOrder.filter((m) => !isModelRateLimited(m));
  const limited = baseOrder.filter((m) => isModelRateLimited(m));
  return [...available, ...limited];
}

export function markWorkingModel(modelName: string): void {
  rateLimitedModels.delete(modelName);
  preferredWorkingModel = modelName;
}

/**
  * Returns an optimized generation config that disables unnecessary chain-of-thought
  * thinking latency on flash models so Urdu, Punjabi, Sindhi, Pashto, Balochi, and
  * English responses start streaming/returning in <1 second.
  */
export function getFastModelConfig(
  modelName: string,
  baseConfig: Record<string, any> = {}
): Record<string, any> {
  const config: Record<string, any> = { ...baseConfig };
  if (
    modelName.includes('flash') &&
    !modelName.includes('flash-lite-latest') &&
    !config.thinkingConfig &&
    !config.tools
  ) {
    config.thinkingConfig = { thinkingBudget: 0 };
  }
  return config;
}

export function isQuotaExhaustedError(err: any): boolean {
  if (!err) return false;
  if (err.status === 429) return true;
  const msg = typeof err.message === 'string' ? err.message : JSON.stringify(err);
  return msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED');
}

// Resilient candidate model execution that remembers the fastest working model and skips rate-limited models
export async function callWithCandidateModels<T>(
  actionName: string,
  operation: (modelName: string) => Promise<T>,
  timeoutMs = 14000
): Promise<T> {
  let lastError: any = null;
  const models = getOrderedCandidateModels();

  for (const modelName of models) {
    try {
      const result = await callGeminiWithTimeout(operation(modelName), timeoutMs);
      if (result) {
        markWorkingModel(modelName);
        return result;
      }
    } catch (err: any) {
      lastError = err;
      if (isQuotaExhaustedError(err)) {
        markModelRateLimited(modelName);
      }
    }
  }

  throw lastError || new Error(`All candidate models failed for ${actionName}`);
}
