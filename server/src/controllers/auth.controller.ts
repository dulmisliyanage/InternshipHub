import { Request, Response, CookieOptions } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma';
import {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  googleCompleteRegistrationSchema,
} from '../validators/auth.validator';
import {
  generateToken,
  generateOnboardingToken,
  verifyOnboardingToken,
} from '../utils/token';
import { verifyGoogleIdToken } from '../utils/google';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const COOKIE_NAME = 'token';

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  path: '/',
};

/**
 * Helper to format safe user object excluding sensitive fields like passwordHash.
 */
function toSafeUser(user: any) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    provider: user.provider,
    status: user.status,
    profileImage: user.profileImage,
    createdAt: user.createdAt,
  };
}

/**
 * POST /api/auth/register
 * Public registration flow for STUDENT and COMPANY roles.
 */
export async function register(req: Request, res: Response): Promise<void> {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    const errorDetails = result.error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    res.status(400).json({
      status: 'error',
      message: errorDetails[0]?.message || 'Validation failed',
      errors: errorDetails,
    });
    return;
  }

  const { name, email, password, role } = result.data;

  // Explicit defense-in-depth guard: ADMIN role must never be registered publicly
  if ((role as string) === 'ADMIN') {
    res.status(403).json({
      status: 'error',
      message: 'Security Violation: Direct registration as ADMIN is strictly prohibited.',
    });
    return;
  }

  try {
    // Check if account already exists with this email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({
        status: 'error',
        message: 'An account with this email already exists',
      });
      return;
    }

    // Hash password with bcrypt (salt rounds: 12)
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user in PostgreSQL
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        provider: 'LOCAL',
        role,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        provider: true,
        status: true,
        profileImage: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    // Set secure HTTP-only cookie
    res.cookie(COOKIE_NAME, token, cookieOptions);

    res.status(201).json({
      status: 'success',
      message: 'Account registered successfully',
      data: {
        user: newUser,
        token,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error occurred during registration',
    });
  }
}

/**
 * POST /api/auth/login
 * Local email/password authentication flow.
 */
export async function login(req: Request, res: Response): Promise<void> {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      status: 'error',
      message: result.error.issues[0]?.message || 'Invalid login credentials',
    });
    return;
  }

  const { email, password } = result.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // User does not exist or was registered via OAuth without local password
    if (!user || !user.passwordHash) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
      return;
    }

    // Verify password against stored hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
      return;
    }

    // Verify account status
    if (user.status !== 'ACTIVE') {
      res.status(403).json({
        status: 'error',
        message: `Account is ${user.status.toLowerCase()}. Please contact support.`,
      });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Set secure HTTP-only cookie
    res.cookie(COOKIE_NAME, token, cookieOptions);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: toSafeUser(user),
        token,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error occurred during login',
    });
  }
}

/**
 * POST /api/auth/google
 * Google Sign-In verification endpoint.
 *
 * Flow:
 * 1. Verifies Google token.
 * 2. If user exists -> logs in immediately (returning Google users go directly into their account).
 * 3. If user DOES NOT exist -> returns needs_role_selection with a short-lived onboardingToken
 *    so the user can choose STUDENT or COMPANY (no ADMIN option).
 */
export async function googleAuth(req: Request, res: Response): Promise<void> {
  const result = googleAuthSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      status: 'error',
      message: result.error.issues[0]?.message || 'Google token is required',
    });
    return;
  }

  const token = result.data.credential || result.data.idToken!;

  try {
    const profile = await verifyGoogleIdToken(token);

    // Check if an account already exists with this googleId or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId: profile.googleId }, { email: profile.email }],
      },
    });

    // Case A: Returning Google user (or existing user linking Google)
    if (user) {
      if (user.status !== 'ACTIVE') {
        res.status(403).json({
          status: 'error',
          message: `Account is ${user.status.toLowerCase()}. Please contact support.`,
        });
        return;
      }

      // Link googleId if they previously signed up with local email
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: profile.googleId,
            profileImage: user.profileImage || profile.profileImage,
          },
        });
      }

      const sessionToken = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

      res.status(200).json({
        status: 'success',
        isNewUser: false,
        message: 'Welcome back! Logged in with Google.',
        data: {
          user: toSafeUser(user),
          token: sessionToken,
        },
      });
      return;
    }

    // Case B: First-time Google user -> Must choose account type (STUDENT or COMPANY)
    const onboardingToken = generateOnboardingToken({
      googleId: profile.googleId,
      email: profile.email,
      name: profile.name,
      profileImage: profile.profileImage,
    });

    res.status(200).json({
      status: 'needs_role_selection',
      isNewUser: true,
      message: 'No account found. Please choose your account type (Student or Company) to complete registration.',
      data: {
        onboardingToken,
        profile: {
          name: profile.name,
          email: profile.email,
          profileImage: profile.profileImage,
        },
        allowedRoles: ['STUDENT', 'COMPANY'],
      },
    });
  } catch (error: any) {
    console.error('Google auth error:', error.message);
    res.status(401).json({
      status: 'error',
      message: error.message || 'Google authentication failed',
    });
  }
}

/**
 * POST /api/auth/google/complete-registration
 * Finalizes first-time Google sign-up after the user selects their account type:
 * STUDENT or COMPANY. ADMIN is forbidden.
 */
export async function googleCompleteRegistration(req: Request, res: Response): Promise<void> {
  const result = googleCompleteRegistrationSchema.safeParse(req.body);

  if (!result.success) {
    const errorMsg = result.error.issues[0]?.message || 'Invalid onboarding input';
    res.status(400).json({
      status: 'error',
      message: errorMsg,
    });
    return;
  }

  const { onboardingToken, role } = result.data;

  // Strict role check: ADMIN option is impossible
  if ((role as string) === 'ADMIN') {
    res.status(403).json({
      status: 'error',
      message: 'Security Violation: Direct registration as ADMIN is strictly prohibited.',
    });
    return;
  }

  try {
    // Verify the short-lived onboarding token
    const onboardingData = verifyOnboardingToken(onboardingToken);

    // Double-check if user was created in the meantime
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ googleId: onboardingData.googleId }, { email: onboardingData.email }],
      },
    });

    if (existing) {
      // User already completed registration or exists
      const sessionToken = generateToken({
        userId: existing.id,
        email: existing.email,
        role: existing.role,
      });

      res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

      res.status(200).json({
        status: 'success',
        isNewUser: false,
        message: 'Account already created. Logged in successfully.',
        data: {
          user: toSafeUser(existing),
          token: sessionToken,
        },
      });
      return;
    }

    // Create the brand new User with provider: GOOGLE and passwordHash: null
    const newUser = await prisma.user.create({
      data: {
        name: onboardingData.name,
        email: onboardingData.email,
        googleId: onboardingData.googleId,
        profileImage: onboardingData.profileImage,
        provider: 'GOOGLE',
        role,
        status: 'ACTIVE',
        passwordHash: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        provider: true,
        status: true,
        profileImage: true,
        createdAt: true,
      },
    });

    // Generate JWT session token
    const sessionToken = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

    res.status(201).json({
      status: 'success',
      message: 'Google account created successfully',
      data: {
        user: newUser,
        token: sessionToken,
      },
    });
  } catch (error: any) {
    console.error('Google complete registration error:', error.message);
    res.status(401).json({
      status: 'error',
      message: 'Onboarding session has expired or is invalid. Please sign in with Google again.',
    });
  }
}

/**
 * POST /api/auth/logout
 * Clears the HTTP-only authentication cookie.
 */
export async function logout(req: Request, res: Response): Promise<void> {
  res.clearCookie(COOKIE_NAME, {
    ...cookieOptions,
    maxAge: 0,
  });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
}

/**
 * GET /api/auth/me
 * Returns currently authenticated user profile.
 */
export async function getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
}
