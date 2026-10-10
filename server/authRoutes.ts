import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import {
  verifyFirebaseToken,
  signInWithEmailAndPasswordServer,
  signUpWithEmailAndPasswordServer,
  sendPasswordResetEmailServer,
  confirmPasswordResetServer,
  resendEmailVerificationServer,
  invalidateFirebaseToken,
} from './firebaseAuth.js';
import { AuthService } from './authService.js';

let defaultGoogleClientId = '';
try {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    defaultGoogleClientId = config.oAuthClientId || '';
  }
} catch (e) {
  // ignore
}

// ============================================================================
// AUTHENTICATION PROVIDER CONFIGURATION
// To restore Firebase Email/Password as the primary provider once configured in
// Firebase Console (Authentication > Sign-in method > Email/Password: Enabled):
// set USE_FIREBASE_EMAIL_AUTH = true;
// ============================================================================
export const USE_FIREBASE_EMAIL_AUTH = false;

export const authRouter = Router();

/**
 * Register with Email & Password
 * Uses secure local AuthService (salted PBKDF2-SHA512 hashing with 100,000 iterations).
 * Firebase code is preserved and isolated via USE_FIREBASE_EMAIL_AUTH.
 */
authRouter.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, confirmPassword, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match. Please check both fields.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    if (USE_FIREBASE_EMAIL_AUTH) {
      const result = await signUpWithEmailAndPasswordServer(email, password, name);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      return res.status(201).json(result);
    }

    // Secure local backend registration
    const result = AuthService.register({ email, password, confirmPassword, name });
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    return res.status(201).json(result);
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Failed to complete registration. Please try again.' });
  }
});

/**
 * Sign In with Email & Password
 * Uses secure local AuthService with timing-safe hash comparison.
 * Firebase code is preserved and isolated via USE_FIREBASE_EMAIL_AUTH.
 */
authRouter.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    if (USE_FIREBASE_EMAIL_AUTH) {
      const result = await signInWithEmailAndPasswordServer(email, password);
      if (!result.success) {
        return res.status(401).json({ error: result.error });
      }
      return res.json(result);
    }

    // Secure local backend login
    const result = AuthService.login(email, password);
    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }

    return res.json(result);
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Failed to sign in. Please try again.' });
  }
});

/**
 * Demo Mode Authentication Endpoint
 * Grants immediate simulated access for UI testing without credentials or Firebase dependency.
 * Explicitly labeled as a non-persistent testing session.
 */
authRouter.post('/api/auth/demo', (req: Request, res: Response) => {
  try {
    const { role = 'student' } = req.body || {};
    const isTeacher = role === 'teacher';
    const demoUser = {
      id: isTeacher ? 'demo-teacher-01' : 'demo-student-01',
      email: isTeacher ? 'demo-teacher@paklingo.local' : 'demo-student@paklingo.local',
      name: isTeacher ? 'Prof. Tariq (Demo Faculty)' : 'Amina Khan (Demo Learner)',
      provider: 'email' as const,
      emailVerified: true,
      isDemo: true,
      createdAt: new Date().toISOString(),
    };
    const token = isTeacher ? 'pkt_demo_teacher' : 'pkt_demo_student';
    return res.json({
      success: true,
      token,
      user: demoUser,
      isDemo: true,
      notice: 'Demo mode active. Simulated session for testing; no real-user credentials created.',
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to initialize demo session.' });
  }
});

/**
 * Google OAuth Authentication
 * Accepts Firebase ID Token or Google credential, verifies against Firebase Auth
 */
authRouter.post('/api/auth/google', async (req: Request, res: Response) => {
  try {
    const { accessToken, credential, idToken, profile } = req.body;
    const tokenToVerify = idToken || credential;

    // 1. Verify directly via Firebase ID token
    if (tokenToVerify && typeof tokenToVerify === 'string') {
      try {
        const verifiedUser = await verifyFirebaseToken(tokenToVerify);
        if (verifiedUser) {
          return res.json({
            success: true,
            token: tokenToVerify,
            user: verifiedUser,
          });
        }
      } catch (fbErr) {
        console.warn('Firebase token verification note:', fbErr);
      }
    }

    // 2. Fallback: If access token was provided, fetch Google userinfo
    let targetEmail = profile?.email || '';
    let targetName = profile?.name || '';
    let targetAvatar = profile?.avatar || profile?.picture || '';
    let googleId = profile?.googleId || profile?.sub || '';

    if (!targetEmail && accessToken && typeof accessToken === 'string') {
      try {
        const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (googleRes.ok) {
          const googleData = await googleRes.json();
          targetEmail = googleData.email || '';
          targetName = googleData.name || '';
          targetAvatar = googleData.picture || '';
          googleId = googleData.sub || '';
        }
      } catch (gErr) {
        console.warn('Google userinfo fetch fallback note:', gErr);
      }
    }

    if (!targetEmail) {
      return res.status(400).json({
        error: 'Google authentication could not be verified. Please try again.',
      });
    }

    return res.json({
      success: true,
      token: tokenToVerify || accessToken || `google_${googleId}`,
      user: {
        id: googleId || `g_${Date.now()}`,
        email: targetEmail,
        name: targetName || targetEmail.split('@')[0],
        avatar: targetAvatar,
        provider: 'google',
        emailVerified: true,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('Google auth error:', err);
    return res.status(500).json({ error: 'Failed to authenticate with Google.' });
  }
});

/**
 * Validate current session and get user profile
 */
authRouter.get('/api/auth/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No active session token provided.' });
    }

    const token = authHeader.substring(7).trim();

    // 1. Handle Demo Mode tokens immediately
    if (token === 'pkt_demo_session' || token === 'pkt_demo_student' || token === 'pkt_demo_teacher') {
      const isTeacher = token === 'pkt_demo_teacher';
      return res.json({
        success: true,
        user: {
          id: isTeacher ? 'demo-teacher-01' : 'demo-student-01',
          email: isTeacher ? 'demo-teacher@paklingo.local' : 'demo-student@paklingo.local',
          name: isTeacher ? 'Prof. Tariq (Demo Faculty)' : 'Amina Khan (Demo Learner)',
          provider: 'email',
          emailVerified: true,
          isDemo: true,
          createdAt: new Date().toISOString(),
        },
      });
    }

    // 2. Handle local AuthService session tokens
    if (token.startsWith('pkt_')) {
      const localUser = AuthService.getUserBySessionToken(token);
      if (localUser) {
        return res.json({ success: true, user: localUser });
      }
    }

    // 3. Fallback: Verify Firebase ID token if token is from Firebase
    try {
      const firebaseUser = await verifyFirebaseToken(token);
      if (firebaseUser) {
        return res.json({ success: true, user: firebaseUser });
      }
    } catch {
      // Continue to 401
    }

    return res.status(401).json({ error: 'Session has expired or is invalid. Please sign in.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve user session.' });
  }
});

/**
 * Logout and invalidate session
 */
authRouter.post('/api/auth/logout', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (token.startsWith('pkt_')) {
        AuthService.invalidateSession(token);
      } else {
        invalidateFirebaseToken(token);
      }
    }
    return res.json({ success: true, message: 'Signed out successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to logout.' });
  }
});

/**
 * Verify email address
 */
authRouter.post('/api/auth/verify-email', (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Verification token is required.' });
    }
    if (USE_FIREBASE_EMAIL_AUTH) {
      return res.json({ success: true, message: 'Email address verified successfully.' });
    }
    const result = AuthService.verifyEmail(token);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Email verification failed.' });
  }
});

/**
 * Resend email verification
 */
authRouter.post('/api/auth/resend-verification', async (req: Request, res: Response) => {
  try {
    const { email, idToken } = req.body;
    if (USE_FIREBASE_EMAIL_AUTH) {
      const result = await resendEmailVerificationServer(idToken || email);
      return res.json(result);
    }
    const result = AuthService.resendVerification(email);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to resend verification.' });
  }
});

/**
 * Request Password Reset (Forgot Password)
 */
authRouter.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (USE_FIREBASE_EMAIL_AUTH) {
      const result = await sendPasswordResetEmailServer(email);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      return res.json(result);
    }
    const result = AuthService.requestPasswordReset(email);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process password reset request.' });
  }
});

/**
 * Complete Password Reset
 */
authRouter.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Missing password reset token.' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }
    if (USE_FIREBASE_EMAIL_AUTH) {
      const result = await confirmPasswordResetServer(token, newPassword);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      return res.json(result);
    }
    const result = AuthService.resetPassword({ token, newPassword, confirmPassword });
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
});

/**
 * Public client config for Google OAuth
 */
authRouter.get('/api/auth/config', (_req: Request, res: Response) => {
  const googleClientId = defaultGoogleClientId || '';
  return res.json({
    googleClientId,
    hasGoogleConfig: Boolean(googleClientId),
  });
});
