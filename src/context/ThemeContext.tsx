import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ThemeOption {
  id: string;
  name: string;
  description: string;
  previewBg: string;
  previewAccent: string;
  accentPreview: string;
}

export const THEMES_LIST: ThemeOption[] = [
  {
    id: 'light',
    name: 'Clean Mint & Emerald',
    description: 'Crisp white canvas, mint-green highlights and navy text',
    previewBg: '#ffffff',
    previewAccent: '#059669',
    accentPreview: '#059669',
  },
  {
    id: 'dark',
    name: 'Midnight Emerald Navy',
    description: 'Deep navy-black background with glowing emerald accents',
    previewBg: '#080f1d',
    previewAccent: '#10b981',
    accentPreview: '#10b981',
  },
  {
    id: 'emerald',
    name: 'Pakistani Emerald Light',
    description: 'National green and clean white aesthetic',
    previewBg: '#ffffff',
    previewAccent: '#059669',
    accentPreview: '#059669',
  },
  {
    id: 'navy-gold',
    name: 'Navy & Gold',
    description: 'Royal navy with warm Pakistani gold accents',
    previewBg: '#f8f9fa',
    previewAccent: '#d97706',
    accentPreview: '#d97706',
  },
];

interface ThemeContextType {
  theme: string;
  isDark: boolean;
  setTheme: (themeId: string) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'paklingo_theme_preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') return stored;
    } catch {
      // ignore
    }
    return 'light';
  });

  const isDark = theme === 'dark';

  const applyThemeToDOM = (t: string) => {
    if (typeof document === 'undefined') return;
    const isDarkMode = t === 'dark';
    document.documentElement.setAttribute('data-theme', t);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  };

  const setTheme = (themeId: string) => {
    setThemeState(themeId);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
    } catch {
      // ignore
    }
    applyThemeToDOM(themeId);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
