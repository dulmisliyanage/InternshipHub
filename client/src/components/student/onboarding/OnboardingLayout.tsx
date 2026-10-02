import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({ children }) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: 'var(--color-surface)',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Left Form Area (55-60% desktop, 100% mobile) */}
      <div
        style={{
          flex: '1 1 58%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--color-surface)',
          overflowY: 'auto',
        }}
      >
        {/* Top Navbar */}
        <header
          style={{
            padding: '1.25rem 2.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
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
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--color-primary)',
              backgroundColor: 'var(--color-primary-light)',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-full)',
            }}
          >
            Student Onboarding
          </span>
        </header>

        {/* Content Container (comfortable 540-660px width) */}
        <div
          style={{
            flex: 1,
            width: '100%',
            maxWidth: '680px',
            margin: '0 auto',
            padding: '2.5rem 2rem 4rem',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </div>
      </div>

      {/* Right Visual Area (42% desktop, hidden on < 1024px) */}
      <div
        className="onboarding-visual-panel"
        style={{
          flex: '0 0 42%',
          minHeight: '100vh',
          position: 'sticky',
          top: 0,
          backgroundImage: 'url(/student-onboarding.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '3.5rem',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        {/* Gradient Overlay for high text contrast */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(30, 27, 75, 0.25) 0%, rgba(30, 27, 75, 0.7) 45%, rgba(49, 46, 129, 0.95) 100%)',
            backdropFilter: 'blur(1px)',
            zIndex: 1,
          }}
        />

        {/* Content overlay */}
        <div style={{ position: 'relative', zIndex: 2, color: '#ffffff' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '1.25rem',
            }}
          >
            <Sparkles size={14} />
            <span>Career Launchpad</span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '2rem',
              fontWeight: 800,
              lineHeight: 1.25,
              margin: '0 0 1rem',
              color: '#ffffff',
            }}
          >
            Build your future,
            <br />
            one skill at a time.
          </h2>

          <p
            style={{
              fontSize: '1.05rem',
              lineHeight: 1.6,
              color: 'rgba(255, 255, 255, 0.9)',
              margin: 0,
              maxWidth: '480px',
            }}
          >
            Create a profile that helps you discover verified opportunities aligned with your
            unique strengths, academic journey, and career goals.
          </p>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 1024px) {
          .onboarding-visual-panel {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .onboarding-desktop-stepper {
            display: none !important;
          }
          .onboarding-mobile-progress {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};
