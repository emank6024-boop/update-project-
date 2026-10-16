import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { VoiceSettings, LanguageCode } from '../types';
import { getLanguageBCP47 } from '../i18n';
import { detectLanguageFromText } from '../config/languageConfig';

export interface VoiceSupportInfo {
  isSupported: boolean;
  hasNativeVoice: boolean;
  voiceName: string | null;
  langTag: string;
  engineType: 'browser' | 'cloud-neural' | 'unsupported';
  message: string;
}

interface VoiceSettingsContextType {
  settings: VoiceSettings;
  voiceSettings: VoiceSettings;
  updateSettings: (partial: Partial<VoiceSettings>) => void;
  updateVoiceSettings: (partial: Partial<VoiceSettings>) => void;
  isVoiceModalOpen: boolean;
  isModalOpen: boolean;
  openVoiceModal: () => void;
  closeVoiceModal: () => void;
  speak: (text: string, langCode?: string) => Promise<boolean>;
  pauseSpeaking: () => void;
  resumeSpeaking: () => void;
  stopSpeaking: () => void;
  replaySpeaking: () => Promise<boolean>;
  isSpeaking: boolean;
  isPaused: boolean;
  isLoadingAudio: boolean;
  lastSpokenText: string;
  lastSpokenLang: string;
  lastVoiceMessage: string | null;
  voiceNotice: string | null;
  clearVoiceMessage: () => void;
  clearVoiceNotice: () => void;
  availableVoices: SpeechSynthesisVoice[];
  checkVoiceSupport: (langCode: string) => VoiceSupportInfo;
}

const DEFAULT_SETTINGS: VoiceSettings = {
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  autoPlay: false,
  selectedVoiceURI: undefined,
};

const STORAGE_KEY = 'paklingo_voice_settings_v2';

// Memoization cache for language detection so it never runs repeatedly on the same text
const languageDetectionCache = new Map<string, string>();

// Client-side audio DataURL cache so replaying any chunk is instantaneous (0ms)
const clientAudioChunkCache = new Map<string, string>();

/**
 * Detects the dominant language/script of a text snippet so TTS always matches the actual text language.
 * Memoized for zero repeated processing overhead.
 */
export function detectSpeechLanguage(text: string, fallbackLang = 'ur'): string {
  if (!text || !text.trim()) return fallbackLang;

  const sample = text.slice(0, 600).trim();
  const cacheKey = `${fallbackLang}__${sample}`;
  const cached = languageDetectionCache.get(cacheKey);
  if (cached) return cached;

  const detected = detectLanguageFromText(sample, (fallbackLang || 'ur') as LanguageCode);

  if (languageDetectionCache.size > 400) {
    const firstKey = languageDetectionCache.keys().next().value;
    if (firstKey) languageDetectionCache.delete(firstKey);
  }
  languageDetectionCache.set(cacheKey, detected);
  return detected;
}

// Clean markdown formatting symbols for natural spoken rhythm
export function stripMarkdownForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[ \t]*\|?[ \t]*:?-+:?[ \t]*(\|[ \t]*:?-+:?[ \t]*)+\|?[ \t]*$/gm, ' ')
    .replace(/\|/g, ', ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~]+/g, '')
    .replace(/[📘💡✅📝📌📊🌍🔎⚠️🎯🏛️🌾⚖️🩺📚🧠🔬💻🔢⚛️🧪🧬📖🖋️🌙]/gu, '')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Splits cleaned text into progressive audio chunks so the first chunk is concise (~120 chars)
 * and begins playing within ~1.5 seconds, while subsequent chunks prefetch in the background.
 */
function splitIntoProgressiveSpeechChunks(cleanedText: string): string[] {
  if (!cleanedText) return [];
  if (cleanedText.length <= 130) return [cleanedText];

  // Split by Urdu/Arabic full stop (۔), question mark (؟ / ?), exclamation (!), period (.), or newline
  const rawSentences = cleanedText
    .split(/(?<=[.۔؟?!؛;\n])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (rawSentences.length <= 1) {
    // Fallback split by comma or word boundaries if no sentence punctuation
    const chunks: string[] = [];
    let remaining = cleanedText;
    let isFirst = true;
    while (remaining.length > 0) {
      const maxLen = isFirst ? 120 : 340;
      if (remaining.length <= maxLen) {
        chunks.push(remaining.trim());
        break;
      }
      let cutIdx = remaining.lastIndexOf(' ', maxLen);
      if (cutIdx < 45) cutIdx = maxLen;
      chunks.push(remaining.slice(0, cutIdx).trim());
      remaining = remaining.slice(cutIdx).trim();
      isFirst = false;
    }
    return chunks.filter(Boolean);
  }

  const chunks: string[] = [];
  let current = '';
  let isFirstChunk = true;

  for (const sentence of rawSentences) {
    const targetLimit = isFirstChunk ? 125 : 350;
    if (!current) {
      if (sentence.length > targetLimit) {
        // Split overly long first sentence at a comma or space
        let cut = sentence.lastIndexOf('،', targetLimit);
        if (cut < 45) cut = sentence.lastIndexOf(',', targetLimit);
        if (cut < 45) cut = sentence.lastIndexOf(' ', targetLimit);
        if (cut < 45) cut = targetLimit;
        chunks.push(sentence.slice(0, cut).trim());
        current = sentence.slice(cut).trim();
        isFirstChunk = false;
      } else {
        current = sentence;
      }
    } else if (current.length + 1 + sentence.length <= targetLimit) {
      current += ' ' + sentence;
    } else {
      chunks.push(current.trim());
      current = sentence;
      isFirstChunk = false;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks.slice(0, 10); // Cap at 10 chunks (~3300 chars max)
}

const VoiceSettingsContext = createContext<VoiceSettingsContextType | undefined>(undefined);

export const VoiceSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<VoiceSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // ignore storage error
    }
    return DEFAULT_SETTINGS;
  });

  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [lastSpokenText, setLastSpokenText] = useState('');
  const [lastSpokenLang, setLastSpokenLang] = useState('ur');
  const [lastVoiceMessage, setLastVoiceMessage] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [cloudTtsAvailable, setCloudTtsAvailable] = useState<boolean>(true);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeModeRef = useRef<'browser' | 'cloud' | null>(null);
  const playbackSessionRef = useRef<number>(0);

  // Load browser voices & check Cloud Neural TTS availability
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          setAvailableVoices(voices);
        }
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    fetch('/api/tts/status')
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.geminiTTSAvailable === 'boolean') {
          setCloudTtsAvailable(data.geminiTTSAvailable);
        }
      })
      .catch(() => {
        // keep optimistic default
      });

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const updateSettings = useCallback((partial: Partial<VoiceSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage error
      }
      if (audioRef.current) {
        if (partial.volume !== undefined) {
          audioRef.current.volume = Math.max(0, Math.min(1, partial.volume));
        }
        if (partial.rate !== undefined) {
          audioRef.current.playbackRate = Math.max(0.5, Math.min(2.0, partial.rate));
        }
      }
      return next;
    });
  }, []);

  const openVoiceModal = useCallback(() => setIsVoiceModalOpen(true), []);
  const closeVoiceModal = useCallback(() => setIsVoiceModalOpen(false), []);
  const clearVoiceMessage = useCallback(() => setLastVoiceMessage(null), []);

  /**
   * Finds a genuine native browser voice for the requested language.
   * NEVER falls back to an English voice for Urdu or Pakistani regional languages.
   */
  const findBestVoiceForLanguage = useCallback(
    (langCode: string, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
      if (!voices || voices.length === 0) return null;

      const bcp47 = getLanguageBCP47(langCode).toLowerCase();
      const primarySubtag = bcp47.split('-')[0];

      if (settings.selectedVoiceURI) {
        const preferred = voices.find((v) => v.voiceURI === settings.selectedVoiceURI);
        if (preferred) {
          const vLang = preferred.lang.toLowerCase().replace('_', '-');
          if (vLang === bcp47 || vLang.startsWith(primarySubtag + '-') || vLang === primarySubtag) {
            return preferred;
          }
        }
      }

      const exactMatch = voices.find((v) => v.lang.toLowerCase().replace('_', '-') === bcp47);
      if (exactMatch) return exactMatch;

      const prefixMatches = voices.filter((v) => {
        const vLang = v.lang.toLowerCase().replace('_', '-');
        return vLang === primarySubtag || vLang.startsWith(primarySubtag + '-');
      });

      if (prefixMatches.length > 0) {
        const pkMatch = prefixMatches.find((v) => v.lang.toLowerCase().includes('pk'));
        if (pkMatch) return pkMatch;

        const naturalMatch = prefixMatches.find(
          (v) =>
            v.name.toLowerCase().includes('natural') ||
            v.name.toLowerCase().includes('neural') ||
            v.name.toLowerCase().includes('google')
        );
        return naturalMatch || prefixMatches[0];
      }

      if (langCode === 'roman_ur' || langCode === 'roman') {
        const urOrHi = voices.find((v) => {
          const l = v.lang.toLowerCase();
          return l.startsWith('ur') || l.startsWith('hi');
        });
        if (urOrHi) return urOrHi;
      }

      return null;
    },
    [settings.selectedVoiceURI]
  );

  const checkVoiceSupport = useCallback(
    (langCode: string): VoiceSupportInfo => {
      const bcp47 = getLanguageBCP47(langCode);
      const voices =
        availableVoices.length > 0
          ? availableVoices
          : typeof window !== 'undefined' && 'speechSynthesis' in window
          ? window.speechSynthesis.getVoices()
          : [];

      const matchedVoice = findBestVoiceForLanguage(langCode, voices);

      if (matchedVoice && langCode === 'en') {
        return {
          isSupported: true,
          hasNativeVoice: true,
          voiceName: matchedVoice.name,
          langTag: matchedVoice.lang,
          engineType: 'browser',
          message: `Ready (${matchedVoice.name})`,
        };
      }

      if (cloudTtsAvailable) {
        return {
          isSupported: true,
          hasNativeVoice: Boolean(matchedVoice),
          voiceName: 'PakLingo Neural Voice (Kore)',
          langTag: bcp47,
          engineType: 'cloud-neural',
          message: `Ready (PakLingo Cloud Neural TTS — ${bcp47})`,
        };
      }

      if (matchedVoice) {
        return {
          isSupported: true,
          hasNativeVoice: true,
          voiceName: matchedVoice.name,
          langTag: matchedVoice.lang,
          engineType: 'browser',
          message: `Ready (${matchedVoice.name})`,
        };
      }

      return {
        isSupported: false,
        hasNativeVoice: false,
        voiceName: null,
        langTag: bcp47,
        engineType: 'unsupported',
        message: `Natural speech synthesis for ${langCode.toUpperCase()} (${bcp47}) is not installed on this browser.`,
      };
    },
    [availableVoices, findBestVoiceForLanguage, cloudTtsAvailable]
  );

  const stopSpeaking = useCallback(() => {
    playbackSessionRef.current += 1;

    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
      } catch {
        // ignore
      }
      audioRef.current = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    activeModeRef.current = null;
    setIsSpeaking(false);
    setIsPaused(false);
    setIsLoadingAudio(false);
  }, []);

  const pauseSpeaking = useCallback(() => {
    if (activeModeRef.current === 'cloud' && audioRef.current) {
      if (!audioRef.current.paused) {
        audioRef.current.pause();
        setIsPaused(true);
      }
      return;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    }
  }, []);

  const resumeSpeaking = useCallback(() => {
    if (activeModeRef.current === 'cloud' && audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
        setIsPaused(false);
        setIsSpeaking(true);
      }
      return;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      }
    }
  }, []);

  // Helper to fetch or retrieve cached audio DataURL for a single text chunk
  const fetchChunkAudioUrl = useCallback(async (chunkText: string, targetLang: string): Promise<string | null> => {
    const cacheKey = `${targetLang}_Kore_${chunkText}`;
    const existing = clientAudioChunkCache.get(cacheKey);
    if (existing) return existing;

    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: chunkText,
        language: targetLang,
        voice: 'Kore',
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (response.ok && data.success && data.audioBase64) {
      const audioSrc = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
      if (clientAudioChunkCache.size > 150) {
        const oldest = clientAudioChunkCache.keys().next().value;
        if (oldest) clientAudioChunkCache.delete(oldest);
      }
      clientAudioChunkCache.set(cacheKey, audioSrc);
      return audioSrc;
    }
    return null;
  }, []);

  // Helper to play a sequence of progressive audio chunks with background prefetching
  const playProgressiveCloudNeuralTTS = useCallback(
    async (cleanedText: string, targetLang: string, sessionId: number): Promise<boolean> => {
      const chunks = splitIntoProgressiveSpeechChunks(cleanedText);
      if (chunks.length === 0) return false;

      try {
        setIsLoadingAudio(true);

        // Start fetching Chunk 0 immediately
        const firstChunkPromise = fetchChunkAudioUrl(chunks[0], targetLang);
        // If there is a second chunk, kick off prefetching in parallel after a tiny stagger
        const prefetchPromises: Map<number, Promise<string | null>> = new Map();
        prefetchPromises.set(0, firstChunkPromise);

        const firstAudioSrc = await firstChunkPromise;
        if (playbackSessionRef.current !== sessionId) {
          return false;
        }

        if (!firstAudioSrc) {
          setIsLoadingAudio(false);
          return false;
        }

        // Prefetch Chunk 1 while Chunk 0 starts playing
        if (chunks.length > 1) {
          prefetchPromises.set(1, fetchChunkAudioUrl(chunks[1], targetLang));
        }

        const playSingleAudioUrl = (audioSrc: string, chunkIndex: number): Promise<boolean> => {
          return new Promise<boolean>((resolve) => {
            if (playbackSessionRef.current !== sessionId) {
              resolve(false);
              return;
            }

            if (audioRef.current) {
              try {
                audioRef.current.pause();
                audioRef.current.src = '';
              } catch {
                // ignore
              }
            }

            const audio = new Audio(audioSrc);
            audio.volume = Math.max(0, Math.min(1, settings.volume));
            audio.playbackRate = Math.max(0.5, Math.min(2.0, settings.rate));
            audioRef.current = audio;
            activeModeRef.current = 'cloud';

            // Prefetch next chunk in the queue
            const nextIndex = chunkIndex + 1;
            if (nextIndex < chunks.length && !prefetchPromises.has(nextIndex)) {
              prefetchPromises.set(nextIndex, fetchChunkAudioUrl(chunks[nextIndex], targetLang));
            }

            audio.onplay = () => {
              if (playbackSessionRef.current !== sessionId) return;
              setIsLoadingAudio(false);
              setIsSpeaking(true);
              setIsPaused(false);
              setLastVoiceMessage(null);
            };

            audio.onpause = () => {
              if (playbackSessionRef.current !== sessionId) return;
              if (!audio.ended && audio.currentTime > 0) {
                setIsPaused(true);
              }
            };

            audio.onended = () => {
              resolve(true);
            };

            audio.onerror = () => {
              resolve(false);
            };

            audio
              .play()
              .then(() => {
                setIsLoadingAudio(false);
                setIsSpeaking(true);
              })
              .catch(() => {
                resolve(false);
              });
          });
        };

        // Play Chunk 0 immediately
        const firstPlayed = await playSingleAudioUrl(firstAudioSrc, 0);
        if (!firstPlayed || playbackSessionRef.current !== sessionId) {
          if (playbackSessionRef.current === sessionId) {
            setIsSpeaking(false);
            setIsPaused(false);
            setIsLoadingAudio(false);
          }
          return firstPlayed;
        }

        // Continue playing remaining prefetched chunks seamlessly
        for (let i = 1; i < chunks.length; i++) {
          if (playbackSessionRef.current !== sessionId) break;
          let nextPromise = prefetchPromises.get(i);
          if (!nextPromise) {
            nextPromise = fetchChunkAudioUrl(chunks[i], targetLang);
            prefetchPromises.set(i, nextPromise);
          }
          const nextAudioSrc = await nextPromise;
          if (!nextAudioSrc || playbackSessionRef.current !== sessionId) break;
          const ok = await playSingleAudioUrl(nextAudioSrc, i);
          if (!ok) break;
        }

        if (playbackSessionRef.current === sessionId) {
          setIsSpeaking(false);
          setIsPaused(false);
          setIsLoadingAudio(false);
          activeModeRef.current = null;
        }
        return true;
      } catch {
        if (playbackSessionRef.current === sessionId) {
          setIsLoadingAudio(false);
        }
        return false;
      }
    },
    [fetchChunkAudioUrl, settings.rate, settings.volume]
  );

  // Helper to play using verified native Browser SpeechSynthesis
  const playBrowserTTS = useCallback(
    (cleanedText: string, matchedVoice: SpeechSynthesisVoice, targetLang: string): boolean => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang || getLanguageBCP47(targetLang);
      utterance.rate = Math.max(0.5, Math.min(2.0, settings.rate));
      utterance.pitch = Math.max(0.5, Math.min(2.0, settings.pitch));
      utterance.volume = Math.max(0.0, Math.min(1.0, settings.volume));

      activeModeRef.current = 'browser';

      utterance.onstart = () => {
        setIsLoadingAudio(false);
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        activeModeRef.current = null;
      };

      utterance.onerror = (event) => {
        setIsSpeaking(false);
        setIsPaused(false);
        activeModeRef.current = null;
        if (event.error !== 'canceled' && event.error !== 'interrupted') {
          setLastVoiceMessage(`Audio playback interrupted (${event.error}).`);
        }
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      return true;
    },
    [settings.pitch, settings.rate, settings.volume]
  );

  const speak = useCallback(
    async (text: string, langCode = 'ur'): Promise<boolean> => {
      if (typeof window === 'undefined') return false;

      const cleanedText = stripMarkdownForSpeech(text);
      if (!cleanedText) return false;

      const detectedLang = detectSpeechLanguage(cleanedText, langCode);

      setLastSpokenText(cleanedText);
      setLastSpokenLang(detectedLang);
      setLastVoiceMessage(null);

      // Stop any existing speech and start a fresh playback session
      stopSpeaking();
      const currentSessionId = playbackSessionRef.current;

      const voices =
        availableVoices.length > 0
          ? availableVoices
          : 'speechSynthesis' in window
          ? window.speechSynthesis.getVoices()
          : [];

      const matchedVoice = findBestVoiceForLanguage(detectedLang, voices);

      // 1. For English, if a high-quality native browser voice exists, play immediately; otherwise use Cloud Neural TTS
      if (detectedLang === 'en' && matchedVoice) {
        const played = playBrowserTTS(cleanedText, matchedVoice, detectedLang);
        if (played) return true;
      }

      // 2. For Urdu, Punjabi, Sindhi, Pashto, Balochi, Saraiki, Roman Urdu (and English fallback):
      // Prioritize Progressive Cloud Neural TTS so the first sentence starts playing promptly in authentic native speech
      const cloudPlayed = await playProgressiveCloudNeuralTTS(
        cleanedText,
        detectedLang,
        currentSessionId
      );
      if (cloudPlayed) {
        return true;
      }

      // 3. Fallback to verified native browser voice ONLY if one genuinely matches the target language
      if (matchedVoice && playbackSessionRef.current === currentSessionId) {
        return playBrowserTTS(cleanedText, matchedVoice, detectedLang);
      }

      if (playbackSessionRef.current === currentSessionId) {
        const bcp47 = getLanguageBCP47(detectedLang);
        setIsSpeaking(false);
        setIsPaused(false);
        setIsLoadingAudio(false);
        setLastVoiceMessage(
          `Audio voice for ${detectedLang.toUpperCase()} (${bcp47}) is currently unavailable.`
        );
      }
      return false;
    },
    [
      availableVoices,
      findBestVoiceForLanguage,
      playBrowserTTS,
      playProgressiveCloudNeuralTTS,
      stopSpeaking,
    ]
  );

  const replaySpeaking = useCallback(async (): Promise<boolean> => {
    if (!lastSpokenText) return false;
    return speak(lastSpokenText, lastSpokenLang);
  }, [lastSpokenText, lastSpokenLang, speak]);

  return (
    <VoiceSettingsContext.Provider
      value={{
        settings,
        voiceSettings: settings,
        updateSettings,
        updateVoiceSettings: updateSettings,
        isVoiceModalOpen,
        isModalOpen: isVoiceModalOpen,
        openVoiceModal,
        closeVoiceModal,
        speak,
        pauseSpeaking,
        resumeSpeaking,
        stopSpeaking,
        replaySpeaking,
        isSpeaking,
        isPaused,
        isLoadingAudio,
        lastSpokenText,
        lastSpokenLang,
        lastVoiceMessage,
        voiceNotice: lastVoiceMessage,
        clearVoiceMessage,
        clearVoiceNotice: clearVoiceMessage,
        availableVoices,
        checkVoiceSupport,
      }}
    >
      {children}
    </VoiceSettingsContext.Provider>
  );
};

export function useVoiceSettings() {
  const ctx = useContext(VoiceSettingsContext);
  if (!ctx) {
    throw new Error('useVoiceSettings must be used within a VoiceSettingsProvider');
  }
  return ctx;
}
