import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const displayName = user?.name || 'Sarah Student';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
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
              color: 'var(--color-primary)',
              backgroundColor: 'var(--color-primary-light)',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
            }}
          >
            STUDENT
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/login">
            <Button size="sm" variant="ghost">
              Sign out
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 1.5rem' }}>
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem',
            boxShadow: 'var(--shadow-sm)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-xl)',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              fontSize: '1.75rem',
            }}
          >
            🎓
          </div>

          <h1 className="page-heading" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
            Student Dashboard
          </h1>

          <p style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
            Welcome, {displayName}
          </p>

          <p style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '2rem' }}>
            ✓ Your account is authenticated successfully.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/">
              <Button variant="secondary" size="md">
                ← Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
