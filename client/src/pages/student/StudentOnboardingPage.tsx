import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FormField,
  Input,
  Button,
  FormError,
  Alert,
  LoadingSpinner,
} from '../../components/ui';
import { studentService } from '../../services/student.service';
import { ApiError } from '../../services/auth.service';
import type {
  SkillCategory,
  WorkType,
  ProficiencyLevel,
  UpdateStudentProfilePayload,
} from '../../types/student';
import { useAuth } from '../../context/AuthContext';

const STORAGE_KEY = 'internshiphub_student_onboarding_draft';

interface FormState {
  university: string;
  degree: string;
  fieldOfStudy: string;
  currentYear: string;
  expectedGraduation: string;
  location: string;
  preferredRole: string;
  preferredWorkType: WorkType | '';
  selectedSkills: {
    skillId: string;
    name: string;
    category: string;
    proficiency: ProficiencyLevel;
  }[];
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
  const { user } = useAuth();

  // Verification & Catalog Loading States
  const [isCheckingProfile, setIsCheckingProfile] = useState<boolean>(true);
  const [isLoadingSkills, setIsLoadingSkills] = useState<boolean>(true);
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  // Form Progress & Submissions
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormState>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...initialFormState, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback if sessionStorage is disabled/inaccessible
    }
    return initialFormState;
  });

  const [stepErrors, setStepErrors] = useState<{ [key: string]: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Skill Search
  const [skillSearchQuery, setSkillSearchQuery] = useState<string>('');

  // 1. Check if profile already exists. If yes, redirect to dashboard.
  useEffect(() => {
    let isMounted = true;
    const checkExistingProfile = async () => {
      try {
        const res = await studentService.getProfile();
        if (!isMounted) return;

        if (res.profile !== null) {
          // Profile exists, no need for onboarding
          navigate('/student/dashboard', { replace: true });
          return;
        }
      } catch (err) {
        console.error('Failed to verify profile status:', err);
      } finally {
        if (isMounted) setIsCheckingProfile(false);
      }
    };

    checkExistingProfile();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // 2. Fetch Skill Catalog
  const fetchSkillCatalog = async () => {
    setIsLoadingSkills(true);
    setCatalogError(null);
    try {
      const res = await studentService.getSkills();
      if (res.categories) {
        setCategories(res.categories);
      }
    } catch (err: any) {
      console.error('Failed to load skill catalog:', err);
      setCatalogError(err.message || 'We could not load the skill catalog. Please try again.');
    } finally {
      setIsLoadingSkills(false);
    }
  };

  useEffect(() => {
    fetchSkillCatalog();
  }, []);

  // 3. Persist non-sensitive form draft to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch {
      // Ignore storage quota/permission errors
    }
  }, [formData]);

  // Field change helpers
  const handleInputChange = (field: keyof FormState, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-level error on edit
    if (stepErrors[field]) {
      setStepErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
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
      const yearNum = Number(formData.currentYear);
      if (isNaN(yearNum) || yearNum < 1 || yearNum > 10) {
        errors.currentYear = 'Current year must be between 1 and 10';
      }
    }

    if (formData.expectedGraduation) {
      const dateVal = Date.parse(formData.expectedGraduation);
      if (isNaN(dateVal)) {
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
      errors.preferredRole = 'Preferred internship role is required (e.g. Software Engineer Intern)';
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

  // Navigation between steps
  const handleContinue = () => {
    setApiError(null);
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(3);
    } else if (currentStep === 3) {
      if (validateStep3()) setCurrentStep(4);
    }
  };

  const handleBack = () => {
    setApiError(null);
    setStepErrors({});
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Skill Selection handlers
  const handleToggleSkill = (skill: { id: string; name: string }, categoryName: string) => {
    setFormData((prev) => {
      const exists = prev.selectedSkills.some((s) => s.skillId === skill.id);
      if (exists) {
        return {
          ...prev,
          selectedSkills: prev.selectedSkills.filter((s) => s.skillId !== skill.id),
        };
      } else {
        return {
          ...prev,
          selectedSkills: [
            ...prev.selectedSkills,
            {
              skillId: skill.id,
              name: skill.name,
              category: categoryName,
              proficiency: 'INTERMEDIATE', // Sensible default
            },
          ],
        };
      }
    });

    if (stepErrors.skills) {
      setStepErrors((prev) => {
        const u = { ...prev };
        delete u.skills;
        return u;
      });
    }
  };

  const handleSetProficiency = (skillId: string, proficiency: ProficiencyLevel) => {
    setFormData((prev) => ({
      ...prev,
      selectedSkills: prev.selectedSkills.map((s) =>
        s.skillId === skillId ? { ...s, proficiency } : s
      ),
    }));
  };

  const handleRemoveSkill = (skillId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedSkills: prev.selectedSkills.filter((s) => s.skillId !== skillId),
    }));
  };

  // Final Form Submission
  const handleSubmitProfile = async () => {
    if (!validateStep4()) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      let gradDateFormatted: string | null = null;
      if (formData.expectedGraduation) {
        // If year-month format (e.g. 2027-06), make it first of month
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
        preferredWorkType: (formData.preferredWorkType as WorkType) || null,
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

      await studentService.updateProfile(payload);

      // On successful creation, clear draft from sessionStorage
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore
      }

      // Navigate to student dashboard
      navigate('/student/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Failed to complete onboarding profile:', err);
      if (err instanceof ApiError && err.errors && err.errors.length > 0) {
        setApiError(err.errors.map((e) => e.message).join('. '));
      } else {
        setApiError(err.message || 'Failed to complete profile. Please check your inputs.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter skills client-side based on search query
  const filteredCategories = useMemo(() => {
    if (!skillSearchQuery.trim()) return categories;

    const query = skillSearchQuery.toLowerCase().trim();
    return categories
      .map((cat) => ({
        ...cat,
        skills: cat.skills.filter((skill) =>
          skill.name.toLowerCase().includes(query)
        ),
      }))
      .filter((cat) => cat.skills.length > 0);
  }, [categories, skillSearchQuery]);

  // Loading Screen while checking profile
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
        <LoadingSpinner size="lg" color="var(--color-primary)" />
        <span style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          Checking onboarding status...
        </span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', paddingBottom: '4rem' }}>
      {/* Top Header */}
      <header
        style={{
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span className="logo" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              Internship<span style={{ color: 'var(--color-primary)' }}>Hub</span>
            </span>
          </Link>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--color-primary)',
              backgroundColor: 'var(--color-primary-light)',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
            }}
          >
            STUDENT ONBOARDING
          </span>
        </div>

        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          Logged in as <strong style={{ color: 'var(--color-text-primary)' }}>{user?.name || user?.email}</strong>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '780px', margin: '2.5rem auto 0', padding: '0 1.5rem' }}>
        {/* Progress Tracker Card */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.75rem 2rem',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h1 className="page-heading" style={{ fontSize: '1.35rem', margin: 0 }}>
                Complete your profile
              </h1>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                Help companies discover your background and match you with internships
              </p>
            </div>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--color-primary)',
                backgroundColor: 'var(--color-primary-light)',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
              }}
            >
              Step {currentStep} of 4
            </span>
          </div>

          {/* Stepper Dots & Line */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            {/* Step 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', zIndex: 1 }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  backgroundColor: currentStep >= 1 ? 'var(--color-primary)' : 'var(--color-border)',
                  color: currentStep >= 1 ? '#ffffff' : 'var(--color-text-secondary)',
                  transition: 'all 0.2s ease',
                }}
              >
                {currentStep > 1 ? '✓' : '1'}
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: currentStep === 1 ? 700 : 500, color: currentStep === 1 ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                Education
              </span>
            </div>

            {/* Connecting bar 1 */}
            <div
              style={{
                flex: 1,
                height: '3px',
                backgroundColor: currentStep > 1 ? 'var(--color-primary)' : 'var(--color-border)',
                margin: '0 0.5rem -1rem',
                transition: 'all 0.3s ease',
              }}
            />

            {/* Step 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', zIndex: 1 }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  backgroundColor: currentStep >= 2 ? 'var(--color-primary)' : 'var(--color-border)',
                  color: currentStep >= 2 ? '#ffffff' : 'var(--color-text-secondary)',
                  transition: 'all 0.2s ease',
                }}
              >
                {currentStep > 2 ? '✓' : '2'}
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: currentStep === 2 ? 700 : 500, color: currentStep === 2 ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                Preferences
              </span>
            </div>

            {/* Connecting bar 2 */}
            <div
              style={{
                flex: 1,
                height: '3px',
                backgroundColor: currentStep > 2 ? 'var(--color-primary)' : 'var(--color-border)',
                margin: '0 0.5rem -1rem',
                transition: 'all 0.3s ease',
              }}
            />

            {/* Step 3 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', zIndex: 1 }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  backgroundColor: currentStep >= 3 ? 'var(--color-primary)' : 'var(--color-border)',
                  color: currentStep >= 3 ? '#ffffff' : 'var(--color-text-secondary)',
                  transition: 'all 0.2s ease',
                }}
              >
                {currentStep > 3 ? '✓' : '3'}
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: currentStep === 3 ? 700 : 500, color: currentStep === 3 ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                Skills
              </span>
            </div>

            {/* Connecting bar 3 */}
            <div
              style={{
                flex: 1,
                height: '3px',
                backgroundColor: currentStep > 3 ? 'var(--color-primary)' : 'var(--color-border)',
                margin: '0 0.5rem -1rem',
                transition: 'all 0.3s ease',
              }}
            />

            {/* Step 4 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', zIndex: 1 }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  backgroundColor: currentStep >= 4 ? 'var(--color-primary)' : 'var(--color-border)',
                  color: currentStep >= 4 ? '#ffffff' : 'var(--color-text-secondary)',
                  transition: 'all 0.2s ease',
                }}
              >
                4
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: currentStep === 4 ? 700 : 500, color: currentStep === 4 ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                About & Links
              </span>
            </div>
          </div>
        </div>

        {/* Global API Error Banner */}
        {apiError && (
          <div style={{ marginBottom: '1.5rem' }}>
            <Alert variant="error" title="Submission Error">
              {apiError}
            </Alert>
          </div>
        )}

        {/* Form Content Card */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.25rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {/* STEP 1: Education */}
          {currentStep === 1 && (
            <div>
              <div style={{ marginBottom: '1.75rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
                  Education
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                  Tell us about your university, degree, and current academic standing.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <FormField
                  htmlFor="university"
                  label="University / Institution *"
                  error={stepErrors.university}
                >
                  <Input
                    id="university"
                    name="university"
                    placeholder="e.g. University of Colombo"
                    value={formData.university}
                    onChange={(e) => handleInputChange('university', e.target.value)}
                    hasError={!!stepErrors.university}
                  />
                </FormField>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <FormField htmlFor="degree" label="Degree Program" error={stepErrors.degree}>
                    <Input
                      id="degree"
                      name="degree"
                      placeholder="e.g. BSc in Information Systems"
                      value={formData.degree}
                      onChange={(e) => handleInputChange('degree', e.target.value)}
                    />
                  </FormField>

                  <FormField htmlFor="fieldOfStudy" label="Field of Study" error={stepErrors.fieldOfStudy}>
                    <Input
                      id="fieldOfStudy"
                      name="fieldOfStudy"
                      placeholder="e.g. Computer Science & Engineering"
                      value={formData.fieldOfStudy}
                      onChange={(e) => handleInputChange('fieldOfStudy', e.target.value)}
                    />
                  </FormField>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <FormField htmlFor="currentYear" label="Current Study Year" error={stepErrors.currentYear}>
                    <select
                      id="currentYear"
                      value={formData.currentYear}
                      onChange={(e) => handleInputChange('currentYear', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.625rem 0.875rem',
                        fontSize: '0.95rem',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text-primary)',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="1">Year 1 (Freshman)</option>
                      <option value="2">Year 2 (Sophomore)</option>
                      <option value="3">Year 3 (Junior)</option>
                      <option value="4">Year 4 (Senior)</option>
                      <option value="5">Year 5 / Master's</option>
                    </select>
                  </FormField>

                  <FormField
                    htmlFor="expectedGraduation"
                    label="Expected Graduation Date"
                    error={stepErrors.expectedGraduation}
                  >
                    <Input
                      id="expectedGraduation"
                      name="expectedGraduation"
                      type="month"
                      value={formData.expectedGraduation}
                      onChange={(e) => handleInputChange('expectedGraduation', e.target.value)}
                      hasError={!!stepErrors.expectedGraduation}
                    />
                  </FormField>
                </div>

                <FormField htmlFor="location" label="Location (City, Country)" error={stepErrors.location}>
                  <Input
                    id="location"
                    name="location"
                    placeholder="e.g. Colombo, Sri Lanka"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </FormField>
              </div>
            </div>
          )}

          {/* STEP 2: Preferences */}
          {currentStep === 2 && (
            <div>
              <div style={{ marginBottom: '1.75rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
                  Career Preferences
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                  What type of internship opportunities are you seeking?
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <FormField
                  htmlFor="preferredRole"
                  label="Preferred Internship Role *"
                  error={stepErrors.preferredRole}
                >
                  <Input
                    id="preferredRole"
                    name="preferredRole"
                    placeholder="e.g. Frontend Developer Intern, Data Analyst Intern"
                    value={formData.preferredRole}
                    onChange={(e) => handleInputChange('preferredRole', e.target.value)}
                    hasError={!!stepErrors.preferredRole}
                  />
                </FormField>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      marginBottom: '0.75rem',
                    }}
                  >
                    Preferred Work Arrangement
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    {[
                      { type: 'REMOTE', icon: '🏠', label: 'Remote', desc: 'Work from anywhere' },
                      { type: 'HYBRID', icon: '🏢', label: 'Hybrid', desc: 'Mix of office & remote' },
                      { type: 'ONSITE', icon: '📍', label: 'On-site', desc: 'Full-time at the office' },
                    ].map((item) => {
                      const isSelected = formData.preferredWorkType === item.type;
                      return (
                        <div
                          key={item.type}
                          onClick={() => handleInputChange('preferredWorkType', item.type)}
                          style={{
                            border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                            backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface)',
                            borderRadius: 'var(--radius-lg)',
                            padding: '1.25rem 1rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <span style={{ fontSize: '1.75rem' }}>{item.icon}</span>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
                            {item.label}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                            {item.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Skills */}
          {currentStep === 3 && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
                  Your Skills & Proficiencies
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                  Select the technologies and competencies you possess. We'll use these to match you with top internships.
                </p>
              </div>

              {stepErrors.skills && (
                <div style={{ marginBottom: '1rem' }}>
                  <FormError message={stepErrors.skills} />
                </div>
              )}

              {/* Skill Catalog Loading / Error States */}
              {isLoadingSkills && (
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                  <LoadingSpinner size="md" color="var(--color-primary)" />
                  <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.75rem', fontSize: '0.9rem' }}>
                    Loading skills catalog...
                  </p>
                </div>
              )}

              {catalogError && (
                <Alert variant="error" title="Catalog Error">
                  {catalogError}
                  <div style={{ marginTop: '0.5rem' }}>
                    <Button size="sm" variant="outline" onClick={fetchSkillCatalog}>
                      Try Again
                    </Button>
                  </div>
                </Alert>
              )}

              {!isLoadingSkills && !catalogError && (
                <div>
                  {/* Skill Search Input */}
                  <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                    <Input
                      id="skill-search"
                      name="skillSearch"
                      placeholder="Search skills (e.g. React, Python, Git)... 🔍"
                      value={skillSearchQuery}
                      onChange={(e) => setSkillSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Selected Skills Panel */}
                  {formData.selectedSkills.length > 0 && (
                    <div
                      style={{
                        backgroundColor: 'var(--color-background)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1.25rem',
                        marginBottom: '1.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          Selected Skills ({formData.selectedSkills.length})
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                          Set your proficiency level for each skill
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                        {formData.selectedSkills.map((item) => (
                          <div
                            key={item.skillId}
                            style={{
                              backgroundColor: 'var(--color-surface)',
                              border: '1px solid var(--color-border)',
                              borderRadius: 'var(--radius-md)',
                              padding: '0.625rem 0.875rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '0.5rem',
                            }}
                          >
                            <div>
                              <strong style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                                {item.name}
                              </strong>
                              <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                • {item.category}
                              </span>
                            </div>

                            {/* Proficiency Segmented Control */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div
                                style={{
                                  display: 'flex',
                                  backgroundColor: 'var(--color-background)',
                                  padding: '2px',
                                  borderRadius: 'var(--radius-md)',
                                  border: '1px solid var(--color-border)',
                                }}
                              >
                                {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as ProficiencyLevel[]).map((level) => {
                                  const isActive = item.proficiency === level;
                                  return (
                                    <button
                                      key={level}
                                      type="button"
                                      onClick={() => handleSetProficiency(item.skillId, level)}
                                      style={{
                                        border: 'none',
                                        backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                                        color: isActive ? '#ffffff' : 'var(--color-text-secondary)',
                                        fontSize: '0.75rem',
                                        fontWeight: isActive ? 700 : 500,
                                        padding: '0.25rem 0.6rem',
                                        borderRadius: 'var(--radius-sm)',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                      }}
                                    >
                                      {level.charAt(0) + level.slice(1).toLowerCase()}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Remove button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(item.skillId)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--color-error)',
                                  cursor: 'pointer',
                                  fontSize: '1rem',
                                  padding: '0.2rem 0.4rem',
                                  borderRadius: '4px',
                                }}
                                title="Remove skill"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Categories and Skill Chips */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {filteredCategories.map((category) => (
                      <div key={category.id}>
                        <h3
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            color: 'var(--color-text-secondary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            margin: '0 0 0.5rem',
                          }}
                        >
                          {category.name}
                        </h3>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {category.skills.map((skill) => {
                            const isSelected = formData.selectedSkills.some((s) => s.skillId === skill.id);
                            return (
                              <button
                                key={skill.id}
                                type="button"
                                onClick={() => handleToggleSkill(skill, category.name)}
                                style={{
                                  border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                  backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface)',
                                  color: isSelected ? 'var(--color-primary-dark)' : 'var(--color-text-primary)',
                                  fontWeight: isSelected ? 700 : 500,
                                  fontSize: '0.85rem',
                                  padding: '0.4rem 0.85rem',
                                  borderRadius: 'var(--radius-full)',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                <span>{skill.name}</span>
                                {isSelected && <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>✓</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: About & Links */}
          {currentStep === 4 && (
            <div>
              <div style={{ marginBottom: '1.75rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
                  Almost done!
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                  Share links to your work and tell companies a little more about yourself.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Bio Field */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label
                      htmlFor="bio"
                      style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}
                    >
                      Bio & Summary
                    </label>
                    <span style={{ fontSize: '0.75rem', color: formData.bio.length > 1000 ? 'var(--color-error)' : 'var(--color-text-secondary)' }}>
                      {formData.bio.length} / 1000
                    </span>
                  </div>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    placeholder="Briefly describe your passions, interests, projects, or what makes you a great intern..."
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.875rem',
                      fontSize: '0.95rem',
                      fontFamily: 'inherit',
                      borderRadius: 'var(--radius-lg)',
                      border: `1px solid ${stepErrors.bio ? 'var(--color-error)' : 'var(--color-border)'}`,
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-primary)',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                  {stepErrors.bio && <FormError message={stepErrors.bio} />}
                </div>

                {/* Professional Links */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <FormField htmlFor="githubUrl" label="GitHub Profile URL" error={stepErrors.githubUrl}>
                    <Input
                      id="githubUrl"
                      name="githubUrl"
                      placeholder="https://github.com/yourusername"
                      value={formData.githubUrl}
                      onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                      hasError={!!stepErrors.githubUrl}
                    />
                  </FormField>

                  <FormField htmlFor="linkedinUrl" label="LinkedIn Profile URL" error={stepErrors.linkedinUrl}>
                    <Input
                      id="linkedinUrl"
                      name="linkedinUrl"
                      placeholder="https://linkedin.com/in/yourprofile"
                      value={formData.linkedinUrl}
                      onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                      hasError={!!stepErrors.linkedinUrl}
                    />
                  </FormField>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <FormField htmlFor="portfolioUrl" label="Portfolio / Personal Website" error={stepErrors.portfolioUrl}>
                    <Input
                      id="portfolioUrl"
                      name="portfolioUrl"
                      placeholder="https://yourportfolio.dev"
                      value={formData.portfolioUrl}
                      onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
                      hasError={!!stepErrors.portfolioUrl}
                    />
                  </FormField>

                  <FormField htmlFor="cvUrl" label="Online CV / Resume Link" error={stepErrors.cvUrl}>
                    <Input
                      id="cvUrl"
                      name="cvUrl"
                      placeholder="https://drive.google.com/... or resume URL"
                      value={formData.cvUrl}
                      onChange={(e) => handleInputChange('cvUrl', e.target.value)}
                      hasError={!!stepErrors.cvUrl}
                    />
                  </FormField>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--color-primary-light)',
                    border: '1px solid rgba(79, 70, 229, 0.2)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '0.875rem 1rem',
                    fontSize: '0.85rem',
                    color: 'var(--color-primary-dark)',
                  }}
                >
                  💡 <strong>Tip:</strong> Direct CV and certificate file uploads will be available in the upcoming profile storage update. For now, you can link your Google Drive, Notion, or personal hosted PDF.
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div
            style={{
              marginTop: '2.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                ← Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <Button
                type="button"
                variant="primary"
                onClick={handleContinue}
              >
                Continue →
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                onClick={handleSubmitProfile}
                isLoading={isSubmitting}
              >
                Complete Profile ✓
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentOnboardingPage;
