import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ hasError = false, icon, endIcon, className = '', style, disabled, ...props }, ref) => {
    return (
      <div
        className={`ih-input-wrapper ${disabled ? 'disabled' : ''} ${hasError ? 'error' : ''}`}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
        }}
      >
        {icon && (
          <span
            style={{
              position: 'absolute',
              left: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
              color: hasError ? 'var(--color-error)' : 'var(--color-text-secondary)',
            }}
          >
            {icon}
          </span>
        )}

        <input
          ref={ref}
          disabled={disabled}
          className={`ih-input ${className}`}
          style={{
            width: '100%',
            height: '42px',
            paddingLeft: icon ? '2.5rem' : '0.875rem',
            paddingRight: endIcon ? '2.5rem' : '0.875rem',
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
            fontFamily: 'var(--font-body)',
            fontSize: '0.925rem',
            color: 'var(--color-text-primary)',
            backgroundColor: disabled ? 'var(--color-background)' : 'var(--color-surface)',
            border: `1px solid ${hasError ? 'var(--color-error)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-xs)',
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
            outline: 'none',
            ...style,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = hasError
              ? 'var(--color-error)'
              : 'var(--color-primary)';
            e.currentTarget.style.boxShadow = hasError
              ? '0 0 0 3px rgba(239, 68, 68, 0.15)'
              : '0 0 0 3px rgba(79, 70, 229, 0.15)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = hasError
              ? 'var(--color-error)'
              : 'var(--color-border)';
            e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
          }}
          {...props}
        />

        {endIcon && (
          <span
            style={{
              position: 'absolute',
              right: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--color-text-secondary)',
            }}
          >
            {endIcon}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
