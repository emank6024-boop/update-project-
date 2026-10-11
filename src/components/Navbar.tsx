import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  X,
  Globe2,
  ChevronDown,
  User,
  Sun,
  Moon,
  Check,
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
  Palette,
  RotateCcw,
  BookOpen,
  Settings as SettingsIcon,
  Home as HomeIcon,
} from 'lucide-react';
import { PageId, LanguageCode } from '../types';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  useTheme,
  ACCENT_PRESETS,
  DEFAULT_ACCENT_ID,
  isValidHexInput,
  normalizeHex,
} from '../context/ThemeContext';
import { PakLingoLogo } from './PakLingoLogo';

interface NavbarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  selectedLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
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
  const { t, setSelectedLanguage: setGlobalLanguage, isRTL } = useLanguage();
  const {
    isDark,
    mode,
    setMode,
    toggleTheme,
    accentId,
    accentColor,
    setAccentPreset,
    setCustomAccentColor,
    resetThemeToDefault,
    contrastInfo,
  } = useTheme();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isFeaturesDropdownOpen, setIsFeaturesDropdownOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);

  const activeLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) ||
    SUPPORTED_LANGUAGES[0];

  const handleNavClick = (pageId: PageId) => {
    onSelectPage(pageId);
    setIsMobileMenuOpen(false);
    setIsFeaturesDropdownOpen(false);
    setIsThemeDropdownOpen(false);
  };

  const handleLanguageSelect = (code: LanguageCode) => {
    onSelectLanguage(code);
    setGlobalLanguage(code);
    setIsLangDropdownOpen(false);
  };

  const featuresList: FeatureDropdownItem[] = [
    { id: 'chat', titleKey: 'module.chat.title', defaultTitle: 'AI Multimodal Assistant', icon: Bot },
    { id: 'translate', titleKey: 'nav.translator', defaultTitle: 'Regional Translator', icon: Languages },
    { id: 'voice-assistant', titleKey: 'nav.voiceAssistant', defaultTitle: 'Voice Assistant & Audio', icon: Mic },
    { id: 'documents', titleKey: 'nav.documents', defaultTitle: 'OCR Document Intelligence', icon: FileText },
    { id: 'government', titleKey: 'module.government.title', defaultTitle: 'Civic & NADRA Services', icon: Building2 },
    { id: 'medical', titleKey: 'module.medical.title', defaultTitle: 'Medical Tools', icon: HeartPulse },
    { id: 'farmer', titleKey: 'module.farmer.title', defaultTitle: 'Farmer Advisory AI', icon: Sprout },
    { id: 'legal', titleKey: 'module.legal.title', defaultTitle: 'Legal Information', icon: Scale },
    { id: 'teacher', titleKey: 'module.teacher.title', defaultTitle: 'AI Teacher & Lessons', icon: GraduationCap },
    { id: 'student', titleKey: 'nav.studentDashboard', defaultTitle: 'Student Dashboard', icon: GraduationCap },
    { id: 'faculty', titleKey: 'nav.facultyDashboard', defaultTitle: 'Faculty Dashboard', icon: Presentation },
    { id: 'fake-news', titleKey: 'module.factCheck.title', defaultTitle: 'Fact Check & News Verifier', icon: ShieldCheck },
    { id: 'sign-language', titleKey: 'module.signLanguage.title', defaultTitle: 'Pakistan Sign Language (PSL)', icon: HandHelping },
  ];

  const isFeaturesActive = [
    'tools',
    'translate',
    'translator',
    'voice-assistant',
    'voice',
    'tts-stt',
    'documents',
    'ocr-documents',
    'ocr',
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
  ].includes(currentPage);

  return (
    <header
      id="main-navbar"
      className="sticky top-0 z-50 w-full max-w-full shrink-0 transition-colors duration-200 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md text-[var(--text-primary)] shadow-xs overflow-visible"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl w-full min-w-0 mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-1.5 sm:gap-3 min-w-0">
          {/* 1. Brand Logo, Title & Subtitle — Properly Aligned Vertically & Horizontally, Never Clipped */}
          <div className="flex items-center shrink-0 min-w-0">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className="flex items-center py-1 cursor-pointer focus:outline-hidden group text-start overflow-visible"
              aria-label="PakLingo AI Home"
            >
              <PakLingoLogo
                size="md"
                showTagline={true}
                taglineText={t('brand.tagline', "AI for Pakistan's Languages")}
              />
            </button>
          </div>

          {/* 2. Desktop Navigation Links — Evenly Distributed Without Wrapping */}
          <nav
            className="hidden lg:flex items-center justify-center gap-1.5 xl:gap-2.5 flex-1 px-2"
            aria-label="Main Navigation"
          >
            {/* Home */}
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                currentPage === 'home'
                  ? 'bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
              }`}
            >
              {t('nav.home', 'Home')}
            </button>

            {/* AI Assistant */}
            <button
              type="button"
              onClick={() => handleNavClick('ai-assistant')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                currentPage === 'ai-assistant' || currentPage === 'chat'
                  ? 'bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
              }`}
            >
              <Bot className="w-3.5 h-3.5 shrink-0" />
              <span>{t('nav.aiAssistant', 'AI Assistant')}</span>
            </button>

            {/* Features Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFeaturesDropdownOpen(!isFeaturesDropdownOpen)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isFeaturesActive
                    ? 'bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
                }`}
              >
                <span>{t('nav.features', 'Features')}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    isFeaturesDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
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
                      className={`absolute ${
                        isRTL ? 'right-0' : 'left-0'
                      } mt-2 w-80 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xl p-2 z-50`}
                    >
                      <div className="px-3 py-2 flex items-center justify-between border-b border-[var(--border)] mb-1">
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                          {t('nav.dedicatedTools', 'Specialized AI Pages')}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleNavClick('tools')}
                          className="text-[11px] font-bold text-[var(--accent-text)] hover:underline cursor-pointer"
                        >
                          {t('nav.viewAllFeatures', 'View All →')}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-1 max-h-96 overflow-y-auto">
                        {featuresList.map((item) => {
                          const Icon = item.icon;
                          const isActive =
                            currentPage === item.id ||
                            (item.id === 'chat' && currentPage === 'ai-assistant') ||
                            (item.id === 'translate' && currentPage === 'translator');
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleNavClick(item.id)}
                              className={`w-full p-2.5 rounded-xl text-start flex items-center gap-3 text-xs transition-colors cursor-pointer ${
                                isActive
                                  ? 'bg-[var(--accent-subtle)] text-[var(--accent-text)] font-bold'
                                  : 'text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
                              }`}
                            >
                              <div className="w-7 h-7 rounded-lg bg-[var(--surface-secondary)] flex items-center justify-center shrink-0 text-[var(--accent-text)]">
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="flex-1 font-medium text-[var(--text-primary)]">
                                {t(item.titleKey, item.defaultTitle)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Blog & Updates */}
            <button
              type="button"
              onClick={() => handleNavClick('blog')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                currentPage === 'blog'
                  ? 'bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
              }`}
            >
              {t('nav.blog', 'Blog & Updates')}
            </button>

            {/* Settings */}
            <button
              type="button"
              onClick={() => handleNavClick('settings')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                currentPage === 'settings'
                  ? 'bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
              }`}
            >
              {t('nav.accessibility', 'Settings')}
            </button>
          </nav>

          {/* 3. Right Action Controls: Theme, Light/Dark Mode, Language Selector, User Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
            {/* Theme Color Picker Popover Button (Desktop/Tablet — Mobile has swatches in Drawer) */}
            <div className="relative hidden sm:block">
              <button
                type="button"
                id="navbar-theme-color-picker-btn"
                onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                title={t('settings.themeTitle', 'Customize Theme & Accent Color')}
                className="h-9 px-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
                aria-label="Customize theme and accent color"
                aria-expanded={isThemeDropdownOpen}
              >
                <span
                  className="theme-swatch keep-white w-3.5 h-3.5 rounded-full border border-black/20 dark:border-white/25 shrink-0"
                  style={{ backgroundColor: accentColor }}
                />
                <Palette className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                <span className="hidden xl:inline text-[11px] font-semibold">
                  {t('nav.themeColor', 'Theme')}
                </span>
              </button>

              <AnimatePresence>
                {isThemeDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsThemeDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      role="dialog"
                      aria-label="Theme and Accent Color Picker"
                      className={`absolute ${
                        isRTL ? 'left-0' : 'right-0'
                      } mt-2 w-80 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xl p-3.5 z-50 space-y-3.5`}
                    >
                      {/* Header & Reset */}
                      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                        <span className="text-xs font-bold text-[var(--text-primary)]">
                          {t('settings.themeTitle', 'Theme & Accent Color')}
                        </span>
                        <button
                          type="button"
                          onClick={resetThemeToDefault}
                          disabled={mode === 'light' && accentId === DEFAULT_ACCENT_ID}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--accent-text)] hover:underline disabled:opacity-40 cursor-pointer"
                          title="Reset to default PakLingo AI Emerald theme"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset Default</span>
                        </button>
                      </div>

                      {/* Light / Dark Mode Switcher */}
                      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)]">
                        <button
                          type="button"
                          onClick={() => setMode('light')}
                          aria-pressed={!isDark}
                          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            !isDark
                              ? 'bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] shadow-2xs'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          <Sun className="w-3.5 h-3.5" />
                          <span>Light</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setMode('dark')}
                          aria-pressed={isDark}
                          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            isDark
                              ? 'bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] shadow-2xs'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          <Moon className="w-3.5 h-3.5" />
                          <span>Dark</span>
                        </button>
                      </div>

                      {/* 8 Preset Swatches */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                          Accent Color Presets
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {ACCENT_PRESETS.map((preset) => {
                            const isSelected = accentId === preset.id;
                            return (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => setAccentPreset(preset.id)}
                                aria-label={`Select ${preset.name} accent color`}
                                aria-pressed={isSelected}
                                className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                                  isSelected
                                    ? 'border-[var(--accent)] bg-[var(--accent-subtle)] ring-1 ring-[var(--focus-ring)]'
                                    : 'border-[var(--border)] hover:bg-[var(--surface-secondary)]'
                                }`}
                              >
                                <span
                                  className="theme-swatch keep-white w-5 h-5 rounded-full border border-black/15 flex items-center justify-center shadow-2xs"
                                  style={{ backgroundColor: preset.hex }}
                                >
                                  {isSelected && <Check className="w-3 h-3 text-white" />}
                                </span>
                                <span className="text-[10px] font-semibold text-[var(--text-primary)] truncate max-w-full">
                                  {preset.name.split(' ')[0]}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom Color Picker */}
                      <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between gap-2">
                        <label
                          htmlFor="navbar-custom-color-input"
                          className="text-[11px] font-semibold text-[var(--text-secondary)]"
                        >
                          Custom Color:
                        </label>
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor="navbar-native-color-picker"
                            className="relative w-7 h-7 rounded-lg border border-[var(--border)] overflow-hidden cursor-pointer shrink-0 shadow-2xs"
                            title="Open custom color picker"
                          >
                            <input
                              id="navbar-native-color-picker"
                              type="color"
                              value={accentColor}
                              onChange={(e) => setCustomAccentColor(e.target.value)}
                              aria-label="Custom accent color picker"
                              className="keep-custom absolute -inset-2 w-11 h-11 cursor-pointer border-0 p-0 bg-transparent"
                            />
                          </label>
                          <input
                            id="navbar-custom-color-input"
                            type="text"
                            value={accentColor.toUpperCase()}
                            onChange={(e) => {
                              if (isValidHexInput(e.target.value)) {
                                setCustomAccentColor(normalizeHex(e.target.value));
                              }
                            }}
                            maxLength={7}
                            aria-label="Custom HEX color value"
                            className="w-20 px-2 py-1 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] text-[11px] font-mono font-bold text-[var(--text-primary)] uppercase"
                          />
                        </div>
                      </div>

                      {/* Contrast Readability Indicator */}
                      <div className="pt-1 flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                        <span>Contrast: {contrastInfo.buttonContrastRatio}:1 (AA Pass)</span>
                        <button
                          type="button"
                          onClick={() => handleNavClick('settings')}
                          className="font-semibold text-[var(--accent-text)] hover:underline cursor-pointer"
                        >
                          All Theme Settings →
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Light / Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              title={`Switch mode (Current: ${isDark ? 'Dark Mode' : 'Light Mode'})`}
              className="h-9 px-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
              aria-label="Toggle dark and light theme"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden md:inline text-[11px]">{t('nav.light', 'Light')}</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-[var(--accent-text)]" />
                  <span className="hidden md:inline text-[11px]">{t('nav.dark', 'Dark')}</span>
                </>
              )}
            </button>

            {/* Central Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                id="main-language-selector-button"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="h-9 flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs text-[var(--text-primary)] transition-colors cursor-pointer shadow-2xs max-w-[130px] sm:max-w-none"
                aria-label={t('nav.selectLanguage', 'Select interface language')}
              >
                <Globe2 className="w-3.5 h-3.5 text-[var(--accent-text)] shrink-0" />
                <span className="font-semibold truncate">{activeLang.nativeName}</span>
                <span className="hidden md:inline text-[11px] text-[var(--text-muted)] whitespace-nowrap">
                  ({activeLang.name})
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-[var(--text-muted)] shrink-0 transition-transform duration-200 ${
                    isLangDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
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
                      className={`absolute ${
                        isRTL ? 'left-0' : 'right-0'
                      } mt-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xl py-1.5 z-50 max-h-96 overflow-y-auto`}
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
                                  ? 'bg-[var(--accent-subtle)] font-bold'
                                  : 'text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-base">{lang.flag || '🇵🇰'}</span>
                                <div className="flex flex-col">
                                  <span className="font-semibold text-[var(--text-primary)]">
                                    {lang.nativeName}
                                  </span>
                                  <span className="text-[10px] text-[var(--text-muted)]">
                                    {lang.name} • {lang.region}
                                  </span>
                                </div>
                              </div>
                              {isSelected && (
                                <Check className="w-4 h-4 text-[var(--accent-text)] shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile / Sign In Button */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => handleNavClick('dashboard')}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] text-xs text-[var(--text-primary)] transition-all cursor-pointer shadow-2xs"
                  title={user.name}
                >
                  <div className="w-6 h-6 rounded-full bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] flex items-center justify-center text-[10px] font-bold shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline font-semibold max-w-[90px] truncate">
                    {user.name}
                  </span>
                </button>
              </div>
            ) : (
              onOpenAuthModal && (
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--button-primary-bg)] hover:bg-[var(--accent-hover)] text-[var(--button-primary-text)] text-xs font-semibold shadow-xs transition-all cursor-pointer whitespace-nowrap"
                >
                  <User className="w-3.5 h-3.5 shrink-0" />
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
            className="lg:hidden border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3 space-y-3 max-h-[82vh] overflow-y-auto"
          >
            {/* Primary Mobile Navigation Items */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleNavClick('home')}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-start flex items-center gap-2 transition-all cursor-pointer ${
                  currentPage === 'home'
                    ? 'bg-[var(--button-primary-bg)] text-[var(--button-primary-text)]'
                    : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <HomeIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{t('nav.home', 'Home')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('ai-assistant')}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-start flex items-center gap-2 transition-all cursor-pointer ${
                  currentPage === 'ai-assistant' || currentPage === 'chat'
                    ? 'bg-[var(--button-primary-bg)] text-[var(--button-primary-text)]'
                    : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <Bot className="w-3.5 h-3.5 shrink-0" />
                <span>{t('nav.aiAssistant', 'AI Assistant')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('blog')}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-start flex items-center gap-2 transition-all cursor-pointer ${
                  currentPage === 'blog'
                    ? 'bg-[var(--button-primary-bg)] text-[var(--button-primary-text)]'
                    : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span>{t('nav.blog', 'Blog & Updates')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('settings')}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-start flex items-center gap-2 transition-all cursor-pointer ${
                  currentPage === 'settings'
                    ? 'bg-[var(--button-primary-bg)] text-[var(--button-primary-text)]'
                    : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <SettingsIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{t('nav.accessibility', 'Settings')}</span>
              </button>
            </div>

            {/* Mobile Features Section */}
            <div className="pt-2 border-t border-[var(--border)] space-y-2">
              <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                {t('nav.features', 'Features')}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {featuresList.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`p-2 rounded-xl text-start flex items-center gap-2 text-xs transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[var(--accent-subtle)] text-[var(--accent-text)] font-bold'
                          : 'bg-[var(--surface-secondary)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-[var(--accent-text)] shrink-0" />
                      <span className="truncate">{t(item.titleKey, item.defaultTitle)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Quick Accent Swatches */}
            <div className="pt-2 border-t border-[var(--border)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[var(--text-secondary)]">
                  Accent Color
                </span>
                <button
                  type="button"
                  onClick={resetThemeToDefault}
                  className="text-[10px] font-semibold text-[var(--accent-text)] hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {ACCENT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setAccentPreset(preset.id)}
                    aria-label={preset.name}
                    className={`theme-swatch keep-white w-6 h-6 rounded-full border shrink-0 flex items-center justify-center ${
                      accentId === preset.id
                        ? 'ring-2 ring-[var(--focus-ring)] border-white'
                        : 'border-black/20'
                    }`}
                    style={{ backgroundColor: preset.hex }}
                  >
                    {accentId === preset.id && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {user && (
              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)] truncate">
                  {user.name} ({user.email})
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="text-xs font-semibold text-rose-500 hover:underline cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
