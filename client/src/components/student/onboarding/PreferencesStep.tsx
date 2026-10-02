import React from 'react';
import { Briefcase, Laptop, Building2, MapPin, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { FormField, Input, Button } from '../../ui';
import type { WorkType } from '../../../types/student';

export interface PreferencesData {
  preferredRole: string;
  preferredWorkType: WorkType;
}

interface PreferencesStepProps {
  data: PreferencesData;
  errors: { [key: string]: string };
  onChange: (field: keyof PreferencesData, value: any) => void;
  onBack: () => void;
  onNext: () => void;
}

const workTypeOptions: {
  type: WorkType;
  label: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  {
    type: 'REMOTE',
    label: 'Remote',
    desc: 'Work from anywhere',
    icon: Laptop,
  },
  {
    type: 'HYBRID',
    label: 'Hybrid',
    desc: 'Office + home flexibility',
    icon: Building2,
  },
  {
    type: 'ONSITE',
    label: 'On-site',
    desc: 'Full-time at company office',
    icon: MapPin,
  },
];

export const PreferencesStep: React.FC<PreferencesStepProps> = ({
  data,
  errors,
  onChange,
  onBack,
  onNext,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Step Header */}
      <div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--color-primary)',
            backgroundColor: 'var(--color-primary-light)',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
          }}
        >
          <Briefcase size={16} />
          <span>Internship Preferences</span>
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
          What kind of role are you seeking?
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', margin: 0 }}>
          Specify your target job title and your preferred work environment.
        </p>
      </div>

      {/* Role Input */}
      <div>
        <FormField
          htmlFor="preferredRole"
          label="Preferred Internship Role"
          required
          error={errors.preferredRole}
          hint="e.g. Frontend Developer Intern, Full Stack Intern, UI/UX Designer Intern"
        >
          <Input
            id="preferredRole"
            name="preferredRole"
            placeholder="e.g. Frontend Developer Intern"
            value={data.preferredRole}
            onChange={(e) => onChange('preferredRole', e.target.value)}
            hasError={!!errors.preferredRole}
          />
        </FormField>
      </div>

      {/* Work Type Selection Cards */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: '0.75rem',
          }}
        >
          Preferred Work Arrangement
        </label>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem',
          }}
        >
          {workTypeOptions.map((item) => {
            const isSelected = data.preferredWorkType === item.type;
            const Icon = item.icon;

            return (
              <div
                key={item.type}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => onChange('preferredWorkType', item.type)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onChange('preferredWorkType', item.type);
                  }
                }}
                style={{
                  position: 'relative',
                  border: `2px solid ${
                    isSelected ? 'var(--color-primary)' : 'var(--color-border)'
                  }`,
                  backgroundColor: isSelected
                    ? 'var(--color-primary-light)'
                    : 'var(--color-surface)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.5rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  outline: 'none',
                  boxShadow: isSelected
                    ? '0 0 0 3px rgba(79, 70, 229, 0.2)'
                    : 'var(--shadow-xs)',
                }}
              >
                {/* Check badge when selected */}
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}

                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: isSelected
                      ? 'rgba(79, 70, 229, 0.15)'
                      : 'var(--color-background)',
                    color: isSelected
                      ? 'var(--color-primary)'
                      : 'var(--color-text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={22} />
                </div>

                <span
                  style={{
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: isSelected
                      ? 'var(--color-primary-dark)'
                      : 'var(--color-text-primary)',
                  }}
                >
                  {item.label}
                </span>

                <span
                  style={{
                    fontSize: '0.8rem',
                    color: isSelected
                      ? 'var(--color-primary-dark)'
                      : 'var(--color-text-secondary)',
                  }}
                >
                  {item.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '1.25rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <Button type="button" variant="outline" size="md" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back</span>
        </Button>

        <Button type="button" variant="primary" size="lg" onClick={onNext}>
          <span>Continue</span>
          <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
};
