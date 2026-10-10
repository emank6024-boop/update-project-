/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PageId, LanguageCode, AccessibilitySettings, ChatAttachment } from './types';
import { Navbar } from './components/Navbar';
import { ModuleSubNav } from './components/ModuleSubNav';
import { HomeScrollBackground } from './components/HomeScrollBackground';
import { Home } from './components/pages/Home';
import { AIAssistant } from './components/pages/AIAssistant';
import { GovernmentAssistant } from './components/pages/GovernmentAssistant';
import { AITeacher } from './components/pages/AITeacher';
import { MedicalAssistant } from './components/pages/MedicalAssistant';
import { FarmerAssistant } from './components/pages/FarmerAssistant';
import { LegalAssistant } from './components/pages/LegalAssistant';
import { FakeNewsDetector } from './components/pages/FakeNewsDetector';
import { OCRDocumentIntelligence } from './components/pages/OCRDocumentIntelligence';
import { LiveTranslator } from './components/pages/LiveTranslator';
import { SignLanguageAssistant } from './components/pages/SignLanguageAssistant';
import { VoiceAssistant } from './components/pages/VoiceAssistant';
import { Dashboard } from './components/pages/Dashboard';
import { Settings } from './components/pages/Settings';
import { HistoryPage } from './components/pages/HistoryPage';
import { BlogPage } from './components/pages/BlogPage';
import { ToolsPage } from './components/pages/ToolsPage';
import { StudentDashboard } from './components/pages/StudentDashboard';
import { FacultyDashboard } from './components/pages/FacultyDashboard';
import { VoiceSettingsProvider } from './context/VoiceSettingsContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { AdminApp } from './admin/AdminApp';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, X, AlertCircle, RefreshCw, Clock, Lock, LogIn } from 'lucide-react';

function AppContent() {
  const { user, isAuthenticated, resendVerification } = useAuth();
  const { selectedLanguage, setSelectedLanguage, isRTL, t } = useLanguage();
  const [verifyNotice, setVerifyNotice] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [dismissVerifyBanner, setDismissVerifyBanner] = useState(false);
  const getPageFromUrl = (): PageId => {
    if (typeof window === 'undefined') return 'home';
    const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    const map: Record<string, PageId> = {
      '': 'home',
      'home': 'home',
      'translate': 'translate',
      'translator': 'translate',
      'voice': 'voice-assistant',
      'voice-assistant': 'voice-assistant',
      'tts-stt': 'tts-stt',
      'documents': 'documents',
      'ocr': 'documents',
      'ocr-documents': 'documents',
      'medical': 'medical',
      'legal': 'legal',
      'student': 'student',
      'student-dashboard': 'student',
      'faculty': 'faculty',
      'faculty-dashboard': 'faculty',
      'teacher': 'teacher',
      'blog': 'blog',
      'settings': 'settings',
      'profile': 'settings',
      'chat': 'chat',
      'ai-assistant': 'chat',
      'government': 'government',
      'farmer': 'farmer',
      'fake-news': 'fake-news',
      'sign-language': 'sign-language',
      'history': 'history',
      'dashboard': 'dashboard',
      'tools': 'tools',
      'features': 'tools',
      'all-features': 'tools',
    };
    return map[hash] || 'home';
  };

  const [currentPage, setCurrentPage] = useState<PageId>(getPageFromUrl);
  const [initialAssistantPrompt, setInitialAssistantPrompt] = useState<string | undefined>(undefined);
  const [initialAssistantAttachments, setInitialAssistantAttachments] = useState<ChatAttachment[] | undefined>(undefined);
  const [initialConversationId, setInitialConversationId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const handleUrlChange = () => {
      setCurrentPage(getPageFromUrl());
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Modal Auth State: opens LoginScreen as an overlay without forcing early return
  const [intendedPage, setIntendedPage] = useState<PageId | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    const search = window.location.search;
    const pathname = window.location.pathname;
    if (
      search.includes('token=') ||
      search.includes('verifyToken=') ||
      pathname.includes('verify-email') ||
      pathname.includes('reset-password')
    ) {
      return true;
    }
    const hasToken = localStorage.getItem('paklingo_auth_token');
    const isGuest = sessionStorage.getItem('paklingo_guest_mode');
    return !hasToken && !isGuest;
  });

  // Pages that genuinely require authenticated account context
  const PROTECTED_PAGES: PageId[] = ['history', 'dashboard'];

  const handleSelectPage = (targetPage: PageId) => {
    if (PROTECTED_PAGES.includes(targetPage) && !isAuthenticated) {
      setIntendedPage(targetPage);
      setIsAuthModalOpen(true);
      return;
    }
    setCurrentPage(targetPage);
    if (typeof window !== 'undefined') {
      const hash = targetPage === 'home' ? '' : `#${targetPage}`;
      if (window.location.hash !== hash) {
        window.history.pushState(null, '', hash || window.location.pathname);
      }
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthModalOpen(false);
    try {
      sessionStorage.removeItem('paklingo_guest_mode');
    } catch {}
    if (intendedPage) {
      setCurrentPage(intendedPage);
      setIntendedPage(null);
    }
  };

  const handleCloseAuthModal = () => {
    try {
      sessionStorage.setItem('paklingo_guest_mode', 'true');
    } catch {}
    setIsAuthModalOpen(false);
    setIntendedPage(null);
  };

  // Keyboard accessibility: dismiss auth modal on Escape
  useEffect(() => {
    if (!isAuthModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen]);

  const [accessibility, setAccessibility] = useState<AccessibilitySettings>({
    highContrast: false,
    simpleMode: false,
    fontSize: 'md',
    screenReaderMode: false,
    reducedMotion: false,
    voiceFeedback: true,
    speechRate: 1.0,
    theme: 'dark',
  });

  const handleUpdateAccessibility = (settings: Partial<AccessibilitySettings>) => {
    setAccessibility((prev) => ({ ...prev, ...settings }));
  };

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (accessibility.highContrast) {
      document.documentElement.classList.add('high-contrast-mode');
    } else {
      document.documentElement.classList.remove('high-contrast-mode');
    }
  }, [accessibility.highContrast]);

  const handleStartChatWithPrompt = (prompt: string, attachments?: ChatAttachment[]) => {
    setInitialConversationId(undefined);
    setInitialAssistantPrompt(prompt);
    setInitialAssistantAttachments(attachments);
    setCurrentPage('ai-assistant');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '#ai-assistant');
    }
  };

  const handleOpenConversation = (conversationId: string) => {
    setInitialConversationId(conversationId);
    setCurrentPage('ai-assistant');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '#ai-assistant');
    }
  };

  const handleScrollToSection = (sectionId: string) => {
    if (currentPage !== 'home') {
      setCurrentPage('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Scroll to top on page change if not jumping to section
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Handle font size class
  const fontSizeClass =
    accessibility.fontSize === 'xl'
      ? 'text-lg'
      : accessibility.fontSize === 'lg'
      ? 'text-base'
      : accessibility.fontSize === 'sm'
      ? 'text-xs'
      : 'text-sm';

  const isHome = currentPage === 'home';

  return (
    <div
      className={`relative min-h-dvh w-full max-w-full min-w-0 overflow-x-hidden flex flex-col font-sans transition-colors duration-200 bg-[var(--app-bg)] text-[var(--text-primary)] ${fontSizeClass}`}
    >
      {/* Global Pakistani Heritage & AI Architectural Background (Behind All Content, pointer-events: none) */}
      <HomeScrollBackground isRTL={isRTL} isHome={isHome} currentPage={currentPage} />

      {/* Universal Sticky Navbar */}
      <Navbar
        currentPage={currentPage}
        onSelectPage={handleSelectPage}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={setSelectedLanguage}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Demo Mode Notice Banner (Compact, readable, non-intrusive) */}
      {user && user.isDemo && (
        <div
          id="demo-mode-active-banner"
          className="relative z-10 bg-[var(--surface-secondary)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 py-1.5 text-xs text-[var(--text-secondary)] flex flex-wrap items-center justify-center sm:justify-between gap-2 max-w-full"
        >
          <div className="max-w-7xl w-full mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>Demo Mode</span>
              </span>
              <span className="text-[11px] sm:text-xs text-[var(--text-secondary)] truncate">
                Signed in as <strong className="text-[var(--text-primary)] font-semibold">{user.name}</strong> for testing.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="text-[11px] sm:text-xs font-semibold text-[var(--accent-text)] hover:underline underline-offset-2 cursor-pointer shrink-0"
            >
              Sign in with real account →
            </button>
          </div>
        </div>
      )}

      {/* Unverified Email Alert Banner (Only shown for non-Google authenticated accounts needing email confirmation, not demo accounts) */}
      {user && !user.isDemo && user.provider !== 'google' && !user.emailVerified && !dismissVerifyBanner && user.email && (
        <div
          id="email-verification-banner"
          className="relative z-10 bg-[var(--surface-secondary)] border-b border-[var(--border)] px-4 py-2.5 text-xs text-[var(--text-primary)] flex flex-wrap items-center justify-between gap-3 transition-colors shadow-xs"
        >
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] flex items-center justify-center shrink-0">
              <Mail className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 text-[12px] leading-snug">
              <span className="text-[var(--text-secondary)]">
                Email verification required for <strong className="text-[var(--text-primary)] font-semibold">{user.email}</strong>. Please check your inbox.
              </span>
              {verifyNotice && (
                <span className="ml-2 font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[11px]">
                  {verifyNotice}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="resend-verification-btn"
              type="button"
              onClick={async () => {
                setIsResending(true);
                const res = await resendVerification(user.email);
                setIsResending(false);
                setVerifyNotice(res.message || 'Verification link resent.');
              }}
              disabled={isResending}
              className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin text-[var(--accent)]' : ''}`} />
              <span>{isResending ? 'Sending...' : 'Resend Link'}</span>
            </button>
            <button
              id="dismiss-verification-btn"
              type="button"
              onClick={() => setDismissVerifyBanner(true)}
              className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              title="Dismiss banner"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Sub-Navigation breadcrumbs when viewing inner specialized sub-tools */}
      <div className="relative z-10 w-full">
        <ModuleSubNav
          currentPage={currentPage}
          onSelectPage={handleSelectPage}
        />
      </div>

      {/* Main Content Area */}
      <main
        id="main-app-content"
        role="main"
        className={`relative z-10 flex-1 w-full max-w-full min-w-0 flex flex-col ${
          isHome
            ? ''
            : currentPage === 'chat' || currentPage === 'ai-assistant'
            ? 'max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-3'
            : 'max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5'
        }`}
      >
        {currentPage === 'home' && (
          <Home
            onSelectPage={handleSelectPage}
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setSelectedLanguage}
            onStartChatWithPrompt={handleStartChatWithPrompt}
            simpleMode={accessibility.simpleMode}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {(currentPage === 'translate' || currentPage === 'translator') && (
          <LiveTranslator selectedLanguage={selectedLanguage} />
        )}

        {(currentPage === 'chat' || currentPage === 'ai-assistant') && (
          <AIAssistant
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setSelectedLanguage}
            initialPrompt={initialAssistantPrompt}
            initialAttachments={initialAssistantAttachments}
            initialConversationId={initialConversationId}
            onClearInitialConversation={() => setInitialConversationId(undefined)}
            onClearInitialPrompt={() => {
              setInitialAssistantPrompt(undefined);
              setInitialAssistantAttachments(undefined);
            }}
          />
        )}

        {currentPage === 'tools' && (
          <ToolsPage onSelectPage={handleSelectPage} />
        )}

        {(currentPage === 'documents' || currentPage === 'ocr-documents' || (currentPage as string) === 'ocr') && (
          <OCRDocumentIntelligence selectedLanguage={selectedLanguage} />
        )}

        {(currentPage === 'history' || currentPage === 'dashboard') && (
          isAuthenticated ? (
            <HistoryPage
              onSelectPage={handleSelectPage}
              onOpenConversation={handleOpenConversation}
            />
          ) : (
            <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Clock className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {t('auth.loginRequired', 'Sign In Required')}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {t('auth.loginRequiredDesc', 'Your activity history, recent chats, and translations are securely stored with your account. Sign in or create a free account to view your history.')}
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  id="protected-history-login-btn"
                  onClick={() => {
                    setIntendedPage('history');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  {t('auth.signInOrCreate', 'Sign In / Create Account')}
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage('home')}
                  className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-xs font-medium hover:bg-[var(--surface-hover)] active:scale-95 transition-all cursor-pointer"
                >
                  {t('common.backToHome', 'Return to Home')}
                </button>
              </div>
            </div>
          )
        )}

        {currentPage === 'blog' && (
          <BlogPage onSelectPage={handleSelectPage} />
        )}

        {currentPage === 'government' && (
          <GovernmentAssistant selectedLanguage={selectedLanguage} />
        )}

        {(currentPage === 'student' || currentPage === 'student-dashboard') && (
          <StudentDashboard onSelectPage={handleSelectPage} selectedLanguage={selectedLanguage} />
        )}

        {(currentPage === 'faculty' || currentPage === 'faculty-dashboard') && (
          <FacultyDashboard onSelectPage={handleSelectPage} selectedLanguage={selectedLanguage} />
        )}

        {currentPage === 'teacher' && (
          <AITeacher selectedLanguage={selectedLanguage} />
        )}

        {currentPage === 'medical' && (
          <MedicalAssistant selectedLanguage={selectedLanguage} />
        )}

        {currentPage === 'farmer' && (
          <FarmerAssistant selectedLanguage={selectedLanguage} />
        )}

        {currentPage === 'legal' && (
          <LegalAssistant selectedLanguage={selectedLanguage} />
        )}

        {currentPage === 'fake-news' && (
          <FakeNewsDetector selectedLanguage={selectedLanguage} />
        )}

        {currentPage === 'sign-language' && (
          <SignLanguageAssistant selectedLanguage={selectedLanguage} />
        )}

        {(currentPage === 'voice-assistant' || currentPage === 'voice' || currentPage === 'tts-stt') && (
          <VoiceAssistant
            selectedLanguage={selectedLanguage}
            initialMode={currentPage === 'tts-stt' ? 'tts' : 'assistant'}
          />
        )}

        {currentPage === 'settings' && (
          <Settings
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            highContrast={accessibility.highContrast}
            onToggleHighContrast={() =>
              handleUpdateAccessibility({ highContrast: !accessibility.highContrast })
            }
            simpleMode={accessibility.simpleMode}
            onToggleSimpleMode={() =>
              handleUpdateAccessibility({ simpleMode: !accessibility.simpleMode })
            }
          />
        )}
      </main>

      {/* Global Voice Settings Modal */}
      <VoiceSettingsModal />

      {/* Auth Modal Overlay: displays LoginScreen when user opts in */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 overflow-hidden bg-[var(--background)] selection:bg-[var(--accent)] selection:text-white"
            role="dialog"
            aria-modal="true"
            aria-label="Account Authentication"
          >
            <LoginScreen
              selectedLanguage={selectedLanguage}
              onSelectLanguage={setSelectedLanguage}
              onClose={handleCloseAuthModal}
              onLoginSuccess={handleLoginSuccess}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function isCurrentAdminRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const search = window.location.search.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return (
    path.startsWith('/admin') ||
    search.includes('admin=true') ||
    hash.startsWith('#/admin') ||
    hash.startsWith('#admin')
  );
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState(isCurrentAdminRoute);

  useEffect(() => {
    const handleRouteChange = () => {
      setIsAdmin(isCurrentAdminRoute());
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  if (isAdmin) {
    return (
      <ThemeProvider>
        <AdminApp />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <VoiceSettingsProvider>
        <AuthProvider>
          <LanguageProvider>
            <AppContent />
          </LanguageProvider>
        </AuthProvider>
      </VoiceSettingsProvider>
    </ThemeProvider>
  );
}
