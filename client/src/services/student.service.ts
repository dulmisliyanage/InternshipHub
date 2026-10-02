import type {
  StudentProfileResponse,
  SkillsCatalogResponse,
  UpdateStudentProfilePayload,
} from '../types/student';
import { ApiError } from './auth.service';

const API_BASE = '/api/student';

async function studentApiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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

export const studentService = {
  /**
   * Retrieve the current student's profile + skills.
   * Returns { status: 'success', profile: null } if no profile exists yet.
   */
  async getProfile(): Promise<StudentProfileResponse> {
    return studentApiRequest<StudentProfileResponse>('/profile', {
      method: 'GET',
    });
  },
  async getStudentProfile(): Promise<StudentProfileResponse> {
    return this.getProfile();
  },

  /**
   * Create or update the current student's profile + selected skills.
   */
  async updateProfile(payload: UpdateStudentProfilePayload): Promise<StudentProfileResponse> {
    return studentApiRequest<StudentProfileResponse>('/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  async updateStudentProfile(payload: UpdateStudentProfilePayload): Promise<StudentProfileResponse> {
    return this.updateProfile(payload);
  },

  /**
   * Retrieve available skill categories and skills.
   */
  async getSkills(): Promise<SkillsCatalogResponse> {
    return studentApiRequest<SkillsCatalogResponse>('/skills', {
      method: 'GET',
    });
  },
  async getSkillCatalog(): Promise<SkillsCatalogResponse> {
    return this.getSkills();
  },
};
