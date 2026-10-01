import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/auth';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  fetchCurrentUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async (): Promise<User | null> => {
    try {
      const res = await authService.getCurrentUser();
      if (res.data?.user) {
        setUser(res.data.user);
        return res.data.user;
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
    return null;
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        setUser,
        fetchCurrentUser,
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
