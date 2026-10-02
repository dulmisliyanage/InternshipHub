import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '../../ui';

interface CompanyOnboardingSuccessProps {
  companyName: string;
}

export const CompanyOnboardingSuccess: React.FC<CompanyOnboardingSuccessProps> = ({ companyName }) => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '2.5rem 1rem',
      }}
    >
      {/* Animated Check Icon */}
      <div
        style={{
          width: '76px',
          height: '76px',
          borderRadius: '50%',
          backgroundColor: '#ECFDF5',
          border: '2px solid #A7F3D0',
          color: '#059669',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.75rem',
          boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)',
        }}
      >
        <Check size={38} strokeWidth={2.8} />
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.85rem',
          fontWeight: 800,
          color: 'var(--color-text-primary)',
          margin: '0 0 0.75rem',
        }}
      >
        Your company is ready!
      </h1>

      <p
        style={{
          fontSize: '1.05rem',
          lineHeight: 1.6,
          color: 'var(--color-text-secondary)',
          maxWidth: '460px',
          margin: '0 0 2rem',
        }}
      >
        Your employer profile for <strong style={{ color: 'var(--color-text-primary)' }}>{companyName}</strong> has been created. You can now start building your presence on InternshipHub and prepare to connect with talented students.
      </p>

      <div style={{ width: '100%', maxWidth: '280px' }}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => navigate('/company/dashboard')}
        >
          <span>Go to Dashboard</span>
          <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
};
