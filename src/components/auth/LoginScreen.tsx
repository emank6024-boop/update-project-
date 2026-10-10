import React, { useState, useRef, useEffect } from 'react';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  Globe2,
  ShieldCheck,
  Eye,
  EyeOff,
  Palette,
  Check,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RefreshCw,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme, THEMES_LIST } from '../../context/ThemeContext';
import { LanguageCode } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../data/languages';

interface LoginScreenProps {
  selectedLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onLoginSuccess: () => void;
  onClose?: () => void;
}

type AuthScreenView =
  | 'options'
  | 'email-signin'
  | 'email-signup'
  | 'forgot-password'
  | 'reset-password'
  | 'verify-email-pending';

export const LoginScreen: React.FC<LoginScreenProps> = ({
  selectedLanguage,
  onSelectLanguage,
  onLoginSuccess,
  onClose,
}) => {
  const {
    loginWithEmail,
    registerWithEmail,
    loginAsDemoUser,
    verifyEmail,
    resendVerification,
    requestPasswordReset,
    resetPassword,
    isLoading,
    user,
  } = useAuth();

  // If user is already authenticated or becomes authenticated via redirect/state-listener, trigger success
  useEffect(() => {
    if (user) {
      onLoginSuccess();
    }
  }, [user, onLoginSuccess]);

  const { theme, setTheme } = useTheme();

  // Current Screen State
  const [view, setView] = useState<AuthScreenView>('options');

  // Theme dropdown state
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot / Reset Password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Email Verification state
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');
  const [pendingVerificationToken, setPendingVerificationToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Feedback states
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [activeButton, setActiveButton] = useState<'email' | 'reset' | null>(null);

  // Close theme menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setIsThemeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check for URL parameters on mount (email verification or password reset links)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlVerifyToken = urlParams.get('token') || urlParams.get('verifyToken');
      const isVerifyRoute = window.location.pathname.includes('verify-email');
      const isResetRoute = window.location.pathname.includes('reset-password');

      if (urlVerifyToken && isVerifyRoute) {
        setPendingVerificationToken(urlVerifyToken);
        setView('verify-email-pending');
        handleDirectEmailVerify(urlVerifyToken);
      } else if (urlVerifyToken && isResetRoute) {
        setResetToken(urlVerifyToken);
        setView('reset-password');
      }
    } catch {}
  }, []);

  /**
   * DEMO MODE ACCESS
   * Instant simulated session for testing all PakLingo AI features without credentials or Firebase setup.
   */
  const handleDemoLogin = async (role: 'student' | 'teacher' = 'student') => {
    if (isLoading) return;
    setAuthError(null);
    setAuthSuccess(null);
    try {
      await loginAsDemoUser(role);
      onLoginSuccess();
    } catch (err: any) {
      setAuthError(err.message || 'Failed to start demo session.');
    }
  };

  /**
   * EMAIL SIGN IN
   * Validates credentials against securely stored cryptographic hash
   */
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setAuthError(null);
    setAuthSuccess(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setAuthError('Please enter both your email address and password.');
      return;
    }

    setActiveButton('email');
    try {
      await loginWithEmail(cleanEmail, password);
      onLoginSuccess();
    } catch (err: any) {
      // Return clear secure non-enumerating error
      setAuthError(err.message || 'Incorrect email or password.');
    } finally {
      setActiveButton(null);
    }
  };

  /**
   * 3. EMAIL REGISTRATION (CREATE ACCOUNT)
   * Hashes password on backend, stores salt, generates verification link
   */
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setAuthError(null);
    setAuthSuccess(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setAuthError('Passwords do not match. Please verify both password fields.');
      return;
    }

    setActiveButton('email');
    try {
      const result = await registerWithEmail(cleanEmail, password, confirmPassword, fullName);
      if (result.verificationToken) {
        setPendingVerificationEmail(cleanEmail);
        setPendingVerificationToken(result.verificationToken);
        setAuthSuccess('Account created successfully! A verification email has been sent.');
        setView('verify-email-pending');
      } else {
        setAuthSuccess('PakLingo password created and linked to your account successfully!');
        setTimeout(() => {
          onLoginSuccess();
        }, 800);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Failed to create account. Please check your details.');
    } finally {
      setActiveButton(null);
    }
  };

  /**
   * 4. DIRECT EMAIL VERIFICATION ACTION
   */
  const handleDirectEmailVerify = async (tokenToVerify?: string) => {
    const tok = tokenToVerify || pendingVerificationToken;
    if (!tok) {
      setAuthError('No verification token provided.');
      return;
    }

    setIsVerifying(true);
    setAuthError(null);
    setAuthSuccess(null);

    try {
      const result = await verifyEmail(tok);
      if (result.success) {
        setAuthSuccess('Your email address has been successfully verified!');
        setTimeout(() => {
          onLoginSuccess();
        }, 1200);
      } else {
        setAuthError(result.error || 'Verification link is invalid or expired.');
      }
    } catch {
      setAuthError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * 5. RESEND VERIFICATION EMAIL
   */
  const handleResendVerification = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    try {
      const result = await resendVerification(pendingVerificationEmail || email);
      if (result.success) {
        if (result.verificationLink) {
          const match = result.verificationLink.match(/token=([a-f0-9]+)/);
          if (match) setPendingVerificationToken(match[1]);
        }
        setAuthSuccess('A fresh verification link has been sent to your email.');
      } else {
        setAuthError(result.error || 'Failed to resend verification.');
      }
    } catch {
      setAuthError('Error sending verification email.');
    }
  };

  /**
   * 6. REQUEST PASSWORD RESET (FORGOT PASSWORD)
   */
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const cleanEmail = forgotEmail.trim();
    if (!cleanEmail) {
      setAuthError('Please enter your registered email address.');
      return;
    }

    setActiveButton('reset');
    try {
      const res = await requestPasswordReset(cleanEmail);
      if (res.success) {
        setAuthSuccess(res.message || 'Password reset instructions sent to your email.');
        if (res.resetToken) {
          setResetToken(res.resetToken);
        }
      } else {
        setAuthError(res.error || 'Failed to process password reset.');
      }
    } catch {
      setAuthError('Failed to send password reset. Please try again.');
    } finally {
      setActiveButton(null);
    }
  };

  /**
   * 7. COMPLETE PASSWORD RESET
   */
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!resetToken) {
      setAuthError('Missing password reset token.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setAuthError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setAuthError('Passwords do not match. Please ensure both passwords match.');
      return;
    }

    setActiveButton('reset');
    try {
      const res = await resetPassword(resetToken, newPassword, confirmNewPassword);
      if (res.success) {
        setAuthSuccess(res.message || 'Password has been securely reset. You can now sign in.');
        setEmail(forgotEmail || email);
        setPassword('');
        setView('email-signin');
      } else {
        setAuthError(res.error || 'Password reset link is invalid or expired.');
      }
    } catch {
      setAuthError('Failed to reset password. Please try again.');
    } finally {
      setActiveButton(null);
    }
  };

  return (
    <div
      id="paklingo-login-screen"
      className="min-h-screen h-[100dvh] w-full bg-[var(--background)] text-[var(--text-primary)] flex flex-col justify-between overflow-hidden relative selection:bg-[var(--accent)] selection:text-white box-border"
    >
      {/* Top Header Bar: Logo, Theme Switcher & Language Selector */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 shrink-0 flex items-center justify-between">
        {/* Brand Identity */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] flex items-center justify-center shadow-md border border-[var(--border)]">
            <span className="font-bold text-base sm:text-lg font-serif">P</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-[var(--text-primary)]">
                PakLingo
              </span>
              <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md bg-[var(--accent)]/15 text-[var(--accent)] font-bold border border-[var(--accent)]/30 uppercase tracking-wider">
                AI
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-urdu text-[var(--accent)]">
              پاکستان کا کثیر لسانی اے آئی معاون
            </span>
          </div>
        </div>

        {/* Right Side Header Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Theme Selector */}
          <div className="relative" ref={themeRef}>
            <button
              type="button"
              id="login-theme-toggle"
              onClick={() => setIsThemeOpen(!isThemeOpen)}
              className="flex items-center gap-1.5 bg-[var(--surface)] hover:bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl px-2.5 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-xs transition-colors cursor-pointer"
              title={`Active Theme: ${theme}`}
              aria-label="Select Theme"
            >
              <Palette className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
              <span className="hidden sm:inline capitalize font-medium">{theme}</span>
            </button>

            {isThemeOpen && (
              <div
                id="login-theme-menu"
                className="absolute right-0 mt-2 w-48 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl p-1.5 z-50 space-y-0.5"
              >
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider border-b border-[var(--border)] mb-1">
                  Website Theme
                </div>
                {THEMES_LIST.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTheme(t.id);
                      setIsThemeOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      theme === t.id
                        ? 'bg-[var(--surface-secondary)] text-[var(--accent)] font-bold'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: t.accentPreview }}
                      />
                      <span>{t.name}</span>
                    </div>
                    {theme === t.id && <Check className="w-3.5 h-3.5 text-[var(--accent)]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Multilingual Selector */}
          <div className="flex items-center gap-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-2.5 py-1.5 text-xs text-[var(--text-secondary)] shadow-xs">
            <Globe2 className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
            <select
              id="login-language-select"
              value={selectedLanguage}
              onChange={(e) => onSelectLanguage(e.target.value as LanguageCode)}
              className="bg-transparent text-xs text-[var(--text-primary)] focus:outline-hidden cursor-pointer font-medium"
              aria-label="Select Interface Language"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option
                  key={lang.code}
                  value={lang.code}
                  className="bg-[var(--dropdown-bg)] text-[var(--dropdown-text)]"
                >
                  {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
          </div>

          {/* Close Button when displayed as modal overlay */}
          {onClose && (
            <button
              type="button"
              id="login-close-btn"
              onClick={onClose}
              className="flex items-center gap-1 bg-[var(--surface)] hover:bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl px-2.5 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-xs transition-colors cursor-pointer active:scale-95 ml-1"
              title="Close and return to app"
              aria-label="Close login dialog"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Close</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Centered Login Section (NO white card container, NO character, NO animation) */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 sm:px-6 flex flex-col items-center justify-center min-h-0 overflow-y-auto overscroll-contain py-2 sm:py-3">
        <div className="w-full text-center space-y-3 sm:space-y-4 my-auto">
          {/* Centered Brand Header */}
          <div className="space-y-1 sm:space-y-1.5">
            <div className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] shadow-md border border-[var(--border)] mb-0.5">
              <span className="font-bold text-xl sm:text-2xl font-serif">P</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-[var(--text-primary)]">
                PakLingo
              </span>
              <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md bg-[var(--accent)]/15 text-[var(--accent)] font-bold border border-[var(--accent)]/30 uppercase tracking-wider">
                AI
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Welcome Back 👋
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Sign in to continue to PakLingo AI
            </p>
          </div>

          {/* Error Message Notification */}
          {authError && (
            <div
              id="auth-error-banner"
              className="p-2.5 sm:p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-300 flex items-start justify-start gap-2.5 text-left"
            >
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0 space-y-1">
                <span className="font-medium leading-relaxed break-words">{authError}</span>
                {typeof window !== 'undefined' && window.self !== window.top && (
                  <div className="pt-0.5">
                    <a
                      href={window.location.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold underline text-rose-700 dark:text-rose-200 hover:text-rose-900"
                    >
                      Open preview in new tab &rarr;
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Success Notification */}
          {authSuccess && (
            <div
              id="auth-success-banner"
              className="p-2.5 sm:p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-300 flex items-start justify-start gap-2.5 text-left"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{authSuccess}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 1: OPTIONS (Email & Demo Mode Options) */}
          {/* ======================================================== */}
          {view === 'options' && (
            <div className="space-y-3 sm:space-y-3.5 pt-0.5">

              {/* Continue with Email Button */}
              <button
                type="button"
                id="continue-with-email-btn"
                onClick={() => {
                  setAuthError(null);
                  setAuthSuccess(null);
                  setView('email-signin');
                }}
                disabled={isLoading}
                className="w-full h-11 sm:h-12 rounded-xl bg-[var(--button-primary-bg)] hover:opacity-90 active:scale-[0.99] text-[var(--button-primary-text)] font-semibold text-sm flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Mail className="w-4 h-4" />
                <span>Continue with Email</span>
              </button>

              {/* Dedicated Demo Mode Section (Clearly Labeled - Testing Only - No Real Auth Claim) */}
              <div className="pt-1">
                <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)]/80 p-2.5 sm:p-3 text-left space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">🧪</span>
                      <span className="text-xs font-bold text-[var(--text-primary)]">Demo Mode</span>
                    </div>
                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      Testing Only
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] leading-tight">
                    Instant access to test all PakLingo AI features without an account or Firebase.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <button
                      type="button"
                      id="demo-student-btn"
                      onClick={() => handleDemoLogin('student')}
                      disabled={isLoading}
                      className="py-1.5 px-2 rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                    >
                      <span>Demo Student</span>
                      <ArrowRight className="w-3 h-3 text-[var(--accent)] shrink-0" />
                    </button>
                    <button
                      type="button"
                      id="demo-teacher-btn"
                      onClick={() => handleDemoLogin('teacher')}
                      disabled={isLoading}
                      className="py-1.5 px-2 rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                    >
                      <span>Demo Faculty</span>
                      <ArrowRight className="w-3 h-3 text-[var(--accent)] shrink-0" />
                    </button>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] italic leading-tight">
                    * Simulated test session. Does not create persistent real-user credentials.
                  </p>
                </div>
              </div>

              {/* Centered Sign In / Sign Up Footer Links */}
              <div className="pt-1.5 sm:pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-[var(--text-muted)]">
                <button
                  type="button"
                  id="link-to-signin"
                  onClick={() => {
                    setAuthError(null);
                    setAuthSuccess(null);
                    setView('email-signin');
                  }}
                  className="hover:text-[var(--accent)] transition-colors cursor-pointer"
                >
                  Already have an account?{' '}
                  <span className="text-[var(--accent)] font-semibold underline underline-offset-2">
                    Sign in
                  </span>
                </button>
                <span className="hidden sm:inline text-[var(--border)]">•</span>
                <button
                  type="button"
                  id="link-to-signup"
                  onClick={() => {
                    setAuthError(null);
                    setAuthSuccess(null);
                    setView('email-signup');
                  }}
                  className="hover:text-[var(--accent)] transition-colors cursor-pointer"
                >
                  New here?{' '}
                  <span className="text-[var(--accent)] font-semibold underline underline-offset-2">
                    Create an account
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 2: EMAIL SIGN IN (Email + Password) */}
          {/* ======================================================== */}
          {view === 'email-signin' && (
            <form onSubmit={handleEmailSignIn} className="space-y-2.5 sm:space-y-3 text-left pt-0.5">
              <div className="flex items-center justify-between pb-0.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                  Sign In with Email
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthError(null);
                    setAuthSuccess(null);
                    setView('options');
                  }}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  ← Back to options
                </button>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    id="email-input"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-3.5 py-2 sm:py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--accent)] transition-colors"
                  />
                </div>
              </div>

              {/* Password & Forgot Password Link */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">
                    Password
                  </label>
                  <button
                    type="button"
                    id="forgot-password-link"
                    onClick={() => {
                      setAuthError(null);
                      setAuthSuccess(null);
                      setForgotEmail(email);
                      setView('forgot-password');
                    }}
                    className="text-xs text-[var(--accent)] hover:underline cursor-pointer font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password-input"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2 sm:py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--accent)] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="email-auth-submit-btn"
                disabled={isLoading}
                className="w-full h-10 sm:h-11 mt-1 rounded-xl bg-[var(--button-primary-bg)] hover:opacity-90 active:scale-[0.99] text-[var(--button-primary-text)] font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {activeButton === 'email' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to PakLingo AI</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Switch to Sign Up */}
              <div className="pt-1 text-center text-xs text-[var(--text-muted)]">
                <button
                  type="button"
                  onClick={() => {
                    setAuthError(null);
                    setAuthSuccess(null);
                    setView('email-signup');
                  }}
                  className="hover:text-[var(--accent)] transition-colors cursor-pointer"
                >
                  New to PakLingo AI?{' '}
                  <span className="text-[var(--accent)] font-semibold underline underline-offset-2">
                    Create an account
                  </span>
                </button>
              </div>

              {/* Instant Demo Mode Option */}
              <div className="pt-1.5 text-center text-[11px] text-[var(--text-muted)] border-t border-[var(--border)]">
                <span>Want to test immediately without credentials? </span>
                <button
                  type="button"
                  id="signin-try-demo-btn"
                  onClick={() => handleDemoLogin('student')}
                  className="text-amber-600 dark:text-amber-400 font-semibold hover:underline cursor-pointer"
                >
                  Try Demo Mode &rarr;
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* VIEW 3: CREATE ACCOUNT (Email + Password + Confirm Password) */}
          {/* ======================================================== */}
          {view === 'email-signup' && (
            <form onSubmit={handleEmailSignUp} className="space-y-2 sm:space-y-2.5 text-left pt-0.5">
              <div className="flex items-center justify-between pb-0.5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] block">
                    Create Account
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    Create a password specifically for your PakLingo AI account
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAuthError(null);
                    setAuthSuccess(null);
                    setView('options');
                  }}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0 ml-2"
                >
                  ← Back
                </button>
              </div>

              {/* Full Name */}
              <div className="space-y-0.5 sm:space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">
                  Full Name (Optional)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    id="signup-name-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Tariq Khan"
                    className="w-full pl-10 pr-3.5 py-1.5 sm:py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--accent)] transition-colors"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-0.5 sm:space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    id="signup-email-input"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-3.5 py-1.5 sm:py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--accent)] transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-0.5 sm:space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">
                    Password
                  </label>
                  <span className="text-[10px] sm:text-[11px] text-[var(--text-muted)]">Min. 6 characters</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="signup-password-input"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-1.5 sm:py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--accent)] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-0.5 sm:space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="signup-confirm-password-input"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-1.5 sm:py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--accent)] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <p className="text-[10px] sm:text-[11px] text-[var(--text-muted)] leading-snug">
                🔒 Note: This password is created specifically for your PakLingo AI account. It is
                never shared with Google or third parties and is cryptographically hashed.
              </p>

              {/* Submit Button */}
              <button
                type="submit"
                id="signup-submit-btn"
                disabled={isLoading}
                className="w-full h-10 sm:h-11 mt-1 rounded-xl bg-[var(--button-primary-bg)] hover:opacity-90 active:scale-[0.99] text-[var(--button-primary-text)] font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {activeButton === 'email' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account securely...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Switch to Sign In */}
              <div className="pt-1 text-center text-xs text-[var(--text-muted)]">
                <button
                  type="button"
                  onClick={() => {
                    setAuthError(null);
                    setAuthSuccess(null);
                    setView('email-signin');
                  }}
                  className="hover:text-[var(--accent)] transition-colors cursor-pointer"
                >
                  Already have an account?{' '}
                  <span className="text-[var(--accent)] font-semibold underline underline-offset-2">
                    Sign in
                  </span>
                </button>
              </div>

              {/* Instant Demo Mode Option */}
              <div className="pt-1.5 text-center text-[11px] text-[var(--text-muted)] border-t border-[var(--border)]">
                <span>Just exploring? </span>
                <button
                  type="button"
                  id="signup-try-demo-btn"
                  onClick={() => handleDemoLogin('student')}
                  className="text-amber-600 dark:text-amber-400 font-semibold hover:underline cursor-pointer"
                >
                  Enter Demo Mode &rarr;
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* VIEW 4: FORGOT PASSWORD */}
          {/* ======================================================== */}
          {view === 'forgot-password' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-2.5 sm:space-y-3 text-left pt-0.5">
              <div className="flex items-center justify-between pb-0.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                  Reset Password
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthError(null);
                    setAuthSuccess(null);
                    setView('email-signin');
                  }}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  ← Back to sign in
                </button>
              </div>

              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Enter your PakLingo AI account email. We will send you a secure link to create a new
                password.
              </p>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    id="forgot-email-input"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-3.5 py-2 sm:py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--accent)] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="forgot-password-submit-btn"
                disabled={isLoading}
                className="w-full h-10 sm:h-11 rounded-xl bg-[var(--button-primary-bg)] hover:opacity-90 active:scale-[0.99] text-[var(--button-primary-text)] font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {activeButton === 'reset' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending reset instructions...</span>
                  </>
                ) : (
                  <>
                    <span>Send Password Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* If reset token was generated, allow immediate transition to set new password */}
              {resetToken && (
                <div className="p-2.5 sm:p-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] space-y-2 text-center">
                  <span className="text-xs text-[var(--text-secondary)] block">
                    Password reset link ready for testing:
                  </span>
                  <button
                    type="button"
                    onClick={() => setView('reset-password')}
                    className="w-full py-2 px-3 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Proceed to Set New Password</span>
                  </button>
                </div>
              )}
            </form>
          )}

          {/* ======================================================== */}
          {/* VIEW 5: RESET PASSWORD (NEW PASSWORD + CONFIRM NEW PASSWORD) */}
          {/* ======================================================== */}
          {view === 'reset-password' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-2.5 sm:space-y-3 text-left pt-0.5">
              <div className="flex items-center justify-between pb-0.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                  Create New Password
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthError(null);
                    setAuthSuccess(null);
                    setView('email-signin');
                  }}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Choose a new secure password for your PakLingo AI account.
              </p>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="new-password-input"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2 sm:py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--accent)] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    id="confirm-new-password-input"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2 sm:py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--accent)] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="reset-password-submit-btn"
                disabled={isLoading}
                className="w-full h-10 sm:h-11 rounded-xl bg-[var(--button-primary-bg)] hover:opacity-90 active:scale-[0.99] text-[var(--button-primary-text)] font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {activeButton === 'reset' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating password...</span>
                  </>
                ) : (
                  <>
                    <span>Update Password & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ======================================================== */}
          {/* VIEW 6: EMAIL VERIFICATION PENDING */}
          {/* ======================================================== */}
          {view === 'verify-email-pending' && (
            <div className="space-y-2.5 sm:space-y-3 text-left pt-0.5">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-center space-y-2 sm:space-y-2.5 shadow-xs">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center mx-auto">
                  <Mail className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                  Verify Your Email Address
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  We sent a verification email to{' '}
                  <strong className="text-[var(--text-primary)] font-semibold">
                    {pendingVerificationEmail || email || 'your email'}
                  </strong>
                  . Please verify your email address to complete your account setup.
                </p>

                {/* Direct 1-Click Verification in Preview */}
                <button
                  type="button"
                  id="direct-verify-email-btn"
                  onClick={() => handleDirectEmailVerify()}
                  disabled={isVerifying}
                  className="w-full py-2 sm:py-2.5 px-4 rounded-xl bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying account...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Verify Email Now</span>
                    </>
                  )}
                </button>

                {/* Resend Verification */}
                <div className="flex items-center justify-center gap-2 pt-0.5 text-xs">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    className="text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend verification email</span>
                  </button>
                </div>
              </div>

              {/* Continue to app anyway (with unverified banner in app) */}
              <button
                type="button"
                onClick={onLoginSuccess}
                className="w-full py-2 sm:py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-secondary)] text-xs font-semibold text-[var(--text-primary)] text-center cursor-pointer transition-colors"
              >
                Continue to PakLingo AI (Verify later)
              </button>
            </div>
          )}

          {/* Verified SSL Badge */}
          <div className="pt-2 sm:pt-2.5 flex items-center justify-center">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-[var(--text-muted)]">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Verified & Secure Cryptographic Authentication</span>
            </div>
          </div>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-2 border-t border-[var(--border)] text-[var(--text-muted)] text-[11px]">
        <p>© 2026 PakLingo AI. Empowering Pakistan with multilingual AI technology.</p>
        <div className="flex items-center gap-3 sm:gap-4">
          <span>Urdu • Punjabi • Sindhi • Pashto • Balochi</span>
          <span>•</span>
          <span className="text-[var(--accent)]">Privacy & Terms</span>
        </div>
      </footer>
    </div>
  );
};
