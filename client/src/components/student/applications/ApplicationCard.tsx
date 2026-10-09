import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileCheck, ArrowRight, MapPin } from 'lucide-react';
import { CompanyLogo } from '../../company/CompanyLogo';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';
import { getWorkTypeBadge } from '../../../utils/internshipFormatters';
import type { ApplicationItem } from '../../../types/application';

interface ApplicationCardProps {
  application: ApplicationItem;
  fromUrl?: string;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  fromUrl = '/student/applications',
}) => {
  const { id, status, appliedAt, hasCv, internship } = application;

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(appliedAt));

  const workTypeInfo = getWorkTypeBadge(internship.workType);

  return (
    <div
      className="ih-application-card"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-xs)',
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.borderColor = 'var(--color-primary-light)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
        e.currentTarget.style.borderColor = 'var(--color-border)';
      }}
    >
      {/* Top Header: Company Info + Status Badge */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '240px' }}>
          <CompanyLogo
            src={internship.company?.logoUrl}
            name={internship.company?.companyName || 'Company'}
            size={52}
          />
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '1.125rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                lineHeight: 1.3,
              }}
            >
              {internship.title}
            </h3>
            <p
              style={{
                margin: '0.2rem 0 0 0',
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary)',
                fontWeight: 500,
              }}
            >
              {internship.company?.companyName || 'Company'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ApplicationStatusBadge status={status} size="md" />
        </div>
      </div>

      {/* Middle Attributes: Date, Work Type, CV status, Location */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem',
          flexWrap: 'wrap',
          paddingTop: '0.5rem',
          borderTop: '1px solid var(--color-border-subtle)',
          fontSize: '0.8125rem',
          color: 'var(--color-text-secondary)',
        }}
      >
        {/* Applied Date */}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Calendar size={14} style={{ color: 'var(--color-text-muted)' }} />
          <span>Applied {formattedDate}</span>
        </span>

        {/* Work Arrangement */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.15rem 0.5rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: workTypeInfo.bg,
            color: workTypeInfo.color,
            border: `1px solid ${workTypeInfo.border}`,
            fontWeight: 500,
            fontSize: '0.75rem',
          }}
        >
          {workTypeInfo.label}
        </span>

        {/* Location if available */}
        {internship.location && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <MapPin size={13} style={{ color: 'var(--color-text-muted)' }} />
            <span>{internship.location}</span>
          </span>
        )}

        {/* CV Indicator */}
        {hasCv && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              color: '#059669',
              backgroundColor: '#ECFDF5',
              padding: '0.15rem 0.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #A7F3D0',
              fontWeight: 500,
              fontSize: '0.75rem',
            }}
          >
            <FileCheck size={13} />
            <span>CV attached</span>
          </span>
        )}
      </div>

      {/* Bottom Action: View Details link */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginTop: 'auto',
          paddingTop: '0.5rem',
        }}
      >
        <Link
          to={`/student/applications/${id}`}
          state={{ from: fromUrl }}
          id={`view-application-${id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-primary)',
            textDecoration: 'none',
            padding: '0.45rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary-light)',
            transition: 'all var(--transition-fast)',
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
    </div>
  );
};
