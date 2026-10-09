import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User as UserIcon, LogOut, Briefcase, FileText } from 'lucide-react';
import { Button } from '../ui';
import { ProfileAvatar } from './profile/ProfileAvatar';
import { useAuth } from '../../context/AuthContext';

interface StudentNavbarProps {
  userName?: string;
  userAvatar?: string | null;
}

export const StudentNavbar: React.FC<StudentNavbarProps> = ({
  userName,
  userAvatar,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const displayName = userName || user?.name || 'Student';
  const avatarSrc = userAvatar !== undefined ? userAvatar : user?.profileImage;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isDashboard = location.pathname === '/student/dashboard';
  const isInternships = location.pathname.startsWith('/student/internships');
  const isApplications = location.pathname.startsWith('/student/applications');
  const isProfile = location.pathname.startsWith('/student/profile');

  return (
    <header
      style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0.875rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      {/* Brand & Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span
            className="logo"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.3rem',
              fontWeight: 800,
              color: 'var(--color-text-primary)',
            }}
          >
            Internship<span style={{ color: 'var(--color-primary)' }}>Hub</span>
          </span>
        </Link>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link
            to="/student/dashboard"
            id="nav-student-dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              textDecoration: 'none',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-lg)',
              fontSize: '0.875rem',
              fontWeight: isDashboard ? 700 : 500,
              color: isDashboard ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              backgroundColor: isDashboard ? 'var(--color-primary-light)' : 'transparent',
              transition: 'all 0.15s ease',
            }}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/student/internships"
            id="nav-student-internships"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              textDecoration: 'none',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-lg)',
              fontSize: '0.875rem',
              fontWeight: isInternships ? 700 : 500,
              color: isInternships ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              backgroundColor: isInternships ? 'var(--color-primary-light)' : 'transparent',
              transition: 'all 0.15s ease',
            }}
          >
            <Briefcase size={16} />
            <span>Discover Internships</span>
          </Link>

          <Link
            to="/student/applications"
            id="nav-student-applications"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              textDecoration: 'none',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-lg)',
              fontSize: '0.875rem',
              fontWeight: isApplications ? 700 : 500,
              color: isApplications ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              backgroundColor: isApplications ? 'var(--color-primary-light)' : 'transparent',
              transition: 'all 0.15s ease',
            }}
          >
            <FileText size={16} />
            <span>My Applications</span>
          </Link>

          <Link
            to="/student/profile"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              textDecoration: 'none',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-lg)',
              fontSize: '0.875rem',
              fontWeight: isProfile ? 700 : 500,
              color: isProfile ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              backgroundColor: isProfile ? 'var(--color-primary-light)' : 'transparent',
              transition: 'all 0.15s ease',
            }}
          >
            <UserIcon size={16} />
            <span>Profile</span>
          </Link>
        </nav>
      </div>

      {/* User Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link
          to="/student/profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
            padding: '0.25rem 0.5rem',
            borderRadius: 'var(--radius-full)',
            transition: 'background-color 0.15s ease',
          }}
        >
          <ProfileAvatar src={avatarSrc} name={displayName} size="sm" />
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
            }}
          >
            {displayName}
          </span>
        </Link>

        <Button
          id="student-signout-btn"
          size="sm"
          variant="ghost"
          onClick={handleLogout}
          isLoading={isLoggingOut}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <LogOut size={14} />
          <span>Sign out</span>
        </Button>
      </div>
    </header>
  );
};
