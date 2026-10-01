import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import {
  FormField,
  Input,
  PasswordInput,
  Button,
  FormError,
} from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { getDashboardPath } from '../../utils/navigation';
import { ApiError } from '../../services/auth.service';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, isAuthenticated, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect straight to the user's dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const destination = location.state?.from?.pathname || getDashboardPath(user.role);
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, user, isLoading, navigate, location]);

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const authenticatedUser = await login({
        email: email.trim().toLowerCase(),
        password,
      });

      // Redirect to attempted destination or designated role dashboard
      const targetPath = location.state?.from?.pathname || getDashboardPath(authenticatedUser.role);
      navigate(targetPath, { replace: true });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrors({ general: err.message });
      } else {
        const msg = err instanceof Error ? err.message : 'Invalid email or password';
        setErrors({ general: msg });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleClick = () => {
    alert('Google authentication will be connected in Step 2.9. Please sign in with your email and password.');
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your account"
      footer={
        <p>
          Don&apos;t have an account?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Create account
          </Link>
        </p>
      }
    >
      {/* Google Sign-in Button (Inactive placeholder for this step) */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Button
          type="button"
          variant="google"
          fullWidth
          size="lg"
          onClick={handleGoogleClick}
          aria-label="Continue with Google"
        >
          Continue with Google
        </Button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0 1.5rem' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          or
        </span>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
      </div>

      {errors.general && <FormError message={errors.general} />}

      <form onSubmit={handleSubmit} noValidate>
        {/* Email Address */}
        <FormField label="Email Address" htmlFor="login-email" required error={errors.email}>
          <Input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="e.g. sarah@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              if (errors.general) setErrors((prev) => ({ ...prev, general: undefined }));
            }}
            hasError={!!errors.email}
            disabled={isSubmitting}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            }
          />
        </FormField>

        {/* Password */}
        <FormField label="Password" htmlFor="login-password" required error={errors.password}>
          <PasswordInput
            id="login-password"
            name="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              if (errors.general) setErrors((prev) => ({ ...prev, general: undefined }));
            }}
            hasError={!!errors.password}
            disabled={isSubmitting}
          />
        </FormField>

        {/* Forgot password link */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem', marginTop: '-0.25rem' }}>
          <span
            onClick={() => alert('Password reset functionality will be added in a future update.')}
            style={{
              fontSize: '0.85rem',
              color: 'var(--color-primary)',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Forgot password?
          </span>
        </div>

        {/* Submit Button */}
        <Button
          id="login-submit-btn"
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
