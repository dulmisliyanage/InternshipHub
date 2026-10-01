import React from 'react';

export interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  error,
  hint,
  required = false,
  className = '',
  style,
  children,
}) => {
  return (
    <div
      className={`ih-form-field ${error ? 'has-error' : ''} ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '1.15rem',
        ...style,
      }}
    >
      {label && (
        <label
          htmlFor={htmlFor}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: '0.375rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          {label}
          {required && (
            <span
              style={{
                color: 'var(--color-error)',
                fontWeight: 700,
              }}
              title="Required"
            >
              *
            </span>
          )}
        </label>
      )}

      {children}

      {hint && !error && (
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.8rem',
            color: 'var(--color-text-secondary)',
            marginTop: '0.35rem',
          }}
        >
          {hint}
        </span>
      )}

      {error && (
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
          {error}
        </span>
      )}
    </div>
  );
};
