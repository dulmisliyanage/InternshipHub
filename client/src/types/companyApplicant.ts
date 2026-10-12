import type { ApplicationStatus } from './application';

export interface ApplicantStudentSkill {
  id: string;
  name: string;
  proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | string;
  category?: string | null;
}

export interface ApplicantStudentSummary {
  id: string;
  userId: string;
  name: string;
  email: string;
  profileImage: string | null;
  university: string | null;
  degree: string | null;
  fieldOfStudy: string | null;
  currentYear: number | null;
  expectedGraduation?: string | null;
  location: string | null;
  bio?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  skills: ApplicantStudentSkill[];
}

export interface ApplicantInternshipSummary {
  id: string;
  title: string;
  category?: string | null;
  workType?: string;
  location?: string | null;
  status?: string;
}

export interface CompanyApplicantItem {
  id: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  hasCv: boolean;
  student: ApplicantStudentSummary;
  internship: {
    id: string;
    title: string;
  };
}

export interface CompanyStatusHistoryItem {
  id: string;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  note?: string | null;
  changedAt: string;
  changedBy: {
    id: string;
    name: string;
    role: string;
  };
}

export interface CompanyApplicantDetail {
  id: string;
  status: ApplicationStatus;
  coverLetter: string | null;
  appliedAt: string;
  updatedAt: string;
  hasCv: boolean;
  student: ApplicantStudentSummary;
  internship: ApplicantInternshipSummary;
  statusHistory: CompanyStatusHistoryItem[];
}

export interface CompanyApplicantListResponse {
  status: 'success';
  data: CompanyApplicantItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CompanyApplicantDetailResponse {
  status: 'success';
  data: CompanyApplicantDetail;
}

export interface UpdateApplicationStatusPayload {
  status: ApplicationStatus;
  note?: string | null;
}

export interface UpdateApplicationStatusResponse {
  status: 'success';
  message: string;
  data: {
    id: string;
    status: ApplicationStatus;
    updatedAt: string;
    history: CompanyStatusHistoryItem;
  };
}
