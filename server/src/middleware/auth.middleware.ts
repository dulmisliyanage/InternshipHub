import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/token';
import prisma from '../prisma';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    provider: string;
    profileImage: string | null;
    createdAt: Date;
  };
}

/**
 * authenticate (requireAuth)
 * 1. Checks Authorization: Bearer <token> or HTTP-only cookie `token`.
 * 2. Verifies token integrity and expiration.
 * 3. Verifies that the user exists in database and has an ACTIVE account.
 * 4. Attaches safe user profile to `req.user`.
 */
export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  let token: string | undefined;

  // 1. Check Authorization Bearer header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // 2. Fallback to HTTP-only cookie if header is not present
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401).json({
      status: 'error',
      message: 'Authentication required. Please log in.',
    });
    return;
  }

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        provider: true,
        profileImage: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(401).json({
        status: 'error',
        message: 'Account not found. Token is invalid.',
      });
      return;
    }

    if (user.status !== 'ACTIVE') {
      res.status(403).json({
        status: 'error',
        message: `Account is ${user.status.toLowerCase()}. Please contact support.`,
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid or expired session token. Please log in again.',
    });
  }
}

// Alias for convenience
export const requireAuth = authenticate;

/**
 * requireRole(...allowedRoles)
 * Ensures that the authenticated user possesses at least one of the allowed roles.
 * Must run AFTER authenticate().
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required before role verification',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        status: 'error',
        message: `Forbidden: Access requires [${allowedRoles.join(' or ')}] role. Your role is '${req.user.role}'.`,
      });
      return;
    }

    next();
  };
}
