import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  MapPin,
  Calendar,
  FileCheck,
  ArrowRight,
  User,
} from 'lucide-react';
import { ApplicationStatusBadge } from '../../student/applications/ApplicationStatusBadge';
import type { CompanyApplicantItem } from '../../../types/companyApplicant';

interface ApplicantCardProps {
  applicant: CompanyApplicantItem;
}

export const ApplicantCard: React.FC<ApplicantCardProps> = ({ applicant }) => {
  const location = useLocation();

  const formatAppliedDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  };

  const student = applicant.student;
  const initial = student.name ? student.name.charAt(0).toUpperCase() : 'A';

  return (
    <div
      className="ih-applicant-card"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.borderColor = 'var(--color-border-hover, #CBD5E1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.borderColor = 'var(--color-border)';
      }}
    >
      {/* Header: Student Info + Status Badge */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Avatar or Initials Circle */}
          {student.profileImage ? (
            <img
              src={student.profileImage}
              alt={student.name}
              style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1px solid var(--color-border)',
              }}
            />
          ) : (
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-light, #EFF6FF)',
                color: 'var(--color-primary, #2563EB)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.15rem',
                border: '1px solid #BFDBFE',
                flexShrink: 0,
              }}
            >
              {initial || <User size={20} />}
            </div>
          )}

          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
              }}
            >
              {student.name}
            </h3>
            <p
              style={{
                margin: '0.2rem 0 0 0',
                fontSize: '0.825rem',
                color: 'var(--color-text-secondary)',
                fontWeight: 500,
              }}
            >
              {student.degree || student.fieldOfStudy
                ? `${student.degree || ''}${student.degree && student.currentYear ? ` · Year ${student.currentYear}` : ''}`
                : student.email}
            </p>
          </div>
        </div>

        <ApplicationStatusBadge status={applicant.status} size="sm" />
      </div>

      {/* Profile Details Snippet */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.85rem 1.25rem',
          fontSize: '0.8125rem',
          color: 'var(--color-text-secondary)',
        }}
      >
        {student.university && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <GraduationCap size={15} style={{ color: 'var(--color-text-muted)' }} />
            <span>{student.university}</span>
          </span>
        )}

        {student.location && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <MapPin size={15} style={{ color: 'var(--color-text-muted)' }} />
            <span>{student.location}</span>
          </span>
        )}

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Calendar size={15} style={{ color: 'var(--color-text-muted)' }} />
          <span>Applied {formatAppliedDate(applicant.appliedAt)}</span>
        </span>

        {applicant.hasCv && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              color: '#059669',
              fontWeight: 600,
            }}
          >
            <FileCheck size={15} />
            <span>CV Attached</span>
          </span>
        )}
      </div>

      {/* Skills Badges */}
      {student.skills && student.skills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {student.skills.slice(0, 5).map((skill) => (
            <span
              key={skill.id}
              style={{
                fontSize: '0.725rem',
                fontWeight: 600,
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#F1F5F9',
                color: 'var(--color-text-secondary)',
                border: '1px solid #E2E8F0',
              }}
              title={skill.proficiency ? `Proficiency: ${skill.proficiency}` : skill.name}
            >
              {skill.name}
            </span>
          ))}
          {student.skills.length > 5 && (
            <span
              style={{
                fontSize: '0.725rem',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                padding: '0.2rem 0.35rem',
              }}
            >
              +{student.skills.length - 5} more
            </span>
          )}
        </div>
      )}

      {/* Footer / Action */}
      <div
        style={{
          borderTop: '1px solid var(--color-border)',
          paddingTop: '0.85rem',
          marginTop: 'auto',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Link
          to={`/company/applications/${applicant.id}`}
          state={{ returnSearch: location.search }}
          id={`view-application-${applicant.id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-primary)',
            textDecoration: 'none',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary-light, #EFF6FF)',
            transition: 'background-color 0.15s ease, transform 0.1s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#DBEAFE';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-light, #EFF6FF)';
          }}
        >
          <span>View Application</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
};
