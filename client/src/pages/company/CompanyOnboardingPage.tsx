import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CompanyOnboardingLayout,
  CompanyOnboardingProgress,
  CompanyBasicsStep,
  CompanyDetailsStep,
  CompanyPresenceStep,
  CompanyReviewStep,
  CompanyOnboardingSuccess,
} from '../../components/company/onboarding';
import { Alert, LoadingSpinner } from '../../components/ui';
import { companyService } from '../../services/company.service';
import { ApiError } from '../../services/auth.service';
import type { CompanySize, CompanyProfilePayload } from '../../types/company';

const STORAGE_KEY = 'internshiphub_company_onboarding_draft';

interface FormState {
  companyName: string;
  industry: string;
  companySize: CompanySize | null;
  location: string;
  description: string;
  website: string;
  linkedinUrl: string;
  logoUrl: string | null;
}

const initialFormState: FormState = {
  companyName: '',
  industry: '',
  companySize: null,
  location: '',
  description: '',
  website: '',
  linkedinUrl: '',
  logoUrl: null,
};

export const CompanyOnboardingPage: React.FC = () => {
  const navigate = useNavigate();

  // Verification & Loading States
  const [isCheckingProfile, setIsCheckingProfile] = useState<boolean>(true);
  const [checkError, setCheckError] = useState<string | null>(null);

  // Flow & Step State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State with sessionStorage draft restore
  const [formData, setFormData] = useState<FormState>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...initialFormState, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback to initial
    }
    return initialFormState;
  });

  const [stepErrors, setStepErrors] = useState<{ [key: string]: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // 1. Check if company profile already exists. If yes, redirect to dashboard.
  const verifyProfileStatus = async () => {
    setIsCheckingProfile(true);
    setCheckError(null);

    try {
      const res = await companyService.getCompanyProfile();
      if (res.profile !== null) {
        // Existing company with completed profile -> skip onboarding
        navigate('/company/dashboard', { replace: true });
        return;
      }
    } catch (err) {
      console.error('Failed to check company profile status:', err);
      setCheckError('We could not load your company profile. Please check your connection and try again.');
    } finally {
      setIsCheckingProfile(false);
    }
  };

  useEffect(() => {
    verifyProfileStatus();
  }, [navigate]);

  // 2. Persist drafts to sessionStorage on update
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch {
      // Ignore sessionStorage errors
    }
  }, [formData]);

  const handleFieldChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (stepErrors[field]) {
      setStepErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (apiError) setApiError(null);
  };

  // URL Helper validation
  const isValidHttpUrl = (val: string): boolean => {
    if (!val || !val.trim()) return true;
    try {
      const url = new URL(val.trim());
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Step-by-step Validation
  const validateStep = (step: number): boolean => {
    const errors: { [key: string]: string } = {};

    if (step === 1) {
      if (!formData.companyName || !formData.companyName.trim()) {
        errors.companyName = 'Company name is required';
      } else if (formData.companyName.trim().length > 150) {
        errors.companyName = 'Company name cannot exceed 150 characters';
      }

      if (formData.industry && formData.industry.trim().length > 150) {
        errors.industry = 'Industry cannot exceed 150 characters';
      }
    }

    if (step === 2) {
      if (formData.location && formData.location.trim().length > 150) {
        errors.location = 'Location cannot exceed 150 characters';
      }

      if (formData.description && formData.description.trim().length > 2000) {
        errors.description = 'Description cannot exceed 2000 characters';
      }
    }

    if (step === 3) {
      if (formData.website && !isValidHttpUrl(formData.website)) {
        errors.website = 'Must be a valid URL starting with http:// or https://';
      }

      if (formData.linkedinUrl && !isValidHttpUrl(formData.linkedinUrl)) {
        errors.linkedinUrl = 'Must be a valid URL starting with http:// or https://';
      }
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setStepErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Final Profile Submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      const payload: CompanyProfilePayload = {
        companyName: formData.companyName.trim(),
        industry: formData.industry.trim() || null,
        companySize: formData.companySize || null,
        location: formData.location.trim() || null,
        description: formData.description.trim() || null,
        website: formData.website.trim() || null,
        linkedinUrl: formData.linkedinUrl.trim() || null,
        logoUrl: null,
      };

      await companyService.updateCompanyProfile(payload);

      // Clean draft from sessionStorage upon success
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore
      }

      setIsSuccess(true);
    } catch (err: unknown) {
      console.error('Failed to create company profile:', err);
      if (err instanceof ApiError) {
        setApiError(err.message);
      } else {
        setApiError("We couldn't create your company profile. Your information is still here. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Initial Profile Checking Loading Screen
  if (isCheckingProfile) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.25rem',
          backgroundColor: 'var(--color-background)',
          fontFamily: 'var(--font-body)',
        }}
      >
        <span
          className="logo"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--color-text-primary)',
          }}
        >
          Internship<span style={{ color: 'var(--color-primary)' }}>Hub</span>
        </span>
        <LoadingSpinner size="lg" color="var(--color-primary)" />
        <span style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          Preparing your employer workspace...
        </span>
      </div>
    );
  }

  // 2. Profile Check Error Screen
  if (checkError) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          backgroundColor: 'var(--color-background)',
        }}
      >
        <div style={{ maxWidth: '440px', width: '100%' }}>
          <Alert variant="error" title="Couldn't load company profile">
            <p style={{ margin: '0 0 1rem' }}>{checkError}</p>
            <button
              type="button"
              onClick={verifyProfileStatus}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </Alert>
        </div>
      </div>
    );
  }

  // 3. Success Screen
  if (isSuccess) {
    return (
      <CompanyOnboardingLayout>
        <CompanyOnboardingSuccess companyName={formData.companyName} />
      </CompanyOnboardingLayout>
    );
  }

  // 4. Main Onboarding Form Steps
  return (
    <CompanyOnboardingLayout>
      <CompanyOnboardingProgress currentStep={currentStep} totalSteps={4} />

      {apiError && (
        <div style={{ marginBottom: '1.5rem' }}>
          <Alert variant="error" title="Submission failed">
            {apiError}
          </Alert>
        </div>
      )}

      {currentStep === 1 && (
        <CompanyBasicsStep
          companyName={formData.companyName}
          industry={formData.industry}
          errors={stepErrors}
          onChange={handleFieldChange}
          onNext={handleNext}
        />
      )}

      {currentStep === 2 && (
        <CompanyDetailsStep
          companySize={formData.companySize}
          location={formData.location}
          description={formData.description}
          errors={stepErrors}
          onChange={handleFieldChange}
          onBack={handleBack}
          onNext={handleNext}
        />
      )}

      {currentStep === 3 && (
        <CompanyPresenceStep
          website={formData.website}
          linkedinUrl={formData.linkedinUrl}
          errors={stepErrors}
          onChange={handleFieldChange}
          onBack={handleBack}
          onNext={handleNext}
        />
      )}

      {currentStep === 4 && (
        <CompanyReviewStep
          companyName={formData.companyName}
          industry={formData.industry}
          companySize={formData.companySize}
          location={formData.location}
          description={formData.description}
          website={formData.website}
          linkedinUrl={formData.linkedinUrl}
          logoUrl={formData.logoUrl}
          isSubmitting={isSubmitting}
          onBack={handleBack}
          onSubmit={handleSubmit}
        />
      )}
    </CompanyOnboardingLayout>
  );
};

export default CompanyOnboardingPage;
