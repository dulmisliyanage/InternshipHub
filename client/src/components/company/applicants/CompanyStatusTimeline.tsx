import React from 'react';
import {
  Clock,
  Search,
  Star,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import type { CompanyStatusHistoryItem } from '../../../types/companyApplicant';
import type { ApplicationStatus } from '../../../types/application';

interface CompanyStatusTimelineProps {
  statusHistory: CompanyStatusHistoryItem[];
  currentStatus?: ApplicationStatus;
}

const STATUS_TITLES: Record<ApplicationStatus, string> = {
  APPLIED: 'Application Submitted',
  UNDER_REVIEW: 'Under Review',
  SHORTLISTED: 'Candidate Shortlisted',
  INTERVIEW: 'Interview Stage',
  ACCEPTED: 'Offer Extended / Accepted',
  REJECTED: 'Application Rejected',
  WITHDRAWN: 'Application Withdrawn by Student',
};

const STATUS_ICONS: Record<
  ApplicationStatus,
  React.ComponentType<{ size?: number; style?: React.CSSProperties }>
> = {
  APPLIED: Clock,
  UNDER_REVIEW: Search,
  SHORTLISTED: Star,
  INTERVIEW: Users,
  ACCEPTED: CheckCircle2,
  REJECTED: XCircle,
  WITHDRAWN: AlertCircle,
};

const STATUS_COLORS: Record<ApplicationStatus, { iconBg: string; iconColor: string; line: string }> = {
  APPLIED: { iconBg: '#EFF6FF', iconColor: '#2563EB', line: '#93C5FD' },
  UNDER_REVIEW: { iconBg: '#FEF3C7', iconColor: '#D97706', line: '#FCD34D' },
  SHORTLISTED: { iconBg: '#EEF2FF', iconColor: '#4F46E5', line: '#A5B4FC' },
  INTERVIEW: { iconBg: '#F5F3FF', iconColor: '#7C3AED', line: '#C4B5FD' },
  ACCEPTED: { iconBg: '#ECFDF5', iconColor: '#059669', line: '#6EE7B7' },
  REJECTED: { iconBg: '#FEF2F2', iconColor: '#DC2626', line: '#FCA5A5' },
  WITHDRAWN: { iconBg: '#F1F5F9', iconColor: '#64748B', line: '#CBD5E1' },
};

export const CompanyStatusTimeline: React.FC<CompanyStatusTimelineProps> = ({
  statusHistory,
}) => {
  // Sort history chronologically (ascending by date)
  const sortedHistory = [...statusHistory].sort(
    (a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime()
  );

  const formatTimestamp = (dateStr: string) => {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  };

  return (
    <div
      className="ih-company-status-timeline"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.75rem',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <h3
        style={{
          margin: '0 0 1.5rem 0',
          fontSize: '1.125rem',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
        }}
      >
        Recruitment Progress Timeline
      </h3>

      {sortedHistory.length === 0 ? (
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          No status history records available.
        </p>
      ) : (
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
          {sortedHistory.map((item, idx) => {
            const isLast = idx === sortedHistory.length - 1;
            const statusConfig = STATUS_COLORS[item.toStatus] || STATUS_COLORS.APPLIED;
            const IconComponent = STATUS_ICONS[item.toStatus] || Clock;
            const title = STATUS_TITLES[item.toStatus] || item.toStatus;

            return (
              <div
                key={item.id || idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  position: 'relative',
                  paddingBottom: isLast ? 0 : '1.75rem',
                }}
              >
                {/* Connecting Vertical Line */}
                {!isLast && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '19px',
                      top: '40px',
                      bottom: 0,
                      width: '2px',
                      backgroundColor: 'var(--color-border)',
                    }}
                  />
                )}

                {/* Node Icon */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: statusConfig.iconBg,
                    border: `2px solid ${statusConfig.iconColor}`,
                    color: statusConfig.iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    zIndex: 2,
                    boxShadow: 'var(--shadow-xs)',
                  }}
                >
                  <IconComponent size={18} />
                </div>

                {/* Details */}
                <div style={{ flex: 1, paddingTop: '0.2rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.9375rem',
                        fontWeight: isLast ? 700 : 600,
                        color: isLast ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                      }}
                    >
                      {title}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--color-text-muted)',
                        fontWeight: 400,
                      }}
                    >
                      {formatTimestamp(item.changedAt)}
                    </span>
                  </div>

                  {item.fromStatus && item.fromStatus !== item.toStatus && (
                    <p
                      style={{
                        margin: '0.25rem 0 0 0',
                        fontSize: '0.8125rem',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      Transition from{' '}
                      <span style={{ fontWeight: 600 }}>{item.fromStatus}</span> to{' '}
                      <span style={{ fontWeight: 600, color: statusConfig.iconColor }}>
                        {item.toStatus}
                      </span>
                    </p>
                  )}

                  {item.changedBy && (
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        color: 'var(--color-text-muted)',
                        marginTop: '0.2rem',
                      }}
                    >
                      By {item.changedBy.name} ({item.changedBy.role})
                    </span>
                  )}

                  {/* Company Review Note */}
                  {item.note && (
                    <div
                      style={{
                        marginTop: '0.65rem',
                        padding: '0.65rem 0.85rem',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.8125rem',
                        color: 'var(--color-text-secondary)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.45rem',
                      }}
                    >
                      <MessageSquare size={14} style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginBottom: '0.15rem' }}>
                          Review Note:
                        </strong>
                        <span style={{ whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>{item.note}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
