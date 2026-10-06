import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Users,
  Calendar,
  Banknote,
  ArrowRight,
} from 'lucide-react';
import type { Internship, InternshipStatus } from '../../types/internship';

interface CompanyInternshipCardProps {
  internship: Internship;
}

export const formatDeadlineDate = (dateStr?: string | null): string => {
  if (!dateStr) return 'No deadline set';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Invalid date';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
};

export const formatUpdatedDate = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
};

const formatAllowance = (
  min?: number | null,
  max?: number | null,
  currency: string = 'LKR'
): string => {
  if (min == null && max == null) return 'Unpaid / Undisclosed';
  if (min != null && max != null && min === max) {
    return `${currency} ${min.toLocaleString()}/mo`;
  }
  if (min != null && max != null) {
    return `${currency} ${min.toLocaleString()} – ${max.toLocaleString()}/mo`;
  }
  if (min != null) {
    return `From ${currency} ${min.toLocaleString()}/mo`;
  }
  if (max != null) {
    return `Up to ${currency} ${max.toLocaleString()}/mo`;
  }
  return 'Unpaid / Undisclosed';
};

const formatWorkType = (workType: string): string => {
  switch (workType) {
    case 'REMOTE':
      return 'Remote';
    case 'HYBRID':
      return 'Hybrid';
    case 'ONSITE':
      return 'On-site';
    default:
      return workType;
  }
};

const getStatusBadgeStyle = (status: InternshipStatus) => {
  switch (status) {
    case 'PUBLISHED':
      return {
        bg: '#ECFDF5',
        color: '#065F46',
        border: '#A7F3D0',
        dot: '#10B981',
        label: 'PUBLISHED',
      };
    case 'DRAFT':
      return {
        bg: '#F1F5F9',
        color: '#475569',
        border: '#CBD5E1',
        dot: '#94A3B8',
        label: 'DRAFT',
      };
    case 'CLOSED':
      return {
        bg: '#FFFBEB',
        color: '#92400E',
        border: '#FDE68A',
        dot: '#F59E0B',
        label: 'CLOSED',
      };
    case 'ARCHIVED':
      return {
        bg: '#F8FAFC',
        color: '#64748B',
        border: '#E2E8F0',
        dot: '#94A3B8',
        label: 'ARCHIVED',
      };
    default:
      return {
        bg: '#F1F5F9',
        color: '#475569',
        border: '#CBD5E1',
        dot: '#94A3B8',
        label: status,
      };
  }
};

export const CompanyInternshipCard: React.FC<CompanyInternshipCardProps> = ({ internship }) => {
  const badge = getStatusBadgeStyle(internship.status);

  const requiredCount = internship.skills.filter((s) => s.type === 'REQUIRED').length;
  const preferredCount = internship.skills.filter((s) => s.type === 'PREFERRED').length;

  const previewSkills = internship.skills.slice(0, 4);
  const remainingSkillsCount = Math.max(0, internship.skills.length - 4);

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-xs)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.borderColor = 'var(--color-primary-light)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
        e.currentTarget.style.borderColor = 'var(--color-border)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Header Row: Title, Category, Status Badge */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {internship.title}
            </h3>
            {internship.category && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                  backgroundColor: 'var(--color-primary-light)',
                  padding: '0.15rem 0.55rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {internship.category}
              </span>
            )}
          </div>

          {/* Subtitle / Meta Tags */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)',
              flexWrap: 'wrap',
              marginTop: '0.35rem',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 500 }}>
              <MapPin size={14} style={{ color: 'var(--color-text-disabled)' }} />
              {formatWorkType(internship.workType)}
              {internship.location ? ` • ${internship.location}` : ''}
            </span>

            {internship.duration && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 500 }}>
                <Clock size={14} style={{ color: 'var(--color-text-disabled)' }} />
                {internship.duration}
              </span>
            )}

            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 500 }}>
              <Users size={14} style={{ color: 'var(--color-text-disabled)' }} />
              {internship.positions} {internship.positions === 1 ? 'position' : 'positions'}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.3rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: badge.bg,
            border: `1px solid ${badge.border}`,
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: badge.color,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: badge.dot,
            }}
          />
          {badge.label}
        </div>
      </div>

      {/* Middle Section: Compensation & Required vs Preferred Skills */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          padding: '0.85rem 1rem',
          backgroundColor: 'var(--color-background)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>
            <Banknote size={15} style={{ color: 'var(--color-primary)' }} />
            <span>{formatAllowance(internship.allowanceMin, internship.allowanceMax, internship.currency || 'LKR')}</span>
          </div>

          {/* Skill Breakdown Counts */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem' }}>
            <span style={{ color: '#047857', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              {requiredCount} Required
            </span>
            <span style={{ color: '#6366F1', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#818CF8' }} />
              {preferredCount} Preferred
            </span>
          </div>
        </div>

        {/* Skill Chips Preview */}
        {internship.skills.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            {previewSkills.map((s) => {
              const isReq = s.type === 'REQUIRED';
              return (
                <span
                  key={s.id}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isReq ? '#EFF6FF' : '#F8FAFC',
                    color: isReq ? '#1D4ED8' : 'var(--color-text-secondary)',
                    border: isReq ? '1px solid #BFDBFE' : '1px solid var(--color-border)',
                  }}
                  title={`${s.name} (${s.type})`}
                >
                  {s.name}
                  {isReq && <span style={{ marginLeft: '0.25rem', fontSize: '0.65rem', opacity: 0.8 }}>*</span>}
                </span>
              );
            })}
            {remainingSkillsCount > 0 && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                  padding: '0.2rem 0.45rem',
                }}
              >
                +{remainingSkillsCount} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Row: Deadline, Last Updated, View Action */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          borderTop: '1px solid var(--color-border)',
          paddingTop: '0.85rem',
          marginTop: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 500 }}>
            <Calendar size={14} style={{ color: 'var(--color-text-disabled)' }} />
            <span>Deadline: <strong style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{formatDeadlineDate(internship.applicationDeadline)}</strong></span>
          </span>

          {internship.updatedAt && (
            <span style={{ fontSize: '0.785rem', color: 'var(--color-text-disabled)' }}>
              Updated {formatUpdatedDate(internship.updatedAt)}
            </span>
          )}
        </div>

        {/* View Details Link */}
        <Link
          to={`/company/internships/${internship.id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-primary)',
            textDecoration: 'none',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary-light)',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#E0E7FF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-light)';
          }}
        >
          <span>View</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};
