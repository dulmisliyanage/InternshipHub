import type { Role } from '../types/auth';

/**
 * Returns the designated dashboard path for a given user role.
 */
export function getDashboardPath(role?: Role | string | null): string {
  switch (role) {
    case 'STUDENT':
      return '/student/dashboard';
    case 'COMPANY':
      return '/company/dashboard';
    case 'ADMIN':
      return '/admin/dashboard';
    default:
      return '/';
  }
}
