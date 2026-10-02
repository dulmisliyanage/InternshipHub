import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../../ui';

interface OnboardingSuccessProps {
  onContinue: () => void;
}

export const OnboardingSuccess: React.FC<OnboardingSuccessProps> = ({ onContinue }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '3rem 1rem',
        margin: 'auto 0',
      }}
    >
      {/* Animated Checkmark Circle */}
      <div
        style={{
          width: '76px',
          height: '76px',
          borderRadius: '50%',
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          color: 'var(--color-success)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          boxShadow: '0 0 0 8px rgba(16, 185, 129, 0.06)',
          animation: 'pulse 2s infinite',
        }}
      >
        <CheckCircle2 size={46} strokeWidth={2.5} />
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '2rem',
          fontWeight: 800,
          color: 'var(--color-text-primary)',
          margin: '0 0 0.75rem',
        }}
      >
        Profile completed!
      </h1>

      <p
        style={{
          fontSize: '1.05rem',
          color: 'var(--color-text-secondary)',
          maxWidth: '420px',
          lineHeight: 1.6,
          margin: '0 0 2.25rem',
        }}
      >
        You're all set! Your academic background and skills are saved, and you are ready to start
        discovering internship opportunities tailored to your profile.
      </p>

      <Button
        type="button"
        variant="primary"
        size="lg"
        onClick={onContinue}
        style={{ minWidth: '220px' }}
      >
        <span>Go to Dashboard</span>
        <ArrowRight size={18} />
      </Button>
    </div>
  );
};
