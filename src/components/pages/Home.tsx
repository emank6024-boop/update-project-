import React from 'react';
import {
  Languages,
  Bot,
  Volume2,
  FileText,
  HeartPulse,
  Scale,
  GraduationCap,
  Presentation,
  BookOpen,
  Settings as SettingsIcon,
  Building2,
  Sprout,
  ArrowRight,
  Sparkles,
  Globe2,
  Mic,
} from 'lucide-react';
import { PageId, LanguageCode } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../data/languages';
import { useLanguage } from '../../context/LanguageContext';

interface HomeProps {
  onSelectPage: (page: PageId) => void;
  selectedLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onStartChatWithPrompt?: (prompt: string) => void;
  onOpenAuthModal?: () => void;
  simpleMode?: boolean;
}

interface FeatureCard {
  id: PageId;
  titleKey: string;
  defaultTitle: string;
  descKey: string;
  defaultDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  btnLabelKey: string;
  defaultBtnLabel: string;
}

export const Home: React.FC<HomeProps> = ({
  onSelectPage,
  selectedLanguage,
  onSelectLanguage,
}) => {
  const { isRTL, t, setSelectedLanguage: setGlobalLanguage, currentLanguage } = useLanguage();

  const handleLanguageClick = (langCode: LanguageCode) => {
    onSelectLanguage(langCode);
    setGlobalLanguage(langCode);
  };

  const featureCards: FeatureCard[] = [
    {
      id: 'translate',
      titleKey: 'feature.translator.title',
      defaultTitle: 'Regional Language Translator',
      descKey: 'feature.translator.desc',
      defaultDesc: 'Real-time bidirectional translation across Urdu, Punjabi, Sindhi, Pashto, Balochi, English, and more.',
      icon: Languages,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      btnLabelKey: 'feature.translator.btn',
      defaultBtnLabel: 'Explore Feature',
    },
    {
      id: 'voice-assistant',
      titleKey: 'feature.voice.title',
      defaultTitle: 'Voice Assistant',
      descKey: 'feature.voice.desc',
      defaultDesc: 'Hands-free spoken conversations with natural speech recognition and localized dialect responses.',
      icon: Volume2,
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      btnLabelKey: 'feature.voice.btn',
      defaultBtnLabel: 'Explore Feature',
    },
    {
      id: 'tts-stt',
      titleKey: 'feature.tts.title',
      defaultTitle: 'Text-to-Speech & Speech-to-Text',
      descKey: 'feature.tts.desc',
      defaultDesc: 'High-quality regional voice synthesis, audio speed adjustments, and live microphone audio transcription.',
      icon: Mic,
      iconBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
      btnLabelKey: 'feature.tts.btn',
      defaultBtnLabel: 'Get Started',
    },
    {
      id: 'documents',
      titleKey: 'feature.ocr.title',
      defaultTitle: 'OCR Document Intelligence',
      descKey: 'feature.ocr.desc',
      defaultDesc: 'Extract and translate printed or handwritten text from Pakistani CNICs, utility bills, and official records.',
      icon: FileText,
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      btnLabelKey: 'feature.ocr.btn',
      defaultBtnLabel: 'Explore Feature',
    },
    {
      id: 'medical',
      titleKey: 'feature.medical.title',
      defaultTitle: 'Medical Tools & Health Guidance',
      descKey: 'feature.medical.desc',
      defaultDesc: 'Multilingual symptom checker, first-aid advice, and healthcare triage with safety disclaimers.',
      icon: HeartPulse,
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      btnLabelKey: 'feature.medical.btn',
      defaultBtnLabel: 'Explore Feature',
    },
    {
      id: 'legal',
      titleKey: 'feature.legal.title',
      defaultTitle: 'Legal Information & Rights Tools',
      descKey: 'feature.legal.desc',
      defaultDesc: 'Citizen legal guidance, tenancy agreements, consumer rights, and labor law procedures in plain language.',
      icon: Scale,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      btnLabelKey: 'feature.legal.btn',
      defaultBtnLabel: 'Explore Feature',
    },
    {
      id: 'student',
      titleKey: 'feature.student.title',
      defaultTitle: 'Student Dashboard',
      descKey: 'feature.student.desc',
      defaultDesc: 'Interactive regional-language tutoring, Pakistani board exam practice quizzes, and subject study guides.',
      icon: GraduationCap,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
      btnLabelKey: 'feature.student.btn',
      defaultBtnLabel: 'Get Started',
    },
    {
      id: 'faculty',
      titleKey: 'feature.faculty.title',
      defaultTitle: 'Faculty & Educator Dashboard',
      descKey: 'feature.faculty.desc',
      defaultDesc: 'Bilingual lesson plan generation, grading rubric authoring, and board-standard exam question banks.',
      icon: Presentation,
      iconBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
      btnLabelKey: 'feature.faculty.btn',
      defaultBtnLabel: 'Explore Feature',
    },
    {
      id: 'government',
      titleKey: 'feature.gov.title',
      defaultTitle: 'Civic & Government Services',
      descKey: 'feature.gov.desc',
      defaultDesc: 'Step-by-step citizen assistance for NADRA, BISP 8171, passport applications, and utility bills.',
      icon: Building2,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      btnLabelKey: 'feature.gov.btn',
      defaultBtnLabel: 'Explore Feature',
    },
    {
      id: 'farmer',
      titleKey: 'feature.farmer.title',
      defaultTitle: 'Farmer Agricultural Advisory',
      descKey: 'feature.farmer.desc',
      defaultDesc: 'Crop disease diagnosis, pesticide recommendations, mandi rate updates, and weather advisories.',
      icon: Sprout,
      iconBg: 'bg-lime-500/10 text-lime-600 dark:text-lime-400',
      btnLabelKey: 'feature.farmer.btn',
      defaultBtnLabel: 'Explore Feature',
    },
    {
      id: 'blog',
      titleKey: 'feature.blog.title',
      defaultTitle: 'Blog & Linguistic Knowledge',
      descKey: 'feature.blog.desc',
      defaultDesc: 'In-depth articles exploring Pakistani linguistic heritage, regional dialects, and AI innovation.',
      icon: BookOpen,
      iconBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
      btnLabelKey: 'feature.blog.btn',
      defaultBtnLabel: 'Explore Feature',
    },
    {
      id: 'settings',
      titleKey: 'feature.settings.title',
      defaultTitle: 'Profile & Accessibility Settings',
      descKey: 'feature.settings.desc',
      defaultDesc: 'Personalize language preferences, toggle dark/light theme, adjust font sizes, and screen reader modes.',
      icon: SettingsIcon,
      iconBg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
      btnLabelKey: 'feature.settings.btn',
      defaultBtnLabel: 'Get Started',
    },
  ];

  return (
    <div
      className="w-full min-h-[calc(100vh-4rem)] flex flex-col bg-[var(--background)] text-[var(--text-primary)] transition-colors duration-200"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* 1. PROFESSIONAL HERO SECTION */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-10 sm:pb-14 text-center flex flex-col items-center">
        {/* Brand Tagline Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-5 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{t('hero.badge', 'AI for Pakistan’s Languages & People')}</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] max-w-4xl mx-auto leading-tight sm:leading-tight mb-4">
          {t('hero.title', 'Empowering Every Pakistani Through AI, Language, and Accessibility')}
        </h1>

        {/* Short, Clear Description */}
        <p className="text-sm sm:text-base md:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed mb-8 font-normal">
          {t(
            'hero.description',
            'PakLingo AI connects Pakistan’s diverse linguistic heritage with cutting-edge artificial intelligence. Access dedicated tools for regional translation, voice assistance, document scanning, education, healthcare, and citizen guidance.'
          )}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onSelectPage('translate')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Languages className="w-4 h-4" />
            <span>{t('hero.getStarted', 'Launch Translator')}</span>
            <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('features-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] active:scale-95 border border-[var(--border)] text-[var(--text-primary)] text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('hero.exploreFeatures', 'Explore Features')}</span>
          </button>
        </div>
      </section>

      {/* 2. ATTRACTIVE FEATURE CARDS SECTION */}
      <section id="features-section" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('features.badge', 'Dedicated Feature Hub')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            {t('features.heading', 'Specialized AI & Language Features')}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            {t(
              'features.subheading',
              'Each tool has its own dedicated page with complete interactive controls, settings, and privacy guarantees.'
            )}
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((card) => {
            const Icon = card.icon;
            const title = t(card.titleKey, card.defaultTitle);
            const desc = t(card.descKey, card.defaultDesc);
            const btnLabel = t(card.btnLabelKey, card.defaultBtnLabel);

            return (
              <div
                key={card.id}
                className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] hover:border-emerald-500/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-3.5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${card.iconBg}`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] group-hover:text-emerald-600 transition-colors">
                    {title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    {desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border)]">
                  <button
                    type="button"
                    onClick={() => onSelectPage(card.id)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-300 hover:text-white text-xs font-semibold transition-all cursor-pointer group/btn"
                  >
                    <span>{btnLabel}</span>
                    <ArrowRight className={`w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1 ${isRTL ? 'rotate-180 group-hover/btn:-translate-x-1' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. BRIEF SUPPORTED-LANGUAGES SECTION */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 my-4 border-y border-[var(--border)] bg-[var(--surface)] transition-colors">
        <div className="text-center max-w-2xl mx-auto mb-6 space-y-1.5">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <Globe2 className="w-4 h-4" />
            <span>{t('languages.heading', 'Supported Pakistani Languages')}</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            {t(
              'languages.subheading',
              'Built natively for Pakistan’s national and regional languages with full right-to-left (RTL) support.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = selectedLanguage === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageClick(lang.code)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-[var(--surface-secondary)] hover:bg-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title={`Switch interface language to ${lang.name}`}
              >
                <span>{lang.flag}</span>
                <span className="font-bold">{lang.nativeName}</span>
                <span className="text-[11px] opacity-75">({lang.name})</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. SMALL FOOTER WITH USEFUL LINKS */}
      <footer className="w-full bg-[var(--surface)] border-t border-[var(--border)] py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo and brief intro */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.5 4.5a8 8 0 1 0 0 15 8.5 8.5 0 1 1 0-15z" />
                  <polygon points="17,7 18,9 20.2,9 18.5,10.5 19.1,12.7 17,11.3 14.9,12.7 15.5,10.5 13.8,9 16,9" />
                </svg>
              </div>
              <div className="text-start">
                <span className="font-bold text-sm text-[var(--text-primary)]">
                  PakLingo <span className="text-emerald-600 dark:text-emerald-400">AI</span>
                </span>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {t('brand.tagline', 'AI for Pakistan’s Languages')}
                </p>
              </div>
            </div>

            {/* Useful Navigation Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-[var(--text-secondary)]">
              <button
                type="button"
                onClick={() => onSelectPage('translate')}
                className="hover:text-emerald-600 cursor-pointer transition-colors"
              >
                {t('nav.translator', 'Translator')}
              </button>
              <button
                type="button"
                onClick={() => onSelectPage('voice-assistant')}
                className="hover:text-emerald-600 cursor-pointer transition-colors"
              >
                {t('nav.voiceAssistant', 'Voice Assistant')}
              </button>
              <button
                type="button"
                onClick={() => onSelectPage('documents')}
                className="hover:text-emerald-600 cursor-pointer transition-colors"
              >
                {t('nav.documents', 'OCR Documents')}
              </button>
              <button
                type="button"
                onClick={() => onSelectPage('medical')}
                className="hover:text-emerald-600 cursor-pointer transition-colors"
              >
                {t('module.medical.title', 'Medical Tools')}
              </button>
              <button
                type="button"
                onClick={() => onSelectPage('legal')}
                className="hover:text-emerald-600 cursor-pointer transition-colors"
              >
                {t('module.legal.title', 'Legal Tools')}
              </button>
              <button
                type="button"
                onClick={() => onSelectPage('student')}
                className="hover:text-emerald-600 cursor-pointer transition-colors"
              >
                {t('nav.studentDashboard', 'Student Hub')}
              </button>
              <button
                type="button"
                onClick={() => onSelectPage('blog')}
                className="hover:text-emerald-600 cursor-pointer transition-colors"
              >
                {t('nav.blog', 'Blog')}
              </button>
              <button
                type="button"
                onClick={() => onSelectPage('settings')}
                className="hover:text-emerald-600 cursor-pointer transition-colors"
              >
                {t('nav.accessibility', 'Settings')}
              </button>
            </div>

            {/* Copyright */}
            <div className="text-[11px] text-[var(--text-muted)]">
              <span>© 2026 PakLingo AI. {t('footer.rights', 'Engineered for Pakistan.')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
