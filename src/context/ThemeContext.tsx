import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export type ThemeMode = 'light' | 'dark';

export type AccentPresetId =
  | 'emerald'
  | 'pink'
  | 'purple'
  | 'blue'
  | 'teal'
  | 'red'
  | 'orange'
  | 'gold'
  | 'custom';

export interface AccentPreset {
  id: AccentPresetId;
  name: string;
  hex: string;
  description: string;
}

export const DEFAULT_ACCENT_HEX = '#059669';
export const DEFAULT_ACCENT_ID: AccentPresetId = 'emerald';
export const DEFAULT_THEME_MODE: ThemeMode = 'light';

export const ACCENT_PRESETS: AccentPreset[] = [
  {
    id: 'emerald',
    name: 'Emerald Green',
    hex: '#059669',
    description: 'Default PakLingo AI Pakistani emerald',
  },
  {
    id: 'pink',
    name: 'Pink',
    hex: '#e11d48',
    description: 'Vibrant rose-pink accent with crisp contrast',
  },
  {
    id: 'purple',
    name: 'Purple',
    hex: '#7c3aed',
    description: 'Royal violet-purple accent',
  },
  {
    id: 'blue',
    name: 'Blue',
    hex: '#2563eb',
    description: 'Classic ocean blue accent',
  },
  {
    id: 'teal',
    name: 'Teal',
    hex: '#0d9488',
    description: 'Deep cyan-teal modern accent',
  },
  {
    id: 'red',
    name: 'Red',
    hex: '#dc2626',
    description: 'Bold crimson red accent',
  },
  {
    id: 'orange',
    name: 'Orange',
    hex: '#ea580c',
    description: 'Warm sunset orange accent',
  },
  {
    id: 'gold',
    name: 'Gold',
    hex: '#d97706',
    description: 'Warm Pakistani amber-gold accent',
  },
];

// Legacy THEMES_LIST kept for compatibility
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
    name: 'Light Mode',
    description: 'Crisp white surfaces with deep navy readable text',
    previewBg: '#ffffff',
    previewAccent: '#059669',
    accentPreview: '#059669',
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Deep midnight navy surfaces with crisp light text',
    previewBg: '#080f1d',
    previewAccent: '#10b981',
    accentPreview: '#10b981',
  },
];

// ============================================================================
// WCAG 2.1 COLOR & CONTRAST ENGINE
// Guarantees >= 4.5:1 text contrast for all preset and custom HEX colors
// ============================================================================

export function normalizeHex(input: string, fallback = DEFAULT_ACCENT_HEX): string {
  if (!input || typeof input !== 'string') return fallback;
  const cleaned = input.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(cleaned)) {
    const r = cleaned[0] + cleaned[0];
    const g = cleaned[1] + cleaned[1];
    const b = cleaned[2] + cleaned[2];
    return `#${r}${g}${b}`.toLowerCase();
  }
  if (/^[0-9a-fA-F]{6}$/.test(cleaned)) {
    return `#${cleaned}`.toLowerCase();
  }
  return fallback;
}

export function isValidHexInput(input: string): boolean {
  const cleaned = input.trim().replace(/^#/, '');
  return /^[0-9a-fA-F]{3}$/.test(cleaned) || /^[0-9a-fA-F]{6}$/.test(cleaned);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const norm = normalizeHex(hex);
  const num = parseInt(norm.slice(1), 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
  );
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r1 = 0,
    g1 = 0,
    b1 = 0;

  if (h < 60) {
    r1 = c;
    g1 = x;
  } else if (h < 120) {
    r1 = x;
    g1 = c;
  } else if (h < 180) {
    g1 = c;
    b1 = x;
  } else if (h < 240) {
    g1 = x;
    b1 = c;
  } else if (h < 300) {
    r1 = x;
    b1 = c;
  } else {
    r1 = c;
    b1 = x;
  }

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

export function getRelativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const toLinear = (c: number) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  };
  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function mixHex(hex1: string, hex2: string, weight1: number): string {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  const w = Math.max(0, Math.min(1, weight1));
  return rgbToHex(
    c1.r * w + c2.r * (1 - w),
    c1.g * w + c2.g * (1 - w),
    c1.b * w + c2.b * (1 - w)
  );
}

export interface ComputedThemeTokens {
  rawAccent: string;
  buttonBg: string;
  buttonHover: string;
  buttonText: string;
  buttonContrastRatio: number;
  textAccent: string;
  textContrastRatio: number;
  accentSubtle: string;
  accentBorder: string;
  focusRing: string;
  wasAdjusted: boolean;
}

export function computeAccessibleThemeTokens(
  rawHexInput: string,
  isDark: boolean
): ComputedThemeTokens {
  const rawAccent = normalizeHex(rawHexInput);
  const rgb = hexToRgb(rawAccent);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  let wasAdjusted = false;

  // 1. Ensure button background is visually distinct from the card surface
  let btnHsl = { ...hsl };
  if (!isDark && btnHsl.l > 88) {
    btnHsl.l = 84;
    wasAdjusted = true;
  } else if (isDark && btnHsl.l < 15) {
    btnHsl.l = 22;
    wasAdjusted = true;
  }

  let buttonBg = hslToHex(btnHsl.h, btnHsl.s, btnHsl.l);
  const lum = getRelativeLuminance(buttonBg);

  // 2. Select readable on-accent text (#ffffff vs #0a192f) and enforce >= 4.55:1 contrast.
  // All 8 presets and rich/medium colors (lum <= 0.36) use crisp white (#ffffff) text and deepen slightly if needed.
  // Genuinely bright/pastel custom colors (lum > 0.36) use deep navy (#0a192f) text.
  const WHITE = '#ffffff';
  const DARK_NAVY = '#0a192f';
  let buttonText = WHITE;

  if (lum > 0.36) {
    // Bright / pastel custom accent fill -> use Dark Navy text (#0a192f)
    buttonText = DARK_NAVY;
    while (getContrastRatio(buttonBg, DARK_NAVY) < 4.6 && btnHsl.l < 92) {
      btnHsl.l += 1.5;
      buttonBg = hslToHex(btnHsl.h, btnHsl.s, btnHsl.l);
      wasAdjusted = true;
    }
  } else {
    // Rich / jewel-tone accent fill -> use Pure White text (#ffffff)
    buttonText = WHITE;
    while (getContrastRatio(buttonBg, WHITE) < 4.6 && btnHsl.l > 8) {
      btnHsl.l -= 1.5;
      buttonBg = hslToHex(btnHsl.h, btnHsl.s, btnHsl.l);
      wasAdjusted = true;
    }
  }

  const buttonContrastRatio = Number(getContrastRatio(buttonBg, buttonText).toFixed(2));

  // 3. Compute hover state for primary buttons (maintains contrast with buttonText)
  const hoverL =
    buttonText === WHITE
      ? Math.max(8, btnHsl.l - 5)
      : Math.max(28, btnHsl.l - 6);
  const buttonHover = hslToHex(btnHsl.h, btnHsl.s, hoverL);

  // 4. Compute subtle surface tint and border (strictly separated from text colors)
  const surfaceBg = isDark ? '#0d192b' : '#ffffff';
  const subtleSurfaceRef = isDark
    ? mixHex(buttonBg, '#13243d', 0.16)
    : mixHex(buttonBg, '#ffffff', 0.09);
  const accentSubtle = subtleSurfaceRef;
  const accentBorder = isDark
    ? mixHex(buttonBg, '#1e385e', 0.45)
    : mixHex(buttonBg, '#cbd5e1', 0.42);

  // 5. Compute readable accent text (--accent-text) for links, icons, and subtle badges
  // Must achieve >= 5.0:1 WCAG AA contrast against BOTH the main surface AND the subtle badge background
  let txtHsl = { ...hsl };
  let textAccent = hslToHex(txtHsl.h, txtHsl.s, txtHsl.l);

  if (!isDark) {
    // Light mode: darken until contrast with subtleSurfaceRef and #ffffff is >= 5.0:1
    let safety = 0;
    while (
      (getContrastRatio(textAccent, subtleSurfaceRef) < 5.0 ||
        getContrastRatio(textAccent, surfaceBg) < 5.0) &&
      txtHsl.l > 12 &&
      safety < 65
    ) {
      txtHsl.l -= 1.8;
      textAccent = hslToHex(txtHsl.h, txtHsl.s, txtHsl.l);
      safety++;
    }
    if (rawAccent.toLowerCase() !== textAccent.toLowerCase() && getContrastRatio(rawAccent, surfaceBg) < 4.5) {
      wasAdjusted = true;
    }
  } else {
    // Dark mode: lighten until contrast with subtleSurfaceRef and #0d192b is >= 5.0:1
    let safety = 0;
    while (
      (getContrastRatio(textAccent, subtleSurfaceRef) < 5.0 ||
        getContrastRatio(textAccent, surfaceBg) < 5.0) &&
      txtHsl.l < 90 &&
      safety < 65
    ) {
      txtHsl.l += 1.8;
      textAccent = hslToHex(txtHsl.h, txtHsl.s, txtHsl.l);
      safety++;
    }
    if (rawAccent.toLowerCase() !== textAccent.toLowerCase() && getContrastRatio(rawAccent, surfaceBg) < 4.5) {
      wasAdjusted = true;
    }
  }

  const textContrastRatio = Number(getContrastRatio(textAccent, surfaceBg).toFixed(2));

  // 6. Focus ring with guaranteed visibility (>= 3:1 against surface)
  const focusRing =
    getContrastRatio(buttonBg, surfaceBg) >= 3.0 ? buttonBg : textAccent;

  return {
    rawAccent,
    buttonBg,
    buttonHover,
    buttonText,
    buttonContrastRatio,
    textAccent,
    textContrastRatio,
    accentSubtle,
    accentBorder,
    focusRing,
    wasAdjusted,
  };
}

interface ThemeContextType {
  // Mode ('light' | 'dark')
  theme: ThemeMode;
  mode: ThemeMode;
  isDark: boolean;
  setTheme: (themeOrPreset: string) => void;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;

  // Accent Color System
  accentId: AccentPresetId;
  accentColor: string;
  customHex: string;
  setAccentPreset: (presetId: AccentPresetId) => void;
  setCustomAccentColor: (hex: string) => void;
  resetThemeToDefault: () => void;
  contrastInfo: ComputedThemeTokens;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const MODE_STORAGE_KEY = 'paklingo_theme_preference';
const ACCENT_ID_STORAGE_KEY = 'paklingo_accent_preset';
const ACCENT_HEX_STORAGE_KEY = 'paklingo_accent_custom_hex';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem(MODE_STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') return stored;
    } catch {
      // ignore
    }
    return DEFAULT_THEME_MODE;
  });

  const [accentId, setAccentIdState] = useState<AccentPresetId>(() => {
    try {
      const storedId = localStorage.getItem(ACCENT_ID_STORAGE_KEY) as AccentPresetId | null;
      if (
        storedId &&
        (['emerald', 'pink', 'purple', 'blue', 'teal', 'red', 'orange', 'gold', 'custom'] as string[]).includes(
          storedId
        )
      ) {
        return storedId;
      }
      // Check legacy theme preference if it was a color name
      const legacy = localStorage.getItem(MODE_STORAGE_KEY);
      if (legacy === 'pink' || legacy === 'purple' || legacy === 'blue') {
        return legacy;
      }
      if (legacy === 'navy-gold' || legacy === 'yellow') {
        return 'gold';
      }
    } catch {
      // ignore
    }
    return DEFAULT_ACCENT_ID;
  });

  const [customHex, setCustomHexState] = useState<string>(() => {
    try {
      const storedHex = localStorage.getItem(ACCENT_HEX_STORAGE_KEY);
      if (storedHex && isValidHexInput(storedHex)) {
        return normalizeHex(storedHex);
      }
    } catch {
      // ignore
    }
    return DEFAULT_ACCENT_HEX;
  });

  const isDark = mode === 'dark';

  const accentColor = useMemo(() => {
    if (accentId === 'custom') {
      return normalizeHex(customHex);
    }
    const found = ACCENT_PRESETS.find((p) => p.id === accentId);
    return found ? found.hex : DEFAULT_ACCENT_HEX;
  }, [accentId, customHex]);

  const contrastInfo = useMemo(
    () => computeAccessibleThemeTokens(accentColor, isDark),
    [accentColor, isDark]
  );

  // Apply both mode and contrast-validated CSS variables to <html> immediately
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    root.setAttribute('data-theme', mode);
    root.setAttribute('data-accent', accentId);

    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }

    // Apply contrast-validated accent tokens
    root.style.setProperty('--accent', contrastInfo.buttonBg);
    root.style.setProperty('--accent-hover', contrastInfo.buttonHover);
    root.style.setProperty('--accent-foreground', contrastInfo.buttonText);
    root.style.setProperty('--accent-text', contrastInfo.textAccent);
    root.style.setProperty('--accent-subtle', contrastInfo.accentSubtle);
    root.style.setProperty('--accent-border', contrastInfo.accentBorder);
    root.style.setProperty('--button-background', contrastInfo.buttonBg);
    root.style.setProperty('--button-foreground', contrastInfo.buttonText);
    root.style.setProperty('--button-primary-bg', contrastInfo.buttonBg);
    root.style.setProperty('--button-primary-text', contrastInfo.buttonText);
    root.style.setProperty('--focus-ring', contrastInfo.focusRing);
    root.style.setProperty('--accent-color', contrastInfo.buttonBg);
  }, [mode, isDark, accentId, contrastInfo]);

  const setMode = (nextMode: ThemeMode) => {
    setModeState(nextMode);
    try {
      localStorage.setItem(MODE_STORAGE_KEY, nextMode);
    } catch {
      // ignore
    }
  };

  const setAccentPreset = (presetId: AccentPresetId) => {
    setAccentIdState(presetId);
    try {
      localStorage.setItem(ACCENT_ID_STORAGE_KEY, presetId);
      if (presetId !== 'custom') {
        const preset = ACCENT_PRESETS.find((p) => p.id === presetId);
        if (preset) {
          setCustomHexState(preset.hex);
          localStorage.setItem(ACCENT_HEX_STORAGE_KEY, preset.hex);
        }
      }
    } catch {
      // ignore
    }
  };

  const setCustomAccentColor = (hexInput: string) => {
    const normalized = normalizeHex(hexInput, customHex);
    setCustomHexState(normalized);
    setAccentIdState('custom');
    try {
      localStorage.setItem(ACCENT_ID_STORAGE_KEY, 'custom');
      localStorage.setItem(ACCENT_HEX_STORAGE_KEY, normalized);
    } catch {
      // ignore
    }
  };

  const setTheme = (themeOrPreset: string) => {
    if (themeOrPreset === 'dark' || themeOrPreset === 'light') {
      setMode(themeOrPreset);
      return;
    }
    const matchingPreset = ACCENT_PRESETS.find((p) => p.id === themeOrPreset);
    if (matchingPreset) {
      setAccentPreset(matchingPreset.id);
    }
  };

  const toggleTheme = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  const resetThemeToDefault = () => {
    setModeState(DEFAULT_THEME_MODE);
    setAccentIdState(DEFAULT_ACCENT_ID);
    setCustomHexState(DEFAULT_ACCENT_HEX);
    try {
      localStorage.setItem(MODE_STORAGE_KEY, DEFAULT_THEME_MODE);
      localStorage.setItem(ACCENT_ID_STORAGE_KEY, DEFAULT_ACCENT_ID);
      localStorage.setItem(ACCENT_HEX_STORAGE_KEY, DEFAULT_ACCENT_HEX);
    } catch {
      // ignore
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: mode,
        mode,
        isDark,
        setTheme,
        setMode,
        toggleTheme,
        accentId,
        accentColor,
        customHex,
        setAccentPreset,
        setCustomAccentColor,
        resetThemeToDefault,
        contrastInfo,
      }}
    >
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
