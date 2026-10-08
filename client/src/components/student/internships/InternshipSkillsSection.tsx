import React from 'react';
import { CheckCircle2, Star, Sparkles } from 'lucide-react';
import type { DiscoverySkill } from '../../../types/internshipDiscovery';

interface InternshipSkillsSectionProps {
  skills: DiscoverySkill[];
}

export const InternshipSkillsSection: React.FC<InternshipSkillsSectionProps> = ({ skills }) => {
  const requiredSkills = skills.filter((s) => s.type === 'REQUIRED');
  const preferredSkills = skills.filter((s) => s.type === 'PREFERRED');

  return (
    <section
      aria-label="Internship Skills Requirements"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '2rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.25rem' }}>
        <Sparkles size={18} style={{ color: 'var(--color-primary)' }} />
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.15rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            margin: 0,
          }}
        >
          Required & Preferred Skills
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Required Skills Subsection */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
            <CheckCircle2 size={16} style={{ color: '#059669' }} />
            <h3
              style={{
                fontSize: '0.925rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
            >
              Required Skills ({requiredSkills.length})
            </h3>
          </div>

          {requiredSkills.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {requiredSkills.map((s) => (
                <div
                  key={s.skillId}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#065F46',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  <span>{s.name}</span>
                  {s.category && (
                    <span style={{ fontSize: '0.75rem', opacity: 0.75 }}>
                      • {s.category}
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      backgroundColor: '#059669',
                      color: '#FFFFFF',
                      padding: '0.1rem 0.4rem',
                      borderRadius: 'var(--radius-full)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Req
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.875rem', fontStyle: 'italic' }}>
              No specific required skills listed.
            </p>
          )}
        </div>

        {/* Preferred Skills Subsection */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
            <Star size={16} style={{ color: '#2563EB' }} />
            <h3
              style={{
                fontSize: '0.925rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
            >
              Preferred / Nice-to-Have Skills ({preferredSkills.length})
            </h3>
          </div>

          {preferredSkills.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {preferredSkills.map((s) => (
                <div
                  key={s.skillId}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    color: '#1D4ED8',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  <span>{s.name}</span>
                  {s.category && (
                    <span style={{ fontSize: '0.75rem', opacity: 0.75 }}>
                      • {s.category}
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      padding: '0.1rem 0.4rem',
                      borderRadius: 'var(--radius-full)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Pref
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.875rem', fontStyle: 'italic' }}>
              No additional preferred skills specified.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
