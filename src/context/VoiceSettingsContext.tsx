import React, { createContext, useContext, useState, useEffect } from 'react';
import { VoiceSettings } from '../types';

interface VoiceSettingsContextType {
  isModalOpen: boolean;
  openVoiceModal: () => void;
  closeVoiceModal: () => void;
  voiceSettings: VoiceSettings;
  updateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  speak: (text: string, lang?: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
}

const VoiceSettingsContext = createContext<VoiceSettingsContextType | undefined>(undefined);

const VOICE_SETTINGS_STORAGE = 'paklingo_voice_settings';

export const VoiceSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

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

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const speak = (text: string, lang = 'ur') => {
    if (!voiceSettings.enabled || !text) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`~]/g, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    utterance.volume = voiceSettings.volume;

    const voices = window.speechSynthesis.getVoices();
    if (lang === 'ur' || lang === 'pa' || lang === 'sd' || lang === 'ps') {
      const urduVoice = voices.find((v) => v.lang.startsWith('ur') || v.lang.startsWith('hi'));
      if (urduVoice) utterance.voice = urduVoice;
    } else {
      const engVoice = voices.find((v) => v.lang.startsWith('en'));
      if (engVoice) utterance.voice = engVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <VoiceSettingsContext.Provider
      value={{
        isModalOpen,
        openVoiceModal,
        closeVoiceModal,
        voiceSettings,
        updateVoiceSettings,
        speak,
        stopSpeaking,
        isSpeaking,
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
