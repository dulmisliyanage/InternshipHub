import type { CompanySize, CompanyProfilePayload } from '../types/company';

export const COMPANY_SIZE_LABELS: Record<CompanySize, string> = {
  STARTUP: 'Startup',
  SMALL: 'Small',
  MEDIUM: 'Medium',
  LARGE: 'Large',
  ENTERPRISE: 'Enterprise',
};

export const COMPANY_SIZE_OPTIONS: { value: CompanySize; label: string; description: string }[] = [
  { value: 'STARTUP', label: 'Startup', description: '1–10 employees' },
  { value: 'SMALL', label: 'Small', description: '11–50 employees' },
  { value: 'MEDIUM', label: 'Medium', description: '51–250 employees' },
  { value: 'LARGE', label: 'Large', description: '251–1,000 employees' },
  { value: 'ENTERPRISE', label: 'Enterprise', description: '1,000+ employees' },
];

/**
 * Returns a friendly display label for a CompanySize enum value.
 * Never outputs raw enum strings to users.
 */
export function formatCompanySize(size?: CompanySize | null, withSuffix: boolean = false): string {
  if (!size) return '';
  const label = COMPANY_SIZE_LABELS[size] || size;
  return withSuffix ? `${label} company` : label;
}

/**
 * Reusable validation logic for Company Profile data.
 * Returns a dictionary of errors keyed by field name.
 */
export function validateCompanyProfile(payload: Partial<CompanyProfilePayload>): Record<string, string> {
  const errors: Record<string, string> = {};

  // Company Name
  const trimmedName = (payload.companyName || '').trim();
  if (!trimmedName) {
    errors.companyName = 'Company name is required';
  } else if (trimmedName.length > 150) {
    errors.companyName = 'Company name cannot exceed 150 characters';
  }

  // Industry
  if (payload.industry && payload.industry.trim().length > 150) {
    errors.industry = 'Industry cannot exceed 150 characters';
  }

  // Location
  if (payload.location && payload.location.trim().length > 150) {
    errors.location = 'Location cannot exceed 150 characters';
  }

  // Description
  if (payload.description && payload.description.length > 2000) {
    errors.description = 'Description cannot exceed 2000 characters';
  }

  // URL Helper
  const isValidUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Website
  if (payload.website && payload.website.trim()) {
    if (!isValidUrl(payload.website.trim())) {
      errors.website = 'Please enter a valid website URL starting with http:// or https://';
    }
  }

  // LinkedIn
  if (payload.linkedinUrl && payload.linkedinUrl.trim()) {
    if (!isValidUrl(payload.linkedinUrl.trim())) {
      errors.linkedinUrl = 'Please enter a valid LinkedIn URL starting with http:// or https://';
    }
  }

  return errors;
}
