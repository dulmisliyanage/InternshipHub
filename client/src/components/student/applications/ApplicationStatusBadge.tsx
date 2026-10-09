import React from 'react';
import {
  Clock,
  Search,
  Star,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import type { ApplicationStatus } from '../../../types/application';

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

interface StatusConfig {
  label: string;
  bg: string;
  color: string;
  border: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
}

const STATUS_CONFIGS: Record<ApplicationStatus, StatusConfig> = {
  APPLIED: {
    label: 'Applied',
    bg: '#EFF6FF',
    color: '#1D4ED8',
    border: '#BFDBFE',
    icon: Clock,
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    bg: '#FEF3C7',
    color: '#B45309',
    border: '#FDE68A',
    icon: Search,
  },
  SHORTLISTED: {
    label: 'Shortlisted',
    bg: '#EEF2FF',
    color: '#4338CA',
    border: '#C7D2FE',
    icon: Star,
  },
  INTERVIEW: {
    label: 'Interview',
    bg: '#F5F3FF',
    color: '#6D28D9',
    border: '#DDD6FE',
    icon: Users,
  },
  ACCEPTED: {
    label: 'Accepted',
    bg: '#ECFDF5',
    color: '#047857',
    border: '#A7F3D0',
    icon: CheckCircle2,
  },
  REJECTED: {
    label: 'Rejected',
    bg: '#FEF2F2',
    color: '#B91C1C',
    border: '#FECACA',
    icon: XCircle,
  },
  WITHDRAWN: {
    label: 'Withdrawn',
    bg: '#F1F5F9',
    color: '#475569',
    border: '#CBD5E1',
    icon: AlertCircle,
  },
};

export const ApplicationStatusBadge: React.FC<ApplicationStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const config = STATUS_CONFIGS[status] || {
    label: status,
    bg: '#F1F5F9',
    color: '#475569',
    border: '#CBD5E1',
    icon: Clock,
  };

  const IconComponent = config.icon;

  const sizeStyles = {
    sm: {
      padding: '0.15rem 0.5rem',
      fontSize: '0.75rem',
      iconSize: 12,
      gap: '0.25rem',
    },
    md: {
      padding: '0.25rem 0.65rem',
      fontSize: '0.8125rem',
      iconSize: 14,
      gap: '0.35rem',
    },
    lg: {
      padding: '0.35rem 0.85rem',
      fontSize: '0.875rem',
      iconSize: 16,
      gap: '0.45rem',
    },
  }[size];

  return (
    <span
      className={`ih-status-badge ih-status-${status.toLowerCase()}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: sizeStyles.gap,
        padding: sizeStyles.padding,
        fontSize: sizeStyles.fontSize,
        fontWeight: 600,
        borderRadius: '9999px',
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
      }}
    >
      {showIcon && <IconComponent size={sizeStyles.iconSize} />}
      <span>{config.label}</span>
    </span>
  );
};
