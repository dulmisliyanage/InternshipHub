import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Calendar,
  Banknote,
  ArrowRight,
  Sparkles,
  Building2,
} from 'lucide-react';
import { CompanyLogo } from '../../company/CompanyLogo';
import type { DiscoveryInternshipItem } from '../../../types/internshipDiscovery';
import {
  formatDeadlineDate,
  formatAllowance,
  getWorkTypeBadge,
} from '../../../utils/internshipFormatters';

interface StudentInternshipCardProps {
  internship: DiscoveryInternshipItem;
}

export const StudentInternshipCard: React.FC<StudentInternshipCardProps> = ({ internship }) => {
  const location = useLocation();
  const companyName = internship.company?.companyName || 'Verified Company';
  const locationText = internship.location || internship.company?.location || 'Sri Lanka';
  const workTypeConfig = getWorkTypeBadge(internship.workType);
  const allowanceText = formatAllowance(
    internship.allowanceMin,
    internship.allowanceMax,
    internship.currency || 'LKR'
  );
  const deadlineText = formatDeadlineDate(internship.applicationDeadline);

  // Group and preview skills (show up to 4-5 total with distinct Required vs Preferred badges)
  const skills = internship.skills || [];
  const previewSkills = skills.slice(0, 4);
  const remainingSkillsCount = skills.length - previewSkills.length;

  return (
    <article
      id={`internship-card-${internship.id}`}
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '1.25rem',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.borderColor = 'var(--color-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.borderColor = 'var(--color-border)';
      }}
    >
      {/* Top Header: Company Logo, Info & Work Type Badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flex: 1, minWidth: 0 }}>
          <CompanyLogo
            src={internship.company?.logoUrl}
            name={companyName}
            size="md"
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={internship.title}
            >
              {internship.title}
            </h3>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                marginTop: '0.25rem',
                color: 'var(--color-text-secondary)',
                fontSize: '0.875rem',
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              <Building2 size={14} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{companyName}</span>
              {internship.category && (
                <>
                  <span style={{ opacity: 0.6 }}>•</span>
                  <span style={{ opacity: 0.85, fontSize: '0.8rem' }}>{internship.category}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Work Type Pill */}
        <span
          style={{
            flexShrink: 0,
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor: workTypeConfig.bg,
            color: workTypeConfig.color,
            border: `1px solid ${workTypeConfig.border}`,
            letterSpacing: '0.02em',
          }}
        >
          {workTypeConfig.label}
        </span>
      </div>

      {/* Metadata Row: Location, Duration, Allowance, Deadline */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.75rem 1rem',
          padding: '0.75rem 0.85rem',
          backgroundColor: 'rgba(248, 250, 252, 0.7)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          fontSize: '0.825rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-secondary)' }}>
          <MapPin size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
          <span style={{ color: 'var(--color-text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {locationText}
          </span>
        </div>

        {internship.duration && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-secondary)' }}>
            <Clock size={14} style={{ color: '#0284C7', flexShrink: 0 }} />
            <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
              {internship.duration}
            </span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-secondary)' }}>
          <Banknote size={14} style={{ color: '#059669', flexShrink: 0 }} />
          <span
            style={{
              color: 'var(--color-text-primary)',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {allowanceText}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-secondary)' }}>
          <Calendar size={14} style={{ color: '#D97706', flexShrink: 0 }} />
          <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
            Ends <strong style={{ color: 'var(--color-text-primary)' }}>{deadlineText}</strong>
          </span>
        </div>
      </div>

      {/* Skills Badges Preview */}
      <div>
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--color-text-secondary)',
            marginBottom: '0.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          <Sparkles size={12} style={{ color: 'var(--color-primary)' }} />
          <span>Skills Required & Preferred</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', minHeight: '26px' }}>
          {previewSkills.length > 0 ? (
            <>
              {previewSkills.map((s) => {
                const isRequired = s.type === 'REQUIRED';
                return (
                  <span
                    key={s.skillId}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: isRequired ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.08)',
                      color: isRequired ? '#065F46' : '#1D4ED8',
                      border: `1px solid ${isRequired ? 'rgba(16, 185, 129, 0.25)' : 'rgba(59, 130, 246, 0.2)'}`,
                    }}
                    title={`${s.name} (${isRequired ? 'Required' : 'Preferred'})`}
                  >
                    <span>{s.name}</span>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        opacity: 0.8,
                        textTransform: 'uppercase',
                      }}
                    >
                      {isRequired ? 'Req' : 'Pref'}
                    </span>
                  </span>
                );
              })}
              {remainingSkillsCount > 0 && (
                <span
                  style={{
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-secondary)',
                    border: '1px dashed var(--color-border)',
                  }}
                >
                  +{remainingSkillsCount} more
                </span>
              )}
            </>
          ) : (
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
              No specific skills listed
            </span>
          )}
        </div>
      </div>

      {/* Card Action Footer: View Details CTA */}
      <div
        style={{
          borderTop: '1px solid var(--color-border)',
          paddingTop: '0.875rem',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <Link
          to={`/student/internships/${internship.id}`}
          state={{ from: location.pathname + location.search }}
          id={`view-details-${internship.id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 700,
            color: 'var(--color-primary)',
            padding: '0.45rem 0.85rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-primary-light)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary)';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-light)';
            e.currentTarget.style.color = 'var(--color-primary)';
          }}
        >
          <span>View Details</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
};

export const StudentInternshipCardSkeleton: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        boxShadow: 'var(--shadow-sm)',
        opacity: 0.7,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-border)',
            animation: 'pulse 1.5s infinite ease-in-out',
          }}
        />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div
            style={{
              height: 18,
              width: '65%',
              backgroundColor: 'var(--color-border)',
              borderRadius: 'var(--radius-md)',
              animation: 'pulse 1.5s infinite ease-in-out',
            }}
          />
          <div
            style={{
              height: 14,
              width: '40%',
              backgroundColor: 'var(--color-border)',
              borderRadius: 'var(--radius-md)',
              animation: 'pulse 1.5s infinite ease-in-out',
            }}
          />
        </div>
      </div>

      <div
        style={{
          height: 60,
          backgroundColor: 'rgba(241, 245, 249, 0.6)',
          borderRadius: 'var(--radius-lg)',
          animation: 'pulse 1.5s infinite ease-in-out',
        }}
      />

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div
          style={{
            height: 24,
            width: 70,
            backgroundColor: 'var(--color-border)',
            borderRadius: 'var(--radius-full)',
            animation: 'pulse 1.5s infinite ease-in-out',
          }}
        />
        <div
          style={{
            height: 24,
            width: 80,
            backgroundColor: 'var(--color-border)',
            borderRadius: 'var(--radius-full)',
            animation: 'pulse 1.5s infinite ease-in-out',
          }}
        />
        <div
          style={{
            height: 24,
            width: 60,
            backgroundColor: 'var(--color-border)',
            borderRadius: 'var(--radius-full)',
            animation: 'pulse 1.5s infinite ease-in-out',
          }}
        />
      </div>

      <div
        style={{
          borderTop: '1px solid var(--color-border)',
          paddingTop: '0.875rem',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <div
          style={{
            height: 32,
            width: 110,
            backgroundColor: 'var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            animation: 'pulse 1.5s infinite ease-in-out',
          }}
        />
      </div>
    </div>
  );
};
