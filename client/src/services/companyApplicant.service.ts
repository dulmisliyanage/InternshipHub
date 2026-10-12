import type {
  CompanyApplicantListResponse,
  CompanyApplicantDetailResponse,
} from '../types/companyApplicant';
import type { ApplicationStatus } from '../types/application';
import { ApiError } from './auth.service';

const API_BASE = '/api/company';

export const companyApplicantService = {
  /**
   * List applications for a specific company-owned internship.
   */
  async getInternshipApplicants(
    internshipId: string,
    params?: {
      page?: number;
      limit?: number;
      status?: ApplicationStatus;
    }
  ): Promise<CompanyApplicantListResponse> {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.set('page', String(params.page));
    if (params?.limit !== undefined) query.set('limit', String(params.limit));
    if (params?.status) query.set('status', params.status);

    const queryString = query.toString();
    const endpoint = queryString
      ? `${API_BASE}/internships/${internshipId}/applications?${queryString}`
      : `${API_BASE}/internships/${internshipId}/applications`;

    const res = await fetch(endpoint, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new ApiError(
        data.message || `Failed to fetch applicants (${res.status})`,
        res.status,
        data.errors
      );
    }

    return data as CompanyApplicantListResponse;
  },

  /**
   * Retrieve full application details, applicant profile, and status history for review.
   */
  async getApplicationDetails(
    applicationId: string
  ): Promise<CompanyApplicantDetailResponse> {
    const res = await fetch(`${API_BASE}/applications/${applicationId}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new ApiError(
        data.message || `Failed to load application details (${res.status})`,
        res.status,
        data.errors
      );
    }

    return data as CompanyApplicantDetailResponse;
  },

  /**
   * Securely fetch applicant PDF CV as a Blob via authenticated session.
   * Does not expose filesystem paths or private keys.
   */
  async downloadCvBlob(applicationId: string): Promise<Blob> {
    const res = await fetch(`${API_BASE}/applications/${applicationId}/cv`, {
      credentials: 'include',
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new ApiError(
        data.message || `Failed to download applicant CV (${res.status})`,
        res.status,
        data.errors
      );
    }

    return await res.blob();
  },
};
