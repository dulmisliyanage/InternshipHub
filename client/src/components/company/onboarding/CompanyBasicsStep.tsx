import React from 'react';
import { Building2, ArrowRight } from 'lucide-react';
import { Button, FormField, Input } from '../../ui';

interface CompanyBasicsStepProps {
  companyName: string;
  industry: string;
  errors: { [key: string]: string };
  onChange: (field: string, value: string) => void;
  onNext: () => void;
}

export const CompanyBasicsStep: React.FC<CompanyBasicsStepProps> = ({
  companyName,
  industry,
  errors,
  onChange,
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
          <Building2 size={15} />
          <span>Company Information</span>
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
          Tell us about your company
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', margin: 0 }}>
          Start by adding the basic information students will see about your organization.
        </p>
      </div>

      {/* Form Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <FormField
          label="Company name"
          htmlFor="companyName"
          error={errors.companyName}
          required
        >
          <Input
            id="companyName"
            value={companyName}
            onChange={(e) => onChange('companyName', e.target.value)}
            placeholder="e.g. Nova Technologies"
            hasError={!!errors.companyName}
            autoFocus
          />
        </FormField>

        <FormField
          label="Industry"
          htmlFor="industry"
          error={errors.industry}
        >
          <Input
            id="industry"
            value={industry}
            onChange={(e) => onChange('industry', e.target.value)}
            placeholder="e.g. Software Development, Financial Services, AI"
            hasError={!!errors.industry}
          />
        </FormField>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginTop: '0.5rem',
        }}
      >
        <Button type="submit" variant="primary" size="lg">
          <span>Continue</span>
          <ArrowRight size={16} />
        </Button>
      </div>
    </form>
  );
};
