import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button, FormError } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { getDashboardPath } from '../../utils/navigation';
import { ApiError } from '../../services/auth.service';

export const ChooseAccountTypePage: React.FC = () => {
  const navigate = useNavigate();
  const { googleOnboarding, completeGoogleOnboarding } = useAuth();

  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'COMPANY' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If page was directly opened or refreshed without in-memory Google onboarding token
  if (!googleOnboarding?.onboardingToken) {
    return (
      <AuthLayout
        title="Onboarding Session Expired"
        subtitle="Your temporary Google sign-up session has expired or was refreshed."
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
            padding: '1.75rem',
            textAlign: 'center',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.5rem',
          }}
        >
          <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>⏳</span>
          <p style={{ color: '#991B1B', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
            For your security, Google onboarding tokens are kept strictly in memory for 15 minutes.
            Please sign in with Google again to complete your account setup.
          </p>
          <Link to="/login">
            <Button variant="primary" size="md">
              Sign in with Google
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!selectedRole) {
      setError('Please select whether you are joining as a Student or a Company.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Send onboarding token + role ('STUDENT' | 'COMPANY' only)
      const user = await completeGoogleOnboarding(selectedRole);

      // Navigate to designated dashboard
      navigate(getDashboardPath(user.role), { replace: true });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        const msg = err instanceof Error ? err.message : 'Failed to complete registration';
        setError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="How will you use InternshipHub?"
      subtitle="Choose the account type that best describes you."
      footer={
        <p>
          Wrong Google account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Sign in with another account
          </Link>
        </p>
      }
    >
      {/* Google User Profile Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--color-primary-light)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          border: '1px solid #C7D2FE',
        }}
      >
        {googleOnboarding.profile.profileImage ? (
          <img
            src={googleOnboarding.profile.profileImage}
            alt="Google profile"
            style={{ width: '36px', height: '36px', borderRadius: '50%' }}
          />
        ) : (
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}
          >
            {googleOnboarding.profile.name[0]}
          </div>
        )}
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {googleOnboarding.profile.name}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {googleOnboarding.profile.email}
          </div>
        </div>
      </div>

      {error && <FormError message={error} />}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.75rem' }}>
          {/* Option 1: Student */}
          <div
            id="choose-role-student"
            role="radio"
            aria-checked={selectedRole === 'STUDENT'}
            tabIndex={0}
            onClick={() => {
              setSelectedRole('STUDENT');
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setSelectedRole('STUDENT');
                setError(null);
              }
            }}
            style={{
              border: `2px solid ${
                selectedRole === 'STUDENT' ? 'var(--color-primary)' : 'var(--color-border)'
              }`,
              backgroundColor:
                selectedRole === 'STUDENT' ? 'var(--color-primary-light)' : 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              outline: 'none',
            }}
          >
            <span style={{ fontSize: '2rem', flexShrink: 0 }}>🎓</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                Student
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                Discover internships, track applications and build your skills.
              </div>
            </div>
            {selectedRole === 'STUDENT' && (
              <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>✓</span>
            )}
          </div>

          {/* Option 2: Company */}
          <div
            id="choose-role-company"
            role="radio"
            aria-checked={selectedRole === 'COMPANY'}
            tabIndex={0}
            onClick={() => {
              setSelectedRole('COMPANY');
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setSelectedRole('COMPANY');
                setError(null);
              }
            }}
            style={{
              border: `2px solid ${
                selectedRole === 'COMPANY' ? 'var(--color-primary)' : 'var(--color-border)'
              }`,
              backgroundColor:
                selectedRole === 'COMPANY' ? 'var(--color-primary-light)' : 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              outline: 'none',
            }}
          >
            <span style={{ fontSize: '2rem', flexShrink: 0 }}>🏢</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                Company
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                Post internships and manage applicants.
              </div>
            </div>
            {selectedRole === 'COMPANY' && (
              <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>✓</span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Button
          id="continue-onboarding-btn"
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating account...' : 'Continue'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ChooseAccountTypePage;
