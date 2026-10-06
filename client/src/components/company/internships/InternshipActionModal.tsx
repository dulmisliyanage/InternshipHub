import React from 'react';
import { Button } from '../../ui/Button';

export interface InternshipActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  confirmVariant?: 'primary' | 'outline';
  confirmStyle?: React.CSSProperties;
  isLoading: boolean;
  loadingLabel?: string;
  icon?: React.ReactNode;
}

export const InternshipActionModal: React.FC<InternshipActionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  confirmVariant = 'primary',
  confirmStyle,
  isLoading,
  loadingLabel,
  icon,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        zIndex: 1000,
        backdropFilter: 'blur(3px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem',
          maxWidth: '460px',
          width: '100%',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--color-border)',
          animation: 'fadeInScale 0.15s ease-out',
        }}
      >
        {icon && (
          <div style={{ marginBottom: '1.25rem' }}>
            {icon}
          </div>
        )}

        <h3
          style={{
            fontSize: '1.2rem',
            fontWeight: 800,
            color: 'var(--color-text-primary)',
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {title}
        </h3>

        <div
          style={{
            fontSize: '0.925rem',
            color: 'var(--color-text-secondary)',
            marginTop: '0.65rem',
            marginBottom: '1.75rem',
            lineHeight: 1.55,
          }}
        >
          {message}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
          }}
        >
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant={confirmVariant}
            size="md"
            onClick={onConfirm}
            disabled={isLoading}
            isLoading={isLoading}
            style={confirmStyle}
          >
            {isLoading ? loadingLabel || 'Processing...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
