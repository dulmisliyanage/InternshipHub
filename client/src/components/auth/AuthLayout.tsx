import React from 'react';

export interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  badge?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
  footer,
  badge,
}) => {
  return (
    <div
      className="ih-auth-container"
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-background)',
        padding: '2rem 1rem',
      }}
    >
      {/* Brand Header */}
      <div
        className="ih-auth-brand"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '1.75rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.625rem',
            marginBottom: '0.5rem',
          }}
        >
          {/* Brand Icon */}
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <span
            className="logo"
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.03em',
            }}
          >
            Internship<span style={{ color: 'var(--color-primary)' }}>Hub</span>
          </span>
        </div>

        {badge && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--color-primary)',
              backgroundColor: 'var(--color-primary-light)',
              padding: '0.2rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              letterSpacing: '0.02em',
            }}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Auth Card */}
      <div
        className="ih-auth-card"
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.25rem',
          boxShadow: 'var(--shadow-md)',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
          <h2
            className="page-heading"
            style={{
              fontSize: '1.45rem',
              fontWeight: 700,
              marginBottom: '0.4rem',
              color: 'var(--color-text-primary)',
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.45,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Form Body */}
        <div>{children}</div>

        {/* Card Footer */}
        {footer && (
          <div
            style={{
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--color-border)',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {footer}
          </div>
        )}
      </div>

      {/* Global Security / Trust Footer */}
      <div
        style={{
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: 'var(--color-text-disabled)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span>Secured with HTTP-only tokens & Role-Based Access Control</span>
      </div>
    </div>
  );
};
