import React from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/Button';

export const RegisterPage: React.FC = () => {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join InternshipHub as a Student or Company"
      badge="Registration"
      footer={
        <p>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Log in
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
        <span style={{ fontSize: '1.75rem', display: 'block', marginBottom: '0.5rem' }}>📋</span>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Register Page Placeholder</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          Student/Company role selector & signup form will be wired up in Step 2.8.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Link to="/choose-account-type" style={{ width: '100%' }}>
          <Button variant="outline" fullWidth size="md">
            Preview Google Onboarding Flow ➔
          </Button>
        </Link>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
