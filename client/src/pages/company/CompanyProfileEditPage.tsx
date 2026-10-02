import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Globe,
  Check,
  AlertCircle,
  Upload,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { Button, FormField, Input, Alert, LoadingSpinner } from '../../components/ui';
import { CompanyNavbar } from '../../components/company/CompanyNavbar';
import { CompanyLogo } from '../../components/company/CompanyLogo';
import {
  COMPANY_SIZE_OPTIONS,
  validateCompanyProfile,
} from '../../utils/company';
import { companyService } from '../../services/company.service';
import { validateImageFile, ALLOWED_IMAGE_EXTENSIONS } from '../../utils/upload';
import type { CompanySize, CompanyProfile, CompanyProfilePayload } from '../../types/company';

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

interface FormState {
  companyName: string;
  industry: string;
  companySize: CompanySize | null;
  location: string;
  description: string;
  website: string;
  linkedinUrl: string;
}

const emptyFormState: FormState = {
  companyName: '',
  industry: '',
  companySize: null,
  location: '',
  description: '',
  website: '',
  linkedinUrl: '',
};

export const CompanyProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Loading & Data States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form States
  const [formData, setFormData] = useState<FormState>(emptyFormState);
  const [initialData, setInitialData] = useState<FormState>(emptyFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Logo Upload & Preview States
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [isRemovingLogo, setIsRemovingLogo] = useState<boolean>(false);
  const [showRemoveLogoModal, setShowRemoveLogoModal] = useState<boolean>(false);
  const [logoSuccessMsg, setLogoSuccessMsg] = useState<string | null>(null);

  // Submission & Modal States
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStepText, setSaveStepText] = useState<string>('Saving changes...');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showDiscardModal, setShowDiscardModal] = useState<boolean>(false);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
    };
  }, [logoPreviewUrl]);

  // 1. Load existing profile
  const fetchProfile = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await companyService.getCompanyProfile();

      if (res.profile === null) {
        // Redirection if company hasn't completed onboarding yet
        navigate('/company/onboarding', { replace: true });
        return;
      }

      setProfile(res.profile);

      const loadedState: FormState = {
        companyName: res.profile.companyName || '',
        industry: res.profile.industry || '',
        companySize: res.profile.companySize || null,
        location: res.profile.location || '',
        description: res.profile.description || '',
        website: res.profile.website || '',
        linkedinUrl: res.profile.linkedinUrl || '',
      };

      setFormData(loadedState);
      setInitialData(loadedState);
    } catch (err) {
      console.error('Failed to load company profile for editing:', err);
      setLoadError('Failed to load profile. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // 2. Dirty Check
  const isDirty = useMemo(() => {
    return (
      selectedLogoFile !== null ||
      formData.companyName !== initialData.companyName ||
      formData.industry !== initialData.industry ||
      formData.companySize !== initialData.companySize ||
      formData.location !== initialData.location ||
      formData.description !== initialData.description ||
      formData.website !== initialData.website ||
      formData.linkedinUrl !== initialData.linkedinUrl
    );
  }, [formData, initialData, selectedLogoFile]);

  // Field change handler
  const handleFieldChange = (field: keyof FormState, value: FormState[keyof FormState]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
    if (saveError) setSaveError(null);
  };

  // Safe navigation back to profile
  const handleBack = () => {
    if (isDirty) {
      setShowDiscardModal(true);
    } else {
      navigate('/company/profile');
    }
  };

  // Handle Logo file selection & validation
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoError(null);
    setLogoSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validationErr = validateImageFile(file);
    if (validationErr) {
      setLogoError(validationErr);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Revoke previous preview URL if any
    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
    }

    const preview = URL.createObjectURL(file);
    setSelectedLogoFile(file);
    setLogoPreviewUrl(preview);
  };

  // Revert local preview
  const handleRevertLogo = () => {
    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
    }
    setSelectedLogoFile(null);
    setLogoPreviewUrl(null);
    setLogoError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Trigger Remove Confirmation or Revert
  const handleRemoveLogoClick = () => {
    if (selectedLogoFile && !profile?.logoUrl) {
      handleRevertLogo();
      return;
    }
    setShowRemoveLogoModal(true);
  };

  // Confirm Removal of Server Logo
  const handleConfirmRemoveLogo = async () => {
    setIsRemovingLogo(true);
    setLogoError(null);
    try {
      await companyService.removeCompanyLogo();
      // Clean local preview as well
      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
      setSelectedLogoFile(null);
      setLogoPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Update local profile state
      setProfile((prev) => (prev ? { ...prev, logoUrl: null } : null));
      setShowRemoveLogoModal(false);
      setLogoSuccessMsg('Company logo removed successfully.');
    } catch (err: unknown) {
      console.error('Failed to remove company logo:', err);
      const msg = err instanceof Error ? err.message : 'Failed to remove company logo. Please try again.';
      setLogoError(msg);
      setShowRemoveLogoModal(false);
    } finally {
      setIsRemovingLogo(false);
    }
  };

  // Submit Handler (Two-Phase: Logo first, then profile details)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateCompanyProfile(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      // Phase 1: Upload logo if a new file is chosen
      let updatedLogoUrl = profile?.logoUrl;
      if (selectedLogoFile) {
        setSaveStepText('Uploading company logo...');
        const logoUploadRes = await companyService.uploadCompanyLogo(selectedLogoFile);
        updatedLogoUrl = logoUploadRes.logoUrl;
      }

      // Phase 2: Save company information
      setSaveStepText('Saving company information...');
      const payload: CompanyProfilePayload = {
        companyName: formData.companyName.trim(),
        industry: formData.industry.trim() || null,
        companySize: formData.companySize || null,
        location: formData.location.trim() || null,
        description: formData.description.trim() || null,
        website: formData.website.trim() || null,
        linkedinUrl: formData.linkedinUrl.trim() || null,
        logoUrl: updatedLogoUrl,
      };

      await companyService.updateCompanyProfile(payload);

      // Clean preview URL
      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl);
      }

      // Success: return immediately to /company/profile
      navigate('/company/profile', { replace: true });
    } catch (err: unknown) {
      console.error('Failed to update company profile:', err);
      const msg =
        err instanceof Error
          ? err.message
          : "We couldn't update your company profile. Your changes haven't been lost. Please try again.";
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          backgroundColor: 'var(--color-background)',
          fontFamily: 'var(--font-body)',
        }}
      >
        <LoadingSpinner size="lg" color="var(--color-primary)" />
        <span style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          Loading profile editor...
        </span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          backgroundColor: 'var(--color-background)',
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            width: '100%',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <AlertCircle size={24} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
            Couldn't load company profile
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.925rem', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
            {loadError}
          </p>
          <Button variant="primary" onClick={fetchProfile}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const displayedLogoSrc = logoPreviewUrl || profile?.logoUrl;
  const hasActiveLogo = !!displayedLogoSrc;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', paddingBottom: '5rem' }}>
      <CompanyNavbar
        companyName={formData.companyName || profile?.companyName}
        logoUrl={displayedLogoSrc}
      />

      <main style={{ maxWidth: '860px', margin: '2rem auto 0', padding: '0 1.5rem' }}>
        {/* Back Link */}
        <button
          type="button"
          onClick={handleBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: 'none',
            color: 'var(--color-text-secondary)',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '0.4rem 0',
            marginBottom: '1.25rem',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
        >
          <ArrowLeft size={16} />
          <span>Back to profile</span>
        </button>

        {/* Page Title & Intro */}
        <div style={{ marginBottom: '2rem' }}>
          <h1
            className="page-heading"
            style={{
              fontSize: '1.85rem',
              color: 'var(--color-text-primary)',
              margin: '0 0 0.35rem',
            }}
          >
            Edit company profile
          </h1>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            Keep your employer information accurate and up to date. Changes reflect across all your future listings.
          </p>
        </div>

        {/* Save Error Alert */}
        {saveError && (
          <div style={{ marginBottom: '1.5rem' }}>
            <Alert variant="error" title="Could not update profile">
              {saveError}
            </Alert>
          </div>
        )}

        {/* Logo Removal Success Alert */}
        {logoSuccessMsg && (
          <div style={{ marginBottom: '1.5rem' }}>
            <Alert variant="success" title="Success">
              {logoSuccessMsg}
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Section 1: Company Logo / Identity */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem 2.25rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.15rem',
                fontWeight: 700,
                margin: '0 0 1.25rem',
                color: 'var(--color-text-primary)',
                borderBottom: '1px solid var(--color-border)',
                paddingBottom: '0.75rem',
              }}
            >
              Company Logo
            </h2>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept={ALLOWED_IMAGE_EXTENSIONS}
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
              <CompanyLogo
                src={displayedLogoSrc}
                name={formData.companyName || 'Company'}
                size={84}
              />

              <div style={{ flex: 1, minWidth: '260px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
                  <Button
                    type="button"
                    variant={hasActiveLogo ? 'outline' : 'primary'}
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
                  >
                    <Upload size={14} />
                    <span>{hasActiveLogo ? 'Change Logo' : 'Upload Logo'}</span>
                  </Button>

                  {selectedLogoFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRevertLogo}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-secondary)' }}
                    >
                      <RotateCcw size={14} />
                      <span>Revert</span>
                    </Button>
                  )}

                  {profile?.logoUrl && !selectedLogoFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveLogoClick}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-error)' }}
                    >
                      <Trash2 size={14} />
                      <span>Remove</span>
                    </Button>
                  )}
                </div>

                {selectedLogoFile && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.8rem',
                      color: 'var(--color-primary)',
                      backgroundColor: 'var(--color-primary-light)',
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 600,
                      marginBottom: '0.4rem',
                    }}
                  >
                    <span>Local preview (will be uploaded on Save Changes)</span>
                  </div>
                )}

                <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  JPG, PNG or WebP. Maximum 5 MB. Recommended: square logo with clear padding.
                </p>

                {logoError && (
                  <p style={{ margin: '0.4rem 0 0', fontSize: '0.825rem', color: 'var(--color-error)', fontWeight: 500 }}>
                    {logoError}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Company Details */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem 2.25rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.15rem',
                fontWeight: 700,
                margin: '0 0 1.5rem',
                color: 'var(--color-text-primary)',
                borderBottom: '1px solid var(--color-border)',
                paddingBottom: '0.75rem',
              }}
            >
              Company Details
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <FormField
                label="Company Name"
                htmlFor="companyName"
                error={errors.companyName}
                required
              >
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleFieldChange('companyName', e.target.value)}
                  placeholder="e.g. Nova Technologies"
                  hasError={!!errors.companyName}
                />
              </FormField>

              <FormField
                label="Industry"
                htmlFor="industry"
                error={errors.industry}
              >
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => handleFieldChange('industry', e.target.value)}
                  placeholder="e.g. Software Development, FinTech"
                  hasError={!!errors.industry}
                />
              </FormField>
            </div>

            {/* Company Size Chips */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: '0.5rem',
                }}
              >
                Company Size
              </label>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: '0.65rem',
                }}
              >
                {COMPANY_SIZE_OPTIONS.map((opt) => {
                  const isSelected = formData.companySize === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleFieldChange('companySize', opt.value)}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-lg)',
                        border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface)',
                        color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.2rem',
                        transition: 'all 0.15s ease',
                        outline: 'none',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.borderColor = 'var(--color-primary)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.borderColor = 'var(--color-border)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{opt.label}</span>
                        {isSelected && <Check size={14} strokeWidth={3} color="var(--color-primary)" />}
                      </div>
                      <span style={{ fontSize: '0.725rem', color: isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                        {opt.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location */}
            <FormField
              label="Location"
              htmlFor="location"
              error={errors.location}
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
                  <MapPin size={16} />
                </div>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleFieldChange('location', e.target.value)}
                  placeholder="e.g. Colombo, Sri Lanka or Remote"
                  style={{ paddingLeft: '2.4rem' }}
                  hasError={!!errors.location}
                />
              </div>
            </FormField>
          </div>

          {/* Section 3: About */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem 2.25rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.15rem',
                fontWeight: 700,
                margin: '0 0 1.5rem',
                color: 'var(--color-text-primary)',
                borderBottom: '1px solid var(--color-border)',
                paddingBottom: '0.75rem',
              }}
            >
              About
            </h2>

            <FormField
              label="Description"
              htmlFor="description"
              error={errors.description}
            >
              <textarea
                id="description"
                rows={5}
                maxLength={2000}
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Describe your organization, mission, engineering culture, and work environment..."
                style={{
                  width: '100%',
                  padding: '0.75rem 0.875rem',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.925rem',
                  color: 'var(--color-text-primary)',
                  backgroundColor: 'var(--color-surface)',
                  border: `1px solid ${errors.description ? 'var(--color-error)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  outline: 'none',
                  boxShadow: 'var(--shadow-xs)',
                  resize: 'vertical',
                  lineHeight: 1.6,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = errors.description
                    ? 'var(--color-error)'
                    : 'var(--color-primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.15)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = errors.description
                    ? 'var(--color-error)'
                    : 'var(--color-border)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
                }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  fontSize: '0.775rem',
                  color: formData.description.length >= 2000 ? 'var(--color-error)' : 'var(--color-text-secondary)',
                  marginTop: '0.35rem',
                }}
              >
                <span>{formData.description.length} / 2000</span>
              </div>
            </FormField>
          </div>

          {/* Section 4: Online Presence */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem 2.25rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.15rem',
                fontWeight: 700,
                margin: '0 0 1.5rem',
                color: 'var(--color-text-primary)',
                borderBottom: '1px solid var(--color-border)',
                paddingBottom: '0.75rem',
              }}
            >
              Online Presence
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <FormField
                label="Company Website"
                htmlFor="website"
                error={errors.website}
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
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleFieldChange('website', e.target.value)}
                    placeholder="https://yourcompany.com"
                    style={{ paddingLeft: '2.4rem' }}
                    hasError={!!errors.website}
                  />
                </div>
              </FormField>

              <FormField
                label="LinkedIn Company Page"
                htmlFor="linkedinUrl"
                error={errors.linkedinUrl}
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
                    value={formData.linkedinUrl}
                    onChange={(e) => handleFieldChange('linkedinUrl', e.target.value)}
                    placeholder="https://linkedin.com/company/yourcompany"
                    style={{ paddingLeft: '2.4rem' }}
                    hasError={!!errors.linkedinUrl}
                  />
                </div>
              </FormField>
            </div>
          </div>

          {/* Form Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '1rem',
              marginTop: '0.5rem',
            }}
          >
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleBack}
              disabled={isSaving}
            >
              Cancel
            </Button>

            <Button
              id="save-company-profile-btn"
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSaving}
              disabled={isSaving}
            >
              {isSaving ? saveStepText : 'Save Changes'}
            </Button>
          </div>
        </form>
      </main>

      {/* Remove Logo Confirmation Modal */}
      {showRemoveLogoModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem',
              maxWidth: '440px',
              width: '100%',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Trash2 size={22} />
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  margin: 0,
                  color: 'var(--color-text-primary)',
                }}
              >
                Remove company logo?
              </h3>
            </div>

            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
              Your logo will be removed from your company profile and replaced with the initials fallback.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowRemoveLogoModal(false)}
                disabled={isRemovingLogo}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleConfirmRemoveLogo}
                isLoading={isRemovingLogo}
                disabled={isRemovingLogo}
              >
                {isRemovingLogo ? 'Removing...' : 'Remove Logo'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Discard Unsaved Changes Modal */}
      {showDiscardModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem',
              maxWidth: '440px',
              width: '100%',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#fffbeb',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertCircle size={22} />
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  margin: 0,
                  color: 'var(--color-text-primary)',
                }}
              >
                Discard unsaved changes?
              </h3>
            </div>

            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
              You have modified your company profile. Leaving now will discard all unsaved changes.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDiscardModal(false)}
              >
                Keep Editing
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => {
                  setShowDiscardModal(false);
                  navigate('/company/profile');
                }}
              >
                Discard Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyProfileEditPage;
