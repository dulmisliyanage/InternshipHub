import React from 'react';
import { Globe, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button, FormField, Input } from '../../ui';

const LinkedinIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface CompanyPresenceStepProps {
  website: string;
  linkedinUrl: string;
  errors: { [key: string]: string };
  onChange: (field: string, value: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export const CompanyPresenceStep: React.FC<CompanyPresenceStepProps> = ({
  website,
  linkedinUrl,
  errors,
  onChange,
  onBack,
  onNext,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Step Header */}
      <div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: '#065F46',
            backgroundColor: '#ECFDF5',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.825rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
          }}
        >
          <Globe size={15} />
          <span>Online Presence</span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.65rem',
            fontWeight: 800,
            color: 'var(--color-text-primary)',
            margin: '0 0 0.4rem',
          }}
        >
          Build trust with students
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', margin: 0 }}>
          Add links that help candidates learn more about your organization.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Website */}
        <FormField
          label="Company website"
          htmlFor="website"
          error={errors.website}
        >
          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              <Globe size={16} />
            </div>
            <Input
              id="website"
              value={website}
              onChange={(e) => onChange('website', e.target.value)}
              placeholder="https://yourcompany.com"
              style={{ paddingLeft: '2.4rem' }}
              hasError={!!errors.website}
            />
          </div>
        </FormField>

        {/* LinkedIn */}
        <FormField
          label="LinkedIn company page"
          htmlFor="linkedinUrl"
          error={errors.linkedinUrl}
        >
          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              <LinkedinIcon size={16} />
            </div>
            <Input
              id="linkedinUrl"
              value={linkedinUrl}
              onChange={(e) => onChange('linkedinUrl', e.target.value)}
              placeholder="https://linkedin.com/company/yourcompany"
              style={{ paddingLeft: '2.4rem' }}
              hasError={!!errors.linkedinUrl}
            />
          </div>
        </FormField>

        <p
          style={{
            fontSize: '0.825rem',
            color: 'var(--color-text-secondary)',
            margin: '0.25rem 0 0',
            lineHeight: 1.5,
          }}
        >
          💡 These links will appear on your verified employer profile and all published internship listings.
        </p>
      </div>

      {/* Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '0.5rem',
        }}
      >
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back</span>
        </Button>
        <Button type="submit" variant="primary" size="lg">
          <span>Continue</span>
          <ArrowRight size={16} />
        </Button>
      </div>
    </form>
  );
};
