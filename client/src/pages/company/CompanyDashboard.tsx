import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { CompanyLogo } from '../../components/company/CompanyLogo';
import { useAuth } from '../../context/AuthContext';
import { companyService } from '../../services/company.service';
import type { CompanyProfile } from '../../types/company';

export const CompanyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkCompanyProfile = async () => {
      try {
        const res = await companyService.getCompanyProfile();
        if (!isMounted) return;

        if (res.profile === null) {
          // If no profile created yet, redirect to onboarding
          navigate('/company/onboarding', { replace: true });
          return;
        }

        setProfile(res.profile);
      } catch (err) {
        console.error('Failed to load company profile:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    checkCompanyProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

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
        <span style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          Loading your company dashboard...
        </span>
      </div>
    );
  }

  const companyDisplayName = profile?.companyName || user?.name || 'Company';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', paddingBottom: '4rem' }}>
      {/* Top Bar */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 2rem',
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span className="logo" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              Internship<span style={{ color: 'var(--color-primary)' }}>Hub</span>
            </span>
          </Link>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#065F46',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
            }}
          >
            COMPANY PORTAL
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <CompanyLogo src={profile?.logoUrl} name={companyDisplayName} size="sm" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {companyDisplayName}
            </span>
          </div>

          <Button
            id="company-logout-btn"
            size="sm"
            variant="ghost"
            onClick={handleLogout}
            isLoading={isLoggingOut}
          >
            Sign out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '840px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
        {/* Welcome Banner */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.25rem',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <CompanyLogo src={profile?.logoUrl} name={companyDisplayName} size={64} />
            <div>
              <h1 className="page-heading" style={{ fontSize: '1.65rem', margin: '0 0 0.35rem' }}>
                Welcome, {companyDisplayName}
              </h1>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                {profile?.industry ? `${profile.industry} • ` : ''}
                {profile?.location || 'Company Workspace'}
              </p>
            </div>
          </div>

          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--color-success)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            ✓ Profile Active
          </span>
        </div>

        {/* Company Profile Summary Card */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.75rem 2rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 1rem' }}>
            About {companyDisplayName}
          </h2>

          <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--color-text-primary)', margin: '0 0 1.25rem' }}>
            {profile?.description || 'No description provided yet.'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
            {profile?.companySize && (
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', display: 'block' }}>Size</span>
                <strong>{profile.companySize}</strong>
              </div>
            )}
            {profile?.location && (
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', display: 'block' }}>Location</span>
                <strong>{profile.location}</strong>
              </div>
            )}
            {profile?.website && (
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', display: 'block' }}>Website</span>
                <a href={profile.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                  {profile.website}
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompanyDashboard;
