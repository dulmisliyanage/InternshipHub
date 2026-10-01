import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export const CompanyDashboard: React.FC = () => {
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
              color: '#065F46',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
            }}
          >
            COMPANY
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
      <main style={{ maxWidth: '1000px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '2rem' }}>🏢</span>
            <div>
              <h1 className="page-heading" style={{ fontSize: '1.5rem', margin: 0 }}>
                Company Dashboard Placeholder
              </h1>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Protected Route: <code>/company/dashboard</code>
              </p>
            </div>
          </div>

          <p style={{ color: 'var(--color-text-primary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Welcome to the Employer Portal. Here companies post internship openings, evaluate applicants, and manage recruitment pipelines.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginTop: '1.5rem',
            }}
          >
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Active Listings</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>0</div>
            </div>
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Candidate Applicants</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>0</div>
            </div>
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Company Profile</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--color-success)' }}>Verified</div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem' }}>
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

export default CompanyDashboard;
