import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { getDashboardPath } from '../../utils/navigation';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const handleFindInternships = () => {
    // 1. Unauthenticated visitors: navigate to student login, preserving discovery destination
    if (!isAuthenticated || !user) {
      navigate('/login', {
        state: { from: { pathname: '/student/internships' } },
      });
      return;
    }

    // 2. Authenticated STUDENT: navigate directly to discovery
    if (user.role === 'STUDENT') {
      navigate('/student/internships');
      return;
    }

    // 3. Authenticated COMPANY or ADMIN: redirect to their role-appropriate dashboard
    navigate(getDashboardPath(user.role));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Header */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 2rem',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: 'var(--color-primary)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <span className="logo" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
            Internship<span style={{ color: 'var(--color-primary)' }}>Hub</span>
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated && user ? (
            <Link to={getDashboardPath(user.role)}>
              <Button size="sm" variant="primary">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Log in
              </Link>
              <Link to="/register">
                <Button size="sm" variant="primary">
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '3rem 1.5rem',
          maxWidth: '720px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.075em',
            color: 'var(--color-primary)',
            backgroundColor: 'var(--color-primary-light)',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            marginBottom: '1.25rem',
          }}
        >
          Career Foundation
        </div>

        <h1
          className="hero-heading"
          style={{
            fontSize: 'clamp(2.25rem, 5vw, 3.25rem)',
            fontWeight: 800,
            marginBottom: '1.25rem',
            color: 'var(--color-text-primary)',
          }}
        >
          InternshipHub
        </h1>

        <p
          style={{
            fontSize: '1.25rem',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
          }}
        >
          Discover opportunities.<br />
          Build the skills employers need.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            size="lg"
            variant="primary"
            id="find-internships-btn"
            onClick={handleFindInternships}
          >
            Find Internships
          </Button>
          <Link to="/register">
            <Button size="lg" variant="secondary">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Quick Testing Links */}
        <div
          style={{
            marginTop: '3.5rem',
            padding: '1.25rem',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
          }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Routing Architecture Quick Links (Manual Verification)
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', marginTop: '0.75rem' }}>
            <Link to="/login" style={{ fontSize: '0.875rem' }}>/login</Link>
            <span>•</span>
            <Link to="/register" style={{ fontSize: '0.875rem' }}>/register</Link>
            <span>•</span>
            <Link to="/choose-account-type" style={{ fontSize: '0.875rem' }}>/choose-account-type</Link>
            <span>•</span>
            <Link to="/student/dashboard" style={{ fontSize: '0.875rem' }}>/student/dashboard</Link>
            <span>•</span>
            <Link to="/student/internships" style={{ fontSize: '0.875rem' }}>/student/internships</Link>
            <span>•</span>
            <Link to="/company/dashboard" style={{ fontSize: '0.875rem' }}>/company/dashboard</Link>
            <span>•</span>
            <Link to="/admin/dashboard" style={{ fontSize: '0.875rem' }}>/admin/dashboard</Link>
            <span>•</span>
            <Link to="/this-does-not-exist" style={{ fontSize: '0.875rem', color: 'var(--color-error)' }}>404 Test</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
