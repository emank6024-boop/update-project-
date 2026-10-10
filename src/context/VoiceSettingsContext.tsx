import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { VoiceSettings } from '../types';
import { getLanguageBCP47 } from '../i18n';

export interface VoiceSupportInfo {
  isSupported: boolean;
  isNative: boolean;
  voiceName?: string;
  bcp47: string;
  message: string;
}

interface VoiceSettingsContextType {
  isModalOpen: boolean;
  openVoiceModal: () => void;
  closeVoiceModal: () => void;
  voiceSettings: VoiceSettings;
  updateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  speak: (text: string, lang?: string) => Promise<boolean>;
  pauseSpeaking: () => void;
  resumeSpeaking: () => void;
  stopSpeaking: () => void;
  replaySpeaking: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  activeSpeechLang: string;
  voiceNotice: string | null;
  clearVoiceNotice: () => void;
  checkVoiceSupport: (lang: string) => VoiceSupportInfo;
}

const VoiceSettingsContext = createContext<VoiceSettingsContextType | undefined>(undefined);

const VOICE_SETTINGS_STORAGE = 'paklingo_voice_settings';

export const VoiceSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeSpeechLang, setActiveSpeechLang] = useState('ur');
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const lastSpokenTextRef = useRef<string>('');
  const lastSpokenLangRef = useRef<string>('ur');

  const [voiceSettings, setVoiceSettingsState] = useState<VoiceSettings>(() => {
    try {
      const stored = localStorage.getItem(VOICE_SETTINGS_STORAGE);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return {
      enabled: true,
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      autoSpeak: false,
    };
  });

  const updateVoiceSettings = (settings: Partial<VoiceSettings>) => {
    setVoiceSettingsState((prev) => {
      const updated = { ...prev, ...settings };
      try {
        localStorage.setItem(VOICE_SETTINGS_STORAGE, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const openVoiceModal = () => setIsModalOpen(true);
  const closeVoiceModal = () => setIsModalOpen(false);
  const clearVoiceNotice = () => setVoiceNotice(null);

  // Check browser speech synthesis capabilities without false claims
  const checkVoiceSupport = useCallback((lang = 'ur'): VoiceSupportInfo => {
    const bcp47 = getLanguageBCP47(lang);
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return {
        isSupported: false,
        isNative: false,
        bcp47,
        message: 'Speech synthesis is not supported by your current browser.',
      };
    }

    const voices = window.speechSynthesis.getVoices();
    const prefix = bcp47.split('-')[0].toLowerCase();

    // Look for exact BCP-47 match or language code prefix
    const matchingVoice = voices.find(
      (v) =>
        v.lang.toLowerCase() === bcp47.toLowerCase() ||
        v.lang.toLowerCase().startsWith(`${prefix}-`) ||
        v.lang.toLowerCase() === prefix
    );

    if (matchingVoice) {
      return {
        isSupported: true,
        isNative: true,
        voiceName: matchingVoice.name,
        bcp47,
        message: `Native ${matchingVoice.name} voice detected.`,
      };
    }

    // Specific honest notices for languages that lack native browser voices
    if (lang === 'bal') {
      return {
        isSupported: false,
        isNative: false,
        bcp47,
        message:
          'Native Balochi voice synthesis is currently not supported by standard speech engines. You can view full written Balochi text or listen in Urdu / English.',
      };
    }

    if (lang === 'sd') {
      return {
        isSupported: false,
        isNative: false,
        bcp47,
        message:
          'Native Sindhi speech synthesis is not installed in your browser engine. You can read the Sindhi text or translate to Urdu/English for audio playback.',
      };
    }

    if (lang === 'ps') {
      return {
        isSupported: false,
        isNative: false,
        bcp47,
        message:
          'Native Pashto speech voice is not available in your browser engine. Text display and translations are fully active.',
      };
    }

    if (lang === 'pa') {
      return {
        isSupported: false,
        isNative: false,
        bcp47,
        message:
          'Native Punjabi speech synthesizer is not installed on this device. You can read the text or listen in Urdu/English.',
      };
    }

    if (lang === 'ur') {
      const urduFallback = voices.find((v) => v.lang.startsWith('ur'));
      if (urduFallback) {
        return {
          isSupported: true,
          isNative: true,
          voiceName: urduFallback.name,
          bcp47,
          message: `Urdu voice (${urduFallback.name}) available.`,
        };
      }
      return {
        isSupported: false,
        isNative: false,
        bcp47,
        message: 'Urdu voice pack is not installed in your operating system or browser.',
      };
    }

    if (lang === 'en') {
      const enVoice = voices.find((v) => v.lang.startsWith('en'));
      return {
        isSupported: !!enVoice,
        isNative: !!enVoice,
        voiceName: enVoice?.name,
        bcp47,
        message: enVoice ? 'English voice active.' : 'No English voice found.',
      };
    }

    return {
      isSupported: false,
      isNative: false,
      bcp47,
      message: `Audio synthesis for this dialect is not supported on this device.`,
    };
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, []);

  const pauseSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && isSpeaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSpeaking]);

  const resumeSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  const speak = useCallback(
    async (text: string, lang = 'ur'): Promise<boolean> => {
      if (!voiceSettings.enabled || !text) return false;
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setVoiceNotice('Speech synthesis is not supported on your browser.');
        return false;
      }

      stopSpeaking();
      const cleanText = text.replace(/[*#_`~]/g, '').trim();
      if (!cleanText) return false;

      lastSpokenTextRef.current = cleanText;
      lastSpokenLangRef.current = lang;
      setActiveSpeechLang(lang);

      const support = checkVoiceSupport(lang);

      // If the language is unsupported (e.g. Balochi, Sindhi without native voice), DO NOT fake it!
      if (!support.isSupported) {
        setVoiceNotice(support.message);
        return false;
      }

      setVoiceNotice(null);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;
      utterance.lang = support.bcp47;

      const voices = window.speechSynthesis.getVoices();
      const prefix = support.bcp47.split('-')[0].toLowerCase();
      const matchingVoice = voices.find(
        (v) =>
          v.lang.toLowerCase() === support.bcp47.toLowerCase() ||
          v.lang.toLowerCase().startsWith(`${prefix}-`) ||
          v.lang.toLowerCase() === prefix
      );

      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      window.speechSynthesis.speak(utterance);
      return true;
    },
    [voiceSettings, stopSpeaking, checkVoiceSupport]
  );

  const replaySpeaking = useCallback(() => {
    if (lastSpokenTextRef.current) {
      speak(lastSpokenTextRef.current, lastSpokenLangRef.current);
    }
  }, [speak]);

  return (
    <VoiceSettingsContext.Provider
      value={{
        isModalOpen,
        openVoiceModal,
        closeVoiceModal,
        voiceSettings,
        updateVoiceSettings,
        speak,
        pauseSpeaking,
        resumeSpeaking,
        stopSpeaking,
        replaySpeaking,
        isSpeaking,
        isPaused,
        activeSpeechLang,
        voiceNotice,
        clearVoiceNotice,
        checkVoiceSupport,
      }}
    >
      {children}
    </VoiceSettingsContext.Provider>
  );
};

export function useVoiceSettings() {
  const context = useContext(VoiceSettingsContext);
  if (!context) {
    throw new Error('useVoiceSettings must be used within a VoiceSettingsProvider');
  }
  return context;
}
