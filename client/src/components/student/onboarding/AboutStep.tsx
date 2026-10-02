import React from 'react';
import {
  FileText,
  Globe,
  ArrowLeft,
  Check,
  Info,
} from 'lucide-react';
import { FormField, Input, Button, FormError } from '../../ui';

const GithubIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const LinkedinIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export interface AboutData {
  bio: string;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  cvUrl: string;
}

interface AboutStepProps {
  data: AboutData;
  errors: { [key: string]: string };
  isSubmitting: boolean;
  onChange: (field: keyof AboutData, value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export const AboutStep: React.FC<AboutStepProps> = ({
  data,
  errors,
  isSubmitting,
  onChange,
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
            gap: '0.5rem',
            color: 'var(--color-primary)',
            backgroundColor: 'var(--color-primary-light)',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
          }}
        >
          <FileText size={16} />
          <span>Profile Finishing Touches</span>
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
          About you & professional links
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', margin: 0 }}>
          Give companies a window into your projects, GitHub repositories, and background.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Bio Textarea */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.35rem',
            }}
          >
            <label
              htmlFor="bio"
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
              }}
            >
              Short Bio / About Me
            </label>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color:
                  data.bio.length > 1000
                    ? 'var(--color-error)'
                    : 'var(--color-text-secondary)',
              }}
            >
              {data.bio.length} / 1000
            </span>
          </div>

          <textarea
            id="bio"
            name="bio"
            rows={4}
            placeholder="Tell recruiters about your interests, key coursework, open-source work, or what drives your passion for this field..."
            value={data.bio}
            onChange={(e) => onChange('bio', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 0.875rem',
              fontSize: '0.95rem',
              fontFamily: 'inherit',
              borderRadius: 'var(--radius-lg)',
              border: `1px solid ${
                errors.bio ? 'var(--color-error)' : 'var(--color-border)'
              }`,
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box',
              lineHeight: 1.5,
            }}
          />
          {errors.bio && <FormError message={errors.bio} />}
        </div>

        {/* Links Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
          }}
        >
          <FormField
            htmlFor="githubUrl"
            label="GitHub Profile"
            error={errors.githubUrl}
            hint="https://github.com/username"
          >
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none',
                }}
              >
                <GithubIcon size={16} />
              </div>
              <Input
                id="githubUrl"
                name="githubUrl"
                placeholder="https://github.com/username"
                value={data.githubUrl}
                onChange={(e) => onChange('githubUrl', e.target.value)}
                hasError={!!errors.githubUrl}
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>
          </FormField>

          <FormField
            htmlFor="linkedinUrl"
            label="LinkedIn Profile"
            error={errors.linkedinUrl}
            hint="https://linkedin.com/in/username"
          >
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none',
                }}
              >
                <LinkedinIcon size={16} />
              </div>
              <Input
                id="linkedinUrl"
                name="linkedinUrl"
                placeholder="https://linkedin.com/in/username"
                value={data.linkedinUrl}
                onChange={(e) => onChange('linkedinUrl', e.target.value)}
                hasError={!!errors.linkedinUrl}
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>
          </FormField>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
          }}
        >
          <FormField
            htmlFor="portfolioUrl"
            label="Portfolio Website"
            error={errors.portfolioUrl}
            hint="https://yourportfolio.dev"
          >
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none',
                }}
              >
                <Globe size={16} />
              </div>
              <Input
                id="portfolioUrl"
                name="portfolioUrl"
                placeholder="https://yourportfolio.dev"
                value={data.portfolioUrl}
                onChange={(e) => onChange('portfolioUrl', e.target.value)}
                hasError={!!errors.portfolioUrl}
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>
          </FormField>

          <FormField
            htmlFor="cvUrl"
            label="Online CV / Resume"
            error={errors.cvUrl}
            hint="Google Drive, Notion, or PDF URL"
          >
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none',
                }}
              >
                <FileText size={16} />
              </div>
              <Input
                id="cvUrl"
                name="cvUrl"
                placeholder="https://..."
                value={data.cvUrl}
                onChange={(e) => onChange('cvUrl', e.target.value)}
                hasError={!!errors.cvUrl}
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>
          </FormField>
        </div>

        {/* Informative Callout */}
        <div
          style={{
            backgroundColor: 'var(--color-primary-light)',
            border: '1px solid rgba(79, 70, 229, 0.2)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            fontSize: '0.875rem',
            color: 'var(--color-primary-dark)',
            lineHeight: 1.5,
          }}
        >
          <Info size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            <strong>Cloud Storage Notice:</strong> Direct CV and certificate PDF file uploads will be
            unlocked in the next storage update. For now, you can link to your publicly viewable
            resume on Google Drive, GitHub, or Notion.
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '1.25rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onBack}
          disabled={isSubmitting}
        >
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
          <span>Complete Profile</span>
          <Check size={18} strokeWidth={2.5} />
        </Button>
      </div>
    </div>
  );
};
