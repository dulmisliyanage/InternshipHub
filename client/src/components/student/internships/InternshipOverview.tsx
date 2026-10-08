import React from 'react';
import {
  MapPin,
  Clock,
  Banknote,
  Users,
  Calendar,
  Briefcase,
} from 'lucide-react';
import type { DiscoveryInternshipItem } from '../../../types/internshipDiscovery';
import {
  formatAllowance,
  formatDeadlineDate,
  formatPositions,
  getWorkTypeBadge,
} from '../../../utils/internshipFormatters';

interface InternshipOverviewProps {
  internship: DiscoveryInternshipItem;
}

export const InternshipOverview: React.FC<InternshipOverviewProps> = ({ internship }) => {
  const workTypeConfig = getWorkTypeBadge(internship.workType);
  const locationText = internship.location || internship.company?.location || 'Not specified';
  const allowanceText = formatAllowance(
    internship.allowanceMin,
    internship.allowanceMax,
    internship.currency || 'LKR'
  );
  const deadlineText = formatDeadlineDate(internship.applicationDeadline);
  const durationText = internship.duration || 'Not specified';
  const positionsText = formatPositions(internship.positions);

  const overviewItems = [
    {
      label: 'Work Arrangement',
      value: workTypeConfig.label,
      icon: Briefcase,
      color: workTypeConfig.color,
      badge: workTypeConfig,
    },
    {
      label: 'Location',
      value: locationText,
      icon: MapPin,
      color: 'var(--color-primary)',
    },
    {
      label: 'Duration',
      value: durationText,
      icon: Clock,
      color: '#0284C7',
    },
    {
      label: 'Allowance',
      value: allowanceText,
      icon: Banknote,
      color: '#059669',
    },
    {
      label: 'Open Positions',
      value: positionsText,
      icon: Users,
      color: '#7C3AED',
    },
    {
      label: 'Application Deadline',
      value: deadlineText,
      icon: Calendar,
      color: '#D97706',
    },
  ];

  return (
    <section
      aria-label="Internship Quick Overview"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '2rem',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.1rem',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          margin: '0 0 1.25rem 0',
        }}
      >
        Key Opportunity Details
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        {overviewItems.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.85rem',
                padding: '0.875rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'rgba(248, 250, 252, 0.75)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: item.color,
                  flexShrink: 0,
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                <IconComponent size={18} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.775rem',
                    fontWeight: 600,
                    color: 'var(--color-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '0.2rem',
                  }}
                >
                  {item.label}
                </span>
                {item.badge ? (
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.15rem 0.55rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      backgroundColor: item.badge.bg,
                      color: item.badge.color,
                      border: `1px solid ${item.badge.border}`,
                    }}
                  >
                    {item.value}
                  </span>
                ) : (
                  <strong
                    style={{
                      display: 'block',
                      fontSize: '0.925rem',
                      color: 'var(--color-text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={item.value}
                  >
                    {item.value}
                  </strong>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
