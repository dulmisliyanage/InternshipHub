import React from 'react';
import { Building2, Users, MapPin } from 'lucide-react';
import { formatCompanySize } from '../../../utils/company';
import type { CompanySize } from '../../../types/company';

interface CompanyInfoSectionProps {
  industry?: string | null;
  companySize?: CompanySize | null;
  location?: string | null;
}

export const CompanyInfoSection: React.FC<CompanyInfoSectionProps> = ({
  industry,
  companySize,
  location,
}) => {
  const formattedSize = formatCompanySize(companySize);

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem 2.5rem',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '0.85rem',
        }}
      >
        <Building2 size={18} color="var(--color-primary)" />
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.15rem',
            fontWeight: 700,
            margin: 0,
            color: 'var(--color-text-primary)',
          }}
        >
          Company Information
        </h2>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.75rem',
        }}
      >
        {/* Industry */}
        <div>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--color-text-secondary)',
              marginBottom: '0.35rem',
            }}
          >
            <Building2 size={14} />
            Industry
          </span>
          <p
            style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: 600,
              color: industry ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            }}
          >
            {industry || 'Not specified'}
          </p>
        </div>

        {/* Company Size */}
        <div>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--color-text-secondary)',
              marginBottom: '0.35rem',
            }}
          >
            <Users size={14} />
            Company Size
          </span>
          <p
            style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: 600,
              color: formattedSize ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            }}
          >
            {formattedSize || 'Not specified'}
          </p>
        </div>

        {/* Location */}
        <div>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--color-text-secondary)',
              marginBottom: '0.35rem',
            }}
          >
            <MapPin size={14} />
            Location
          </span>
          <p
            style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: 600,
              color: location ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            }}
          >
            {location || 'Not specified'}
          </p>
        </div>
      </div>
    </div>
  );
};
