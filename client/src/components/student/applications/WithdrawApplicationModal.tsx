import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '../../ui/Button';

interface WithdrawApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  internshipTitle: string;
  companyName: string;
  isSubmitting: boolean;
  error?: string | null;
}

export const WithdrawApplicationModal: React.FC<WithdrawApplicationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  internshipTitle,
  companyName,
  isSubmitting,
  error,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="withdraw-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        zIndex: 100,
        animation: 'fadeIn 0.15s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        id="withdraw-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="withdraw-modal-title"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-2xl)',
          maxWidth: '480px',
          width: '100%',
          padding: '2rem',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Close dialog"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            color: 'var(--color-text-secondary)',
            padding: '0.25rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={20} />
        </button>

        {/* Warning Icon & Heading */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3
              id="withdraw-modal-title"
              style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
              }}
            >
              Withdraw Application
            </h3>
            <p
              style={{
                margin: '0.2rem 0 0 0',
                fontSize: '0.8125rem',
                color: 'var(--color-text-secondary)',
              }}
            >
              This action cannot be undone
            </p>
          </div>
        </div>

        {/* Modal Description */}
        <p
          style={{
            margin: 0,
            fontSize: '0.9375rem',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
          }}
        >
          Are you sure you want to withdraw your application for{' '}
          <strong style={{ color: 'var(--color-text-primary)' }}>{internshipTitle}</strong> at{' '}
          <strong style={{ color: 'var(--color-text-primary)' }}>{companyName}</strong>? Once
          withdrawn, you will not be able to re-apply for this specific opening.
        </p>

        {/* Error message */}
        {error && (
          <div
            id="withdraw-error-alert"
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: 'var(--radius-md)',
              color: '#B91C1C',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '0.5rem',
          }}
        >
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
            id="withdraw-cancel-btn"
          >
            Keep Application
          </Button>

          <Button
            variant="danger"
            size="md"
            onClick={onConfirm}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            id="withdraw-confirm-btn"
            style={{
              backgroundColor: '#DC2626',
              borderColor: '#DC2626',
              color: '#FFFFFF',
            }}
          >
            {isSubmitting ? 'Withdrawing...' : 'Yes, Withdraw'}
          </Button>
        </div>
      </div>
    </div>
  );
};
