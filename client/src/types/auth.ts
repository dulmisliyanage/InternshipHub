export type Role = 'STUDENT' | 'COMPANY' | 'ADMIN';
export type AuthProvider = 'LOCAL' | 'GOOGLE';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  provider: AuthProvider;
  status: AccountStatus;
  profileImage: string | null;
  createdAt: string;
}

export interface AuthResponse {
  status: 'success' | 'error';
  message: string;
  data?: {
    user: User;
  };
}

export interface GoogleAuthResponse {
  status: 'success' | 'needs_role_selection' | 'error';
  isNewUser: boolean;
  message: string;
  data?: {
    user?: User;
    onboardingToken?: string;
    profile?: {
      name: string;
      email: string;
      profileImage: string | null;
    };
    allowedRoles?: ('STUDENT' | 'COMPANY')[];
  };
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'STUDENT' | 'COMPANY';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface GoogleCompleteRegistrationPayload {
  onboardingToken: string;
  role: 'STUDENT' | 'COMPANY';
}
