import type {
  DiscoveryListResponse,
  DiscoverySingleResponse,
  DiscoveryQueryParams,
} from '../types/internshipDiscovery';
import { ApiError } from './auth.service';

const API_BASE = '/api/student';

async function studentDiscoveryApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
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

export const internshipDiscoveryService = {
  /**
   * Fetch paginated list of published and unexpired internships for student discovery.
   */
  async getPublishedInternships(
    params?: DiscoveryQueryParams,
    options?: { signal?: AbortSignal }
  ): Promise<DiscoveryListResponse> {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.set('page', String(params.page));
    if (params?.limit !== undefined) query.set('limit', String(params.limit));
    if (params?.search) query.set('search', params.search);
    if (params?.workType) query.set('workType', params.workType);
    if (params?.category) query.set('category', params.category);
    if (params?.location) query.set('location', params.location);

    const queryString = query.toString();
    const endpoint = queryString ? `/internships?${queryString}` : '/internships';

    return studentDiscoveryApiRequest<DiscoveryListResponse>(endpoint, {
      method: 'GET',
      signal: options?.signal,
    });
  },

  /**
   * Fetch full details for a single published and unexpired internship by ID.
   */
  async getPublishedInternshipById(id: string): Promise<DiscoverySingleResponse> {
    return studentDiscoveryApiRequest<DiscoverySingleResponse>(`/internships/${id}`, {
      method: 'GET',
    });
  },
};

export default internshipDiscoveryService;
