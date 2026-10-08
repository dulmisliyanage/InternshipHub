import type { WorkType, InternshipSkillType } from './internship';

export interface DiscoveryCompany {
  id: string;
  companyName: string;
  logoUrl?: string | null;
  location?: string | null;
  industry?: string | null;
  companySize?: string | null;
  website?: string | null;
  linkedinUrl?: string | null;
  description?: string | null;
}

export interface DiscoverySkill {
  skillId: string;
  name: string;
  category?: string | null;
  type: InternshipSkillType;
}

export interface DiscoveryInternshipItem {
  id: string;
  title: string;
  category?: string | null;
  description: string;
  responsibilities?: string | null;
  workType: WorkType;
  location?: string | null;
  duration?: string | null;
  allowanceMin?: number | null;
  allowanceMax?: number | null;
  currency?: string | null;
  positions: number;
  applicationDeadline?: string | null;
  status: 'PUBLISHED';
  publishedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  company: DiscoveryCompany | null;
  skills: DiscoverySkill[];
}

export interface DiscoveryPagination {
  page: number;
  limit: number;
  total: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface DiscoveryListResponse {
  status: 'success' | 'error';
  internships: DiscoveryInternshipItem[];
  pagination: DiscoveryPagination;
  message?: string;
}

export interface DiscoverySingleResponse {
  status: 'success' | 'error';
  internship: DiscoveryInternshipItem;
  message?: string;
}

export interface DiscoveryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  workType?: WorkType;
  category?: string;
  location?: string;
}
