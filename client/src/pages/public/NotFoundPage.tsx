import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const location = useLocation();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        textAlign: 'center',
        backgroundColor: 'var(--color-background)',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: '#FEE2E2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-error)',
          marginBottom: '1.25rem',
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <span
        style={{
          fontSize: '0.85rem',
          fontWeight: 700,
          color: 'var(--color-error)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginBottom: '0.5rem',
        }}
      >
        404 Not Found
      </span>

      <h1 className="page-heading" style={{ fontSize: '1.85rem', marginBottom: '0.75rem' }}>
        Page Not Found
      </h1>

      <p
        style={{
          color: 'var(--color-text-secondary)',
          maxWidth: '460px',
          lineHeight: 1.5,
          marginBottom: '2rem',
        }}
      >
        The requested path <code style={{ backgroundColor: '#E2E8F0', padding: '2px 6px', borderRadius: '4px', fontSize: '0.9em' }}>{location.pathname}</code> does not exist on InternshipHub.
      </p>

      <Link to="/">
        <Button variant="primary" size="md">
          Return to Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
