import { SupportedLanguage, LanguageCode } from '../types';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    script: 'rtl',
    region: 'National / All Pakistan',
    flag: '🇵🇰',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    script: 'ltr',
    region: 'Official / Global',
    flag: '🌐',
  },
  {
    code: 'roman_ur',
    name: 'Roman Urdu',
    nativeName: 'Roman Urdu',
    script: 'ltr',
    region: 'Digital / Youth',
    flag: '📱',
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'پنجابی',
    script: 'rtl',
    region: 'Punjab',
    flag: '🌾',
  },
  {
    code: 'sd',
    name: 'Sindhi',
    nativeName: 'سنڌي',
    script: 'rtl',
    region: 'Sindh',
    flag: '🏺',
  },
  {
    code: 'ps',
    name: 'Pashto',
    nativeName: 'پښتو',
    script: 'rtl',
    region: 'Khyber Pakhtunkhwa',
    flag: '⛰️',
  },
  {
    code: 'bal',
    name: 'Balochi',
    nativeName: 'بلوچی',
    script: 'rtl',
    region: 'Balochistan',
    flag: '🏜️',
  },
  {
    code: 'skr',
    name: 'Saraiki',
    nativeName: 'سرائیکی',
    script: 'rtl',
    region: 'South Punjab',
    flag: '☀️',
  },
  {
    code: 'hnd',
    name: 'Hindko',
    nativeName: 'ہندکو',
    script: 'rtl',
    region: 'Hazara / Peshawar',
    flag: '🌲',
  },
  {
    code: 'ks',
    name: 'Kashmiri',
    nativeName: 'کشمیری',
    script: 'rtl',
    region: 'Azad Kashmir',
    flag: '🍁',
  },
  {
    code: 'brh',
    name: 'Brahui',
    nativeName: 'براہوئی',
    script: 'rtl',
    region: 'Balochistan / Kalat',
    flag: '🦅',
  },
];

export function getLanguageByCode(code: LanguageCode): SupportedLanguage {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code) || SUPPORTED_LANGUAGES[0];
}
