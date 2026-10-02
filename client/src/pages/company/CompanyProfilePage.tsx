import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button, LoadingSpinner } from '../../components/ui';
import { CompanyNavbar } from '../../components/company/CompanyNavbar';
import {
  CompanyProfileHeader,
  CompanyAboutSection,
  CompanyInfoSection,
  CompanyLinksSection,
} from '../../components/company/profile';
import { companyService } from '../../services/company.service';
import type { CompanyProfile } from '../../types/company';

export const CompanyProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await companyService.getCompanyProfile();

      if (res.profile === null) {
        // If onboarding has not been completed, redirect immediately
        navigate('/company/onboarding', { replace: true });
        return;
      }

      setProfile(res.profile);
    } catch (err) {
      console.error('Failed to load company profile:', err);
      setError('We could not load your company profile. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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
          Loading company profile...
        </span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          backgroundColor: 'var(--color-background)',
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            width: '100%',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <AlertCircle size={24} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
            We couldn't load your company profile
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.925rem', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
            {error || 'An unexpected error occurred while loading your profile.'}
          </p>
          <Button variant="primary" onClick={fetchProfile} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={16} />
            <span>Try Again</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', paddingBottom: '4rem' }}>
      <CompanyNavbar companyName={profile.companyName} logoUrl={profile.logoUrl} />

      <main
        style={{
          maxWidth: '1100px',
          margin: '2rem auto 0',
          padding: '0 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        <CompanyProfileHeader profile={profile} />
        <CompanyAboutSection description={profile.description} />
        <CompanyInfoSection
          industry={profile.industry}
          companySize={profile.companySize}
          location={profile.location}
        />
        <CompanyLinksSection website={profile.website} linkedinUrl={profile.linkedinUrl} />
      </main>
    </div>
  );
};

export default CompanyProfilePage;
