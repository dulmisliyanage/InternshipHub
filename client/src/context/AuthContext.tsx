import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, LoginPayload, RegisterPayload } from '../types/auth';
import { authService } from '../services/auth.service';

export interface GoogleOnboardingData {
  onboardingToken: string;
  profile: {
    name: string;
    email: string;
    profileImage: string | null;
  };
}

export interface GoogleAuthResult {
  isNewUser: boolean;
  user?: User;
  onboarding?: GoogleOnboardingData;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  googleOnboarding: GoogleOnboardingData | null;
  setGoogleOnboarding: (data: GoogleOnboardingData | null) => void;
  login: (credentials: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  googleLogin: (credential: string) => Promise<GoogleAuthResult>;
  completeGoogleOnboarding: (role: 'STUDENT' | 'COMPANY') => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  updateUser: (updatedFields: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Short-lived in-memory onboarding token (no localStorage / sessionStorage persistence)
  const [googleOnboarding, setGoogleOnboarding] = useState<GoogleOnboardingData | null>(null);

  // Restore session from HTTP-only cookie on mount or page refresh
  const refreshUser = async (): Promise<User | null> => {
    try {
      const res = await authService.getCurrentUser();
      if (res.data?.user) {
        setUser(res.data.user);
        return res.data.user;
      }
      setUser(null);
      return null;
    } catch {
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: LoginPayload): Promise<User> => {
    // 1. Post credentials; server issues HTTP-only cookie
    await authService.login(credentials);

    // 2. Query /api/auth/me as authoritative user record
    const meRes = await authService.getCurrentUser();
    const verifiedUser = meRes.data?.user;

    if (!verifiedUser) {
      throw new Error('Authentication succeeded but session could not be established.');
    }

    setUser(verifiedUser);
    return verifiedUser;
  };

  const register = async (payload: RegisterPayload): Promise<User> => {
    // 1. Post registration; server issues HTTP-only cookie
    await authService.register(payload);

    // 2. Query /api/auth/me as authoritative user record
    const meRes = await authService.getCurrentUser();
    const verifiedUser = meRes.data?.user;

    if (!verifiedUser) {
      throw new Error('Registration succeeded but session could not be established.');
    }

    setUser(verifiedUser);
    return verifiedUser;
  };

  const googleLogin = async (credential: string): Promise<GoogleAuthResult> => {
    const res = await authService.googleAuth(credential);

    // Case A: Returning Google user
    if (!res.isNewUser && res.status === 'success') {
      const meRes = await authService.getCurrentUser();
      const verifiedUser = meRes.data?.user;

      if (!verifiedUser) {
        throw new Error('Google sign-in succeeded but session could not be verified.');
      }

      setUser(verifiedUser);
      setGoogleOnboarding(null);
      return { isNewUser: false, user: verifiedUser };
    }

    // Case B: First-time Google user -> needs role selection
    if (res.status === 'needs_role_selection' && res.data?.onboardingToken) {
      const onboardingData: GoogleOnboardingData = {
        onboardingToken: res.data.onboardingToken,
        profile: {
          name: res.data.profile?.name || 'Google User',
          email: res.data.profile?.email || '',
          profileImage: res.data.profile?.profileImage || null,
        },
      };

      setGoogleOnboarding(onboardingData);
      return { isNewUser: true, onboarding: onboardingData };
    }

    throw new Error(res.message || 'Unexpected Google authentication response');
  };

  const completeGoogleOnboarding = async (role: 'STUDENT' | 'COMPANY'): Promise<User> => {
    if (!googleOnboarding?.onboardingToken) {
      throw new Error('Onboarding session has expired. Please sign in with Google again.');
    }

    // 1. Send onboarding token and chosen role (STUDENT or COMPANY)
    await authService.completeGoogleRegistration({
      onboardingToken: googleOnboarding.onboardingToken,
      role,
    });

    // 2. Clear short-lived onboarding memory
    setGoogleOnboarding(null);

    // 3. Query authoritative session from /api/auth/me
    const meRes = await authService.getCurrentUser();
    const verifiedUser = meRes.data?.user;

    if (!verifiedUser) {
      throw new Error('Account created but session could not be verified.');
    }

    setUser(verifiedUser);
    return verifiedUser;
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setGoogleOnboarding(null);
    }
  };

  const updateUser = (updatedFields: Partial<User>): void => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        googleOnboarding,
        setGoogleOnboarding,
        login,
        register,
        googleLogin,
        completeGoogleOnboarding,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
