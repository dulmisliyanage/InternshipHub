export type CompanySize =
  | 'STARTUP'
  | 'SMALL'
  | 'MEDIUM'
  | 'LARGE'
  | 'ENTERPRISE';

export interface CompanyUserSummary {
  id: string;
  name: string;
  email: string;
  profileImage?: string | null;
}

export interface CompanyProfile {
  id: string;
  userId: string;
  companyName: string;
  industry?: string | null;
  companySize?: CompanySize | null;
  location?: string | null;
  website?: string | null;
  linkedinUrl?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: CompanyUserSummary;
}

export interface CompanyProfilePayload {
  companyName: string;
  industry?: string | null;
  companySize?: CompanySize | null;
  location?: string | null;
  website?: string | null;
  linkedinUrl?: string | null;
  description?: string | null;
  logoUrl?: string | null;
}

export type UpdateCompanyProfilePayload = CompanyProfilePayload;

export interface CompanyProfileResponse {
  status: 'success' | 'error';
  profile: CompanyProfile | null;
  message?: string;
}
