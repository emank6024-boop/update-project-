import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguageCode } from '../types';
import { SUPPORTED_LANGUAGES } from '../data/languages';

interface LanguageContextType {
  selectedLanguage: LanguageCode;
  setSelectedLanguage: (lang: LanguageCode) => void;
  isRTL: boolean;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'paklingo_selected_language';

// Comprehensive translations for UI across English, Urdu, Punjabi, Sindhi, Pashto, Balochi
const TRANSLATIONS: Record<string, Record<string, string>> = {
  tagline: {
    en: "AI for Pakistan's Languages",
    ur: 'پاکستانی زبانوں کے لیے مصنوعی ذہانت',
    pa: 'پاکستانی بولیاں لئی مصنوعی ذہانت',
    sd: 'پاڪستاني ٻولين لاءِ مصنوعي ذهانت',
    ps: 'د پاکستان ژبو لپاره مصنوعي ذهانت',
    bal: 'پاکستان ءِ زبانانی واستا مصنوعی ذہانت',
    roman_ur: "Pakistan ki zabanon ke liye AI",
  },
  signIn: {
    en: 'Sign In',
    ur: 'لاگ ان کریں',
    pa: 'لاگ ان کرو',
    sd: 'داخل ٿيو',
    ps: 'ننوتل',
    bal: 'پترگ / لاگ ان',
    roman_ur: 'Sign In Karein',
  },
  createAccount: {
    en: 'Create Account',
    ur: 'اکاؤنٹ بنائیں',
    pa: 'اکاؤنٹ بناؤ',
    sd: 'کاتو ٺاهيو',
    ps: 'حساب جوړ کړئ',
    bal: 'اکاؤنٹ جوڑ کن ات',
    roman_ur: 'Account Banayein',
  },
  welcomeBack: {
    en: 'Welcome Back 👋',
    ur: 'خوش آمدید 👋',
    pa: 'جی آیاں نوں 👋',
    sd: 'ڀلي ڪري آيا 👋',
    ps: 'ښه راغلاست 👋',
    bal: 'وش آتکے 👋',
    roman_ur: 'Khush Amdeed 👋',
  },
  welcomeSubtitle: {
    en: "Sign in to continue to PakLingo AI",
    ur: 'پاک لنگو اے آئی میں لاگ ان کریں',
    pa: 'پاک لنگو اے آئی وچ داخل ہوو',
    sd: 'پاڪ لنگو اي آءِ ۾ داخل ٿيو',
    ps: 'پاک لنګو اي آی ته ننوځئ',
    bal: 'پاک لنگو اے آئی ءَ پتر ات',
    roman_ur: 'PakLingo AI mein dakhil hon',
  },
  joinPakLingo: {
    en: 'Create Your Account',
    ur: 'اپنا نیا اکاؤنٹ بنائیں',
    pa: 'اپنا نواں اکاؤنٹ بناؤ',
    sd: 'پنهنجو نئون کاتو ٺاهيو',
    ps: 'خپل نوی حساب جوړ کړئ',
    bal: 'وتی نوکیں اکاؤنٹ جوڑ کن ات',
    roman_ur: 'Apna naya account banayein',
  },
  joinSubtitle: {
    en: 'Join thousands of citizens accessing AI in regional languages',
    ur: 'علاقائی زبانوں میں اے آئی تک رسائی حاصل کریں',
    pa: 'اپنی بولیاں وچ اے آئی نال جڑو',
    sd: 'پنهنجي ٻوليءَ ۾ اي آءِ سان ڳنڍجو',
    ps: 'په خپلو ژبو کې د اي آی اسانتیا ترلاسه کړئ',
    bal: 'وتی وتی زبان ءَ اے آئی ءِ کمک گر ات',
    roman_ur: 'Apni zaban mein AI ki sahulat payein',
  },
  emailAddress: {
    en: 'Email Address',
    ur: 'ای میل ایڈریس',
    pa: 'ای میل پتہ',
    sd: 'اي ميل پتو',
    ps: 'برېښنالیک پته',
    bal: 'ای میل پتا',
    roman_ur: 'Email Address',
  },
  password: {
    en: 'Password',
    ur: 'پاس ورڈ',
    pa: 'پاس ورڈ',
    sd: 'ڳجهو لفظ (پاسورڊ)',
    ps: 'پټ نوم (پاسورډ)',
    bal: 'پاسورڈ',
    roman_ur: 'Password',
  },
  confirmPassword: {
    en: 'Confirm Password',
    ur: 'پاس ورڈ کی تصدیق کریں',
    pa: 'پاس ورڈ دی تصدیق کرو',
    sd: 'پاسورڊ جي تصديق ڪريو',
    ps: 'د پاسورډ تصدیق',
    bal: 'پاسورڈ ءِ تصدیق',
    roman_ur: 'Password Confirm Karein',
  },
  fullName: {
    en: 'Full Name',
    ur: 'پورا نام',
    pa: 'پورا ناں',
    sd: 'پورو نالو',
    ps: 'بشپړ نوم',
    bal: 'سرجمیں نام',
    roman_ur: 'Pura Naam',
  },
  forgotPassword: {
    en: 'Forgot Password?',
    ur: 'پاس ورڈ بھول گئے؟',
    pa: 'پاس ورڈ بھل گئے؟',
    sd: 'پاسورڊ وسري ويو؟',
    ps: 'پاسورډ مو هېر شوی؟',
    bal: 'پاسورڈ شموشتگ؟',
    roman_ur: 'Password bhool gaye?',
  },
  demoMode: {
    en: 'Demo Mode',
    ur: 'ڈیمو موڈ (سہولت آزمائش)',
    pa: 'ڈیمو موڈ',
    sd: 'ڊيمو موڊ',
    ps: 'د ازموینې موډ',
    bal: 'ڈیمو موڈ',
    roman_ur: 'Demo Mode',
  },
  demoDisclaimer: {
    en: 'Simulated testing sessions. No credentials or personal data are stored.',
    ur: 'آزمائشی سیشن۔ کوئی ذاتی معلومات محفوظ نہیں کی جاتیں۔',
    pa: 'ٹیسٹنگ لئی فرضی سیشن۔ کوئی ذاتی ڈیٹا محفوظ نہیں ہوندا۔',
    sd: 'آزمائشي سيشن. ڪا به ذاتي ڄاڻ محفوظ نه ٿيندي آهي.',
    ps: 'ازمایښتي سیشن. هېڅ شخصي معلومات نه ساتل کېږي.',
    bal: 'آزمائشی سیشن۔ ہچ وڑیں ذاتی ڈیٹا محفوظ نہ بیت۔',
    roman_ur: 'Testing session. Koi personal data store nahi hota.',
  },
  demoStudent: {
    en: 'Demo Student',
    ur: 'طالب علم ڈیمو (Student)',
    pa: 'طالب علم ڈیمو',
    sd: 'شاگرد ڊيمو',
    ps: 'زده کوونکی ډیمو',
    bal: 'وانندہ ڈیمو',
    roman_ur: 'Demo Student',
  },
  demoFaculty: {
    en: 'Demo Faculty',
    ur: 'استاد ڈیمو (Faculty)',
    pa: 'استاد ڈیمو',
    sd: 'استاد ڊيمو',
    ps: 'استاد ډیمو',
    bal: 'استاد ڈیمو',
    roman_ur: 'Demo Faculty',
  },
  dontHaveAccount: {
    en: "Don't have an account?",
    ur: 'اکاؤنٹ موجود نہیں ہے؟',
    pa: 'اکاؤنٹ نئیں اے؟',
    sd: 'ڪاتو موجود ناهي؟',
    ps: 'حساب نه لرئ؟',
    bal: 'اکاؤنٹ نیست انت؟',
    roman_ur: 'Account nahi hai?',
  },
  alreadyHaveAccount: {
    en: 'Already have an account?',
    ur: 'پہلے سے اکاؤنٹ موجود ہے؟',
    pa: 'پہلاں توں اکاؤنٹ اے؟',
    sd: 'اڳ ۾ ئي کاتو موجود آهي؟',
    ps: 'له وړاندې حساب لرئ؟',
    bal: 'پیشتر اکاؤنٹ است انت؟',
    roman_ur: 'Pehle se account hai?',
  },
  orDivider: {
    en: 'OR',
    ur: 'یا',
    pa: 'یا',
    sd: 'يا',
    ps: 'یا',
    bal: 'یا',
    roman_ur: 'YA',
  },
  lightMode: {
    en: 'Light',
    ur: 'لائٹ موڈ',
    pa: 'لائٹ موڈ',
    sd: 'لائيٽ موڊ',
    ps: 'روښانه',
    bal: 'روژنا موڈ',
    roman_ur: 'Light Mode',
  },
  darkMode: {
    en: 'Dark',
    ur: 'ڈارک موڈ',
    pa: 'ڈارک موڈ',
    sd: 'ڊارڪ موڊ',
    ps: 'تیاره',
    bal: 'تہار موڈ',
    roman_ur: 'Dark Mode',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLanguage, setSelectedLanguageState] = useState<LanguageCode>(() => {
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

  const setSelectedLanguage = (lang: LanguageCode) => {
    setSelectedLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage);
  // RTL applies to Urdu and other Arabic-script languages of Pakistan
  const isRTL = currentLangObj ? currentLangObj.script === 'rtl' : true;

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = selectedLanguage;
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    }
  }, [selectedLanguage, isRTL]);

  const t = (key: string): string => {
    if (TRANSLATIONS[key] && TRANSLATIONS[key][selectedLanguage]) {
      return TRANSLATIONS[key][selectedLanguage];
    }
    if (TRANSLATIONS[key] && TRANSLATIONS[key]['en']) {
      return TRANSLATIONS[key]['en'];
    }
    return key;
  };

  return (
    <LanguageContext.Provider
      value={{
        selectedLanguage,
        setSelectedLanguage,
        isRTL,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
