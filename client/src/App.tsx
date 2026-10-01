import { useState, useEffect } from 'react';
import './App.css';
import {
  Button,
  Input,
  PasswordInput,
  FormField,
  Alert,
  FormError,
  LoadingSpinner,
} from './components/ui';
import { AuthLayout } from './components/auth/AuthLayout';

export function App() {
  const [view, setView] = useState<'tokens' | 'auth-preview'>('tokens');
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [sampleEmail, setSampleEmail] = useState('');
  const [samplePassword, setSamplePassword] = useState('');
  const [sampleError, setSampleError] = useState<string | null>(null);
  const [btnLoading, setBtnLoading] = useState(false);
  const [dismissAlert, setDismissAlert] = useState(false);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setApiOnline(data.status === 'ok'))
      .catch(() => setApiOnline(false));
  }, []);

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSampleError(null);
    if (!sampleEmail) {
      setSampleError('Please enter your email address');
      return;
    }
    if (!samplePassword) {
      setSampleError('Please enter your password');
      return;
    }
    setBtnLoading(true);
    setTimeout(() => {
      setBtnLoading(false);
      alert(`Simulated auth submission with: ${sampleEmail}`);
    }, 1200);
  };

  return (
    <div className="ih-container">
      {/* Top Header */}
      <header className="ih-header">
        <div className="ih-header-left">
          <div className="ih-header-title">
            <div className="ih-logo-mark">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <h1 className="logo" style={{ fontSize: '1.65rem', margin: 0 }}>
              Internship<span style={{ color: 'var(--color-primary)' }}>Hub</span>
            </h1>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-primary)',
                backgroundColor: 'var(--color-primary-light)',
                padding: '0.2rem 0.65rem',
                borderRadius: 'var(--radius-full)',
              }}
            >
              Step 2.7A Design System
            </span>
          </div>
          <p className="ih-tagline">
            Official design tokens, typography system, and reusable UI primitives.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Backend Status Pill */}
          <div
            className="ih-system-status"
            style={{
              backgroundColor: apiOnline ? '#ECFDF5' : '#FEF2F2',
              borderColor: apiOnline ? '#A7F3D0' : '#FECACA',
              color: apiOnline ? '#065F46' : '#991B1B',
            }}
          >
            <span
              className="ih-status-dot"
              style={{
                backgroundColor: apiOnline ? 'var(--color-success)' : 'var(--color-error)',
              }}
            />
            {apiOnline === null ? 'Pinging API...' : apiOnline ? 'Express API Online' : 'API Offline'}
          </div>

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--color-surface)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <Button
              size="sm"
              variant={view === 'tokens' ? 'primary' : 'ghost'}
              onClick={() => setView('tokens')}
            >
              Design Primitives
            </Button>
            <Button
              size="sm"
              variant={view === 'auth-preview' ? 'primary' : 'ghost'}
              onClick={() => setView('auth-preview')}
            >
              AuthLayout Preview
            </Button>
          </div>
        </div>
      </header>

      {view === 'tokens' ? (
        <main>
          {/* Section 1: Design Tokens */}
          <section className="ih-section">
            <div className="ih-section-header">
              <h2>Design Tokens</h2>
              <p className="ih-section-desc">
                Curated palette with brand, semantic states, text colors, and surface tokens.
              </p>
            </div>

            <div className="ih-token-grid">
              <div className="ih-token-card">
                <div className="ih-token-swatch" style={{ backgroundColor: '#4F46E5' }} />
                <div className="ih-token-info">
                  <span className="ih-token-name">--color-primary</span>
                  <span className="ih-token-val">#4F46E5</span>
                </div>
              </div>

              <div className="ih-token-card">
                <div className="ih-token-swatch" style={{ backgroundColor: '#3730A3' }} />
                <div className="ih-token-info">
                  <span className="ih-token-name">--color-primary-dark</span>
                  <span className="ih-token-val">#3730A3</span>
                </div>
              </div>

              <div className="ih-token-card">
                <div className="ih-token-swatch" style={{ backgroundColor: '#EEF2FF', borderBottom: '1px solid var(--color-border)' }} />
                <div className="ih-token-info">
                  <span className="ih-token-name">--color-primary-light</span>
                  <span className="ih-token-val">#EEF2FF</span>
                </div>
              </div>

              <div className="ih-token-card">
                <div className="ih-token-swatch" style={{ backgroundColor: '#10B981' }} />
                <div className="ih-token-info">
                  <span className="ih-token-name">--color-success</span>
                  <span className="ih-token-val">#10B981</span>
                </div>
              </div>

              <div className="ih-token-card">
                <div className="ih-token-swatch" style={{ backgroundColor: '#F59E0B' }} />
                <div className="ih-token-info">
                  <span className="ih-token-name">--color-warning</span>
                  <span className="ih-token-val">#F59E0B</span>
                </div>
              </div>

              <div className="ih-token-card">
                <div className="ih-token-swatch" style={{ backgroundColor: '#EF4444' }} />
                <div className="ih-token-info">
                  <span className="ih-token-name">--color-error</span>
                  <span className="ih-token-val">#EF4444</span>
                </div>
              </div>

              <div className="ih-token-card">
                <div className="ih-token-swatch" style={{ backgroundColor: '#3B82F6' }} />
                <div className="ih-token-info">
                  <span className="ih-token-name">--color-info</span>
                  <span className="ih-token-val">#3B82F6</span>
                </div>
              </div>

              <div className="ih-token-card">
                <div className="ih-token-swatch" style={{ backgroundColor: '#0F172A' }} />
                <div className="ih-token-info">
                  <span className="ih-token-name">--color-text-primary</span>
                  <span className="ih-token-val">#0F172A</span>
                </div>
              </div>

              <div className="ih-token-card">
                <div className="ih-token-swatch" style={{ backgroundColor: '#64748B' }} />
                <div className="ih-token-info">
                  <span className="ih-token-name">--color-text-secondary</span>
                  <span className="ih-token-val">#64748B</span>
                </div>
              </div>

              <div className="ih-token-card">
                <div className="ih-token-swatch" style={{ backgroundColor: '#94A3B8' }} />
                <div className="ih-token-info">
                  <span className="ih-token-name">--color-text-disabled</span>
                  <span className="ih-token-val">#94A3B8</span>
                </div>
              </div>

              <div className="ih-token-card">
                <div className="ih-token-swatch" style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--color-border)' }} />
                <div className="ih-token-info">
                  <span className="ih-token-name">--color-background</span>
                  <span className="ih-token-val">#F8FAFC</span>
                </div>
              </div>

              <div className="ih-token-card">
                <div className="ih-token-swatch" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--color-border)' }} />
                <div className="ih-token-info">
                  <span className="ih-token-name">--color-surface</span>
                  <span className="ih-token-val">#FFFFFF</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Typography System */}
          <section className="ih-section">
            <div className="ih-section-header">
              <h2>Typography System</h2>
              <p className="ih-section-desc">
                Strict two-font system: Plus Jakarta Sans for headings & Inter for functional body/UI.
              </p>
            </div>

            <div className="ih-card">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Plus Jakarta Sans — Headings & Brand
                  </span>
                  <h1 style={{ marginTop: '0.25rem', marginBottom: '0.25rem' }}>
                    Hero Heading 1 (2rem / 800)
                  </h1>
                  <h2>Page Heading 2 (1.5rem / 700)</h2>
                  <h3 style={{ marginTop: '0.25rem' }}>Section Heading 3 (1.15rem / 600)</h3>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Inter — Body, UI Controls, Buttons, Forms & Tables
                  </span>
                  <p style={{ marginTop: '0.35rem', color: 'var(--color-text-primary)' }}>
                    Body Text Regular (15px / 400): Clean and legible for candidate resumes, job requirements, and application statuses.
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                    Secondary Supporting Text (14px / 400): Provides helpful micro-copy and field descriptions.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Interactive Reusable Primitives */}
          <section className="ih-section">
            <div className="ih-section-header">
              <h2>Component Primitives</h2>
              <p className="ih-section-desc">
                Reusable across all authentication, dashboard, and application screens.
              </p>
            </div>

            <div className="ih-preview-grid">
              {/* Button Variants */}
              <div className="ih-card">
                <div className="ih-card-title">
                  <span>🔘</span> Button Component
                </div>
                <div className="ih-flex-col">
                  <div className="ih-flex-row">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="danger">Danger</Button>
                  </div>

                  <div className="ih-flex-row">
                    <Button variant="google">Continue with Google</Button>
                    <Button variant="primary" isLoading>Submitting</Button>
                    <Button variant="primary" disabled>Disabled</Button>
                  </div>

                  <div className="ih-flex-row">
                    <Button size="sm" variant="primary">Small</Button>
                    <Button size="md" variant="primary">Medium</Button>
                    <Button size="lg" variant="primary">Large</Button>
                  </div>
                </div>
              </div>

              {/* Form Inputs & PasswordInput */}
              <div className="ih-card">
                <div className="ih-card-title">
                  <span>📝</span> Form Inputs & PasswordInput
                </div>
                <form onSubmit={(e) => e.preventDefault()}>
                  <FormField label="Full Name" htmlFor="demo-name" required hint="Used for your candidate profile">
                    <Input id="demo-name" placeholder="Sarah Jenkins" />
                  </FormField>

                  <FormField label="Email Address" htmlFor="demo-email" required>
                    <Input
                      id="demo-email"
                      type="email"
                      placeholder="sarah@university.edu"
                      icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                      }
                    />
                  </FormField>

                  <FormField label="Password" htmlFor="demo-password" required hint="Must be at least 8 characters">
                    <PasswordInput id="demo-password" placeholder="••••••••••••" />
                  </FormField>

                  <FormField label="Input with Error" htmlFor="demo-error" error="This field is required">
                    <Input id="demo-error" hasError defaultValue="Invalid input" />
                  </FormField>
                </form>
              </div>

              {/* Alert & FormError */}
              <div className="ih-card">
                <div className="ih-card-title">
                  <span>🔔</span> Alert & FormError Primitives
                </div>
                <div className="ih-flex-col">
                  {!dismissAlert && (
                    <Alert
                      variant="info"
                      title="System Information"
                      message="Step 2.7A established the design tokens and reusable primitives."
                      onClose={() => setDismissAlert(true)}
                    />
                  )}
                  <Alert
                    variant="success"
                    title="Account Created"
                    message="Welcome to InternshipHub. Your email has been verified."
                  />
                  <Alert
                    variant="warning"
                    title="Account Restricted"
                    message="Your profile requires administrator approval before listing internships."
                  />
                  <FormError message="Invalid login credentials. Please check your email and password." />
                </div>
              </div>

              {/* Loading Spinner */}
              <div className="ih-card">
                <div className="ih-card-title">
                  <span>⏳</span> LoadingSpinner Primitive
                </div>
                <div className="ih-flex-row" style={{ gap: '1.5rem', padding: '1rem 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <LoadingSpinner size="sm" color="var(--color-primary)" />
                    <span style={{ fontSize: '0.85rem' }}>Small (16px)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <LoadingSpinner size="md" color="var(--color-primary)" />
                    <span style={{ fontSize: '0.85rem' }}>Medium (20px)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <LoadingSpinner size="lg" color="var(--color-primary)" />
                    <span style={{ fontSize: '0.85rem' }}>Large (28px)</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      ) : (
        /* Section 4: Live AuthLayout Preview */
        <main>
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <h2>AuthLayout Shell Preview</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              The unified shell used by Login, Registration, and Google Onboarding.
            </p>
          </div>

          <AuthLayout
            title="Sign in to InternshipHub"
            subtitle="Access your student applications or company recruitment dashboard."
            badge="Candidate & Employer Portal"
            footer={
              <p>
                Don&apos;t have an account?{' '}
                <a href="#register" style={{ fontWeight: 600 }}>
                  Create an account
                </a>
              </p>
            }
          >
            {sampleError && <FormError message={sampleError} />}

            <form onSubmit={handleSimulateSubmit}>
              <FormField label="Email Address" htmlFor="auth-email" required>
                <Input
                  id="auth-email"
                  type="email"
                  placeholder="name@company.com or student@edu"
                  value={sampleEmail}
                  onChange={(e) => setSampleEmail(e.target.value)}
                  icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  }
                />
              </FormField>

              <FormField label="Password" htmlFor="auth-password" required>
                <PasswordInput
                  id="auth-password"
                  placeholder="Enter your password"
                  value={samplePassword}
                  onChange={(e) => setSamplePassword(e.target.value)}
                />
              </FormField>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
                <a href="#forgot" style={{ fontSize: '0.85rem' }}>
                  Forgot password?
                </a>
              </div>

              <Button type="submit" variant="primary" fullWidth isLoading={btnLoading} size="lg">
                Sign in
              </Button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                or
              </span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
            </div>

            <Button variant="google" fullWidth size="lg">
              Continue with Google
            </Button>
          </AuthLayout>
        </main>
      )}
    </div>
  );
}

export default App;
