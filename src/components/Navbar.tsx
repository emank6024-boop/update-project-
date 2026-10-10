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

interface NavItem {
  id: PageId;
  label: string;
  labelUrdu: string;
  matchIds?: PageId[];
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', labelUrdu: 'ہوم' },
  { id: 'chat', label: 'Assistant', matchIds: ['chat', 'ai-assistant'], labelUrdu: 'معاون چیٹ' },
  { id: 'translate', label: 'Translator', matchIds: ['translate', 'translator'], labelUrdu: 'مترجم' },
  { id: 'documents', label: 'Documents', matchIds: ['documents', 'ocr-documents'], labelUrdu: 'دستاویزات' },
  { id: 'fake-news', label: 'Fact Check', matchIds: ['fake-news'], labelUrdu: 'حقائق کی تصدیق' },
  {
    id: 'tools',
    label: 'Modules',
    matchIds: [
      'tools',
      'government',
      'teacher',
      'medical',
      'farmer',
      'legal',
      'sign-language',
      'voice-assistant',
      'history',
      'dashboard',
    ],
    labelUrdu: 'تمام ماڈیولز',
  },
  { id: 'settings', label: 'Accessibility', matchIds: ['settings'], labelUrdu: 'ترتیبات' },
];

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
  const { theme, isDark, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) ||
    SUPPORTED_LANGUAGES[0];

  const isItemActive = (item: NavItem) => {
    if (item.matchIds) {
      return item.matchIds.includes(currentPage);
    }
    return item.id === currentPage;
  };

  const handleNavClick = (pageId: PageId) => {
    onSelectPage(pageId);
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      id="main-navbar"
      className="sticky top-0 z-50 transition-colors duration-200 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md text-[var(--text-primary)] shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 cursor-pointer focus:outline-hidden group text-left"
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
                  AI for Pakistan's Languages
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
            {NAV_ITEMS.map((item) => {
              const active = isItemActive(item);
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                    active
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
                  }`}
                >
                  {isRTL ? item.labelUrdu : item.label}
                </button>
              );
            })}
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
                  <span className="hidden md:inline text-[11px]">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-emerald-600" />
                  <span className="hidden md:inline text-[11px]">Dark</span>
                </>
              )}
            </button>

            {/* Speech Settings Quick Toggle */}
            <button
              type="button"
              onClick={openVoiceModal}
              title="Voice & Speech Settings"
              className="p-2 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:scale-95 transition-all cursor-pointer"
              aria-label="Voice and speech settings"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs text-[var(--text-primary)] transition-all cursor-pointer shadow-2xs"
                aria-label="Select interface language"
              >
                <Globe2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline font-semibold">{activeLang.name}</span>
                <span className="sm:hidden font-semibold">{activeLang.code.toUpperCase()}</span>
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
                      className="absolute right-0 mt-2 w-64 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xl py-1.5 z-50 max-h-88 overflow-y-auto"
                    >
                      <div className="px-3 py-1.5 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)]">
                        Select Language
                      </div>
                      {SUPPORTED_LANGUAGES.map((lang) => {
                        const isSelected = selectedLanguage === lang.code;
                        return (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => {
                              onSelectLanguage(lang.code);
                              setGlobalLanguage(lang.code);
                              setIsLangDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left hover:bg-[var(--surface-hover)] transition-colors cursor-pointer ${
                              isSelected
                                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-bold'
                                : 'text-[var(--text-primary)] font-medium'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                              <span>{lang.name}</span>
                            </div>
                            <span className="text-[var(--text-muted)] font-urdu text-[11px]" dir="rtl">
                              {lang.nativeName}
                            </span>
                          </button>
                        );
                      })}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Accessibility / Settings Page Button */}
            <button
              type="button"
              onClick={() => handleNavClick('settings')}
              title="Accessibility & Settings"
              className={`p-2 rounded-xl border border-[var(--border)] active:scale-95 transition-all cursor-pointer ${
                currentPage === 'settings'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
              }`}
              aria-label="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>

            {/* User / Profile & Logout OR Login / Sign Up */}
            {user ? (
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] shadow-2xs"
                  title={`Signed in as ${user.name || user.email}`}
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] flex items-center justify-center font-bold shrink-0 border border-emerald-500/30">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs text-[var(--text-primary)] hidden lg:inline max-w-[100px] truncate font-semibold">
                    {user.name || user.email?.split('@')[0]}
                  </span>
                  {user.isDemo && (
                    <span className="text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-700 dark:text-amber-300 px-1 py-0.2 rounded border border-amber-500/30">
                      DEMO
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    try {
                      sessionStorage.removeItem('paklingo_guest_mode');
                    } catch {}
                    onOpenAuthModal();
                  }}
                  title={`Signed in as ${user.email || 'User'}. Click to Log out`}
                  className="p-2 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 active:scale-95 transition-all cursor-pointer hidden sm:block"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                id="nav-login-btn"
                onClick={() => {
                  try {
                    sessionStorage.removeItem('paklingo_guest_mode');
                  } catch {}
                  onOpenAuthModal();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isRTL ? 'لاگ ان' : 'Sign In'}</span>
                <span className="sm:hidden">{isRTL ? 'لاگ ان' : 'Sign In'}</span>
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-primary)] active:scale-95 transition-all cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="lg:hidden border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3 space-y-1 overflow-hidden"
          >
            {NAV_ITEMS.map((item) => {
              const active = isItemActive(item);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
                  }`}
                >
                  {isRTL ? item.labelUrdu : item.label}
                </button>
              );
            })}
            {user ? (
              <div className="pt-2 border-t border-[var(--border)] mt-2 space-y-2">
                <div className="px-3 py-1.5 flex items-center gap-2.5 text-xs text-[var(--text-secondary)]">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 text-xs flex items-center justify-center font-bold shrink-0 border border-emerald-500/30">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="truncate min-w-0">
                    <p className="font-semibold text-[var(--text-primary)] truncate">{user.name || user.email?.split('@')[0]}</p>
                    <p className="text-[11px] text-[var(--text-muted)] truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 rounded-xl text-sm text-rose-500 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-[var(--border)] mt-2">
                <button
                  type="button"
                  id="mobile-nav-login-btn"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAuthModal?.();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-sm transition-all cursor-pointer shadow-xs"
                >
                  <User className="w-4 h-4" />
                  <span>{isRTL ? 'لاگ ان / اکاؤنٹ بنائیں' : 'Sign In / Create Account'}</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
