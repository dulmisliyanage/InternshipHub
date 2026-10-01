import React from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/Button';

export const ChooseAccountTypePage: React.FC = () => {
  return (
    <AuthLayout
      title="Choose account type"
      subtitle="Select whether you are seeking internships or hiring talent."
      badge="First-Time Google Sign-In"
      footer={
        <p>
          Need help?{' '}
          <Link to="/" style={{ fontWeight: 600 }}>
            Return to Home
          </Link>
        </p>
      }
    >
      <div
        style={{
          padding: '2rem 1rem',
          textAlign: 'center',
          backgroundColor: 'var(--color-background)',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--color-border)',
          marginBottom: '1.5rem',
        }}
      >
        <span style={{ fontSize: '1.75rem', display: 'block', marginBottom: '0.5rem' }}>🎓 / 🏢</span>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>
          Choose Account Type Placeholder
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
          Google Onboarding: User selects <strong>Student</strong> or <strong>Company</strong>.
        </p>
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-error)',
            fontWeight: 600,
            backgroundColor: '#FEE2E2',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
          }}
        >
          No Admin Option Allowed
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Link to="/student/dashboard" style={{ width: '100%' }}>
          <Button variant="primary" fullWidth size="md">
            Continue as Student ➔
          </Button>
        </Link>
        <Link to="/company/dashboard" style={{ width: '100%' }}>
          <Button variant="secondary" fullWidth size="md">
            Continue as Company ➔
          </Button>
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ChooseAccountTypePage;
