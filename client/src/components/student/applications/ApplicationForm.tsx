import React, { useState } from 'react';
import { User, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import { CvUploadField } from './CvUploadField';
import type { DiscoveryInternshipItem } from '../../../types/internshipDiscovery';
import type { StudentProfile } from '../../../types/student';

interface ApplicationFormProps {
  internship: DiscoveryInternshipItem;
  studentProfile: StudentProfile | null;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submissionError?: string | null;
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({
  internship,
  studentProfile,
  onSubmit,
  onCancel,
  isSubmitting,
  submissionError,
}) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setCvError('Please upload your CV in PDF format before submitting.');
      return;
    }

    setCvError(null);

    const formData = new FormData();
    formData.append('internshipId', internship.id);
    if (coverLetter.trim()) {
      formData.append('coverLetter', coverLetter.trim());
    }
    formData.append('cv', selectedFile);

    await onSubmit(formData);
  };

  return (
    <form
      id="student-application-form"
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
      }}
    >
      {/* 1. Student Profile Attachment Banner */}
      <div
        id="profile-summary-banner"
        style={{
          padding: '1.25rem',
          backgroundColor: 'rgba(241, 245, 249, 0.7)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)',
            flexShrink: 0,
          }}
        >
          <User size={20} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <h4
              style={{
                margin: 0,
                fontSize: '0.925rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
              }}
            >
              Your Verified Student Profile
            </h4>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#15803D',
                backgroundColor: '#DCFCE7',
                padding: '0.1rem 0.45rem',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <CheckCircle2 size={12} /> Auto-linked
            </span>
          </div>

          <p
            style={{
              margin: '0 0 0.5rem 0',
              fontSize: '0.825rem',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.4,
            }}
          >
            Your academic background, verified skill catalog ratings, and career preferences will automatically accompany this application to give the employer a complete view.
          </p>

          {studentProfile && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.75rem',
                fontSize: '0.8rem',
                color: 'var(--color-text-primary)',
                fontWeight: 500,
              }}
            >
              {studentProfile.university && (
                <span>🏫 {studentProfile.university}</span>
              )}
              {studentProfile.degree && (
                <span>🎓 {studentProfile.degree}</span>
              )}
              {studentProfile.skills && studentProfile.skills.length > 0 && (
                <span>⚡ {studentProfile.skills.length} Profile Skills</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. CV Upload Field (Required) */}
      <CvUploadField
        selectedFile={selectedFile}
        onFileSelect={(file) => {
          setSelectedFile(file);
          if (file) setCvError(null);
        }}
        error={cvError}
        disabled={isSubmitting}
      />

      {/* 3. Cover Letter Field (Optional) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label
            htmlFor="cover-letter-input"
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
            }}
          >
            Cover Letter <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}>(Optional)</span>
          </label>
          <span
            style={{
              fontSize: '0.75rem',
              color: coverLetter.length > 4500 ? 'var(--color-danger)' : 'var(--color-text-secondary)',
            }}
          >
            {coverLetter.length} / 5000
          </span>
        </div>

        <textarea
          id="cover-letter-input"
          placeholder="Introduce yourself, highlight what excites you about this specific internship, and describe relevant projects or coursework..."
          value={coverLetter}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCoverLetter(e.target.value.slice(0, 5000))}
          rows={5}
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '0.875rem',
            fontFamily: 'inherit',
            fontSize: '0.9rem',
            lineHeight: 1.6,
            color: 'var(--color-text-primary)',
            backgroundColor: isSubmitting ? 'var(--color-background)' : 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-xs)',
            resize: 'vertical',
            outline: 'none',
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-primary)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.15)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
          }}
        />

        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-text-secondary)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <Sparkles size={13} style={{ color: 'var(--color-primary)' }} />
          Tip: Mention specific technologies from the required skills list to stand out.
        </p>
      </div>

      {/* Submission Error Banner */}
      {submissionError && (
        <div
          id="application-submission-error"
          style={{
            padding: '0.875rem 1rem',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: 'var(--radius-md)',
            color: '#B91C1C',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{submissionError}</span>
        </div>
      )}

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '1rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button
          id="submit-application-btn"
          type="submit"
          variant="primary"
          size="md"
          disabled={isSubmitting || !selectedFile}
          isLoading={isSubmitting}
        >
          {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
        </Button>
      </div>
    </form>
  );
};
