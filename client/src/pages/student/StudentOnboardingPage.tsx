import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  OnboardingLayout,
  OnboardingProgress,
  EducationStep,
  PreferencesStep,
  SkillsStep,
  AboutStep,
  OnboardingSuccess,
} from '../../components/student/onboarding';
import { Alert, LoadingSpinner } from '../../components/ui';
import { studentService } from '../../services/student.service';
import { ApiError } from '../../services/auth.service';
import type {
  SkillCategory,
  SelectedSkill,
  ProficiencyLevel,
  WorkType,
  UpdateStudentProfilePayload,
} from '../../types/student';

const STORAGE_KEY = 'internshiphub_student_onboarding_draft';

interface FormState {
  university: string;
  degree: string;
  fieldOfStudy: string;
  currentYear: string;
  expectedGraduation: string;
  location: string;
  preferredRole: string;
  preferredWorkType: WorkType;
  selectedSkills: SelectedSkill[];
  bio: string;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  cvUrl: string;
}

const initialFormState: FormState = {
  university: '',
  degree: '',
  fieldOfStudy: '',
  currentYear: '3',
  expectedGraduation: '',
  location: '',
  preferredRole: '',
  preferredWorkType: 'REMOTE',
  selectedSkills: [],
  bio: '',
  githubUrl: '',
  linkedinUrl: '',
  portfolioUrl: '',
  cvUrl: '',
};

export const StudentOnboardingPage: React.FC = () => {
  const navigate = useNavigate();

  // Verification & Loading States
  const [isCheckingProfile, setIsCheckingProfile] = useState<boolean>(true);
  const [isLoadingSkills, setIsLoadingSkills] = useState<boolean>(true);
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);

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
      // Fallback
    }
    return initialFormState;
  });

  const [stepErrors, setStepErrors] = useState<{ [key: string]: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // 1. Check if profile already exists. If yes, redirect to dashboard.
  useEffect(() => {
    let isMounted = true;
    const verifyProfileStatus = async () => {
      try {
        const res = await studentService.getStudentProfile();
        if (!isMounted) return;

        if (res.profile !== null) {
          // Existing student with profile -> skip onboarding
          navigate('/student/dashboard', { replace: true });
          return;
        }
      } catch (err) {
        console.error('Failed to verify profile status:', err);
      } finally {
        if (isMounted) setIsCheckingProfile(false);
      }
    };

    verifyProfileStatus();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // 2. Fetch Skill Catalog
  const fetchSkillCatalog = async () => {
    setIsLoadingSkills(true);
    setCatalogError(null);
    try {
      const res = await studentService.getSkillCatalog();
      if (res.categories) {
        setCategories(res.categories);
      }
    } catch (err: unknown) {
      console.error('Failed to load skill catalog:', err);
      const msg = err instanceof Error ? err.message : 'We could not load the skill catalog. Please try again.';
      setCatalogError(msg);
    } finally {
      setIsLoadingSkills(false);
    }
  };

  useEffect(() => {
    fetchSkillCatalog();
  }, []);

  // 3. Persist draft to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch {
      // Ignore
    }
  }, [formData]);

  // Field change helpers
  const handleFieldChange = (field: keyof FormState, value: FormState[keyof FormState]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (stepErrors[field]) {
      setStepErrors((prev) => {
        const u = { ...prev };
        delete u[field];
        return u;
      });
    }
  };

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.university.trim()) {
      errors.university = 'University or institution name is required';
    }

    if (formData.currentYear) {
      const year = Number(formData.currentYear);
      if (isNaN(year) || year < 1 || year > 10) {
        errors.currentYear = 'Current year must be between 1 and 10';
      }
    }

    if (formData.expectedGraduation) {
      const parsed = Date.parse(formData.expectedGraduation);
      if (isNaN(parsed)) {
        errors.expectedGraduation = 'Please enter a valid graduation date';
      }
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.preferredRole.trim()) {
      errors.preferredRole = 'Preferred internship role is required (e.g. Frontend Developer Intern)';
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 3 Validation
  const validateStep3 = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (formData.selectedSkills.length === 0) {
      errors.skills = 'Please select at least one skill to help companies discover your profile';
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 4 Validation
  const validateStep4 = (): boolean => {
    const errors: { [key: string]: string } = {};
    const urlRegex = /^https?:\/\/.+/i;

    if (formData.githubUrl.trim() && !urlRegex.test(formData.githubUrl.trim())) {
      errors.githubUrl = 'Must be a valid URL starting with http:// or https://';
    }

    if (formData.linkedinUrl.trim() && !urlRegex.test(formData.linkedinUrl.trim())) {
      errors.linkedinUrl = 'Must be a valid URL starting with http:// or https://';
    }

    if (formData.portfolioUrl.trim() && !urlRegex.test(formData.portfolioUrl.trim())) {
      errors.portfolioUrl = 'Must be a valid URL starting with http:// or https://';
    }

    if (formData.cvUrl.trim() && !urlRegex.test(formData.cvUrl.trim())) {
      errors.cvUrl = 'Must be a valid URL starting with http:// or https://';
    }

    if (formData.bio.length > 1000) {
      errors.bio = 'Bio cannot exceed 1000 characters';
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step Navigation
  const handleNext = () => {
    setApiError(null);
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    } else if (currentStep === 3 && validateStep3()) {
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    setApiError(null);
    setStepErrors({});
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Skill management handlers
  const handleToggleSkill = (skill: { id: string; name: string }, categoryName: string) => {
    setFormData((prev) => {
      const exists = prev.selectedSkills.some((s) => s.skillId === skill.id);
      if (exists) {
        return {
          ...prev,
          selectedSkills: prev.selectedSkills.filter((s) => s.skillId !== skill.id),
        };
      }
      return {
        ...prev,
        selectedSkills: [
          ...prev.selectedSkills,
          {
            skillId: skill.id,
            name: skill.name,
            category: categoryName,
            proficiency: 'INTERMEDIATE',
          },
        ],
      };
    });

    if (stepErrors.skills) {
      setStepErrors((prev) => {
        const u = { ...prev };
        delete u.skills;
        return u;
      });
    }
  };

  const handleSetProficiency = (skillId: string, level: ProficiencyLevel) => {
    setFormData((prev) => ({
      ...prev,
      selectedSkills: prev.selectedSkills.map((s) =>
        s.skillId === skillId ? { ...s, proficiency: level } : s
      ),
    }));
  };

  const handleRemoveSkill = (skillId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedSkills: prev.selectedSkills.filter((s) => s.skillId !== skillId),
    }));
  };

  // Submit Profile (PUT /api/student/profile)
  const handleSubmitProfile = async () => {
    if (!validateStep4()) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      let gradDateFormatted: string | null = null;
      if (formData.expectedGraduation) {
        if (formData.expectedGraduation.length === 7) {
          gradDateFormatted = `${formData.expectedGraduation}-01T00:00:00.000Z`;
        } else {
          gradDateFormatted = new Date(formData.expectedGraduation).toISOString();
        }
      }

      const payload: UpdateStudentProfilePayload = {
        university: formData.university.trim() || null,
        degree: formData.degree.trim() || null,
        fieldOfStudy: formData.fieldOfStudy.trim() || null,
        currentYear: formData.currentYear ? Number(formData.currentYear) : null,
        expectedGraduation: gradDateFormatted,
        location: formData.location.trim() || null,
        preferredRole: formData.preferredRole.trim() || null,
        preferredWorkType: formData.preferredWorkType,
        bio: formData.bio.trim() || null,
        githubUrl: formData.githubUrl.trim() || null,
        linkedinUrl: formData.linkedinUrl.trim() || null,
        portfolioUrl: formData.portfolioUrl.trim() || null,
        cvUrl: formData.cvUrl.trim() || null,
        skills: formData.selectedSkills.map((s) => ({
          skillId: s.skillId,
          proficiency: s.proficiency,
        })),
      };

      await studentService.updateStudentProfile(payload);

      // Clear draft on success
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore
      }

      // Display polished success screen
      setIsSuccess(true);
    } catch (err: unknown) {
      console.error('Failed to complete onboarding profile:', err);
      if (err instanceof ApiError && err.errors && err.errors.length > 0) {
        setApiError(err.errors.map((e) => e.message).join('. '));
      } else {
        const msg = err instanceof Error ? err.message : "We couldn't save your profile. Your information is still here. Please try again.";
        setApiError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading Screen while verifying profile existence
  if (isCheckingProfile) {
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
        <span
          className="logo"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.75rem',
            fontWeight: 800,
            marginBottom: '0.5rem',
          }}
        >
          Internship<span style={{ color: 'var(--color-primary)' }}>Hub</span>
        </span>
        <LoadingSpinner size="lg" color="var(--color-primary)" />
        <span
          style={{
            fontSize: '0.95rem',
            color: 'var(--color-text-secondary)',
            fontWeight: 500,
          }}
        >
          Preparing your experience...
        </span>
      </div>
    );
  }

  return (
    <OnboardingLayout>
      {isSuccess ? (
        <OnboardingSuccess
          onContinue={() => navigate('/student/dashboard', { replace: true })}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Progress Indicator */}
          <OnboardingProgress currentStep={currentStep} totalSteps={4} />

          {/* API Error Notification Banner */}
          {apiError && (
            <div style={{ marginBottom: '1.5rem' }}>
              <Alert variant="error" title="Submission Error">
                {apiError}
              </Alert>
            </div>
          )}

          {/* Steps */}
          {currentStep === 1 && (
            <EducationStep
              data={{
                university: formData.university,
                degree: formData.degree,
                fieldOfStudy: formData.fieldOfStudy,
                currentYear: formData.currentYear,
                expectedGraduation: formData.expectedGraduation,
                location: formData.location,
              }}
              errors={stepErrors}
              onChange={handleFieldChange}
              onNext={handleNext}
            />
          )}

          {currentStep === 2 && (
            <PreferencesStep
              data={{
                preferredRole: formData.preferredRole,
                preferredWorkType: formData.preferredWorkType,
              }}
              errors={stepErrors}
              onChange={handleFieldChange}
              onBack={handleBack}
              onNext={handleNext}
            />
          )}

          {currentStep === 3 && (
            <SkillsStep
              categories={categories}
              selectedSkills={formData.selectedSkills}
              isLoading={isLoadingSkills}
              error={catalogError}
              validationError={stepErrors.skills}
              onRetry={fetchSkillCatalog}
              onToggleSkill={handleToggleSkill}
              onSetProficiency={handleSetProficiency}
              onRemoveSkill={handleRemoveSkill}
              onBack={handleBack}
              onNext={handleNext}
            />
          )}

          {currentStep === 4 && (
            <AboutStep
              data={{
                bio: formData.bio,
                githubUrl: formData.githubUrl,
                linkedinUrl: formData.linkedinUrl,
                portfolioUrl: formData.portfolioUrl,
                cvUrl: formData.cvUrl,
              }}
              errors={stepErrors}
              isSubmitting={isSubmitting}
              onChange={handleFieldChange}
              onBack={handleBack}
              onSubmit={handleSubmitProfile}
            />
          )}
        </div>
      )}
    </OnboardingLayout>
  );
};

export default StudentOnboardingPage;
