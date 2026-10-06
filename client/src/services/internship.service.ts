import type {
  InternshipListResponse,
  InternshipSingleResponse,
} from '../types/internship';
import { ApiError } from './auth.service';

const API_BASE = '/api/company/internships';

async function internshipApiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include', // Always send HTTP-only authentication cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      data.message || `Request failed with status ${res.status}`,
      res.status,
      data.errors
    );
  }

  return data as T;
}

export const internshipService = {
  /**
   * Fetch all internships belonging to the authenticated company.
   */
  async getCompanyInternships(): Promise<InternshipListResponse> {
    return internshipApiRequest<InternshipListResponse>('', {
      method: 'GET',
    });
  },

  /**
   * Fetch a single internship listing by ID.
   */
  async getCompanyInternshipById(id: string): Promise<InternshipSingleResponse> {
    return internshipApiRequest<InternshipSingleResponse>(`/${id}`, {
      method: 'GET',
    });
  },
};
