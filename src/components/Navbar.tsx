import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  X,
  Globe2,
  ChevronDown,
  Volume2,
  Settings as SettingsIcon,
  LogOut,
  User,
  Sun,
  Moon,
  Sparkles,
  Check,
  BookOpen,
  Languages,
  Mic,
  FileText,
  HeartPulse,
  Scale,
  GraduationCap,
  Presentation,
  Building2,
  Sprout,
  ShieldCheck,
  HandHelping,
  Bot,
} from 'lucide-react';
import { PageId, LanguageCode } from '../types';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { useAuth } from '../context/AuthContext';
import { useVoiceSettings } from '../context/VoiceSettingsContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  selectedLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onScrollToSection?: (sectionId: string) => void;
  onOpenAuthModal?: () => void;
}

interface FeatureDropdownItem {
  id: PageId;
  titleKey: string;
  defaultTitle: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onSelectPage,
  selectedLanguage,
  onSelectLanguage,
  onOpenAuthModal,
}) => {
  const { user, logout } = useAuth();
  const { openVoiceModal } = useVoiceSettings();
  const { t, setSelectedLanguage: setGlobalLanguage, isRTL } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isFeaturesDropdownOpen, setIsFeaturesDropdownOpen] = useState(false);

  const activeLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) ||
    SUPPORTED_LANGUAGES[0];

  const handleNavClick = (pageId: PageId) => {
    onSelectPage(pageId);
    setIsMobileMenuOpen(false);
    setIsFeaturesDropdownOpen(false);
  };

  const handleLanguageSelect = (code: LanguageCode) => {
    onSelectLanguage(code);
    setGlobalLanguage(code);
    setIsLangDropdownOpen(false);
  };

  const featuresList: FeatureDropdownItem[] = [
    { id: 'translate', titleKey: 'nav.translator', defaultTitle: 'Regional Translator', icon: Languages },
    { id: 'voice-assistant', titleKey: 'nav.voiceAssistant', defaultTitle: 'Voice Assistant & Audio', icon: Mic },
    { id: 'documents', titleKey: 'nav.documents', defaultTitle: 'OCR Document Intelligence', icon: FileText },
    { id: 'medical', titleKey: 'module.medical.title', defaultTitle: 'Medical Tools', icon: HeartPulse },
    { id: 'legal', titleKey: 'module.legal.title', defaultTitle: 'Legal Information', icon: Scale },
    { id: 'student', titleKey: 'nav.studentDashboard', defaultTitle: 'Student Dashboard', icon: GraduationCap },
    { id: 'faculty', titleKey: 'nav.facultyDashboard', defaultTitle: 'Faculty Dashboard', icon: Presentation },
    { id: 'government', titleKey: 'module.government.title', defaultTitle: 'Civic & NADRA Services', icon: Building2 },
    { id: 'farmer', titleKey: 'module.farmer.title', defaultTitle: 'Farmer Advisory AI', icon: Sprout },
    { id: 'fake-news', titleKey: 'module.factCheck.title', defaultTitle: 'Fact Check & News Verifier', icon: ShieldCheck },
    { id: 'sign-language', titleKey: 'module.signLanguage.title', defaultTitle: 'Pakistan Sign Language (PSL)', icon: HandHelping },
    { id: 'chat', titleKey: 'module.chat.title', defaultTitle: 'AI Chat Assistant', icon: Bot },
  ];

  const isFeaturesActive = [
    'medical',
    'legal',
    'student',
    'student-dashboard',
    'faculty',
    'faculty-dashboard',
    'teacher',
    'government',
    'farmer',
    'fake-news',
    'sign-language',
    'chat',
    'ai-assistant',
  ].includes(currentPage);

  return (
    <header
      id="main-navbar"
      className="sticky top-0 z-50 transition-colors duration-200 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md text-[var(--text-primary)] shadow-xs"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline (Click returns to Homepage) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 cursor-pointer focus:outline-hidden group text-start"
              aria-label="PakLingo AI Home"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:bg-emerald-700 transition-colors shrink-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.5 4.5a8 8 0 1 0 0 15 8.5 8.5 0 1 1 0-15z" />
                  <polygon points="17,7 18,9 20.2,9 18.5,10.5 19.1,12.7 17,11.3 14.9,12.7 15.5,10.5 13.8,9 16,9" />
                </svg>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold tracking-tight text-[var(--text-primary)]">
                    PakLingo <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">AI</span>
                  </span>
                </div>
                <span className="hidden sm:inline text-[11px] text-[var(--text-muted)] font-medium tracking-tight">
                  {t('brand.tagline', "AI for Pakistan's Languages")}
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
            {/* Home */}
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                currentPage === 'home'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
              }`}
            >
              {t('nav.home', 'Home')}
            </button>

            {/* Translator */}
            <button
              onClick={() => handleNavClick('translate')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                currentPage === 'translate' || currentPage === 'translator'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
              }`}
            >
              {t('nav.translator', 'Translator')}
            </button>

            {/* Voice Assistant */}
            <button
              onClick={() => handleNavClick('voice-assistant')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                currentPage === 'voice-assistant' || currentPage === 'voice' || currentPage === 'tts-stt'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
              }`}
            >
              {t('nav.voiceAssistant', 'Voice & Audio')}
            </button>

            {/* OCR Documents */}
            <button
              onClick={() => handleNavClick('documents')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                currentPage === 'documents' || currentPage === 'ocr-documents' || (currentPage as string) === 'ocr'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
              }`}
            >
              {t('nav.documents', 'OCR Documents')}
            </button>

            {/* Organized Features Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFeaturesDropdownOpen(!isFeaturesDropdownOpen)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isFeaturesActive
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
                }`}
              >
                <span>{t('nav.features', 'Features')}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isFeaturesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isFeaturesDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsFeaturesDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className={`absolute ${isRTL ? 'right-0' : 'left-0'} mt-2 w-80 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xl p-2 z-50`}
                    >
                      <div className="px-3 py-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)] mb-1">
                        {t('nav.dedicatedTools', 'Specialized AI Pages')}
                      </div>
                      <div className="grid grid-cols-1 gap-1 max-h-96 overflow-y-auto">
                        {featuresList.map((item) => {
                          const Icon = item.icon;
                          const isActive = currentPage === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleNavClick(item.id)}
                              className={`w-full p-2.5 rounded-xl text-start flex items-center gap-3 text-xs transition-colors cursor-pointer ${
                                isActive
                                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold'
                                  : 'text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
                              }`}
                            >
                              <div className="w-7 h-7 rounded-lg bg-[var(--surface-secondary)] flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="flex-1 font-medium">{t(item.titleKey, item.defaultTitle)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Blog */}
            <button
              onClick={() => handleNavClick('blog')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                currentPage === 'blog'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
              }`}
            >
              {t('nav.blog', 'Blog')}
            </button>

            {/* Settings */}
            <button
              onClick={() => handleNavClick('settings')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                currentPage === 'settings'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
              }`}
            >
              {t('nav.accessibility', 'Settings')}
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle (Light / Dark) */}
            <button
              type="button"
              onClick={toggleTheme}
              title={`Switch theme (Current: ${isDark ? 'Dark Mode' : 'Light Mode'})`}
              className="p-2 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-medium"
              aria-label="Toggle dark and light theme"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden md:inline text-[11px]">{t('nav.light', 'Light')}</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-emerald-600" />
                  <span className="hidden md:inline text-[11px]">{t('nav.dark', 'Dark')}</span>
                </>
              )}
            </button>

            {/* Speech Settings Quick Toggle */}
            <button
              type="button"
              onClick={openVoiceModal}
              title={t('nav.voiceSettings', 'Voice Audio Settings')}
              className="p-2 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:scale-95 transition-all cursor-pointer"
              aria-label="Voice and speech settings"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Central Language Selector Dropdown (Available on ALL pages) */}
            <div className="relative">
              <button
                type="button"
                id="main-language-selector-button"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs text-[var(--text-primary)] transition-all cursor-pointer shadow-2xs"
                aria-label={t('nav.selectLanguage', 'Select interface language')}
              >
                <Globe2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold">{activeLang.nativeName}</span>
                <span className="hidden sm:inline text-[11px] text-[var(--text-muted)]">({activeLang.name})</span>
                <ChevronDown className={`w-3 h-3 text-[var(--text-muted)] transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isLangDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsLangDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-72 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xl py-1.5 z-50 max-h-96 overflow-y-auto`}
                    >
                      <div className="px-3 py-2 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)]">
                        {t('nav.selectLanguage', 'Select Interface Language')}
                      </div>
                      <div className="py-1">
                        {SUPPORTED_LANGUAGES.map((lang) => {
                          const isSelected = selectedLanguage === lang.code;
                          return (
                            <button
                              key={lang.code}
                              type="button"
                              onClick={() => handleLanguageSelect(lang.code)}
                              className={`w-full px-3.5 py-2 text-start flex items-center justify-between text-xs transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold'
                                  : 'text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-base">{lang.flag || '🇵🇰'}</span>
                                <div className="flex flex-col">
                                  <span className="font-semibold">{lang.nativeName}</span>
                                  <span className="text-[10px] text-[var(--text-muted)]">{lang.name} • {lang.region}</span>
                                </div>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile / Login Button */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => handleNavClick('dashboard')}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] text-xs text-[var(--text-primary)] transition-all cursor-pointer shadow-2xs"
                  title={user.name}
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline font-semibold max-w-[90px] truncate">{user.name}</span>
                </button>
              </div>
            ) : (
              onOpenAuthModal && (
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('nav.signIn', 'Sign In')}</span>
                </button>
              )
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3 space-y-3 max-h-[80vh] overflow-y-auto"
          >
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleNavClick('home')}
                className={`px-3 py-2.5 rounded-xl text-xs font-medium text-start transition-all cursor-pointer ${
                  currentPage === 'home'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                {t('nav.home', 'Home')}
              </button>
              <button
                onClick={() => handleNavClick('translate')}
                className={`px-3 py-2.5 rounded-xl text-xs font-medium text-start transition-all cursor-pointer ${
                  currentPage === 'translate'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                {t('nav.translator', 'Translator')}
              </button>
              <button
                onClick={() => handleNavClick('voice-assistant')}
                className={`px-3 py-2.5 rounded-xl text-xs font-medium text-start transition-all cursor-pointer ${
                  currentPage === 'voice-assistant'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                {t('nav.voiceAssistant', 'Voice & Audio')}
              </button>
              <button
                onClick={() => handleNavClick('documents')}
                className={`px-3 py-2.5 rounded-xl text-xs font-medium text-start transition-all cursor-pointer ${
                  currentPage === 'documents'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                {t('nav.documents', 'OCR Documents')}
              </button>
              <button
                onClick={() => handleNavClick('student')}
                className={`px-3 py-2.5 rounded-xl text-xs font-medium text-start transition-all cursor-pointer ${
                  currentPage === 'student'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                {t('nav.studentDashboard', 'Student Hub')}
              </button>
              <button
                onClick={() => handleNavClick('faculty')}
                className={`px-3 py-2.5 rounded-xl text-xs font-medium text-start transition-all cursor-pointer ${
                  currentPage === 'faculty'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                {t('nav.facultyDashboard', 'Faculty Hub')}
              </button>
              <button
                onClick={() => handleNavClick('medical')}
                className={`px-3 py-2.5 rounded-xl text-xs font-medium text-start transition-all cursor-pointer ${
                  currentPage === 'medical'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                {t('module.medical.title', 'Medical Tools')}
              </button>
              <button
                onClick={() => handleNavClick('legal')}
                className={`px-3 py-2.5 rounded-xl text-xs font-medium text-start transition-all cursor-pointer ${
                  currentPage === 'legal'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                {t('module.legal.title', 'Legal Tools')}
              </button>
              <button
                onClick={() => handleNavClick('blog')}
                className={`px-3 py-2.5 rounded-xl text-xs font-medium text-start transition-all cursor-pointer ${
                  currentPage === 'blog'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                {t('nav.blog', 'Blog')}
              </button>
              <button
                onClick={() => handleNavClick('settings')}
                className={`px-3 py-2.5 rounded-xl text-xs font-medium text-start transition-all cursor-pointer ${
                  currentPage === 'settings'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                {t('nav.accessibility', 'Settings')}
              </button>
            </div>

            {user && (
              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)] truncate">
                  {user.name} ({user.email})
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-500/10 transition-colors"
                >
                  {t('nav.logout', 'Sign Out')}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
