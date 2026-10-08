/**
 * Shared formatting utilities for student internship discovery and details.
 */

export const formatDeadlineDate = (dateStr?: string | null): string => {
  if (!dateStr) return 'No deadline specified';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Invalid date';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
};

export const formatAllowance = (
  min?: number | null,
  max?: number | null,
  currency: string = 'LKR'
): string => {
  const curr = currency || 'LKR';
  if (min == null && max == null) return 'Allowance not specified';
  if (min != null && max != null && min === max) {
    return `${curr} ${min.toLocaleString()}/mo`;
  }
  if (min != null && max != null) {
    return `${curr} ${min.toLocaleString()} – ${max.toLocaleString()}/mo`;
  }
  if (min != null) {
    return `From ${curr} ${min.toLocaleString()}/mo`;
  }
  if (max != null) {
    return `Up to ${curr} ${max.toLocaleString()}/mo`;
  }
  return 'Allowance not specified';
};

export const getWorkTypeBadge = (workType?: string) => {
  switch (workType) {
    case 'REMOTE':
      return {
        label: 'Remote',
        bg: '#EEF2FF',
        color: '#4338CA',
        border: '#C7D2FE',
      };
    case 'HYBRID':
      return {
        label: 'Hybrid',
        bg: '#F0FDF4',
        color: '#15803D',
        border: '#BBF7D0',
      };
    case 'ONSITE':
      return {
        label: 'On-site',
        bg: '#FFF7ED',
        color: '#C2410C',
        border: '#FFEDD5',
      };
    default:
      return {
        label: workType || 'Not specified',
        bg: '#F1F5F9',
        color: '#475569',
        border: '#E2E8F0',
      };
  }
};

export const formatPositions = (positions?: number | null): string => {
  if (!positions || positions <= 0) return '1 opening';
  return positions === 1 ? '1 opening' : `${positions} openings`;
};

/**
 * Validates that an external URL begins with http:// or https://
 * to prevent malicious javascript: or data: URIs.
 */
export const isSafeUrl = (url?: string | null): boolean => {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};
