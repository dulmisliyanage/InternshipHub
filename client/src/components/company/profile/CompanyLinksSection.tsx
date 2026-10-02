import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, ExternalLink, Plus } from 'lucide-react';
import { Button } from '../../ui/Button';

const LinkedinIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
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

interface CompanyLinksSectionProps {
  website?: string | null;
  linkedinUrl?: string | null;
}

export const CompanyLinksSection: React.FC<CompanyLinksSectionProps> = ({
  website,
  linkedinUrl,
}) => {
  const hasWebsite = !!website && website.trim().length > 0;
  const hasLinkedin = !!linkedinUrl && linkedinUrl.trim().length > 0;
  const hasAnyLink = hasWebsite || hasLinkedin;

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
        <Globe size={18} color="var(--color-primary)" />
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.15rem',
            fontWeight: 700,
            margin: 0,
            color: 'var(--color-text-primary)',
          }}
        >
          Online Presence
        </h2>
      </div>

      {hasAnyLink ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {hasWebsite && (
            <a
              href={website!}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.75rem 1.25rem',
                  backgroundColor: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--color-text-primary)',
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.color = 'var(--color-primary)';
                  e.currentTarget.style.backgroundColor = 'var(--color-primary-light)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.color = 'var(--color-text-primary)';
                  e.currentTarget.style.backgroundColor = 'var(--color-background)';
                }}
              >
                <Globe size={18} color="var(--color-primary)" />
                <span>Visit Website</span>
                <ExternalLink size={14} style={{ opacity: 0.7 }} />
              </div>
            </a>
          )}

          {hasLinkedin && (
            <a
              href={linkedinUrl!}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.75rem 1.25rem',
                  backgroundColor: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--color-text-primary)',
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0A66C2';
                  e.currentTarget.style.color = '#0A66C2';
                  e.currentTarget.style.backgroundColor = 'rgba(10, 102, 194, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.color = 'var(--color-text-primary)';
                  e.currentTarget.style.backgroundColor = 'var(--color-background)';
                }}
              >
                <LinkedinIcon size={18} />
                <span>LinkedIn Page</span>
                <ExternalLink size={14} style={{ opacity: 0.7 }} />
              </div>
            </a>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '0.85rem',
            padding: '1rem 0',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '0.925rem',
              color: 'var(--color-text-secondary)',
              fontStyle: 'italic',
            }}
          >
            No online presence links added yet. Add your official website and LinkedIn page so students can explore your work.
          </p>
          <Link to="/company/profile/edit" style={{ textDecoration: 'none' }}>
            <Button variant="outline" size="sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Plus size={14} />
              <span>Add links</span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};
