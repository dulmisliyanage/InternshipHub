import React from 'react';
import { Outlet } from 'react-router-dom';
import type { Role } from '../types/auth';

export interface ProtectedRouteProps {
  allowedRoles?: Role[];
  children?: React.ReactNode;
}

/**
 * Placeholder for ProtectedRoute.
 * Full session check and RBAC redirection will be connected after
 * Login and Registration UI forms are wired up.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
