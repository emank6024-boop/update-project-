import { LanguageCode } from '../types';

export interface LanguageMetadata {
  code: LanguageCode;
  name: string;
  nativeName: string;
  direction: 'rtl' | 'ltr';
  script: 'rtl' | 'ltr';
  region: string;
  flag: string;
  speechRecognitionCode: string;
  speechSynthesisCode: string;
  browserSttSupport: 'full' | 'partial' | 'cloud-fallback';
  fontFamily: string;
  aiPromptDirective: string;
  sampleGreeting: string;
}

export const CENTRAL_LANGUAGE_CONFIG: Record<LanguageCode, LanguageMetadata> = {
  ur: {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    direction: 'rtl',
    script: 'rtl',
    region: 'National / All Pakistan',
    flag: '🇵🇰',
    speechRecognitionCode: 'ur-PK',
    speechSynthesisCode: 'ur-PK',
    browserSttSupport: 'full',
    fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif",
    aiPromptDirective:
      'Respond entirely in authentic, natural Pakistani Urdu (اردو) using standard Urdu Perso-Arabic script.',
    sampleGreeting: 'السلام علیکم! میں آپ کی کیا مدد کر سکتا ہوں؟',
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    script: 'ltr',
    region: 'Official / Global',
    flag: '🌐',
    speechRecognitionCode: 'en-US',
    speechSynthesisCode: 'en-US',
    browserSttSupport: 'full',
    fontFamily: "'Inter', system-ui, sans-serif",
    aiPromptDirective:
      'Respond entirely in clear, accurate, professional English.',
    sampleGreeting: 'Hello! How can I help you today?',
  },
  pa: {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'پنجابی',
    direction: 'rtl',
    script: 'rtl',
    region: 'Punjab',
    flag: '🌾',
    speechRecognitionCode: 'pa-PK',
    speechSynthesisCode: 'pa-PK',
    browserSttSupport: 'cloud-fallback',
    fontFamily: "'Noto Nastaliq Urdu', 'Noto Naskh Arabic', serif",
    aiPromptDirective:
      'Respond entirely in authentic Pakistani Punjabi (پنجابی) written in Shahmukhi script (شاہ مکھی). Use natural Punjabi vocabulary and grammar (e.g., تہاڈا, وچ, نال, کیہ, ایہہ, آکھیا, کیتا). Do NOT reply in standard Urdu or English.',
    sampleGreeting: 'سلام وعلیکم! میں تہاڈی کیہ مدد کر سکدا ہاں؟',
  },
  sd: {
    code: 'sd',
    name: 'Sindhi',
    nativeName: 'سنڌي',
    direction: 'rtl',
    script: 'rtl',
    region: 'Sindh',
    flag: '🏺',
    speechRecognitionCode: 'sd-PK',
    speechSynthesisCode: 'sd-PK',
    browserSttSupport: 'cloud-fallback',
    fontFamily: "'Noto Naskh Arabic', 'Amiri', serif",
    aiPromptDirective:
      'Respond entirely in authentic, fluent Sindhi (سنڌي) using standard Sindhi Arabic script with proper Sindhi characters (ڄ, ڃ, ڳ, ڱ, ڪ, ڇ, ڌ, ٿ, ڦ). Do NOT reply in Urdu or English.',
    sampleGreeting: 'اسلام عليڪم! مان توهان جي ڪهڙي مدد ڪري سگهان ٿو؟',
  },
  ps: {
    code: 'ps',
    name: 'Pashto',
    nativeName: 'پښتو',
    direction: 'rtl',
    script: 'rtl',
    region: 'Khyber Pakhtunkhwa',
    flag: '⛰️',
    speechRecognitionCode: 'ps-AF',
    speechSynthesisCode: 'ps-PK',
    browserSttSupport: 'cloud-fallback',
    fontFamily: "'Noto Naskh Arabic', 'Amiri', serif",
    aiPromptDirective:
      'Respond entirely in authentic, fluent Pashto (پښتو) using standard Pashto Arabic script with proper Pashto characters (ښ, ځ, څ, ډ, ړ, ږ, ڼ, ې, ۍ, ۀ). Use natural Pashto grammar and vocabulary (e.g., ستاسو, څنګه, کولی شئ, په اړه, مرسته). Do NOT reply in Urdu, Persian, or English.',
    sampleGreeting: 'سلام! زه ستاسو څنګه مرسته کولی شم؟',
  },
  bal: {
    code: 'bal',
    name: 'Balochi',
    nativeName: 'بلوچی',
    direction: 'rtl',
    script: 'rtl',
    region: 'Balochistan',
    flag: '🏜️',
    speechRecognitionCode: 'ur-PK',
    speechSynthesisCode: 'bal-PK',
    browserSttSupport: 'cloud-fallback',
    fontFamily: "'Noto Nastaliq Urdu', 'Noto Naskh Arabic', serif",
    aiPromptDirective:
      'Respond entirely in authentic, natural Balochi (بلوچی) written in standard Balochi Perso-Arabic script. Use genuine Balochi vocabulary and grammar (e.g., شما, وتی, من, کُت, کن ات, گوں, ہست, انت, نبشتہ, کمکار). Do NOT reply in standard Urdu or English.',
    sampleGreeting: 'سلام! من شمارا چے کمک کُت کناں؟',
  },
  roman_ur: {
    code: 'roman_ur',
    name: 'Roman Urdu',
    nativeName: 'Roman Urdu',
    direction: 'ltr',
    script: 'ltr',
    region: 'Digital / Youth',
    flag: '📱',
    speechRecognitionCode: 'ur-PK',
    speechSynthesisCode: 'ur-PK',
    browserSttSupport: 'cloud-fallback',
    fontFamily: "'Inter', system-ui, sans-serif",
    aiPromptDirective:
      'Respond entirely in natural, easy-to-read Pakistani Roman Urdu (Urdu written in the Latin/English alphabet).',
    sampleGreeting: 'Assalam-o-Alaikum! Main aap ki kya madad kar sakta hoon?',
  },
  roman: {
    code: 'roman',
    name: 'Roman Urdu',
    nativeName: 'Roman Urdu',
    direction: 'ltr',
    script: 'ltr',
    region: 'Digital / Youth',
    flag: '📱',
    speechRecognitionCode: 'ur-PK',
    speechSynthesisCode: 'ur-PK',
    browserSttSupport: 'cloud-fallback',
    fontFamily: "'Inter', system-ui, sans-serif",
    aiPromptDirective:
      'Respond entirely in natural, easy-to-read Pakistani Roman Urdu (Urdu written in the Latin/English alphabet).',
    sampleGreeting: 'Assalam-o-Alaikum! Main aap ki kya madad kar sakta hoon?',
  },
  skr: {
    code: 'skr',
    name: 'Saraiki',
    nativeName: 'سرائیکی',
    direction: 'rtl',
    script: 'rtl',
    region: 'South Punjab',
    flag: '☀️',
    speechRecognitionCode: 'ur-PK',
    speechSynthesisCode: 'skr-PK',
    browserSttSupport: 'cloud-fallback',
    fontFamily: "'Noto Nastaliq Urdu', 'Noto Naskh Arabic', serif",
    aiPromptDirective:
      'Respond entirely in authentic Saraiki (سرائیکی) using Saraiki Perso-Arabic script (ݙ, ڳ, ݨ, ڄ, ٻ).',
    sampleGreeting: 'سلام! میں تہاݙی کیا مدد کر سڳدا ہاں؟',
  },
  hnd: {
    code: 'hnd',
    name: 'Hindko',
    nativeName: 'ہندکو',
    direction: 'rtl',
    script: 'rtl',
    region: 'Hazara / Peshawar',
    flag: '🌲',
    speechRecognitionCode: 'ur-PK',
    speechSynthesisCode: 'hnd-PK',
    browserSttSupport: 'cloud-fallback',
    fontFamily: "'Noto Nastaliq Urdu', serif",
    aiPromptDirective:
      'Respond entirely in authentic Hindko (ہندکو) using Perso-Arabic script.',
    sampleGreeting: 'سلام! میں تہاڈی کیہ مدد کر سکنا آں؟',
  },
  ks: {
    code: 'ks',
    name: 'Kashmiri',
    nativeName: 'کشمیری',
    direction: 'rtl',
    script: 'rtl',
    region: 'Azad Kashmir',
    flag: '🍁',
    speechRecognitionCode: 'ur-PK',
    speechSynthesisCode: 'ks-PK',
    browserSttSupport: 'cloud-fallback',
    fontFamily: "'Noto Nastaliq Urdu', serif",
    aiPromptDirective:
      'Respond entirely in authentic Kashmiri (کشمیری) using Kashmiri Perso-Arabic script.',
    sampleGreeting: 'اسلام علیکم! بہٕ کِتھ کٔنۍ ہیکہٕ توہِند مدد کٔرِتھ؟',
  },
  brh: {
    code: 'brh',
    name: 'Brahui',
    nativeName: 'براہوئی',
    direction: 'rtl',
    script: 'rtl',
    region: 'Balochistan / Kalat',
    flag: '🦅',
    speechRecognitionCode: 'ur-PK',
    speechSynthesisCode: 'brh-PK',
    browserSttSupport: 'cloud-fallback',
    fontFamily: "'Noto Nastaliq Urdu', serif",
    aiPromptDirective:
      'Respond entirely in authentic Brahui (براہوئی) using Brahui Perso-Arabic script.',
    sampleGreeting: 'سلام! ای نما انت کمک کننگ کیوہ؟',
  },
};

export function getLanguageConfig(code?: string): LanguageMetadata {
  const normalized = ((code || 'ur').toLowerCase().trim() as LanguageCode);
  return CENTRAL_LANGUAGE_CONFIG[normalized] || CENTRAL_LANGUAGE_CONFIG.ur;
}

/**
 * High-accuracy script & lexical detector for English, Urdu, Punjabi, Sindhi, Pashto, Balochi, and Saraiki.
 */
export function detectLanguageFromText(text: string, fallbackLang: LanguageCode = 'ur'): LanguageCode {
  if (!text || !text.trim()) return fallbackLang;
  const sample = text.replace(/```[\s\S]*?```/g, ' ').slice(0, 600).trim();

  const arabicMatches = sample.match(/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g);
  const latinMatches = sample.match(/[A-Za-z]/g);
  const arabicCount = arabicMatches ? arabicMatches.length : 0;
  const latinCount = latinMatches ? latinMatches.length : 0;

  if (arabicCount > 0 && arabicCount >= latinCount * 0.25) {
    // 1. Distinct Pashto characters: ښ ځ څ ډ ړ ږ ڼ ې ۍ ۀ
    if (/[ښځڅډړږڼېۍۀ]/.test(sample) || /(?:^|\s)(ستاسو|څنګه|پښتو|کولی|په|دمخه|لپاره|دی|ده|وي)(?:\s|$)/.test(sample)) {
      return 'ps';
    }
    // 2. Distinct Sindhi characters: ڄ ڃ ڳ ڱ ڪ ڇ ڌ ٿ ڦ ٺ ڏ ڙ
    if (/[ڄڃڳڱڪڇڌٿڦٺڏڙ]/.test(sample) || /(?:^|\s)(آهي|آهن|توهان|سنڌي|ڪيئن|سگهان|ٿو)(?:\s|$)/.test(sample)) {
      return 'sd';
    }
    // 3. Distinct Saraiki characters: ݙ ݨ ٻ
    if (/[ݙݨٻ]/.test(sample)) {
      return 'skr';
    }
    // 4. Distinct Balochi lexical & orthographic markers
    if (/(?:^|\s)(شما|شمارا|وتی|کُت|کن ات|کناں|گوں|بلوچی|نبشتہ|انت|ہست|وش آتک|کمکار)(?:\s|$)/.test(sample)) {
      return 'bal';
    }
    // 5. Distinct Punjabi (Shahmukhi) lexical markers
    if (/(?:^|\s)(تہاڈا|تہانوں|تہاڈی|آکھیا|ہاں|وچ|نال|کیہ|ساڈا|تسی|پنجابی|کیتا|سکدا|ہوندے)(?:\s|$)/.test(sample)) {
      return 'pa';
    }
    // 6. Respect the user's selected regional RTL language if no conflicting markers
    if (['ur', 'pa', 'sd', 'ps', 'bal', 'skr', 'hnd', 'ks', 'brh'].includes(fallbackLang)) {
      return fallbackLang;
    }
    return 'ur';
  }

  if (latinCount > arabicCount * 2) {
    if (fallbackLang === 'roman_ur' || fallbackLang === 'roman') {
      return 'roman_ur';
    }
    // Check for clear Roman Urdu word patterns
    if (/\b(kya|hai|hain|mein|kaise|aur|nahi|karein|batayein|tareeqa|aap|hum|pakistan\s+mein|ke\s+liye|ki\s+madad)\b/i.test(sample)) {
      return 'roman_ur';
    }
    return 'en';
  }

  return fallbackLang;
}
