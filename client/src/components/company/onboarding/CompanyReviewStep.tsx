import React from 'react';
import {
  CheckCircle2,
  MapPin,
  Globe,
  ExternalLink,
  ArrowLeft,
  Users,
  Briefcase,
} from 'lucide-react';
import { Button } from '../../ui';
import { CompanyLogo } from '../CompanyLogo';
import type { CompanySize } from '../../../types/company';

const LinkedinIcon: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const sizeLabelMap: { [key in CompanySize]: string } = {
  STARTUP: 'Startup (< 10 team members)',
  SMALL: 'Small (10 – 50 team members)',
  MEDIUM: 'Medium (50 – 250 team members)',
  LARGE: 'Large (250 – 1,000 team members)',
  ENTERPRISE: 'Enterprise (1,000+ team members)',
};

interface CompanyReviewStepProps {
  companyName: string;
  industry: string;
  companySize: CompanySize | null;
  location: string;
  description: string;
  website: string;
  linkedinUrl: string;
  logoUrl?: string | null;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

export const CompanyReviewStep: React.FC<CompanyReviewStepProps> = ({
  companyName,
  industry,
  companySize,
  location,
  description,
  website,
  linkedinUrl,
  logoUrl,
  isSubmitting,
  onBack,
  onSubmit,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Step Header */}
      <div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: '#065F46',
            backgroundColor: '#ECFDF5',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.825rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
          }}
        >
          <CheckCircle2 size={15} />
          <span>Profile Review</span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.65rem',
            fontWeight: 800,
            color: 'var(--color-text-primary)',
            margin: '0 0 0.4rem',
          }}
        >
          Review your company profile
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', margin: 0 }}>
          Make sure everything looks right before publishing. You can update this information anytime.
        </p>
      </div>

      {/* Profile Preview Card */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
        }}
      >
        {/* Top Header Section */}
        <div
          style={{
            padding: '1.75rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            flexWrap: 'wrap',
          }}
        >
          <CompanyLogo src={logoUrl} name={companyName || 'Company'} size={64} />

          <div style={{ flex: 1, minWidth: '220px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.35rem',
                fontWeight: 800,
                color: 'var(--color-text-primary)',
                margin: '0 0 0.25rem',
              }}
            >
              {companyName || 'Company Name'}
            </h2>

            <div
              style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
                marginTop: '0.35rem',
              }}
            >
              {industry && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Briefcase size={14} color="var(--color-primary)" />
                  <span>{industry}</span>
                </span>
              )}

              {location && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} color="var(--color-primary)" />
                  <span>{location}</span>
                </span>
              )}
            </div>

            {companySize && (
              <div style={{ marginTop: '0.5rem' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#065F46',
                    backgroundColor: '#ECFDF5',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  <Users size={12} />
                  <span>{sizeLabelMap[companySize]}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* About Section */}
        <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid var(--color-border)' }}>
          <h3
            style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              margin: '0 0 0.5rem',
            }}
          >
            About
          </h3>
          <p
            style={{
              fontSize: '0.925rem',
              lineHeight: 1.6,
              color: description ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              margin: 0,
              whiteSpace: 'pre-line',
              fontStyle: description ? 'normal' : 'italic',
            }}
          >
            {description || 'No company description provided.'}
          </p>
        </div>

        {/* Online Presence Links */}
        <div style={{ padding: '1.25rem 1.75rem', backgroundColor: 'var(--color-background)' }}>
          <h3
            style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              margin: '0 0 0.75rem',
            }}
          >
            Online Presence
          </h3>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {website ? (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                  textDecoration: 'none',
                }}
              >
                <Globe size={14} />
                <span>Website</span>
                <ExternalLink size={12} style={{ opacity: 0.6 }} />
              </a>
            ) : null}

            {linkedinUrl ? (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                  textDecoration: 'none',
                }}
              >
                <LinkedinIcon size={14} />
                <span>LinkedIn</span>
                <ExternalLink size={12} style={{ opacity: 0.6 }} />
              </a>
            ) : null}

            {!website && !linkedinUrl && (
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                No external links specified.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '0.5rem',
        }}
      >
        <Button type="button" variant="outline" size="lg" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft size={16} />
          <span>Back</span>
        </Button>
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={onSubmit}
          isLoading={isSubmitting}
        >
          {isSubmitting ? 'Creating profile...' : 'Create Company Profile'}
        </Button>
      </div>
    </div>
  );
};
