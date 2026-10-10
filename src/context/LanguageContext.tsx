import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { LanguageCode, SupportedLanguage } from '../types';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '../data/languages';
import { translate, isLanguageRTL, getLanguageBCP47 } from '../i18n';

interface LanguageContextType {
  selectedLanguage: LanguageCode;
  setSelectedLanguage: (lang: LanguageCode) => void;
  isRTL: boolean;
  dir: 'rtl' | 'ltr';
  bcp47: string;
  currentLanguage: SupportedLanguage;
  t: (key: string, fallback?: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LANGUAGE_STORAGE_KEY = 'paklingo_selected_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLanguage, setSelectedLanguageState] = useState<LanguageCode>(() => {
    if (typeof window === 'undefined') return 'ur';
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) {
        return stored as LanguageCode;
      }
    } catch {
      // ignore
    }
    return 'ur';
  });

  const setSelectedLanguage = useCallback((lang: LanguageCode) => {
    setSelectedLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, []);

  const isRTL = useMemo(() => isLanguageRTL(selectedLanguage), [selectedLanguage]);
  const dir: 'rtl' | 'ltr' = isRTL ? 'rtl' : 'ltr';
  const bcp47 = useMemo(() => getLanguageBCP47(selectedLanguage), [selectedLanguage]);
  const currentLanguage = useMemo(() => getLanguageByCode(selectedLanguage), [selectedLanguage]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = selectedLanguage;
      document.documentElement.dir = dir;
      document.documentElement.setAttribute('data-language', selectedLanguage);
    }
  }, [selectedLanguage, dir]);

  const t = useCallback(
    (key: string, fallback?: string, params?: Record<string, string | number>): string => {
      return translate(key, selectedLanguage, fallback, params);
    },
    [selectedLanguage]
  );

  const value = useMemo(
    () => ({
      selectedLanguage,
      setSelectedLanguage,
      isRTL,
      dir,
      bcp47,
      currentLanguage,
      t,
    }),
    [selectedLanguage, setSelectedLanguage, isRTL, dir, bcp47, currentLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
