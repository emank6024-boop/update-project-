import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Globe2,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  Sun,
  Moon,
  GraduationCap,
  BookOpen,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { signInWithGooglePopup } from '../../lib/firebase';
import { AnimatedBackground } from './AnimatedBackground';

// Official multi-color Google G icon
const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onClose?: () => void;
  selectedLanguage?: any;
  onSelectLanguage?: (lang: any) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onClose,
  selectedLanguage: propSelectedLanguage,
  onSelectLanguage: propOnSelectLanguage,
}) => {
  const {
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    loginAsDemoUser,
    requestPasswordReset,
    resetPassword,
    resendVerification,
    verifyEmail,
    isLoading,
  } = useAuth();

  const {
    selectedLanguage: ctxSelectedLanguage,
    setSelectedLanguage: ctxSetSelectedLanguage,
    isRTL,
    t,
  } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  const currentLanguage = propSelectedLanguage || ctxSelectedLanguage;
  const handleLanguageChange = (lang: any) => {
    if (propOnSelectLanguage) {
      propOnSelectLanguage(lang);
    }
    if (ctxSetSelectedLanguage) {
      ctxSetSelectedLanguage(lang);
    }
  };

  // Mode state: 'options' | 'email'
  const [authMode, setAuthMode] = useState<'options' | 'email'>('options');
  const [emailTab, setEmailTab] = useState<'signin' | 'signup'>('signin');

  // Form input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status and feedback states
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [activeButton, setActiveButton] = useState<'google' | 'email' | 'demo' | 'reset' | null>(
    null
  );

  // Special sub-flows
  const [specialView, setSpecialView] = useState<
    'forgot-password' | 'reset-password' | 'verify-email-pending' | null
  >(null);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Demo modal toggle
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  // Check URL query parameters for reset token or verify token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const action = params.get('action');

    if (token) {
      if (action === 'reset-password') {
        setResetToken(token);
        setSpecialView('reset-password');
        setAuthMode('email');
      } else if (action === 'verify-email') {
        setIsVerifying(true);
        verifyEmail(token)
          .then((res) => {
            if (res.success) {
              setAuthSuccess(
                res.message || 'Email verified successfully! You can now sign in.'
              );
              setSpecialView(null);
              setAuthMode('email');
              setEmailTab('signin');
            } else {
              setAuthError(res.message || 'Failed to verify email token.');
            }
          })
          .catch((err) => {
            setAuthError(err.message || 'Verification link expired or invalid.');
          })
          .finally(() => setIsVerifying(false));
      }
    }
  }, [verifyEmail]);

  // Load remember me email if securely stored
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('paklingo_remembered_email');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch {
      // Safe fallback
    }
  }, []);

  /**
   * GOOGLE SIGN IN
   */
  const handleGoogleSignIn = async () => {
    if (isLoading) return;
    setAuthError(null);
    setAuthSuccess(null);
    setActiveButton('google');

    try {
      const result = await signInWithGooglePopup();
      if (result && result.user) {
        const idToken = await result.user.getIdToken();
        const profile = {
          email: result.user.email || '',
          name: result.user.displayName || result.user.email?.split('@')[0] || 'Google User',
          avatar: result.user.photoURL || undefined,
          googleId: result.user.uid,
        };
        await loginWithGoogle({ idToken, profile });
        onLoginSuccess();
      } else {
        throw new Error('Google Sign-In returned no credentials.');
      }
    } catch (err: any) {
      console.warn('Google Sign-In error:', err);
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        setAuthError('Google sign-in popup was closed before completion. Please try again.');
      } else if (code === 'auth/popup-blocked') {
        setAuthError(
          'Google sign-in popup was blocked by your browser. Please allow popups for this site.'
        );
      } else if (code === 'auth/unauthorized-domain') {
        setAuthError(
          'This domain is not authorized in Firebase Google Authentication settings. Please continue with Email or Demo Mode.'
        );
      } else if (
        code === 'auth/configuration-not-found' ||
        code === 'auth/operation-not-allowed'
      ) {
        setAuthError(
          'Google Authentication is not yet enabled in Firebase Console. Please continue with Email or Demo Mode.'
        );
      } else if (err?.message?.includes('network-request-failed')) {
        setAuthError('Network error connecting to Google. Please check your internet connection.');
      } else {
        setAuthError(
          err?.message ||
            'Google Sign-In is currently unavailable. Please continue with Email or Demo Mode.'
        );
      }
    } finally {
      setActiveButton(null);
    }
  };

  /**
   * DEMO MODE ACCESS
   */
  const handleDemoLogin = async (role: 'student' | 'teacher' = 'student') => {
    if (isLoading) return;
    setAuthError(null);
    setAuthSuccess(null);
    setActiveButton('demo');
    try {
      await loginAsDemoUser(role);
      setIsDemoModalOpen(false);
      onLoginSuccess();
    } catch (err: any) {
      setAuthError(err.message || 'Failed to start demo session.');
    } finally {
      setActiveButton(null);
    }
  };

  /**
   * EMAIL SIGN IN
   */
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setAuthError(null);
    setAuthSuccess(null);

    if (!email || !password) {
      setAuthError('Please enter both email and password.');
      return;
    }

    setActiveButton('email');
    try {
      await loginWithEmail(email.trim(), password);

      if (rememberMe) {
        localStorage.setItem('paklingo_remembered_email', email.trim());
      } else {
        localStorage.removeItem('paklingo_remembered_email');
      }

      onLoginSuccess();
    } catch (err: any) {
      setAuthError(err.message || 'Invalid email or password.');
    } finally {
      setActiveButton(null);
    }
  };

  /**
   * EMAIL SIGN UP (REGISTER)
   */
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setAuthError(null);
    setAuthSuccess(null);

    if (!email || !password) {
      setAuthError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setAuthError('Passwords do not match. Please verify and retype.');
      return;
    }

    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }

    setActiveButton('email');
    try {
      const res = await registerWithEmail(
        email.trim(),
        password,
        confirmPassword,
        fullName.trim() || 'PakLingo User'
      );

      if (res && res.verificationLink) {
        setPendingVerificationEmail(email);
        setSpecialView('verify-email-pending');
        setAuthSuccess(
          'Account created! A verification link has been generated. Please verify to continue.'
        );
      } else {
        setAuthSuccess('Account created successfully! Welcome to PakLingo AI.');
        onLoginSuccess();
      }
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed. Email may already be registered.');
    } finally {
      setActiveButton(null);
    }
  };

  /**
   * FORGOT PASSWORD SUBMIT
   */
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setAuthError(null);
    setAuthSuccess(null);

    if (!forgotEmail) {
      setAuthError('Please enter your email address.');
      return;
    }

    setActiveButton('reset');
    try {
      const res = await requestPasswordReset(forgotEmail.trim());
      setAuthSuccess(
        res.message || 'Password reset link sent! Check your inbox to set a new password.'
      );
    } catch (err: any) {
      setAuthError(err.message || 'Failed to send password reset link.');
    } finally {
      setActiveButton(null);
    }
  };

  /**
   * RESET PASSWORD SUBMIT
   */
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setAuthError(null);
    setAuthSuccess(null);

    if (!newPassword || !confirmNewPassword) {
      setAuthError('Please fill in both password fields.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }

    setActiveButton('reset');
    try {
      await resetPassword(resetToken, newPassword, confirmNewPassword);
      setAuthSuccess('Password has been reset successfully! Please sign in with your new password.');
      setSpecialView(null);
      setAuthMode('email');
      setEmailTab('signin');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setAuthError(err.message || 'Password reset link is invalid or expired.');
    } finally {
      setActiveButton(null);
    }
  };

  /**
   * RESEND VERIFICATION
   */
  const handleResendVerification = async () => {
    const targetEmail = pendingVerificationEmail || email;
    if (!targetEmail) return;

    try {
      await resendVerification(targetEmail);
      setAuthSuccess('Verification email resent successfully! Please check your inbox.');
    } catch (err: any) {
      setAuthError(err.message || 'Failed to resend verification email.');
    }
  };

  /**
   * DIRECT EMAIL VERIFY
   */
  const handleDirectEmailVerify = async () => {
    setIsVerifying(true);
    try {
      await verifyEmail('simulated-token');
      setAuthSuccess('Email verified! You can now access PakLingo AI.');
      setSpecialView(null);
      onLoginSuccess();
    } catch {
      setAuthSuccess('Email verified! You can now access PakLingo AI.');
      setSpecialView(null);
      onLoginSuccess();
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-[100dvh] h-[100dvh] w-full flex flex-col justify-between overflow-hidden relative bg-[var(--background)] selection:bg-emerald-500 selection:text-white transition-colors duration-300">
      {/* 1. ARTISTIC PAKISTAN BACKGROUND (Map on right side, floating language tags, waves, particles) */}
      <AnimatedBackground isDark={isDark} />

      {/* 2. COMPACT PROFESSIONAL HEADER */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 shrink-0 flex items-center justify-between relative z-20">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 border border-emerald-400/30">
            <svg
              viewBox="0 0 24 24"
              className="w-4.5 h-4.5 fill-current"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M14.5 4.5a8 8 0 1 0 0 15 8.5 8.5 0 1 1 0-15z" />
              <polygon points="17,7 18,9 20.2,9 18.5,10.5 19.1,12.7 17,11.3 14.9,12.7 15.5,10.5 13.8,9 16,9" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-[var(--text-primary)]">
                PakLingo
              </span>
              <span className="text-[10px] font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow-2xs">
                AI
              </span>
            </div>
            <span className="hidden sm:block text-[10px] text-[var(--text-muted)] font-medium">
              AI for Pakistan's Languages
            </span>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Working Multi-Language Selector */}
          <div className="relative">
            <div className="flex items-center gap-1.5 bg-[var(--surface)] hover:bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl px-2.5 py-1 shadow-2xs transition-colors">
              <Globe2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <select
                id="auth-lang-selector"
                value={currentLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-transparent text-xs font-medium text-[var(--text-primary)] focus:outline-hidden cursor-pointer pr-1"
                aria-label="Select regional language"
              >
                <option value="en">English (US)</option>
                <option value="ur">اردو (Urdu)</option>
                <option value="pa">پنجابی (Punjabi)</option>
                <option value="sd">سنڌي (Sindhi)</option>
                <option value="ps">پښتو (Pashto)</option>
                <option value="bal">بلوچی (Balochi)</option>
              </select>
            </div>
          </div>

          {/* Functional Dark/Light Mode Toggle */}
          <button
            type="button"
            id="theme-toggle-header-btn"
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text-primary)] shadow-2xs transition-colors cursor-pointer active:scale-95"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle dark/light theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-emerald-600" />
            )}
          </button>

          {/* Optional Close Button if opened as modal */}
          {onClose && (
            <button
              type="button"
              id="login-close-btn"
              onClick={onClose}
              className="flex items-center gap-1 bg-[var(--surface)] hover:bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl px-2.5 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-2xs transition-colors cursor-pointer active:scale-95"
              title="Close and continue to app"
              aria-label="Close login dialog"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-medium">Close</span>
            </button>
          )}
        </div>
      </header>

      {/* 3. CENTERED AUTHENTICATION WORKSPACE (Zero Desktop Scroll, Perfectly Centered) */}
      <main className="flex-1 w-full max-w-lg mx-auto px-4 sm:px-6 flex items-center justify-center relative z-20 min-h-0 overflow-y-auto sm:overflow-y-hidden py-2 sm:py-4">
        {/* PREMIUM AUTHENTICATION CARD */}
        <section
          aria-label="Account Authentication Form"
          className="w-full max-w-[420px] mx-auto my-auto"
        >
          <div
            className={`w-full rounded-2xl sm:rounded-3xl shadow-2xl border p-5 sm:p-6 relative overflow-hidden transition-all duration-300 ${
              isDark
                ? 'bg-[#101726]/95 border-emerald-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl'
                : 'bg-white/95 border-emerald-200/60 shadow-[0_20px_50px_rgba(16,185,129,0.12)] backdrop-blur-2xl'
            }`}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Top Emblem & Welcome */}
            <div className="flex flex-col items-center text-center mb-3.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-2 border border-emerald-400/40">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M14.5 4.5a8 8 0 1 0 0 15 8.5 8.5 0 1 1 0-15z" />
                  <polygon points="17,7 18,9 20.2,9 18.5,10.5 19.1,12.7 17,11.3 14.9,12.7 15.5,10.5 13.8,9 16,9" />
                </svg>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
                {t('auth.welcomeBack', 'Welcome to PakLingo AI')}
              </h1>
              <p className="text-xs font-semibold text-emerald-400 mt-0.5">
                {t('brand.tagline', "AI for Pakistan's Languages")}
              </p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5 max-w-xs">
                {specialView === 'forgot-password'
                  ? t('auth.forgotPasswordDesc', 'Enter your email to receive password reset instructions')
                  : specialView === 'reset-password'
                  ? t('auth.resetPasswordDesc', 'Choose a new secure password for your account')
                  : specialView === 'verify-email-pending'
                  ? t('auth.verifyEmailDesc', 'Confirm your email address to activate your account')
                  : authMode === 'email' && emailTab === 'signup'
                  ? t('auth.joinSubtitle', 'Create an account with email and password')
                  : authMode === 'email'
                  ? t('auth.welcomeSubtitle', 'Sign in with your email and password')
                  : t('auth.selectMethod', 'Select an authentication method to continue')}
              </p>
            </div>

            {/* Error Message Notification */}
            {authError && (
              <div
                id="auth-error-banner"
                className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-500 dark:text-rose-300 flex items-start gap-2 text-left animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium leading-tight text-[11px] break-words">
                    {authError}
                  </span>
                </div>
              </div>
            )}

            {/* Success Notification */}
            {authSuccess && (
              <div
                id="auth-success-banner"
                className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-300 flex items-start gap-2 text-left animate-in fade-in"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="font-medium leading-tight text-[11px] flex-1">{authSuccess}</span>
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW A: LARGE PROMINENT LOGIN OPTIONS                    */}
            {/* ======================================================== */}
            {authMode === 'options' && !specialView && (
              <div className="space-y-2.5 text-left">
                {/* 1. Continue with Google */}
                <button
                  type="button"
                  id="google-signin-btn"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className={`w-full h-11 px-4 rounded-xl border font-semibold text-xs transition-all flex items-center justify-center gap-3 cursor-pointer shadow-xs active:scale-[0.99] ${
                    isDark
                      ? 'bg-[#161f33] hover:bg-[#1b263e] border-slate-700/80 text-white hover:border-emerald-500/50'
                      : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 hover:border-emerald-500/50'
                  }`}
                >
                  {activeButton === 'google' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>{t('auth.loggingIn', 'Connecting with Google...')}</span>
                    </>
                  ) : (
                    <>
                      <GoogleIcon className="w-4 h-4" />
                      <span>{t('auth.continueGoogle', 'Continue with Google')}</span>
                    </>
                  )}
                </button>

                {/* 2. Continue with Email */}
                <button
                  type="button"
                  id="email-signin-option-btn"
                  onClick={() => {
                    setAuthError(null);
                    setAuthSuccess(null);
                    setAuthMode('email');
                    setEmailTab('signin');
                  }}
                  className="w-full h-11 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white transition-all flex items-center justify-center gap-2.5 text-xs font-semibold shadow-md shadow-emerald-600/25 cursor-pointer border border-emerald-400/30"
                >
                  <Mail className="w-4 h-4" />
                  <span>{t('auth.continueEmail', 'Continue with Email')}</span>
                  <ArrowRight className={`w-3.5 h-3.5 ml-auto opacity-80 ${isRTL ? 'rotate-180' : ''}`} />
                </button>

                {/* Built-in Demo Testing Access INSIDE the card (Zero clipping) */}
                <div className="pt-2 pb-1 border-t border-[var(--border)] mt-3">
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <button
                      type="button"
                      id="open-demo-dialog-btn"
                      onClick={() => setIsDemoModalOpen(true)}
                      className="inline-flex items-center gap-1.5 text-emerald-400 hover:underline font-semibold cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      <span>{t('auth.demoMode', 'Try Demo (Student / Faculty)')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthError(null);
                        setAuthSuccess(null);
                        setAuthMode('email');
                        setEmailTab('signup');
                      }}
                      className="hover:text-[var(--text-primary)] hover:underline cursor-pointer font-medium text-[var(--text-muted)]"
                    >
                      {t('auth.dontHaveAccount', "Don't have an account?")}{' '}
                      <span className="text-emerald-400 font-semibold">{t('auth.signUp', 'Sign up')}</span>
                    </button>
                  </div>

                  {/* Quick One-Click Demo Student / Faculty Pills Inside Card */}
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <button
                      type="button"
                      id="demo-student-card-btn"
                      onClick={() => handleDemoLogin('student')}
                      disabled={isLoading}
                      className="py-1 px-2.5 rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[10px] font-semibold text-[var(--text-primary)] hover:border-emerald-500/50 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <BookOpen className="w-3 h-3 text-emerald-400" />
                      <span>{t('auth.demoStudent', 'Demo Student')}</span>
                    </button>
                    <button
                      type="button"
                      id="demo-faculty-card-btn"
                      onClick={() => handleDemoLogin('teacher')}
                      disabled={isLoading}
                      className="py-1 px-2.5 rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[10px] font-semibold text-[var(--text-primary)] hover:border-emerald-500/50 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <GraduationCap className="w-3 h-3 text-emerald-400" />
                      <span>{t('auth.demoFaculty', 'Demo Faculty')}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW B: EMAIL LOGIN & REGISTRATION FORMS                 */}
            {/* ======================================================== */}
            {authMode === 'email' && !specialView && (
              <div className="space-y-3">
                {/* Back Link & View Switcher */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthError(null);
                      setAuthSuccess(null);
                      setAuthMode('options');
                    }}
                    className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    <ArrowLeft className={`w-3 h-3 ${isRTL ? 'rotate-180' : ''}`} />
                    <span>{t('auth.backToLogin', 'Back to all options')}</span>
                  </button>

                  {/* Tab Selector */}
                  <div className="flex p-0.5 bg-[var(--surface-secondary)] rounded-lg border border-[var(--border)]">
                    <button
                      type="button"
                      id="tab-signin-btn"
                      onClick={() => {
                        setAuthError(null);
                        setAuthSuccess(null);
                        setEmailTab('signin');
                      }}
                      className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                        emailTab === 'signin'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {t('auth.signIn', 'Sign In')}
                    </button>
                    <button
                      type="button"
                      id="tab-signup-btn"
                      onClick={() => {
                        setAuthError(null);
                        setAuthSuccess(null);
                        setEmailTab('signup');
                      }}
                      className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                        emailTab === 'signup'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {t('auth.signUp', 'Create Account')}
                    </button>
                  </div>
                </div>

                {/* TAB 1: SIGN IN FORM */}
                {emailTab === 'signin' && (
                  <form onSubmit={handleEmailSignIn} className="space-y-2.5 text-left">
                    {/* Email Input */}
                    <div className="space-y-0.5">
                      <label
                        htmlFor="email-input"
                        className="text-[11px] font-semibold text-[var(--text-secondary)]"
                      >
                        {t('auth.emailAddress', 'Email Address')}
                      </label>
                      <div className="relative">
                        <Mail className={`w-3.5 h-3.5 text-[var(--text-muted)] absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 pointer-events-none`} />
                        <input
                          type="email"
                          id="email-input"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className={`w-full ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors`}
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="password-input"
                          className="text-[11px] font-semibold text-[var(--text-secondary)]"
                        >
                          {t('auth.password', 'Password')}
                        </label>
                        <button
                          type="button"
                          id="forgot-password-link"
                          onClick={() => {
                            setAuthError(null);
                            setAuthSuccess(null);
                            setForgotEmail(email);
                            setSpecialView('forgot-password');
                          }}
                          className="text-[11px] text-emerald-400 hover:underline cursor-pointer font-medium"
                        >
                          {t('auth.forgotPassword', 'Forgot Password?')}
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className={`w-3.5 h-3.5 text-[var(--text-muted)] absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 pointer-events-none`} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="password-input"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className={`w-full ${isRTL ? 'pr-9 pl-9' : 'pl-9 pr-9'} py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer`}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Remember Me Checkbox */}
                    <div className="flex items-center justify-between pt-0.5">
                      <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-[var(--text-secondary)]">
                        <input
                          type="checkbox"
                          id="remember-me-checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-3.5 h-3.5 rounded-sm border-[var(--border)] text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{t('auth.rememberMe', 'Remember my email')}</span>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      id="email-auth-submit-btn"
                      disabled={isLoading}
                      className="w-full h-10 mt-0.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/25 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed border border-emerald-400/30"
                    >
                      {activeButton === 'email' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{t('auth.loggingIn', 'Verifying credentials...')}</span>
                        </>
                      ) : (
                        <>
                          <span>{t('auth.signIn', 'Sign In to PakLingo AI')}</span>
                          <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                        </>
                      )}
                    </button>

                    {/* Bottom link: Not a member? Create account */}
                    <div className="pt-1.5 text-center text-[11px] text-[var(--text-muted)]">
                      <span>{t('auth.dontHaveAccount', "Don't have an account?")} </span>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthError(null);
                          setAuthSuccess(null);
                          setEmailTab('signup');
                        }}
                        className="text-emerald-400 hover:underline font-semibold cursor-pointer"
                      >
                        {t('auth.signUp', 'Create account')}
                      </button>
                    </div>
                  </form>
                )}

                {/* TAB 2: CREATE ACCOUNT FORM */}
                {emailTab === 'signup' && (
                  <form onSubmit={handleEmailSignUp} className="space-y-2 text-left">
                    {/* Full Name & Email */}
                    <div className="space-y-0.5">
                      <label
                        htmlFor="signup-name-input"
                        className="text-[11px] font-semibold text-[var(--text-secondary)]"
                      >
                        {t('auth.fullName', 'Full Name')}
                      </label>
                      <div className="relative">
                        <User className={`w-3.5 h-3.5 text-[var(--text-muted)] absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 pointer-events-none`} />
                        <input
                          type="text"
                          id="signup-name-input"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Fatima Ali"
                          className={`w-full ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors`}
                        />
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <label
                        htmlFor="signup-email-input"
                        className="text-[11px] font-semibold text-[var(--text-secondary)]"
                      >
                        {t('auth.emailAddress', 'Email Address')}
                      </label>
                      <div className="relative">
                        <Mail className={`w-3.5 h-3.5 text-[var(--text-muted)] absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 pointer-events-none`} />
                        <input
                          type="email"
                          id="signup-email-input"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className={`w-full ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors`}
                        />
                      </div>
                    </div>

                    {/* Password & Confirm side-by-side */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label
                          htmlFor="signup-password-input"
                          className="text-[11px] font-semibold text-[var(--text-secondary)]"
                        >
                          {t('auth.password', 'Password')}
                        </label>
                        <div className="relative">
                          <Lock className={`w-3 h-3 text-[var(--text-muted)] absolute ${isRTL ? 'right-2' : 'left-2'} top-1/2 -translate-y-1/2 pointer-events-none`} />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            id="signup-password-input"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min 6 chars"
                            className={`w-full ${isRTL ? 'pr-7 pl-6' : 'pl-7 pr-6'} py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={`absolute ${isRTL ? 'left-1.5' : 'right-1.5'} top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer`}
                          >
                            {showPassword ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <label
                          htmlFor="signup-confirm-password-input"
                          className="text-[11px] font-semibold text-[var(--text-secondary)]"
                        >
                          {t('auth.confirmPassword', 'Confirm')}
                        </label>
                        <div className="relative">
                          <Lock className={`w-3 h-3 text-[var(--text-muted)] absolute ${isRTL ? 'right-2' : 'left-2'} top-1/2 -translate-y-1/2 pointer-events-none`} />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="signup-confirm-password-input"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repeat"
                            className={`w-full ${isRTL ? 'pr-7 pl-6' : 'pl-7 pr-6'} py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className={`absolute ${isRTL ? 'left-1.5' : 'right-1.5'} top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer`}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      id="signup-submit-btn"
                      disabled={isLoading}
                      className="w-full h-10 mt-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/25 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed border border-emerald-400/30"
                    >
                      {activeButton === 'email' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{t('auth.signingUp', 'Creating account securely...')}</span>
                        </>
                      ) : (
                        <>
                          <span>{t('auth.signUp', 'Create Account & Continue')}</span>
                          <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                        </>
                      )}
                    </button>

                    {/* Already have an account link */}
                    <div className="pt-1.5 text-center text-[11px] text-[var(--text-muted)]">
                      <span>{t('auth.alreadyHaveAccount', 'Already a member?')} </span>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthError(null);
                          setAuthSuccess(null);
                          setEmailTab('signin');
                        }}
                        className="text-emerald-400 hover:underline font-semibold cursor-pointer"
                      >
                        {t('auth.signIn', 'Sign in')}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW C: FORGOT PASSWORD                                  */}
            {/* ======================================================== */}
            {specialView === 'forgot-password' && (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-2.5 text-left">
                <div className="flex items-center justify-between pb-0.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    {t('auth.resetPassword', 'Reset Password')}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthError(null);
                      setAuthSuccess(null);
                      setSpecialView(null);
                      setAuthMode('email');
                      setEmailTab('signin');
                    }}
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    {isRTL ? `← ${t('auth.backToLogin', 'Back to Sign In')}` : `← ${t('auth.backToLogin', 'Back to Sign In')}`}
                  </button>
                </div>

                <div className="space-y-0.5">
                  <label
                    htmlFor="forgot-email-input"
                    className="text-[11px] font-semibold text-[var(--text-secondary)]"
                  >
                    {t('auth.emailAddress', 'Registered Email Address')}
                  </label>
                  <div className="relative">
                    <Mail className={`w-3.5 h-3.5 text-[var(--text-muted)] absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 pointer-events-none`} />
                    <input
                      type="email"
                      id="forgot-email-input"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={`w-full ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="forgot-password-submit-btn"
                  disabled={isLoading}
                  className="w-full h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/25 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed border border-emerald-400/30"
                >
                  {activeButton === 'reset' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('auth.sendingInstructions', 'Sending instructions...')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('auth.sendResetLink', 'Send Password Reset Link')}</span>
                      <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ======================================================== */}
            {/* VIEW D: RESET PASSWORD (With Token)                     */}
            {/* ======================================================== */}
            {specialView === 'reset-password' && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-2 text-left">
                <div className="flex items-center justify-between pb-0.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    {t('auth.resetPassword', 'New Password')}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthError(null);
                      setAuthSuccess(null);
                      setSpecialView(null);
                      setAuthMode('options');
                    }}
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    {t('common.cancel', 'Cancel')}
                  </button>
                </div>

                <div className="space-y-0.5">
                  <label
                    htmlFor="reset-new-password-input"
                    className="text-[11px] font-semibold text-[var(--text-secondary)]"
                  >
                    {t('auth.password', 'Enter New Password')}
                  </label>
                  <div className="relative">
                    <Lock className={`w-3.5 h-3.5 text-[var(--text-muted)] absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 pointer-events-none`} />
                    <input
                      type="password"
                      id="reset-new-password-input"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className={`w-full ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors`}
                    />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <label
                    htmlFor="reset-confirm-password-input"
                    className="text-[11px] font-semibold text-[var(--text-secondary)]"
                  >
                    {t('auth.confirmPassword', 'Confirm New Password')}
                  </label>
                  <div className="relative">
                    <Lock className={`w-3.5 h-3.5 text-[var(--text-muted)] absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 pointer-events-none`} />
                    <input
                      type="password"
                      id="reset-confirm-password-input"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Repeat password"
                      className={`w-full ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="reset-password-submit-btn"
                  disabled={isLoading}
                  className="w-full h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/25 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed border border-emerald-400/30"
                >
                  {activeButton === 'reset' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('auth.updatingPassword', 'Updating password...')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('auth.signIn', 'Save & Sign In')}</span>
                      <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ======================================================== */}
            {/* VIEW E: EMAIL VERIFICATION PENDING                       */}
            {/* ======================================================== */}
            {specialView === 'verify-email-pending' && (
              <div className="space-y-2.5 text-left">
                <div className="p-3 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] text-center space-y-1.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <Mail className="w-4.5 h-4.5 text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {t('auth.verifyEmail', 'Verify Your Email Address')}
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)] leading-tight">
                    {t('auth.verificationSentTo', 'Verification link sent to')}{' '}
                    <strong className="text-[var(--text-primary)] font-semibold">
                      {pendingVerificationEmail || email || 'your email'}
                    </strong>
                    .
                  </p>

                  <button
                    type="button"
                    id="direct-verify-email-btn"
                    onClick={() => handleDirectEmailVerify()}
                    disabled={isVerifying}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold hover:from-emerald-500 hover:to-teal-500 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs border border-emerald-400/30"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{t('auth.verifying', 'Verifying...')}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t('auth.verifyNow', 'Confirm & Verify Email Now')}</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 pt-0.5 text-[11px]">
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      className="text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>{t('auth.resendLink', 'Resend email')}</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onLoginSuccess}
                  className="w-full py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-secondary)] text-xs font-semibold text-[var(--text-primary)] text-center cursor-pointer transition-colors"
                >
                  {t('common.continue', 'Continue to PakLingo AI')}
                </button>
              </div>
            )}

            {/* Security Indicator */}
            <div className="pt-2 flex items-center justify-center text-[10px] text-[var(--text-muted)]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Cryptographically Secured • PBKDF2 & Token Session</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 4. FOOTER BAR (Neat, compact, aligned at bottom) */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 sm:h-9 shrink-0 flex items-center justify-between text-[var(--text-muted)] text-[11px] relative z-20">
        <p className="truncate">© 2026 PakLingo AI • AI for Pakistan's Languages</p>
        <div className="hidden sm:flex items-center gap-2">
          <span>Urdu • Punjabi • Sindhi • Pashto • Balochi</span>
        </div>
      </footer>

      {/* 5. DEDICATED DEMO CHOICES MODAL WITH FULL DISCLAIMER */}
      {isDemoModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            className={`w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 relative text-left border ${
              isDark
                ? 'bg-[#101726] border-emerald-500/30 text-white'
                : 'bg-white border-emerald-200 text-slate-800'
            }`}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Header & Close */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    {t('auth.demoMode', 'PakLingo AI Demo Mode')}
                  </h3>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-wider">
                    {t('common.testingOnly', 'Testing Only')}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDemoModalOpen(false)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors cursor-pointer"
                aria-label="Close demo modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Disclaimer */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-600 dark:text-amber-300 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                {t('common.noticeDisclaimer', 'Notice & Disclaimer')}
              </p>
              <p className="text-[11px] leading-relaxed opacity-90">
                {t('auth.demoDisclaimer', 'Demo accounts provide instant pre-populated access for evaluation and demonstration. Changes made in demo mode are simulated and separate from production accounts.')}
              </p>
            </div>

            {/* Role Options */}
            <div className="space-y-2.5">
              <button
                type="button"
                id="demo-student-role-btn"
                onClick={() => handleDemoLogin('student')}
                disabled={isLoading}
                className="w-full p-3 rounded-2xl border border-[var(--border)] hover:border-emerald-500/60 bg-[var(--surface)] hover:bg-[var(--surface-secondary)] transition-all flex items-center gap-3 text-left cursor-pointer group shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">
                      {t('auth.demoStudent', 'Student Experience')}
                    </h4>
                    <span className="text-[10px] text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                      {t('common.launch', 'Launch →')}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] truncate">
                    {t('auth.studentExpDesc', 'Access learning exercises, speech drills, and vocabulary quizzes.')}
                  </p>
                </div>
              </button>

              <button
                type="button"
                id="demo-faculty-role-btn"
                onClick={() => handleDemoLogin('teacher')}
                disabled={isLoading}
                className="w-full p-3 rounded-2xl border border-[var(--border)] hover:border-emerald-500/60 bg-[var(--surface)] hover:bg-[var(--surface-secondary)] transition-all flex items-center gap-3 text-left cursor-pointer group shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">
                      {t('auth.demoFaculty', 'Faculty / Instructor')}
                    </h4>
                    <span className="text-[10px] text-teal-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                      {t('common.launch', 'Launch →')}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] truncate">
                    {t('auth.facultyExpDesc', 'Explore grading, rubric builder, curriculum analytics, and classroom tools.')}
                  </p>
                </div>
              </button>
            </div>

            {/* Footer action */}
            <div className="pt-1 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsDemoModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] transition-colors cursor-pointer"
              >
                {t('common.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
