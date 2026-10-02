import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronDown, ChevronUp, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import type { ProfileCompletion } from '../../types/profile';

export interface ProfileCompletionCardProps {
  completion?: ProfileCompletion | null;
  title?: string;
  description?: string;
  editPath: string;
  ctaLabel?: string;
  variant?: 'full' | 'compact';
  style?: React.CSSProperties;
}

export const ProfileCompletionCard: React.FC<ProfileCompletionCardProps> = ({
  completion,
  title = 'Profile Completion',
  description,
  editPath,
  ctaLabel = 'Complete Profile',
  variant = 'full',
  style,
}) => {
  const [showAllMissing, setShowAllMissing] = useState(false);

  if (!completion) return null;

  const { percentage, missing = [] } = completion;
  const isComplete = percentage >= 100;

  // Determine progress bar fill color
  let progressColor = 'var(--color-primary)';
  if (isComplete) {
    progressColor = 'var(--color-success)';
  } else if (percentage < 50) {
    progressColor = '#F59E0B'; // Amber
  }

  // -------------------------------------------------------------
  // Compact Variant (Ideal for Dashboard)
  // -------------------------------------------------------------
  if (variant === 'compact') {
    return (
      <div
        className="ih-profile-completion-compact"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          ...style,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--color-text-secondary)',
                display: 'block',
                marginBottom: '0.2rem',
              }}
            >
              {title}
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: isComplete ? 'var(--color-success)' : 'var(--color-text-primary)',
                }}
              >
                {percentage}%
              </span>
              {isComplete && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--color-success)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  Complete
                </span>
              )}
            </div>
          </div>

          {!isComplete && (
            <Link to={editPath} style={{ textDecoration: 'none' }}>
              <Button size="sm" variant="outline">
                <span>{ctaLabel}</span>
              </Button>
            </Link>
          )}
        </div>

        {/* Progress Bar with accessibility */}
        <div
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${title}: ${percentage}%`}
          style={{
            width: '100%',
            height: '8px',
            backgroundColor: 'var(--color-background)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            border: '1px solid var(--color-border)',
          }}
        >
          <div
            style={{
              width: `${Math.min(100, Math.max(0, percentage))}%`,
              height: '100%',
              backgroundColor: progressColor,
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.4s ease',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem' }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>
            {isComplete ? (
              <span style={{ color: 'var(--color-success)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 size={14} /> Profile fully detailed
              </span>
            ) : (
              `${missing.length} recommended item${missing.length === 1 ? '' : 's'} remaining`
            )}
          </span>

          {!isComplete && (
            <Link
              to={editPath}
              style={{
                color: 'var(--color-primary)',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <span>Improve</span>
              <ArrowRight size={13} />
            </Link>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Full Variant (For Profile View Pages)
  // -------------------------------------------------------------
  const visibleMissing = showAllMissing ? missing : missing.slice(0, 3);
  const hiddenCount = missing.length - 3;

  return (
    <div
      className="ih-profile-completion-card"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem 2.5rem',
        boxShadow: 'var(--shadow-sm)',
        ...style,
      }}
    >
      {/* Top Header & Percentage */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
            >
              {title}
            </h2>
            {isComplete && <Sparkles size={16} color="var(--color-success)" />}
          </div>
          {description && (
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              {description}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.85rem',
              fontWeight: 800,
              color: isComplete ? 'var(--color-success)' : 'var(--color-text-primary)',
              lineHeight: 1,
            }}
          >
            {percentage}%
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>complete</span>
        </div>
      </div>

      {/* Progress Bar with Accessible Semantics */}
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${title}: ${percentage}%`}
        style={{
          width: '100%',
          height: '10px',
          backgroundColor: 'var(--color-background)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            width: `${Math.min(100, Math.max(0, percentage))}%`,
            height: '100%',
            backgroundColor: progressColor,
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      {/* 100% State */}
      {isComplete ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.25rem',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-lg)',
            color: '#065F46',
            fontSize: '0.925rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={20} color="var(--color-success)" />
          <span>Profile complete! Your profile has all the recommended information to stand out.</span>
        </div>
      ) : (
        /* Actionable Missing Items Section */
        <div>
          <span
            style={{
              display: 'block',
              fontSize: '0.825rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--color-text-secondary)',
              marginBottom: '0.85rem',
            }}
          >
            Recommended next steps
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
            {visibleMissing.map((item) => (
              <div
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  fontSize: '0.9rem',
                  color: 'var(--color-text-primary)',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-border)',
                    border: '2px solid var(--color-primary)',
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1 }}>{item.label}</span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--color-text-secondary)',
                    backgroundColor: 'var(--color-background)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  +{item.weight}%
                </span>
              </div>
            ))}

            {hiddenCount > 0 && (
              <button
                type="button"
                onClick={() => setShowAllMissing(!showAllMissing)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.25rem 0',
                  marginTop: '0.2rem',
                }}
              >
                <span>
                  {showAllMissing ? 'Show fewer recommendations' : `+ ${hiddenCount} more recommendations`}
                </span>
                {showAllMissing ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link to={editPath} style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="md" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                <span>{ctaLabel}</span>
                <ArrowRight size={15} />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
