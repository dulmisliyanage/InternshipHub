import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-fallback-secret-change-in-prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface GoogleOnboardingPayload {
  googleId: string;
  email: string;
  name: string;
  profileImage: string | null;
  type: 'google_onboarding';
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

/**
 * Signs a short-lived token (15 mins) carrying Google user information for the
 * first-time role selection step (STUDENT vs COMPANY).
 */
export function generateOnboardingToken(
  payload: Omit<GoogleOnboardingPayload, 'type'>
): string {
  return jwt.sign({ ...payload, type: 'google_onboarding' }, JWT_SECRET, {
    expiresIn: '15m',
  });
}

/**
 * Validates and decodes the short-lived Google onboarding token.
 */
export function verifyOnboardingToken(token: string): GoogleOnboardingPayload {
  const decoded = jwt.verify(token, JWT_SECRET) as GoogleOnboardingPayload;
  if (decoded.type !== 'google_onboarding') {
    throw new Error('Invalid onboarding token type');
  }
  return decoded;
}
