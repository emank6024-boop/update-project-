/**
 * PakLingo AI - Central Internationalization (i18n) Engine
 *
 * Implements robust lookup, parameter interpolation, missing-key detection,
 * graceful fallbacks, and language script utilities.
 */

import { LanguageCode } from '../types';
import { TranslationDictionary } from './types';
import { enTranslations } from './locales/en';
import { urTranslations } from './locales/ur';
import { sdTranslations } from './locales/sd';
import { balTranslations } from './locales/bal';
import { paTranslations } from './locales/pa';
import { psTranslations } from './locales/ps';
import { romanUrTranslations } from './locales/roman_ur';

export const LOCALES: Record<string, TranslationDictionary> = {
  en: enTranslations,
  ur: urTranslations,
  sd: sdTranslations,
  bal: balTranslations,
  pa: paTranslations,
  ps: psTranslations,
  roman_ur: romanUrTranslations,
  roman: romanUrTranslations,
};

// Languages using Right-To-Left Arabic / Perso-Arabic scripts in Pakistan
export const RTL_LANGUAGES: LanguageCode[] = ['ur', 'sd', 'bal', 'pa', 'ps', 'skr', 'hnd', 'ks', 'brh'];

export function isLanguageRTL(lang: LanguageCode): boolean {
  return RTL_LANGUAGES.includes(lang);
}

// BCP-47 Speech Recognition and Synthesis Codes
export const LANGUAGE_BCP47_MAP: Record<string, string> = {
  ur: 'ur-PK',
  en: 'en-US',
  pa: 'pa-PK',
  sd: 'sd-PK',
  ps: 'ps-PK',
  bal: 'bal-PK',
  skr: 'ur-PK',
  hnd: 'ur-PK',
  ks: 'ur-PK',
  brh: 'ur-PK',
  roman_ur: 'ur-PK',
  roman: 'ur-PK',
};

export function getLanguageBCP47(lang: string): string {
  return LANGUAGE_BCP47_MAP[lang] || 'ur-PK';
}

// Warn once per missing key in development to avoid console flooding
const warnedMissingKeys = new Set<string>();

/**
 * Translate a key into the given language with optional fallback text and parameter interpolation.
 *
 * @example
 * translate('hero.title', 'ur')
 * translate('dashboard.welcomeUser', 'ur', 'Welcome, {name}', { name: 'Ahmad' })
 */
export function translate(
  key: string,
  lang: LanguageCode,
  fallback?: string,
  params?: Record<string, string | number>
): string {
  const dictionary = LOCALES[lang] || LOCALES['ur'];
  let text = dictionary?.[key];

  // Primary fallback chain: requested lang -> ur -> en -> explicit fallback -> key
  if (!text) {
    if (lang !== 'ur' && LOCALES['ur']?.[key]) {
      text = LOCALES['ur'][key];
    } else if (LOCALES['en']?.[key]) {
      text = LOCALES['en'][key];
    } else if (fallback !== undefined) {
      text = fallback;
    } else {
      text = key;

      // Development-time missing key check
      if (process.env.NODE_ENV !== 'production') {
        const warnToken = `${lang}:${key}`;
        if (!warnedMissingKeys.has(warnToken)) {
          warnedMissingKeys.add(warnToken);
          console.warn(`[PakLingo i18n] Missing translation key "${key}" for language "${lang}".`);
        }
      }
    }
  }

  // Parameter interpolation: {keyName} replaced by params[keyName]
  if (params && typeof text === 'string') {
    for (const [pKey, pVal] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
    }
  }

  return text;
}

/**
 * Audit helper to verify key completeness across all supported locales during testing.
 */
export function auditMissingKeys(): Record<string, string[]> {
  const baselineKeys = Object.keys(enTranslations);
  const report: Record<string, string[]> = {};

  for (const [code, dict] of Object.entries(LOCALES)) {
    if (code === 'roman') continue;
    const missing = baselineKeys.filter((k) => !dict[k]);
    if (missing.length > 0) {
      report[code] = missing;
    }
  }

  return report;
}
