export type ApplicationStatus =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface ApplicationStatusHistoryItem {
  id: string;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  changedAt: string;
}

export interface ApplicationCompanySummary {
  id?: string;
  companyName: string;
  logoUrl?: string | null;
  location?: string | null;
  industry?: string | null;
}

export interface ApplicationInternshipSummary {
  id: string;
  title: string;
  workType?: string;
  location?: string | null;
  category?: string | null;
  duration?: string | null;
  status?: string;
  applicationDeadline?: string | null;
  company?: ApplicationCompanySummary | null;
  skills?: {
    skillId: string;
    name: string;
    type: 'REQUIRED' | 'PREFERRED';
  }[];
}

export interface ApplicationItem {
  id: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  coverLetter?: string | null;
  hasCv?: boolean;
  internshipId?: string;
  internship: ApplicationInternshipSummary;
}

export interface ApplicationDetail extends ApplicationItem {
  statusHistory: ApplicationStatusHistoryItem[];
}

export interface ApplicationListResponse {
  status: 'success';
  data: ApplicationItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApplicationDetailResponse {
  status: 'success';
  data: ApplicationDetail;
}

export interface SubmitApplicationResponse {
  status: 'success';
  message: string;
  data: ApplicationItem;
}
