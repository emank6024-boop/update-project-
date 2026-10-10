import { Router, Request, Response } from 'express';
import { Modality } from '@google/genai';
import {
  getGemini,
  callGeminiWithTimeout,
  isQuotaExhaustedError,
  deduplicateRequest,
} from '../geminiService.js';
import { resolveEffectiveLanguage } from '../languageDirectives.js';

export const ttsRouter = Router();

// Helper: Convert 16-bit linear PCM buffer to standard WAV format (only used if buffer is raw headerless PCM)
export function pcmToWav(
  pcmBuffer: Buffer,
  sampleRate = 24000,
  numChannels = 1,
  bitsPerSample = 16
): Buffer {
  // Check if buffer already has a RIFF WAVE header (e.g. from gemini-3.8-flash-tts)
  if (
    pcmBuffer.length > 44 &&
    pcmBuffer.toString('ascii', 0, 4) === 'RIFF' &&
    pcmBuffer.toString('ascii', 8, 12) === 'WAVE'
  ) {
    return pcmBuffer;
  }

  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // Linear PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

// Clean markdown and decorative symbols while preserving all Urdu, Pashto, Sindhi, Punjabi, and Balochi letters
export function cleanTextForNaturalSpeech(rawText: string): string {
  return rawText
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[ \t]*\|?[ \t]*:?-+:?[ \t]*(\|[ \t]*:?-+:?[ \t]*)+\|?[ \t]*$/gm, ' ')
    .replace(/\|/g, '، ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~]+/g, '')
    .replace(/[📘💡✅📝📌📊🌍🔎⚠️🎯🏛️🌾⚖️🩺📚🧠🔬💻🔢⚛️🧪🧬📖🖋️🌙🔊🎤]/gu, '')
    .replace(/\n{2,}/g, '۔ ')
    .replace(/\n/g, '، ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// High-speed in-memory cache for synthesized audio
const ttsAudioCache = new Map<
  string,
  { audioBase64: string; mimeType: string; timestamp: number }
>();

// Prioritize fast, active Gemini TTS models first
const TTS_CANDIDATE_MODELS = [
  'gemini-3.8-flash-tts',
  'gemini-3.8-flash-lite-tts',
  'gemini-2.5-flash-preview-tts',
];

let preferredTtsModel: string | null = 'gemini-3.8-flash-tts';

function getOrderedTtsModels(): string[] {
  if (!preferredTtsModel) return TTS_CANDIDATE_MODELS;
  return [
    preferredTtsModel,
    ...TTS_CANDIDATE_MODELS.filter((m) => m !== preferredTtsModel),
  ];
}

/**
 * Resilient server-side multilingual speech stream fallback (used if Gemini TTS quota is temporarily exhausted)
 * Supports Urdu (ur), Pashto (ps), Sindhi (sd), Punjabi (pa/ur), Balochi (ur phonetic), and English (en).
 */
async function fetchServerSpeechFallback(
  text: string,
  langCode: string
): Promise<{ audioBase64: string; mimeType: string } | null> {
  try {
    const code = (langCode || 'ur').toLowerCase().trim();
    // Map regional Perso-Arabic scripts to best supported phonetic speech voice in fallback
    const tlMap: Record<string, string> = {
      en: 'en',
      ur: 'ur',
      roman_ur: 'ur',
      roman: 'ur',
      pa: 'ur', // Shahmukhi Punjabi is Perso-Arabic; 'pa' in Google Translate expects Gurmukhi, whereas 'ur' reads Shahmukhi script accurately
      sd: 'ur', // Reads Perso-Arabic smoothly
      ps: 'ur', // Reads Pashto Perso-Arabic script smoothly if cloud neural is rate-limited
      bal: 'ur', // Reads Balochi Perso-Arabic script smoothly
      skr: 'ur',
      hnd: 'ur',
      ks: 'ur',
      brh: 'ur',
    };
    const tl = tlMap[code] || 'ur';
    const shortChunk = text.slice(0, 200).trim();
    if (!shortChunk) return null;

    const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      shortChunk
    )}&tl=${tl}&client=tw-ob`;

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength < 200) return null;

    return {
      audioBase64: Buffer.from(arrayBuffer).toString('base64'),
      mimeType: 'audio/mpeg',
    };
  } catch {
    return null;
  }
}

// PakLingo AI Text-to-Speech Engine Status & Voices
ttsRouter.get('/api/tts/status', (_req: Request, res: Response) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({
    geminiTTSAvailable: hasKey,
    hasGeminiKey: hasKey,
    voices: [
      { id: 'Kore', name: 'Kore (Natural & Clear - Recommended)', gender: 'Female' },
      { id: 'Zephyr', name: 'Zephyr (Warm & Expressive)', gender: 'Female' },
      { id: 'Puck', name: 'Puck (Friendly & Engaging)', gender: 'Male' },
      { id: 'Fenrir', name: 'Fenrir (Deep & Professional)', gender: 'Male' },
      { id: 'Charon', name: 'Charon (Calm & Informative)', gender: 'Male' },
    ],
  });
});

// PakLingo AI Multilingual Text-to-Speech Generation Endpoint
ttsRouter.post('/api/tts', async (req: Request, res: Response) => {
  const { text, language = 'ur', voice = 'Kore' } = req.body;
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Text is required for TTS synthesis.' });
  }

  const cleanedText = cleanTextForNaturalSpeech(text);
  if (!cleanedText) {
    return res.status(400).json({ error: 'No speakable text found.' });
  }

  const effectiveLang = resolveEffectiveLanguage(cleanedText, language);

  // Keep each TTS request concise for low-latency response; client chunks longer text automatically
  const safeText = cleanedText.slice(0, 800);

  const validVoices = ['Kore', 'Zephyr', 'Puck', 'Fenrir', 'Charon'];
  const chosenVoice = validVoices.includes(voice) ? voice : 'Kore';

  const cacheKey = `${effectiveLang}_${chosenVoice}_${safeText}`;
  const cached = ttsAudioCache.get(cacheKey);
  if (cached) {
    return res.json({
      success: true,
      audioBase64: cached.audioBase64,
      mimeType: cached.mimeType,
      provider: 'gemini-tts-cached',
      language: effectiveLang,
      voice: chosenVoice,
    });
  }

  const ai = getGemini();
  if (!ai) {
    const fallbackAudio = await fetchServerSpeechFallback(safeText, effectiveLang);
    if (fallbackAudio) {
      return res.json({
        success: true,
        audioBase64: fallbackAudio.audioBase64,
        mimeType: fallbackAudio.mimeType,
        provider: 'server-speech-fallback',
        language: effectiveLang,
        voice: chosenVoice,
      });
    }
    return res.status(503).json({
      success: false,
      error: 'AI_UNAVAILABLE',
      message: 'Gemini API not configured. Falling back to verified browser speech synthesis.',
      fallbackToBrowser: true,
    });
  }

  try {
    const result = await deduplicateRequest(`tts_${cacheKey}`, async () => {
      let lastError: any = null;
      const models = getOrderedTtsModels();

      for (const modelName of models) {
        try {
          const response = await callGeminiWithTimeout(
            ai.models.generateContent({
              model: modelName,
              contents: [{ parts: [{ text: safeText }] }],
              config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: chosenVoice },
                  },
                },
              },
            }),
            12000
          );

          const inlineData = response?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
          if (inlineData?.data) {
            preferredTtsModel = modelName;
            const rawBuffer = Buffer.from(inlineData.data, 'base64');
            // Avoid double WAV headers: pcmToWav checks if RIFF header is already present
            const wavBuffer = pcmToWav(rawBuffer, 24000, 1, 16);
            const audioBase64 = wavBuffer.toString('base64');
            const mimeType = 'audio/wav';

            if (ttsAudioCache.size > 400) {
              const oldestKey = ttsAudioCache.keys().next().value;
              if (oldestKey) ttsAudioCache.delete(oldestKey);
            }
            ttsAudioCache.set(cacheKey, { audioBase64, mimeType, timestamp: Date.now() });

            return {
              audioBase64,
              mimeType,
              provider: 'gemini-tts',
            };
          }
        } catch (err: any) {
          lastError = err;
        }
      }

      // If Gemini TTS models encountered rate limits, use server speech fallback for instant audio
      const fallbackAudio = await fetchServerSpeechFallback(safeText, effectiveLang);
      if (fallbackAudio) {
        ttsAudioCache.set(cacheKey, {
          audioBase64: fallbackAudio.audioBase64,
          mimeType: fallbackAudio.mimeType,
          timestamp: Date.now(),
        });
        return {
          audioBase64: fallbackAudio.audioBase64,
          mimeType: fallbackAudio.mimeType,
          provider: 'server-speech-fallback',
        };
      }

      throw lastError || new Error('All TTS models failed');
    });

    return res.json({
      success: true,
      audioBase64: result.audioBase64,
      mimeType: result.mimeType,
      provider: result.provider,
      language: effectiveLang,
      voice: chosenVoice,
    });
  } catch (lastError: any) {
    console.error('Gemini TTS error across candidate models:', lastError?.message || lastError);
    const isQuota = isQuotaExhaustedError(lastError);
    return res.status(isQuota ? 429 : 503).json({
      success: false,
      error: isQuota ? 'QUOTA_EXHAUSTED' : 'TTS_SERVICE_ERROR',
      message: isQuota
        ? 'Cloud TTS rate limit reached. Checking local speech synthesis.'
        : 'Cloud TTS temporarily unavailable. Checking local speech synthesis.',
      fallbackToBrowser: true,
    });
  }
});
