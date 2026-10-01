import React from 'react';

export type AlertVariant = 'error' | 'warning' | 'success' | 'info';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  message?: React.ReactNode;
  children?: React.ReactNode;
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  message,
  children,
  onClose,
  className = '',
  style,
}) => {
  const config = {
    error: {
      bg: '#FEF2F2',
      border: '#FCA5A5',
      color: '#991B1B',
      iconColor: 'var(--color-error)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
    },
    warning: {
      bg: '#FFFBEB',
      border: '#FCD34D',
      color: '#92400E',
      iconColor: 'var(--color-warning)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
    success: {
      bg: '#ECFDF5',
      border: '#6EE7B7',
      color: '#065F46',
      iconColor: 'var(--color-success)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    info: {
      bg: 'var(--color-primary-light)',
      border: '#C7D2FE',
      color: 'var(--color-primary-dark)',
      iconColor: 'var(--color-info)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      ),
    },
  }[variant];

  return (
    <div
      role="alert"
      className={`ih-alert ih-alert-${variant} ${className}`}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        color: config.color,
        fontSize: '0.9rem',
        lineHeight: 1.45,
        fontFamily: 'var(--font-body)',
        ...style,
      }}
    >
      <span style={{ color: config.iconColor, flexShrink: 0, marginTop: '2px' }}>
        {config.icon}
      </span>

      <div style={{ flex: 1 }}>
        {title && (
          <div style={{ fontWeight: 600, marginBottom: message || children ? '0.2rem' : 0 }}>
            {title}
          </div>
        )}
        {message && <div>{message}</div>}
        {children}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            color: config.color,
            opacity: 0.7,
            marginLeft: 'auto',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
};

export interface FormErrorProps {
  message?: string | null;
  className?: string;
}

export const FormError: React.FC<FormErrorProps> = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <Alert
      variant="error"
      message={message}
      className={`ih-form-error ${className}`}
      style={{ marginBottom: '1rem' }}
    />
  );
};
