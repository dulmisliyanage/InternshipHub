import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  MinusCircle,
  RefreshCw,
  Award,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import type { DiscoverySkill } from '../../../types/internshipDiscovery';
import type { StudentSkill } from '../../../types/student';
import { compareSkills } from '../../../utils/skillComparison';

interface InternshipSkillComparisonProps {
  internshipSkills: DiscoverySkill[];
  studentSkills: StudentSkill[] | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export const InternshipSkillComparison: React.FC<InternshipSkillComparisonProps> = ({
  internshipSkills,
  studentSkills,
  isLoading,
  error,
  onRetry,
}) => {
  // 1. Loading State (Independent skeleton, does not block details page)
  if (isLoading) {
    return (
      <section
        id="skill-comparison-loading"
        aria-label="Skill Compatibility Loading"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '1.5rem',
          opacity: 0.8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-border)',
              animation: 'pulse 1.5s infinite ease-in-out',
            }}
          />
          <div
            style={{
              width: 200,
              height: 20,
              backgroundColor: 'var(--color-border)',
              borderRadius: 'var(--radius-md)',
              animation: 'pulse 1.5s infinite ease-in-out',
            }}
          />
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: 90,
                backgroundColor: 'rgba(241, 245, 249, 0.6)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                animation: 'pulse 1.5s infinite ease-in-out',
              }}
            />
          ))}
        </div>
        <div
          style={{
            height: 120,
            backgroundColor: 'rgba(241, 245, 249, 0.4)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            animation: 'pulse 1.5s infinite ease-in-out',
          }}
        />
      </section>
    );
  }

  // 2. Error State (Never display misleading 0% when API fails)
  if (error) {
    return (
      <section
        id="skill-comparison-error"
        aria-label="Skill Compatibility Error"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid #FECACA',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertCircle size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: '0 0 0.35rem 0',
              }}
            >
              Unable to load your skill compatibility
            </h3>
            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: '0.875rem',
                margin: '0 0 1rem 0',
                lineHeight: 1.5,
              }}
            >
              {error}
            </p>
            <Button
              id="retry-skill-comparison-btn"
              variant="outline"
              size="sm"
              onClick={onRetry}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <RefreshCw size={14} />
              <span>Retry</span>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // 3. Incomplete Profile State (0 profile skills)
  if (!studentSkills || studentSkills.length === 0) {
    return (
      <section
        id="skill-comparison-empty"
        aria-label="Profile Skills Incomplete"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#EEF2FF',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Award size={24} />
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  margin: 0,
                }}
              >
                Your Skill Compatibility
              </h2>
            </div>
            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: '0.9rem',
                margin: '0 0 1rem 0',
                lineHeight: 1.5,
              }}
            >
              You haven't added any skills to your profile yet. Add your technical and domain skills to see which requirements you already meet and what you can develop for this role.
            </p>
            <Link to="/student/profile/edit" style={{ textDecoration: 'none' }}>
              <Button
                id="add-profile-skills-btn"
                variant="primary"
                size="sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span>Add Skills to Profile</span>
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // 4. Comparison Evaluation (Pure standardized ID comparison)
  const result = compareSkills(internshipSkills, studentSkills);

  // Determine coverage color theme
  let coverageBarColor = '#94A3B8';
  if (result.coveragePercentage !== null) {
    if (result.coveragePercentage >= 80) {
      coverageBarColor = '#059669';
    } else if (result.coveragePercentage >= 50) {
      coverageBarColor = 'var(--color-primary)';
    } else {
      coverageBarColor = '#D97706';
    }
  }

  return (
    <section
      id="skill-comparison-section"
      aria-label="Your Skill Compatibility"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.75rem',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '1.5rem',
      }}
    >
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={20} style={{ color: 'var(--color-primary)' }} />
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
            >
              Your Skill Compatibility
            </h2>
            <p
              style={{
                fontSize: '0.825rem',
                color: 'var(--color-text-secondary)',
                margin: '0.15rem 0 0 0',
              }}
            >
              Compare your profile skills with this internship's standardized requirements.
            </p>
          </div>
        </div>

        <Link
          to="/student/profile/edit"
          style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--color-primary)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          <span>Update My Skills</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* 3-Card Summary Metric Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        {/* Metric 1: Required Skills Matched */}
        <div
          id="stat-required-matched"
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'rgba(236, 253, 245, 0.7)',
            border: '1px solid rgba(167, 243, 208, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.775rem',
                fontWeight: 700,
                color: '#065F46',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Required Skills Matched
            </span>
            <CheckCircle2 size={18} style={{ color: '#059669' }} />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.6rem',
                fontWeight: 800,
                color: '#064E3B',
                lineHeight: 1.1,
              }}
            >
              {result.totalRequired > 0
                ? `${result.matchedRequiredCount} / ${result.totalRequired}`
                : '0 / 0'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#047857', marginTop: '0.25rem', fontWeight: 500 }}>
              {result.matchedRequiredCount === 1
                ? '1 skill matched'
                : `${result.matchedRequiredCount} skills matched`}
            </div>
          </div>
        </div>

        {/* Metric 2: Required Skills Missing */}
        <div
          id="stat-required-missing"
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor:
              result.missingRequiredCount === 0
                ? 'rgba(240, 253, 244, 0.7)'
                : 'rgba(254, 243, 199, 0.6)',
            border:
              result.missingRequiredCount === 0
                ? '1px solid rgba(187, 247, 208, 0.8)'
                : '1px solid rgba(253, 230, 138, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.775rem',
                fontWeight: 700,
                color: result.missingRequiredCount === 0 ? '#15803D' : '#92400E',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Required Skills Missing
            </span>
            <AlertCircle
              size={18}
              style={{
                color: result.missingRequiredCount === 0 ? '#16A34A' : '#D97706',
              }}
            />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.6rem',
                fontWeight: 800,
                color: result.missingRequiredCount === 0 ? '#14532D' : '#78350F',
                lineHeight: 1.1,
              }}
            >
              {result.missingRequiredCount}
            </div>
            <div
              style={{
                fontSize: '0.8rem',
                color: result.missingRequiredCount === 0 ? '#15803D' : '#B45309',
                marginTop: '0.25rem',
                fontWeight: 500,
              }}
            >
              {result.missingRequiredCount === 0
                ? 'All required skills met!'
                : result.missingRequiredCount === 1
                ? '1 skill to develop'
                : `${result.missingRequiredCount} skills to develop`}
            </div>
          </div>
        </div>

        {/* Metric 3: Required Skill Coverage */}
        <div
          id="stat-required-coverage"
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'rgba(248, 250, 252, 0.8)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.775rem',
                fontWeight: 700,
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Required Skill Coverage
            </span>
            <TrendingUp size={18} style={{ color: coverageBarColor }} />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.6rem',
                fontWeight: 800,
                color: 'var(--color-text-primary)',
                lineHeight: 1.1,
              }}
            >
              {result.coverageDisplay}
            </div>

            {result.coveragePercentage !== null ? (
              <div style={{ marginTop: '0.5rem' }}>
                <div
                  style={{
                    height: 6,
                    width: '100%',
                    backgroundColor: 'var(--color-border)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${result.coveragePercentage}%`,
                      backgroundColor: coverageBarColor,
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.775rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                No required skills listed
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Skills Match Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Required Skills Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem' }}>
            <CheckCircle2 size={16} style={{ color: '#059669' }} />
            <h3
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
            >
              Required Skills ({result.totalRequired})
            </h3>
          </div>

          {result.allRequiredSkills.length > 0 ? (
            <div
              id="comparison-required-skills-list"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '0.75rem',
              }}
            >
              {result.allRequiredSkills.map((skill) => (
                <div
                  key={skill.skillId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: skill.isMatched
                      ? 'rgba(236, 253, 245, 0.65)'
                      : 'rgba(254, 243, 199, 0.45)',
                    border: skill.isMatched
                      ? '1px solid rgba(167, 243, 208, 0.8)'
                      : '1px solid rgba(253, 230, 138, 0.8)',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1, marginRight: '0.5rem' }}>
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={skill.name}
                    >
                      {skill.name}
                    </span>
                    {skill.category && (
                      <span
                        style={{
                          display: 'block',
                          fontSize: '0.725rem',
                          color: 'var(--color-text-secondary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {skill.category}
                      </span>
                    )}
                  </div>

                  {skill.isMatched ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#065F46',
                        backgroundColor: '#D1FAE5',
                        border: '1px solid #A7F3D0',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        flexShrink: 0,
                      }}
                    >
                      <CheckCircle2 size={13} />
                      <span>Matched</span>
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#92400E',
                        backgroundColor: '#FEF3C7',
                        border: '1px solid #FDE68A',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        flexShrink: 0,
                      }}
                    >
                      <AlertCircle size={13} />
                      <span>Missing</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p
              style={{
                margin: 0,
                color: 'var(--color-text-secondary)',
                fontSize: '0.875rem',
                fontStyle: 'italic',
              }}
            >
              No specific required skills listed for this opportunity.
            </p>
          )}
        </div>

        {/* Preferred Skills Section */}
        {result.allPreferredSkills.length > 0 && (
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
            <div style={{ marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Sparkles size={16} style={{ color: '#2563EB' }} />
                <h3
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    margin: 0,
                  }}
                >
                  Preferred Skills ({result.totalPreferred})
                </h3>
              </div>
              <p
                style={{
                  fontSize: '0.775rem',
                  color: 'var(--color-text-secondary)',
                  margin: '0.2rem 0 0 0',
                }}
              >
                Preferred skills are nice to have. Missing a preferred skill does not disqualify you.
              </p>
            </div>

            <div
              id="comparison-preferred-skills-list"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '0.75rem',
              }}
            >
              {result.allPreferredSkills.map((skill) => (
                <div
                  key={skill.skillId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: skill.isMatched
                      ? 'rgba(239, 246, 255, 0.7)'
                      : 'rgba(248, 250, 252, 0.75)',
                    border: skill.isMatched
                      ? '1px solid rgba(191, 219, 254, 0.8)'
                      : '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1, marginRight: '0.5rem' }}>
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={skill.name}
                    >
                      {skill.name}
                    </span>
                    {skill.category && (
                      <span
                        style={{
                          display: 'block',
                          fontSize: '0.725rem',
                          color: 'var(--color-text-secondary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {skill.category}
                      </span>
                    )}
                  </div>

                  {skill.isMatched ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#1D4ED8',
                        backgroundColor: '#DBEAFE',
                        border: '1px solid #BFDBFE',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        flexShrink: 0,
                      }}
                    >
                      <CheckCircle2 size={13} />
                      <span>Matched</span>
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--color-text-secondary)',
                        backgroundColor: 'rgba(241, 245, 249, 0.8)',
                        border: '1px solid var(--color-border)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        flexShrink: 0,
                      }}
                    >
                      <MinusCircle size={13} />
                      <span>Missing</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
