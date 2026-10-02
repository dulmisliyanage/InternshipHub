import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus } from 'lucide-react';
import { Button } from '../../ui/Button';

interface CompanyAboutSectionProps {
  description?: string | null;
}

export const CompanyAboutSection: React.FC<CompanyAboutSectionProps> = ({ description }) => {
  const hasDescription = description && description.trim().length > 0;

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
          marginBottom: '1.25rem',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '0.85rem',
        }}
      >
        <FileText size={18} color="var(--color-primary)" />
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.15rem',
            fontWeight: 700,
            margin: 0,
            color: 'var(--color-text-primary)',
          }}
        >
          About
        </h2>
      </div>

      {hasDescription ? (
        <div
          style={{
            fontSize: '0.95rem',
            lineHeight: 1.7,
            color: 'var(--color-text-primary)',
            whiteSpace: 'pre-line',
          }}
        >
          {description}
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '0.85rem',
            padding: '1.5rem 0',
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
            No company description has been added yet. Tell prospective interns about your mission, culture, and projects.
          </p>
          <Link to="/company/profile/edit" style={{ textDecoration: 'none' }}>
            <Button variant="outline" size="sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Plus size={14} />
              <span>Add description</span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};
