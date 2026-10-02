import type {
  CompanyProfilePayload,
  CompanyProfileResponse,
} from '../types/company';
import { ApiError } from './auth.service';

const API_BASE = '/api/company';

async function companyApiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include', // Always send HTTP-only auth cookies
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

export const companyService = {
  /**
   * Retrieve the authenticated company's profile.
   * Returns { status: 'success', profile: null } if no profile exists yet.
   */
  async getCompanyProfile(): Promise<CompanyProfileResponse> {
    return companyApiRequest<CompanyProfileResponse>('/profile', {
      method: 'GET',
    });
  },

  /**
   * Create or update the company profile.
   */
  async updateCompanyProfile(payload: CompanyProfilePayload): Promise<CompanyProfileResponse> {
    return companyApiRequest<CompanyProfileResponse>('/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Upload company logo to Cloudinary and store URL in CompanyProfile.logoUrl.
   */
  async uploadCompanyLogo(file: File): Promise<{ status: string; message: string; logoUrl: string }> {
    const formData = new FormData();
    formData.append('logo', file);

    const res = await fetch(`${API_BASE}/profile/logo`, {
      method: 'PUT',
      credentials: 'include',
      body: formData,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new ApiError(
        data.message || `Upload failed with status ${res.status}`,
        res.status,
        data.errors
      );
    }

    return data;
  },

  /**
   * Remove company logo from Cloudinary and reset CompanyProfile.logoUrl to null.
   */
  async removeCompanyLogo(): Promise<{ status: string; message: string; logoUrl: null }> {
    return companyApiRequest<{ status: string; message: string; logoUrl: null }>('/profile/logo', {
      method: 'DELETE',
    });
  },
};
