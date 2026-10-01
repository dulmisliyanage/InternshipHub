import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { getDashboardPath } from '../utils/navigation';
import type { Role } from '../types/auth';

export interface ProtectedRouteProps {
  allowedRoles?: Role[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 1. While /me is checking session cookie on initial page load / refresh
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          backgroundColor: 'var(--color-background)',
          fontFamily: 'var(--font-body)',
        }}
      >
        <LoadingSpinner size="lg" color="var(--color-primary)" />
        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          Verifying session...
        </span>
      </div>
    );
  }

  // 2. Authentication check: redirect unauthenticated users to /login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Authorization check: if role is not allowed, redirect to user's own dashboard
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const userDashboard = getDashboardPath(user.role);
    return <Navigate to={userDashboard} replace />;
  }

  // 4. Authenticated & authorized
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
