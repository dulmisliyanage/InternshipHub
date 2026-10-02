import React from 'react';
import { Users, MapPin, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button, FormField, Input } from '../../ui';
import type { CompanySize } from '../../../types/company';
import { COMPANY_SIZE_OPTIONS } from '../../../utils/company';

interface CompanyDetailsStepProps {
  companySize: CompanySize | null;
  location: string;
  description: string;
  errors: { [key: string]: string };
  onChange: (field: string, value: CompanySize | string) => void;
  onBack: () => void;
  onNext: () => void;
}

export const CompanyDetailsStep: React.FC<CompanyDetailsStepProps> = ({
  companySize,
  location,
  description,
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
          <Users size={15} />
          <span>Organization Details</span>
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
          Organization details
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', margin: 0 }}>
          Help interns understand your company size, location, and mission.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Company Size Chips */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              marginBottom: '0.5rem',
            }}
          >
            Company size
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '0.65rem',
            }}
          >
            {COMPANY_SIZE_OPTIONS.map((opt) => {
              const isSelected = companySize === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange('companySize', opt.value)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-lg)',
                    border: isSelected
                      ? '2px solid var(--color-primary)'
                      : '1px solid var(--color-border)',
                    backgroundColor: isSelected
                      ? 'var(--color-primary-light)'
                      : 'var(--color-surface)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      marginBottom: '0.2rem',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: isSelected
                          ? 'var(--color-primary-dark)'
                          : 'var(--color-text-primary)',
                      }}
                    >
                      {opt.label}
                    </span>
                    {isSelected && (
                      <Check size={14} color="var(--color-primary)" strokeWidth={3} />
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {opt.description}
                  </span>
                </button>
              );
            })}
          </div>
          {errors.companySize && (
            <p style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '0.35rem' }}>
              {errors.companySize}
            </p>
          )}
        </div>

        {/* Location */}
        <FormField
          label="Location (Headquarters or Office)"
          htmlFor="location"
          error={errors.location}
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
              <MapPin size={16} />
            </div>
            <Input
              id="location"
              value={location}
              onChange={(e) => onChange('location', e.target.value)}
              placeholder="e.g. Colombo, Sri Lanka or Remote"
              style={{ paddingLeft: '2.4rem' }}
              hasError={!!errors.location}
            />
          </div>
        </FormField>

        {/* Description / About */}
        <FormField
          label="About your company"
          htmlFor="description"
          error={errors.description}
        >
          <textarea
            id="description"
            rows={4}
            maxLength={2000}
            value={description}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="Tell prospective interns about your company culture, technology stack, mission, and the impact they will have..."
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              fontSize: '0.95rem',
              fontFamily: 'inherit',
              borderRadius: 'var(--radius-lg)',
              border: `1px solid ${errors.description ? 'var(--color-error)' : 'var(--color-border)'}`,
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              outline: 'none',
              boxSizing: 'border-box',
              resize: 'vertical',
              lineHeight: 1.5,
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '0.35rem',
              fontSize: '0.75rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            <span>Students read this to understand who you are before applying.</span>
            <span>{description.length} / 2000</span>
          </div>
        </FormField>
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
