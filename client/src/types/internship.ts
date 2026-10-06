export type InternshipStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';

export type WorkType = 'REMOTE' | 'HYBRID' | 'ONSITE';

export type InternshipSkillType = 'REQUIRED' | 'PREFERRED';

export interface InternshipSkill {
  id: string;
  skillId: string;
  name: string;
  category?: string | null;
  type: InternshipSkillType;
}

export interface InternshipCompanySummary {
  id: string;
  companyName: string;
  logoUrl?: string | null;
  location?: string | null;
}

export interface Internship {
  id: string;
  title: string;
  category?: string | null;
  description: string;
  responsibilities?: string | null;
  location?: string | null;
  workType: WorkType;
  duration?: string | null;
  allowanceMin?: number | null;
  allowanceMax?: number | null;
  currency?: string | null;
  positions: number;
  applicationDeadline?: string | null;
  status: InternshipStatus;
  publishedAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  company?: InternshipCompanySummary;
  skills: InternshipSkill[];
}

export interface InternshipListResponse {
  status: 'success' | 'error';
  internships: Internship[];
  message?: string;
}

export interface InternshipSingleResponse {
  status: 'success' | 'error';
  internship: Internship;
  message?: string;
}
