import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { CompanyLogo } from './CompanyLogo';
import { useAuth } from '../../context/AuthContext';

interface CompanyNavbarProps {
  companyName?: string;
  logoUrl?: string | null;
}

export const CompanyNavbar: React.FC<CompanyNavbarProps> = ({
  companyName,
  logoUrl,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const displayName = companyName || user?.name || 'Company';

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

  const isDashboard = location.pathname === '/company/dashboard';
  const isProfile = location.pathname.startsWith('/company/profile');

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
      {/* Brand & Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to="/company/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: '#065F46',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-full)',
            }}
          >
            EMPLOYER
          </span>
        </Link>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link
            to="/company/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
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
            to="/company/profile"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
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
            <Building2 size={16} />
            <span>Profile</span>
          </Link>
        </nav>
      </div>

      {/* Right: Company Identity & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link
          to="/company/profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
            padding: '0.25rem 0.6rem',
            borderRadius: 'var(--radius-full)',
            transition: 'background-color 0.15s ease',
          }}
          title="View company profile"
        >
          <CompanyLogo src={logoUrl} name={displayName} size="sm" />
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                lineHeight: 1.2,
                maxWidth: '180px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {displayName}
            </span>
          </div>
        </Link>

        <Button
          id="company-signout-btn"
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
