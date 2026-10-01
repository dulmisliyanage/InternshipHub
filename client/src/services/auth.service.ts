import type {
  AuthResponse,
  GoogleAuthResponse,
  RegisterPayload,
  LoginPayload,
  GoogleCompleteRegistrationPayload,
} from '../types/auth';

const API_BASE = '/api/auth';

/**
 * Reusable request helper that always includes HTTP-only session cookies.
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include', // Always send HTTP-only cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export const authService = {
  /**
   * Register a new Student or Company account
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Login with email and password
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Logout and clear HTTP-only cookie
   */
  async logout(): Promise<{ status: string; message: string }> {
    return apiRequest<{ status: string; message: string }>('/logout', {
      method: 'POST',
    });
  },

  /**
   * Fetch currently authenticated user session
   */
  async getCurrentUser(): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/me', {
      method: 'GET',
    });
  },

  /**
   * Authenticate with Google ID Token / credential
   */
  async googleAuth(credential: string): Promise<GoogleAuthResponse> {
    return apiRequest<GoogleAuthResponse>('/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
  },

  /**
   * Complete first-time Google sign-up by selecting STUDENT or COMPANY
   */
  async completeGoogleRegistration(
    payload: GoogleCompleteRegistrationPayload
  ): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/google/complete-registration', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
