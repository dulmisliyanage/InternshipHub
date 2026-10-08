import React from 'react';
import {
  Building2,
  Globe,
  MapPin,
  Users,
  ExternalLink,
} from 'lucide-react';
import { CompanyLogo } from '../../company/CompanyLogo';
import type { DiscoveryCompany } from '../../../types/internshipDiscovery';
import { isSafeUrl } from '../../../utils/internshipFormatters';

const LinkedinIcon: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface InternshipCompanySectionProps {
  company: DiscoveryCompany | null;
}

export const InternshipCompanySection: React.FC<InternshipCompanySectionProps> = ({ company }) => {
  const companyName = company?.companyName || 'Verified Employer';
  const hasValidWebsite = isSafeUrl(company?.website);
  const hasValidLinkedin = isSafeUrl(company?.linkedinUrl);

  return (
    <section
      aria-label="About the Company"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.75rem',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '2rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <Building2 size={20} style={{ color: 'var(--color-primary)' }} />
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.15rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            margin: 0,
          }}
        >
          About the Company
        </h2>
      </div>

      {/* Company Header Block */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1.25rem',
          flexWrap: 'wrap',
          marginBottom: '1.25rem',
        }}
      >
        <CompanyLogo
          src={company?.logoUrl}
          name={companyName}
          size="lg"
        />

        <div style={{ flex: 1, minWidth: 200 }}>
          <h3
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--color-text-primary)',
              margin: '0 0 0.35rem 0',
            }}
          >
            {companyName}
          </h3>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '0.75rem',
              color: 'var(--color-text-secondary)',
              fontSize: '0.85rem',
            }}
          >
            {company?.industry && (
              <span style={{ fontWeight: 500 }}>{company.industry}</span>
            )}
            {company?.industry && company?.location && <span>•</span>}
            {company?.location && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <MapPin size={13} style={{ color: 'var(--color-primary)' }} />
                <span>{company.location}</span>
              </span>
            )}
            {company?.companySize && (
              <>
                <span>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Users size={13} />
                  <span>{company.companySize} Team</span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Company Description */}
      {company?.description ? (
        <p
          style={{
            color: 'var(--color-text-primary)',
            fontSize: '0.925rem',
            lineHeight: 1.65,
            margin: '0 0 1.25rem 0',
            whiteSpace: 'pre-line',
          }}
        >
          {company.description}
        </p>
      ) : (
        <p
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: '0.9rem',
            fontStyle: 'italic',
            margin: '0 0 1.25rem 0',
          }}
        >
          No company description provided yet.
        </p>
      )}

      {/* Safe External Links */}
      {(hasValidWebsite || hasValidLinkedin) && (
        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            paddingTop: '1rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.85rem',
          }}
        >
          {hasValidWebsite && (
            <a
              href={company!.website!}
              target="_blank"
              rel="noopener noreferrer"
              id="company-website-link"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--color-primary)',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-primary-light)',
                transition: 'all 0.15s ease',
              }}
            >
              <Globe size={15} />
              <span>Visit Website</span>
              <ExternalLink size={13} style={{ opacity: 0.7 }} />
            </a>
          )}

          {hasValidLinkedin && (
            <a
              href={company!.linkedinUrl!}
              target="_blank"
              rel="noopener noreferrer"
              id="company-linkedin-link"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#0A66C2',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'rgba(10, 102, 194, 0.08)',
                transition: 'all 0.15s ease',
              }}
            >
              <LinkedinIcon size={15} />
              <span>LinkedIn Profile</span>
              <ExternalLink size={13} style={{ opacity: 0.7 }} />
            </a>
          )}
        </div>
      )}
    </section>
  );
};
