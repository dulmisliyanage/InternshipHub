import React from 'react';
import { Check, GraduationCap, Briefcase, Code2, FileText } from 'lucide-react';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps?: number;
}

const steps = [
  { step: 1, label: 'Education', icon: GraduationCap },
  { step: 2, label: 'Preferences', icon: Briefcase },
  { step: 3, label: 'Skills', icon: Code2 },
  { step: 4, label: 'About', icon: FileText },
];

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  totalSteps = 4,
}) => {
  const progressPercentage = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Mobile Simple Progress Bar */}
      <div className="onboarding-mobile-progress" style={{ display: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {steps[currentStep - 1]?.label || 'Profile Setup'}
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            Step {currentStep} of {totalSteps}
          </span>
        </div>
        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div
            style={{
              width: `${(currentStep / totalSteps) * 100}%`,
              height: '100%',
              backgroundColor: 'var(--color-primary)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Desktop Stepper */}
      <div className="onboarding-desktop-stepper" style={{ position: 'relative' }}>
        {/* Background track line */}
        <div
          style={{
            position: 'absolute',
            top: '18px',
            left: '20px',
            right: '20px',
            height: '3px',
            backgroundColor: 'var(--color-border)',
            zIndex: 0,
          }}
        >
          {/* Active progress fill */}
          <div
            style={{
              height: '100%',
              width: `${progressPercentage}%`,
              backgroundColor: 'var(--color-primary)',
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          {steps.map((s) => {
            const isCompleted = s.step < currentStep;
            const isCurrent = s.step === currentStep;
            const Icon = s.icon;

            return (
              <div
                key={s.step}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isCompleted
                      ? 'var(--color-primary)'
                      : isCurrent
                      ? 'var(--color-primary)'
                      : 'var(--color-surface)',
                    border: `2px solid ${
                      isCompleted || isCurrent ? 'var(--color-primary)' : 'var(--color-border)'
                    }`,
                    color: isCompleted || isCurrent ? '#ffffff' : 'var(--color-text-secondary)',
                    boxShadow: isCurrent
                      ? '0 0 0 4px rgba(79, 70, 229, 0.15)'
                      : 'var(--shadow-xs)',
                    transition: 'all 0.25s ease',
                  }}
                >
                  {isCompleted ? (
                    <Check size={18} strokeWidth={3} />
                  ) : (
                    <Icon size={18} strokeWidth={isCurrent ? 2.5 : 2} />
                  )}
                </div>

                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent
                      ? 'var(--color-primary)'
                      : isCompleted
                      ? 'var(--color-text-primary)'
                      : 'var(--color-text-secondary)',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
