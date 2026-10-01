import { Request, Response, CookieOptions } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { generateToken } from '../utils/token';
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
        // passwordHash is intentionally never selected
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

    // Return safe user object (excluding passwordHash)
    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          provider: user.provider,
          status: user.status,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
        },
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
