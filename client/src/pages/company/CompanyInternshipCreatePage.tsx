import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { InternshipForm } from '../../components/company/internships/InternshipForm';
import { companyService } from '../../services/company.service';
import { internshipService } from '../../services/internship.service';
import type { CompanyProfile } from '../../types/company';
import type {
  SkillCategoryCatalogItem,
  CreateInternshipPayload,
} from '../../types/internship';

export const CompanyInternshipCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [skillCategories, setSkillCategories] = useState<SkillCategoryCatalogItem[]>([]);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isSkillsLoading, setIsSkillsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        const [profileRes, skillsRes] = await Promise.all([
          companyService.getCompanyProfile(),
          internshipService.getSkillsCatalog(),
        ]);
        if (!isMounted) return;
        if (!profileRes.profile) {
          navigate('/company/onboarding', { replace: true });
          return;
        }
        setProfile(profileRes.profile);
        if (skillsRes.categories) {
          setSkillCategories(skillsRes.categories);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        if (isMounted) {
          setIsInitializing(false);
          setIsSkillsLoading(false);
        }
      }
    };
    init();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleSubmit = async (payload: CreateInternshipPayload) => {
    setIsSubmitting(true);
    setApiError(null);
    try {
      const response = await internshipService.createInternship(payload);
      if (response.status === 'success' || response.internship) {
        navigate('/company/internships', {
          state: { flashMessage: 'Internship draft created successfully' },
        });
      } else {
        setApiError(response.message || 'Failed to create internship listing');
      }
    } catch (err: any) {
      console.error('Error saving internship draft:', err);
      setApiError(err?.message || 'A network error occurred while saving the draft. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInitializing || !profile) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-background)',
          gap: '1rem',
        }}
      >
        <LoadingSpinner size="lg" />
        <span style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          Loading company workspace...
        </span>
      </div>
    );
  }

  return (
    <InternshipForm
      pageTitle="Create Internship"
      pageSubtitle="Create a new opportunity for students. Save as draft to refine anytime."
      backUrl="/company/internships"
      backLabel="Back to Internships"
      submitButtonText="Save Draft"
      submittingButtonText="Saving..."
      profile={profile}
      skillCategories={skillCategories}
      isSkillsLoading={isSkillsLoading}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      apiError={apiError}
    />
  );
};
