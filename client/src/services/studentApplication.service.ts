import type {
  ApplicationListResponse,
  ApplicationDetailResponse,
  SubmitApplicationResponse,
  ApplicationStatus,
} from '../types/application';
import { ApiError } from './auth.service';

const API_BASE = '/api/student/applications';

export const studentApplicationService = {
  /**
   * Submit an application with a private PDF CV using multipart/form-data.
   */
  async submitApplicationWithCv(
    formData: FormData
  ): Promise<SubmitApplicationResponse> {
    const res = await fetch(`${API_BASE}/with-cv`, {
      method: 'POST',
      credentials: 'include',
      body: formData, // Browser automatically sets Content-Type multipart/form-data with boundary
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new ApiError(
        data.message || `Submission failed with status ${res.status}`,
        res.status,
        data.errors
      );
    }

    return data as SubmitApplicationResponse;
  },

  /**
   * Submit an application using JSON payload (without CV upload).
   */
  async submitApplication(payload: {
    internshipId: string;
    coverLetter?: string;
  }): Promise<SubmitApplicationResponse> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new ApiError(
        data.message || `Submission failed with status ${res.status}`,
        res.status,
        data.errors
      );
    }

    return data as SubmitApplicationResponse;
  },

  /**
   * List the student's own submitted applications.
   */
  async getStudentApplications(params?: {
    page?: number;
    limit?: number;
    status?: ApplicationStatus;
  }): Promise<ApplicationListResponse> {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.set('page', String(params.page));
    if (params?.limit !== undefined) query.set('limit', String(params.limit));
    if (params?.status) query.set('status', params.status);

    const queryString = query.toString();
    const endpoint = queryString ? `${API_BASE}?${queryString}` : API_BASE;

    const res = await fetch(endpoint, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new ApiError(
        data.message || `Failed to fetch applications (${res.status})`,
        res.status,
        data.errors
      );
    }

    return data as ApplicationListResponse;
  },

  /**
   * Retrieve details and status history of a specific application.
   */
  async getStudentApplicationById(id: string): Promise<ApplicationDetailResponse> {
    const res = await fetch(`${API_BASE}/${id}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new ApiError(
        data.message || `Failed to fetch application details (${res.status})`,
        res.status,
        data.errors
      );
    }

    return data as ApplicationDetailResponse;
  },

  /**
   * Withdraw an active application.
   */
  async withdrawApplication(id: string): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE}/${id}/withdraw`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new ApiError(
        data.message || `Failed to withdraw application (${res.status})`,
        res.status,
        data.errors
      );
    }

    return data;
  },
};
