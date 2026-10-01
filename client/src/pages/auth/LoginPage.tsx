import React from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/Button';

export const LoginPage: React.FC = () => {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your InternshipHub account"
      badge="Authentication"
      footer={
        <p>
          Don&apos;t have an account?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Sign up
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
        <span style={{ fontSize: '1.75rem', display: 'block', marginBottom: '0.5rem' }}>🔐</span>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Login Page Placeholder</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          Full email/password & Google login form will be wired up in Step 2.8.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Link to="/student/dashboard" style={{ width: '100%' }}>
          <Button variant="outline" fullWidth size="md">
            Preview Student Dashboard ➔
          </Button>
        </Link>
        <Link to="/company/dashboard" style={{ width: '100%' }}>
          <Button variant="secondary" fullWidth size="md">
            Preview Company Dashboard ➔
          </Button>
        </Link>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
