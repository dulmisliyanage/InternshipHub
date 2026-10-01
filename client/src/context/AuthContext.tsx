import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, LoginPayload, RegisterPayload } from '../types/auth';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
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
