/**
 * Global Multilingual System Directives & Script Detection for PakLingo AI (Backend)
 *
 * Enforces strict adherence to user-selected and user-typed languages across all endpoints
 * (Chat, Government Assistant, Farmer, Medical, Legal, Teacher, Fact Check, PSL, OCR, TTS).
 */

export const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  ur: 'Urdu (اردو)',
  en: 'English',
  roman_ur: 'Roman Urdu (Pakistani Urdu written in Latin/English alphabet)',
  roman: 'Roman Urdu (Pakistani Urdu written in Latin/English alphabet)',
  pa: 'Punjabi (پنجابی - شاہ مکھی)',
  sd: 'Sindhi (سنڌي)',
  ps: 'Pashto (پښتو)',
  bal: 'Balochi (بلوچی)',
  skr: 'Saraiki (سرائیکی)',
  hnd: 'Hindko (ہندکو)',
  ks: 'Kashmiri (کشمیری)',
  brh: 'Brahui (براہوئی)',
};

export function getLanguageName(code: string): string {
  const normalized = (code || 'ur').toLowerCase().trim();
  return LANGUAGE_DISPLAY_NAMES[normalized] || LANGUAGE_DISPLAY_NAMES['ur'];
}

/**
 * Resolves the target language for an AI response based on both the user's selected UI language
 * and the script/lexical markers of the user's actual message.
 * - If the user explicitly writes in Pashto, Sindhi, Balochi, Punjabi, or Saraiki native script,
 *   the AI responds in that exact language even if the UI selector was left on English.
 * - Otherwise, the AI strictly honors the user's selected language (`selectedLanguage`).
 */
export function resolveEffectiveLanguage(userMessage: string, selectedLanguage = 'ur'): string {
  const cleanSelected = (selectedLanguage || 'ur').toLowerCase().trim();
  if (!userMessage || !userMessage.trim()) {
    return cleanSelected;
  }

  const sample = userMessage.slice(0, 600).trim();
  const arabicMatches = sample.match(/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g);
  const latinMatches = sample.match(/[A-Za-z]/g);
  const arabicCount = arabicMatches ? arabicMatches.length : 0;
  const latinCount = latinMatches ? latinMatches.length : 0;

  if (arabicCount >= 3 && arabicCount >= latinCount * 0.3) {
    // 1. Explicit Pashto characters or words
    if (
      /[ښځڅډړږڼېۍۀ]/.test(sample) ||
      /(?:^|\s)(ستاسو|څنګه|پښتو|کولی|دمخه|لپاره|څه|ولې|چیرته)(?:\s|$)/.test(sample)
    ) {
      return 'ps';
    }
    // 2. Explicit Sindhi characters or words
    if (
      /[ڄڃڳڱڪڇڌٿڦٺڏڙ]/.test(sample) ||
      /(?:^|\s)(آهي|آهن|توهان|سنڌي|ڪيئن|سگهان|ڪهڙو)(?:\s|$)/.test(sample)
    ) {
      return 'sd';
    }
    // 3. Explicit Saraiki characters
    if (/[ݙݨٻ]/.test(sample)) {
      return 'skr';
    }
    // 4. Explicit Balochi vocabulary
    if (
      /(?:^|\s)(شما|شمارا|وتی|کُت|کن ات|کناں|گوں|بلوچی|نبشتہ|انت|ہست|وش آتک|کمکار|بلوچستان)(?:\s|$)/.test(
        sample
      )
    ) {
      return cleanSelected === 'ur' ? 'bal' : cleanSelected === 'en' ? 'bal' : cleanSelected;
    }
    // 5. Explicit Punjabi Shahmukhi vocabulary
    if (
      /(?:^|\s)(تہاڈا|تہانوں|تہاڈی|آکھیا|وچ|نال|کیہ|ساڈا|تسی|پنجابی|کیتا|سکدا|ہوندے)(?:\s|$)/.test(
        sample
      )
    ) {
      return cleanSelected === 'ur' || cleanSelected === 'en' ? 'pa' : cleanSelected;
    }

    // If the user typed in Perso-Arabic script while UI was set to English ('en'),
    // respond in Urdu (or their regional language) rather than English
    if (cleanSelected === 'en') {
      return 'ur';
    }
  }

  return cleanSelected;
}

export function getGlobalLanguageDirective(languageCode: string): string {
  const code = (languageCode || 'ur').toLowerCase().trim();

  switch (code) {
    case 'ps':
      return `CRITICAL MULTILINGUAL REQUIREMENT — PASHTO (پښتو):
The target response language is PASHTO (پښتو).
1. You MUST generate your ENTIRE response, headings, explanations, bullet points, step-by-step guides, and advice in authentic, natural, grammatically accurate Pashto (پښتو) using standard Pashto Arabic script (including proper Pashto letters: ښ, ځ, څ, ډ, ړ, ږ, ڼ, ې, ۍ, ۀ).
2. Whether the user's question is written in Pashto, English, Urdu, or Roman script, understand the question completely and write your full answer ONLY in Pashto (پښتو).
3. NEVER reply in Urdu, Persian/Farsi, or English. Use genuine Pashto vocabulary (e.g., لومړی, دوهم, مهم ټکي, لنډیز, لارښوونه, ستاسو, په اړه).`;

    case 'bal':
      return `CRITICAL MULTILINGUAL REQUIREMENT — BALOCHI (بلوچی):
The target response language is BALOCHI (بلوچی).
1. You MUST generate your ENTIRE response, headings, explanations, bullet points, step-by-step guides, and advice in authentic, natural Balochi (بلوچی) using standard Balochi Perso-Arabic script.
2. Use genuine Balochi grammar, pronouns, verbs, and vocabulary (e.g., شما, شمارا, وتی, من, ما, کُت, کن ات, گوں, ہست, انت, نبشتہ, سرپدی, رہشونی, گام پہ گام) — do NOT substitute standard Urdu sentences.
3. Whether the user's question is written in Balochi, Urdu, or English, understand their question and write your complete answer ONLY in Balochi (بلوچی).
4. NEVER default to English or standard Urdu.`;

    case 'sd':
      return `CRITICAL MULTILINGUAL REQUIREMENT — SINDHI (سنڌي):
The target response language is SINDHI (سنڌي).
1. You MUST generate your ENTIRE response, headings, explanations, bullet points, step-by-step guides, and advice in authentic, fluent Sindhi (سنڌي) using standard Sindhi Arabic script with proper Sindhi characters (ڄ, ڃ, ڳ, ڱ, ڪ, ڇ, ڌ, ٿ, ڦ, ٺ, ڏ, ڙ).
2. Whether the user's question is in Sindhi, Urdu, or English, understand it and provide your complete answer ONLY in Sindhi (سنڌي).
3. NEVER default to English or Urdu.`;

    case 'pa':
      return `CRITICAL MULTILINGUAL REQUIREMENT — PUNJABI (پنجابی - شاہ مکھی):
The target response language is Pakistani PUNJABI (پنجابی) in Shahmukhi script.
1. You MUST generate your ENTIRE response, headings, explanations, bullet points, step-by-step guides, and advice in authentic, natural Pakistani Punjabi (پنجابی / شاہ مکھی).
2. Use genuine Punjabi vocabulary and grammar (e.g., تہاڈا, تہانوں, وچ, نال, کیہ, ایہہ, آکھیا, کیتا, لئی, دسیا, طریقے) rather than standard Urdu grammar.
3. Whether the user's question is in Punjabi, Urdu, or English, understand it and write your complete answer ONLY in Punjabi (پنجابی).
4. NEVER default to English or standard Urdu.`;

    case 'skr':
      return `CRITICAL MULTILINGUAL REQUIREMENT — SARAIKI (سرائیکی):
The target response language is SARAIKI (سرائیکی).
1. You MUST generate your ENTIRE response, headings, explanations, steps, and advice in authentic, sweet Saraiki (سرائیکی) using Saraiki script characters (ݙ, ڳ, ݨ, ڄ, ٻ).
2. Understand the question in whatever language the user typed, and answer completely in Saraiki (سرائیکی).`;

    case 'hnd':
      return `CRITICAL MULTILINGUAL REQUIREMENT — HINDKO (ہندکو):
The target response language is HINDKO (ہندکو).
1. You MUST generate your ENTIRE response, explanations, steps, and advice in authentic Hindko (ہندکو).`;

    case 'ks':
      return `CRITICAL MULTILINGUAL REQUIREMENT — KASHMIRI (کشمیری):
The target response language is KASHMIRI (کشمیری).
1. You MUST generate your ENTIRE response, explanations, steps, and advice in authentic Kashmiri (کشمیری) using Kashmiri Perso-Arabic script.`;

    case 'brh':
      return `CRITICAL MULTILINGUAL REQUIREMENT — BRAHUI (براہوئی):
The target response language is BRAHUI (براہوئی).
1. You MUST generate your ENTIRE response, explanations, steps, and advice in authentic Brahui (براہوئی).`;

    case 'roman_ur':
    case 'roman':
      return `CRITICAL MULTILINGUAL REQUIREMENT — ROMAN URDU:
The target response language is ROMAN URDU (Urdu written in Latin / English alphabet).
1. You MUST generate your ENTIRE response in natural, fluent, easy-to-read Pakistani Roman Urdu (e.g., "Is ke liye aap ko sab se pehle...").
2. Understand the input in English, Urdu script, or Roman Urdu, and provide your full response in conversational Roman Urdu.`;

    case 'en':
      return `CRITICAL MULTILINGUAL REQUIREMENT — ENGLISH:
The target response language is ENGLISH.
1. You MUST generate your ENTIRE response in clear, concise, professional, grammatically sound English.
2. If the user asked a question in Urdu or a regional language while explicitly requesting an English answer, provide the clear answer in English.`;

    case 'ur':
    default:
      return `CRITICAL MULTILINGUAL REQUIREMENT — URDU (اردو):
The target response language is URDU (اردو).
1. You MUST generate your ENTIRE response, headings, explanations, bullet points, step-by-step guides, and advice in authentic, clear, respectful Pakistani Urdu (اردو رسم الخط / Nastaliq script).
2. Whether the user asks in English, Roman Urdu, or Urdu, understand their question and provide your complete answer ONLY in Urdu (اردو).`;
  }
}
