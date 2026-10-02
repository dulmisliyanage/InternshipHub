import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Pencil } from 'lucide-react';
import { Button } from '../../ui/Button';
import { CompanyLogo } from '../CompanyLogo';
import { formatCompanySize } from '../../../utils/company';
import type { CompanyProfile } from '../../../types/company';

interface CompanyProfileHeaderProps {
  profile: CompanyProfile;
}

export const CompanyProfileHeader: React.FC<CompanyProfileHeaderProps> = ({ profile }) => {
  const companySizeLabel = formatCompanySize(profile.companySize, true);

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.75rem',
      }}
    >
      {/* Left: Logo & Core Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
        <CompanyLogo
          src={profile.logoUrl}
          name={profile.companyName}
          size={76}
          style={{ boxShadow: 'var(--shadow-sm)' }}
        />

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
            <h1
              className="page-heading"
              style={{
                fontSize: '1.85rem',
                margin: 0,
                color: 'var(--color-text-primary)',
              }}
            >
              {profile.companyName}
            </h1>

            {companySizeLabel && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                  backgroundColor: 'var(--color-primary-light)',
                  border: '1px solid rgba(79, 70, 229, 0.2)',
                  padding: '0.2rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {companySizeLabel}
              </span>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              color: 'var(--color-text-secondary)',
              fontSize: '0.925rem',
            }}
          >
            {profile.industry && (
              <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                {profile.industry}
              </span>
            )}

            {profile.industry && profile.location && <span>•</span>}

            {profile.location && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={15} color="var(--color-text-secondary)" />
                {profile.location}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Edit Profile Action */}
      <div>
        <Link to="/company/profile/edit" style={{ textDecoration: 'none' }}>
          <Button
            id="company-edit-profile-btn"
            variant="outline"
            size="md"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <Pencil size={15} />
            <span>Edit Profile</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};
