/**
 * PakLingo AI - Central Internationalization (i18n) Type Definitions
 */

import { LanguageCode } from '../types';

export type TranslationDictionary = Record<string, string>;

export interface LocalePackage {
  code: LanguageCode;
  name: string;
  nativeName: string;
  script: 'rtl' | 'ltr';
  bcp47: string;
  translations: TranslationDictionary;
}
