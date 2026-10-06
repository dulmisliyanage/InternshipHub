import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { CompanyNavbar } from '../../components/company/CompanyNavbar';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { InternshipForm, type SelectedSkillState } from '../../components/company/internships/InternshipForm';
import { companyService } from '../../services/company.service';
import { internshipService } from '../../services/internship.service';
import type { CompanyProfile } from '../../types/company';
import type {
  Internship,
  SkillCategoryCatalogItem,
  CreateInternshipPayload,
} from '../../types/internship';

export const CompanyInternshipEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [internship, setInternship] = useState<Internship | null>(null);
  const [skillCategories, setSkillCategories] = useState<SkillCategoryCatalogItem[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!id) {
      setIsNotFound(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsNotFound(false);
    setLoadError(null);

    try {
      const [profileRes, skillsRes, internshipRes] = await Promise.allSettled([
        companyService.getCompanyProfile(),
        internshipService.getSkillsCatalog(),
        internshipService.getCompanyInternshipById(id),
      ]);

      // Check Profile
      if (profileRes.status === 'fulfilled') {
        if (!profileRes.value.profile) {
          navigate('/company/onboarding', { replace: true });
          return;
        }
        setProfile(profileRes.value.profile);
      } else {
        throw new Error('Failed to load company profile');
      }

      // Check Skills Catalog
      if (skillsRes.status === 'fulfilled' && skillsRes.value.categories) {
        setSkillCategories(skillsRes.value.categories);
      }

      // Check Internship
      if (internshipRes.status === 'fulfilled') {
        const item = internshipRes.value.internship;
        if (!item) {
          setIsNotFound(true);
        } else {
          setInternship(item);
        }
      } else {
        const errorReason = internshipRes.reason;
        if (errorReason?.status === 404) {
          setIsNotFound(true);
        } else {
          setLoadError(errorReason?.message || 'We could not load this internship.');
        }
      }
    } catch (err: any) {
      console.error('Error loading edit page:', err);
      setLoadError(err?.message || 'We encountered an error loading this internship.');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (payload: CreateInternshipPayload) => {
    if (!id) return;
    setIsSubmitting(true);
    setApiError(null);

    try {
      const response = await internshipService.updateCompanyInternship(id, payload);
      if (response.status === 'success' || response.internship) {
        navigate(`/company/internships/${id}`, {
          state: { flashMessage: 'Internship listing updated successfully' },
        });
      } else {
        setApiError(response.message || 'Failed to update internship listing');
      }
    } catch (err: any) {
      console.error('Error updating internship:', err);
      setApiError(err?.message || 'A network error occurred while updating the listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading State
  if (isLoading) {
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
          Loading internship details...
        </span>
      </div>
    );
  }

  // Not Found State (Safe 404 for tenant isolation)
  if (isNotFound) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
        <CompanyNavbar companyName={profile?.companyName || 'Company'} logoUrl={profile?.logoUrl} />
        <main
          style={{
            maxWidth: '560px',
            margin: '5rem auto',
            padding: '2.5rem',
            textAlign: 'center',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: '#FEE2E2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-error)',
              margin: '0 auto 1.25rem auto',
            }}
          >
            <AlertCircle size={28} />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
            Internship not found
          </h2>
          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--color-text-secondary)',
              marginTop: '0.5rem',
              marginBottom: '1.75rem',
              lineHeight: 1.5,
            }}
          >
            This internship may no longer exist or you may not have access to it.
          </p>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/company/internships')}
            leftIcon={<ArrowLeft size={16} />}
          >
            Back to Internships
          </Button>
        </main>
      </div>
    );
  }

  // Error State
  if (loadError || !internship || !profile) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
        <CompanyNavbar companyName={profile?.companyName || 'Company'} logoUrl={profile?.logoUrl} />
        <main
          style={{
            maxWidth: '560px',
            margin: '5rem auto',
            padding: '2.5rem',
            textAlign: 'center',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D97706',
              margin: '0 auto 1.25rem auto',
            }}
          >
            <AlertCircle size={28} />
          </div>

          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
            Unable to load internship
          </h2>
          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--color-text-secondary)',
              marginTop: '0.5rem',
              marginBottom: '1.75rem',
              lineHeight: 1.5,
            }}
          >
            {loadError || 'An unexpected error occurred while loading the listing.'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/company/internships')}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={loadData}
              leftIcon={<RefreshCw size={16} />}
            >
              Try Again
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Format initialSkills for InternshipForm
  const initialSkills: SelectedSkillState[] = (internship.skills || []).map((s) => ({
    skillId: s.skillId,
    name: s.name,
    categoryName: s.category || undefined,
    type: s.type,
  }));

  // Format initialData for InternshipForm
  const initialData: Partial<CreateInternshipPayload> = {
    title: internship.title,
    category: internship.category,
    description: internship.description,
    responsibilities: internship.responsibilities,
    workType: internship.workType,
    location: internship.location,
    duration: internship.duration,
    allowanceMin: internship.allowanceMin,
    allowanceMax: internship.allowanceMax,
    currency: internship.currency || 'LKR',
    positions: internship.positions,
    applicationDeadline: internship.applicationDeadline,
  };

  return (
    <InternshipForm
      pageTitle="Edit Internship"
      pageSubtitle="Update listing details, requirements, and standardized skills."
      backUrl={`/company/internships/${id}`}
      backLabel="Back to Internship Details"
      submitButtonText="Save Changes"
      submittingButtonText="Saving..."
      initialData={initialData}
      initialSkills={initialSkills}
      profile={profile}
      skillCategories={skillCategories}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      apiError={apiError}
    />
  );
};
