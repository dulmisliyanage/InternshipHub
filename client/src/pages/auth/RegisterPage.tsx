import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import {
  FormField,
  Input,
  PasswordInput,
  Button,
  FormError,
} from '../../components/ui';
import { authService, ApiError } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'STUDENT' | 'COMPANY' | '';
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  general?: string;
}

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 1. Name validation (min 2 chars after trimming, matches backend Zod)
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      newErrors.name = 'Full name is required';
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // 2. Email validation
    const trimmedEmail = form.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // 3. Password validation (identical to backend Zod min 8 chars)
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // 4. Confirm Password validation
    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Confirming your password is required';
    } else if (form.confirmPassword !== form.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // 5. Role validation (STUDENT or COMPANY only, strictly no ADMIN)
    if (!form.role) {
      newErrors.role = 'Please select whether you are a Student or Company';
    } else if (form.role !== 'STUDENT' && form.role !== 'COMPANY') {
      newErrors.role = 'Invalid account type selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear field-specific error as user types
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate submission while already processing
    if (isSubmitting) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // 1. Submit registration request (password confirmation stripped out)
      await authService.register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role as 'STUDENT' | 'COMPANY',
      });

      // 2. Step 6: Verify session after registration via GET /api/auth/me
      // Rather than trusting frontend state, read the verified user from the server
      const meResponse = await authService.getCurrentUser();
      const authenticatedUser = meResponse.data?.user;

      if (!authenticatedUser) {
        throw new Error('Could not verify authenticated session. Please try logging in.');
      }

      // Update AuthContext
      setUser(authenticatedUser);

      // Route dynamically according to the verified role from /me
      if (authenticatedUser.role === 'STUDENT') {
        navigate('/student/dashboard');
      } else if (authenticatedUser.role === 'COMPANY') {
        navigate('/company/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          // Specific duplicate email handling
          setErrors({
            email: 'An account with this email already exists',
            general: 'An account with this email already exists. Please log in or use another email.',
          });
        } else if (err.errors && err.errors.length > 0) {
          const fieldErrors: FormErrors = {};
          err.errors.forEach((e) => {
            if (e.field === 'email') fieldErrors.email = e.message;
            else if (e.field === 'name') fieldErrors.name = e.message;
            else if (e.field === 'password') fieldErrors.password = e.message;
            else if (e.field === 'role') fieldErrors.role = e.message;
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ general: err.message });
        }
      } else {
        const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
        setErrors({ general: msg });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleClick = () => {
    alert('Google authentication will be connected in Step 2.8. Please register using email and password.');
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your internship journey."
      footer={
        <p>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Log in
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
          aria-label="Continue with Google (Enabled in Step 2.8)"
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
        {/* Full Name */}
        <FormField label="Full Name" htmlFor="reg-name" required error={errors.name}>
          <Input
            id="reg-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="e.g. Sarah Student or Acme Technologies"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            hasError={!!errors.name}
            disabled={isSubmitting}
          />
        </FormField>

        {/* Email Address */}
        <FormField label="Email Address" htmlFor="reg-email" required error={errors.email}>
          <Input
            id="reg-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="e.g. sarah@example.com"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
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
        <FormField
          label="Password"
          htmlFor="reg-password"
          required
          hint="Must be at least 8 characters"
          error={errors.password}
        >
          <PasswordInput
            id="reg-password"
            name="password"
            autoComplete="new-password"
            placeholder="Create a secure password"
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
            hasError={!!errors.password}
            disabled={isSubmitting}
          />
        </FormField>

        {/* Confirm Password */}
        <FormField
          label="Confirm Password"
          htmlFor="reg-confirm-password"
          required
          error={errors.confirmPassword}
        >
          <PasswordInput
            id="reg-confirm-password"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={form.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            hasError={!!errors.confirmPassword}
            disabled={isSubmitting}
          />
        </FormField>

        {/* Role Selector: Student vs Company (No Admin Option) */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              marginBottom: '0.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            I am joining as
            <span style={{ color: 'var(--color-error)', fontWeight: 700 }}>*</span>
          </label>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              marginTop: '0.35rem',
            }}
          >
            {/* Student Card */}
            <div
              id="role-option-student"
              role="radio"
              aria-checked={form.role === 'STUDENT'}
              tabIndex={0}
              onClick={() => handleChange('role', 'STUDENT')}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  handleChange('role', 'STUDENT');
                }
              }}
              style={{
                border: `2px solid ${
                  form.role === 'STUDENT' ? 'var(--color-primary)' : 'var(--color-border)'
                }`,
                backgroundColor:
                  form.role === 'STUDENT' ? 'var(--color-primary-light)' : 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                outline: 'none',
                position: 'relative',
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🎓</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                Student
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem', lineHeight: 1.35 }}>
                Find internships and build skills
              </div>
            </div>

            {/* Company Card */}
            <div
              id="role-option-company"
              role="radio"
              aria-checked={form.role === 'COMPANY'}
              tabIndex={0}
              onClick={() => handleChange('role', 'COMPANY')}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  handleChange('role', 'COMPANY');
                }
              }}
              style={{
                border: `2px solid ${
                  form.role === 'COMPANY' ? 'var(--color-primary)' : 'var(--color-border)'
                }`,
                backgroundColor:
                  form.role === 'COMPANY' ? 'var(--color-primary-light)' : 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                outline: 'none',
                position: 'relative',
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🏢</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                Company
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem', lineHeight: 1.35 }}>
                Find talented interns
              </div>
            </div>
          </div>

          {errors.role && (
            <span
              role="alert"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.825rem',
                color: 'var(--color-error)',
                marginTop: '0.35rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 500,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {errors.role}
            </span>
          )}
        </div>

        {/* Submit Button */}
        <Button
          id="register-submit-btn"
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
