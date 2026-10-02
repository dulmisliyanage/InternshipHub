import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

interface CompanyOnboardingLayoutProps {
  children: React.ReactNode;
}

export const CompanyOnboardingLayout: React.FC<CompanyOnboardingLayoutProps> = ({ children }) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      {/* Left Form Area (~58%) */}
      <div
        style={{
          flex: '1 1 58%',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        {/* Header Bar */}
        <header
          style={{
            padding: '1.5rem 2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <span
                className="logo"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: 'var(--color-text-primary)',
                }}
              >
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
                letterSpacing: '0.04em',
              }}
            >
              EMPLOYER ONBOARDING
            </span>
          </div>
        </header>

        {/* Form Body */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '2.5rem 2rem 4rem',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
            }}
          >
            {children}
          </div>
        </div>
      </div>

      {/* Right Visual Panel (~42%) */}
      <div
        className="company-onboarding-visual-panel"
        style={{
          flex: '0 0 42%',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '3rem',
          backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0.88) 100%), url('/company-onboarding.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#FFFFFF',
          overflow: 'hidden',
        }}
      >
        {/* Top Tagline */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: '1px solid rgba(255, 255, 255, 0.25)',
              marginBottom: '1rem',
            }}
          >
            <Sparkles size={14} color="#A7F3D0" />
            <span>Employer Partner Network</span>
          </div>
        </div>

        {/* Bottom Highlights Card */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(12px)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.6rem',
              fontWeight: 800,
              lineHeight: 1.3,
              margin: '0 0 0.85rem',
              color: '#FFFFFF',
            }}
          >
            Find the talent that moves your company forward.
          </h2>

          <p
            style={{
              fontSize: '0.95rem',
              lineHeight: 1.6,
              color: '#CBD5E1',
              margin: '0 0 1.5rem',
            }}
          >
            Connect directly with verified university students, showcase your employer brand, and streamline your intern hiring pipeline.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#F1F5F9' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                }}
              >
                ✓
              </div>
              <span>Targeted skill-matched student profiles</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#F1F5F9' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                }}
              >
                ✓
              </div>
              <span>Custom employer branding and listings</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#F1F5F9' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                }}
              >
                ✓
              </div>
              <span>Fast-track application and candidate reviews</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .company-onboarding-visual-panel {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
