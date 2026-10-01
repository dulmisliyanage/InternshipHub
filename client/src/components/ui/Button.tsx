import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'google';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    // Size styling
    const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
      sm: {
        padding: '0.45rem 0.85rem',
        fontSize: '0.85rem',
        borderRadius: 'var(--radius-sm)',
        height: '34px',
      },
      md: {
        padding: '0.625rem 1.15rem',
        fontSize: '0.925rem',
        borderRadius: 'var(--radius-md)',
        height: '42px',
      },
      lg: {
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
        borderRadius: 'var(--radius-lg)',
        height: '48px',
      },
    };

    // Variant base styles
    const getVariantStyles = (): React.CSSProperties => {
      switch (variant) {
        case 'primary':
          return {
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            border: '1px solid transparent',
            boxShadow: 'var(--shadow-xs)',
          };
        case 'secondary':
          return {
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-xs)',
          };
        case 'outline':
          return {
            backgroundColor: 'transparent',
            color: 'var(--color-primary)',
            border: '1.5px solid var(--color-primary)',
          };
        case 'ghost':
          return {
            backgroundColor: 'transparent',
            color: 'var(--color-text-secondary)',
            border: '1px solid transparent',
          };
        case 'danger':
          return {
            backgroundColor: 'var(--color-error)',
            color: '#FFFFFF',
            border: '1px solid transparent',
            boxShadow: 'var(--shadow-xs)',
          };
        case 'google':
          return {
            backgroundColor: '#FFFFFF',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-xs)',
            fontWeight: 500,
          };
        default:
          return {};
      }
    };

    const combinedStyle: React.CSSProperties = {
      display: fullWidth ? 'flex' : 'inline-flex',
      width: fullWidth ? '100%' : 'auto',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      fontWeight: 600,
      fontFamily: 'var(--font-body)',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.65 : 1,
      transition: 'all var(--transition-fast)',
      userSelect: 'none',
      ...sizeStyles[size],
      ...getVariantStyles(),
      ...style,
    };

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`ih-button ih-button-${variant} ih-button-${size} ${className}`}
        style={combinedStyle}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size={size === 'lg' ? 'md' : 'sm'} color="currentColor" />
            <span>{typeof children === 'string' ? children : 'Loading...'}</span>
          </>
        ) : (
          <>
            {variant === 'google' && !leftIcon && (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            {leftIcon && <span className="ih-btn-icon-left">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="ih-btn-icon-right">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
