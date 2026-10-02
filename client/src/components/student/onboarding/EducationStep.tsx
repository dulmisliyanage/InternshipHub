import React from 'react';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { FormField, Input, Button } from '../../ui';

export interface EducationData {
  university: string;
  degree: string;
  fieldOfStudy: string;
  currentYear: string;
  expectedGraduation: string;
  location: string;
}

interface EducationStepProps {
  data: EducationData;
  errors: { [key: string]: string };
  onChange: (field: keyof EducationData, value: string) => void;
  onNext: () => void;
}

export const EducationStep: React.FC<EducationStepProps> = ({
  data,
  errors,
  onChange,
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
          <GraduationCap size={16} />
          <span>Academic Background</span>
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
          Tell us about your studies
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', margin: 0 }}>
          Your university and academic status help employers understand your timeline and eligibility.
        </p>
      </div>

      {/* Inputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
        <FormField
          htmlFor="university"
          label="University / Institution"
          required
          error={errors.university}
        >
          <Input
            id="university"
            name="university"
            placeholder="e.g. University of Colombo"
            value={data.university}
            onChange={(e) => onChange('university', e.target.value)}
            hasError={!!errors.university}
          />
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <FormField
            htmlFor="degree"
            label="Degree Program"
            error={errors.degree}
            hint="e.g. BSc, BEng, BA, Higher Diploma"
          >
            <Input
              id="degree"
              name="degree"
              placeholder="e.g. BSc in Information Systems"
              value={data.degree}
              onChange={(e) => onChange('degree', e.target.value)}
            />
          </FormField>

          <FormField
            htmlFor="fieldOfStudy"
            label="Field of Study"
            error={errors.fieldOfStudy}
            hint="e.g. Computer Science, Software Engineering"
          >
            <Input
              id="fieldOfStudy"
              name="fieldOfStudy"
              placeholder="e.g. Information Systems"
              value={data.fieldOfStudy}
              onChange={(e) => onChange('fieldOfStudy', e.target.value)}
            />
          </FormField>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <FormField
            htmlFor="currentYear"
            label="Current Study Year"
            error={errors.currentYear}
          >
            <select
              id="currentYear"
              value={data.currentYear}
              onChange={(e) => onChange('currentYear', e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                fontSize: '0.95rem',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="1">Year 1 (Freshman)</option>
              <option value="2">Year 2 (Sophomore)</option>
              <option value="3">Year 3 (Junior)</option>
              <option value="4">Year 4 (Senior)</option>
              <option value="5">Year 5 / Master's</option>
            </select>
          </FormField>

          <FormField
            htmlFor="expectedGraduation"
            label="Expected Graduation Date"
            error={errors.expectedGraduation}
            hint="Month & Year"
          >
            <Input
              id="expectedGraduation"
              name="expectedGraduation"
              type="month"
              value={data.expectedGraduation}
              onChange={(e) => onChange('expectedGraduation', e.target.value)}
              hasError={!!errors.expectedGraduation}
            />
          </FormField>
        </div>

        <FormField
          htmlFor="location"
          label="Current Location"
          error={errors.location}
          hint="City and country you reside in"
        >
          <Input
            id="location"
            name="location"
            placeholder="e.g. Colombo, Sri Lanka"
            value={data.location}
            onChange={(e) => onChange('location', e.target.value)}
          />
        </FormField>
      </div>

      {/* Action Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <Button type="button" variant="primary" size="lg" onClick={onNext}>
          <span>Continue</span>
          <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
};
