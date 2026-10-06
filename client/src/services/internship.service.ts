import type {
  InternshipListResponse,
  InternshipSingleResponse,
  CreateInternshipPayload,
  SkillsCatalogResponse,
} from '../types/internship';
import { ApiError } from './auth.service';

const API_BASE = '/api/company';

async function companyApiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
    return companyApiRequest<InternshipListResponse>('/internships', {
      method: 'GET',
    });
  },

  /**
   * Fetch a single internship listing by ID.
   */
  async getCompanyInternshipById(id: string): Promise<InternshipSingleResponse> {
    return companyApiRequest<InternshipSingleResponse>(`/internships/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Create a new draft internship listing.
   */
  async createInternship(payload: CreateInternshipPayload): Promise<InternshipSingleResponse> {
    return companyApiRequest<InternshipSingleResponse>('/internships', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Fetch the standardized skill catalog (categories & skills).
   */
  async getSkillsCatalog(): Promise<SkillsCatalogResponse> {
    return companyApiRequest<SkillsCatalogResponse>('/skills', {
      method: 'GET',
    });
  },
};
