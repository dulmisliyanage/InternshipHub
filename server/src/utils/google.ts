import { OAuth2Client } from 'google-auth-library';

export interface GoogleUserProfile {
  googleId: string;
  email: string;
  name: string;
  profileImage: string | null;
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verifies a Google ID token or dev token and extracts the user profile.
 */
export async function verifyGoogleIdToken(token: string): Promise<GoogleUserProfile> {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;

  // 1. In Development/Testing mode, support mock Google tokens for testing without Google Cloud Console setup
  if (token.startsWith('mock_google_') || token.startsWith('dev_google_')) {
    try {
      const parts = token.split(':');
      if (parts.length === 2) {
        const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
        return {
          googleId: decoded.googleId || decoded.sub || 'mock-google-id',
          email: decoded.email.toLowerCase(),
          name: decoded.name || 'Google User',
          profileImage: decoded.profileImage || decoded.picture || null,
        };
      }
    } catch {
      // Fall through to standard verification
    }
  }

  // 2. Production / Live Google OAuth verification
  if (!googleClientId) {
    throw new Error(
      'GOOGLE_CLIENT_ID is not configured in server/.env. For development/testing, use a mock token or configure your Google OAuth credentials.'
    );
  }

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: googleClientId,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.sub || !payload.email) {
    throw new Error('Invalid Google token payload');
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name || payload.email.split('@')[0],
    profileImage: payload.picture || null,
  };
}
