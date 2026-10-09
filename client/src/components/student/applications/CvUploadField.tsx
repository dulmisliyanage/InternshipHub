import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Button } from '../../ui/Button';

interface CvUploadFieldProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  error?: string | null;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const CvUploadField: React.FC<CvUploadFieldProps> = ({
  selectedFile,
  onFileSelect,
  error,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  const displayError = error || internalError;

  const validateAndSetFile = (file: File) => {
    setInternalError(null);

    // Validate MIME type / extension
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setInternalError('Only PDF documents are allowed. Please upload a .pdf file.');
      onFileSelect(null);
      return;
    }

    // Validate size limit
    if (file.size > MAX_FILE_SIZE) {
      setInternalError('File exceeds the 5 MB limit. Please select a smaller PDF.');
      onFileSelect(null);
      return;
    }

    onFileSelect(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    setInternalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <label
        htmlFor="cv-upload-input"
        style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
        }}
      >
        Upload Your CV / Resume <span style={{ color: 'var(--color-danger)' }}>*</span>
      </label>

      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        id="cv-upload-input"
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        disabled={disabled}
        style={{ display: 'none' }}
      />

      {/* Selected file preview */}
      {selectedFile ? (
        <div
          id="cv-selected-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            backgroundColor: 'rgba(37, 99, 235, 0.04)',
            border: '1.5px solid var(--color-primary)',
            borderRadius: 'var(--radius-lg)',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', minWidth: 0 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FileText size={22} />
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: '0.925rem',
                    color: 'var(--color-text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '280px',
                  }}
                  title={selectedFile.name}
                >
                  {selectedFile.name}
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.45rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(37, 99, 235, 0.15)',
                    color: 'var(--color-primary)',
                  }}
                >
                  PDF
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.8rem',
                  color: 'var(--color-text-secondary)',
                  marginTop: '0.2rem',
                }}
              >
                <span>{formatFileSize(selectedFile.size)}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#16A34A', fontWeight: 500 }}>
                  <CheckCircle2 size={13} /> Ready to submit
                </span>
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={disabled}
            aria-label="Remove CV file"
            style={{ color: 'var(--color-text-secondary)', padding: '0.4rem' }}
          >
            <X size={18} />
          </Button>
        </div>
      ) : (
        /* Empty / Drop Zone */
        <div
          id="cv-dropzone"
          onClick={() => !disabled && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${
              isDragOver
                ? 'var(--color-primary)'
                : displayError
                ? 'var(--color-danger)'
                : 'var(--color-border)'
            }`,
            backgroundColor: isDragOver
              ? 'rgba(37, 99, 235, 0.05)'
              : 'rgba(248, 250, 252, 0.6)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-full)',
              backgroundColor: isDragOver
                ? 'rgba(37, 99, 235, 0.15)'
                : 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDragOver ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            }}
          >
            <UploadCloud size={26} />
          </div>

          <div>
            <p
              style={{
                fontSize: '0.925rem',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                margin: '0 0 0.25rem 0',
              }}
            >
              <span style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
                Click to browse
              </span>{' '}
              or drag & drop your CV
            </p>
            <p
              style={{
                fontSize: '0.8rem',
                color: 'var(--color-text-secondary)',
                margin: 0,
              }}
            >
              PDF format only • Maximum file size 5 MB
            </p>
          </div>
        </div>
      )}

      {/* Inline Error Message */}
      {displayError && (
        <div
          id="cv-upload-error"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            color: 'var(--color-danger)',
            fontSize: '0.8rem',
            fontWeight: 500,
          }}
        >
          <AlertCircle size={14} />
          <span>{displayError}</span>
        </div>
      )}

      <p
        style={{
          fontSize: '0.75rem',
          color: 'var(--color-text-secondary)',
          margin: 0,
        }}
      >
        Your CV is stored in secure, private storage and accessible only to you and the hiring employer.
      </p>
    </div>
  );
};
