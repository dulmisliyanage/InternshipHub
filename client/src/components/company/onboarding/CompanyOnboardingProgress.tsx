import React from 'react';
import { Building2, Users, Globe, CheckCircle2, Check } from 'lucide-react';

interface CompanyOnboardingProgressProps {
  currentStep: number;
  totalSteps?: number;
  onStepClick?: (step: number) => void;
}

const steps = [
  { id: 1, label: 'Company', icon: Building2 },
  { id: 2, label: 'Details', icon: Users },
  { id: 3, label: 'Presence', icon: Globe },
  { id: 4, label: 'Review', icon: CheckCircle2 },
];

export const CompanyOnboardingProgress: React.FC<CompanyOnboardingProgressProps> = ({
  currentStep,
  totalSteps = 4,
}) => {
  const percentComplete = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      {/* Desktop Stepper */}
      <div className="company-desktop-stepper" style={{ position: 'relative' }}>
        {/* Background Connecting Line */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '30px',
            right: '30px',
            height: '2px',
            backgroundColor: 'var(--color-border)',
            zIndex: 1,
          }}
        >
          {/* Active Fill Line */}
          <div
            style={{
              height: '100%',
              width: `${percentComplete}%`,
              backgroundColor: 'var(--color-primary)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Step Circles & Labels */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {steps.map((s) => {
            const isCompleted = currentStep > s.id;
            const isCurrent = currentStep === s.id;

            let bgColor = 'var(--color-surface)';
            let borderColor = 'var(--color-border)';
            let textColor = 'var(--color-text-secondary)';

            if (isCompleted) {
              bgColor = 'var(--color-primary)';
              borderColor = 'var(--color-primary)';
              textColor = '#FFFFFF';
            } else if (isCurrent) {
              bgColor = 'var(--color-surface)';
              borderColor = 'var(--color-primary)';
              textColor = 'var(--color-primary)';
            }

            return (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '76px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: bgColor,
                    border: `2px solid ${borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: textColor,
                    boxShadow: isCurrent ? '0 0 0 4px var(--color-primary-light)' : 'none',
                    transition: 'all 0.25s ease',
                  }}
                >
                  {isCompleted ? <Check size={18} strokeWidth={2.5} /> : s.id}
                </div>

                <span
                  style={{
                    marginTop: '0.5rem',
                    fontSize: '0.78rem',
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Stepper */}
      <div className="company-mobile-stepper" style={{ display: 'none' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
          }}
        >
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Step {currentStep} of {totalSteps}
          </span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)' }}>
            {steps[currentStep - 1]?.label}
          </span>
        </div>

        {/* Progress Track */}
        <div
          style={{
            width: '100%',
            height: '6px',
            backgroundColor: 'var(--color-border)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${(currentStep / totalSteps) * 100}%`,
              height: '100%',
              backgroundColor: 'var(--color-primary)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .company-desktop-stepper {
            display: none !important;
          }
          .company-mobile-stepper {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};
