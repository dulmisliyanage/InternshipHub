import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { CompanyNavbar } from '../../components/company/CompanyNavbar';
import { CompanyLogo } from '../../components/company/CompanyLogo';
import { ProfileCompletionCard } from '../../components/profile';
import { formatCompanySize } from '../../utils/company';
import { useAuth } from '../../context/AuthContext';
import { companyService } from '../../services/company.service';
import type { CompanyProfile } from '../../types/company';

export const CompanyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
      <CompanyNavbar companyName={companyDisplayName} logoUrl={profile?.logoUrl} />

      {/* Main Content */}
      <main style={{ maxWidth: '880px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {profile?.completion && (
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: profile.completion.percentage >= 100 ? 'var(--color-success)' : 'var(--color-primary)',
                  backgroundColor: profile.completion.percentage >= 100 ? 'rgba(16, 185, 129, 0.1)' : 'var(--color-primary-light)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                {profile.completion.percentage >= 100 ? '✓ 100% Complete' : `${profile.completion.percentage}% Complete`}
              </span>
            )}
            <Link to="/company/profile" style={{ textDecoration: 'none' }}>
              <Button variant="outline" size="sm">
                View Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Company Profile Strength Card */}
        {profile?.completion && (
          <div style={{ marginBottom: '1.5rem' }}>
            <ProfileCompletionCard
              completion={profile.completion}
              title="Company Profile Strength"
              description="Help students understand your organization before they apply."
              editPath="/company/profile/edit"
              ctaLabel="Complete Profile"
              variant="compact"
            />
          </div>
        )}

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
              About {companyDisplayName}
            </h2>
            <Link to="/company/profile/edit" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
              Edit Profile →
            </Link>
          </div>

          <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--color-text-primary)', margin: '0 0 1.25rem' }}>
            {profile?.description || 'No description provided yet.'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
            {profile?.companySize && (
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', display: 'block' }}>Size</span>
                <strong>{formatCompanySize(profile.companySize)}</strong>
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
