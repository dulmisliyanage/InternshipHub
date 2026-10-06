import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Check,
  X,
  AlertCircle,
  Building2,
  DollarSign,
  Layers,
  Sparkles,
} from 'lucide-react';
import { CompanyNavbar } from '../../components/company/CompanyNavbar';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { companyService } from '../../services/company.service';
import { internshipService } from '../../services/internship.service';
import type { CompanyProfile } from '../../types/company';
import type {
  WorkType,
  InternshipSkillType,
  SkillCategoryCatalogItem,
  CreateInternshipPayload,
} from '../../types/internship';

const CATEGORY_SUGGESTIONS = [
  'Software Engineering',
  'Frontend Development',
  'Backend Development',
  'Full Stack Development',
  'UI/UX Design',
  'Data Science & Analytics',
  'Mobile App Development',
  'DevOps & Cloud',
  'Quality Assurance & Testing',
  'Cybersecurity',
  'Product Management',
  'Business Analysis',
  'Other',
];

interface SelectedSkillState {
  skillId: string;
  name: string;
  categoryName?: string;
  type: InternshipSkillType;
}

export const CompanyInternshipCreatePage: React.FC = () => {
  const navigate = useNavigate();

  // Company Profile
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Skill Catalog
  const [skillCategories, setSkillCategories] = useState<SkillCategoryCatalogItem[]>([]);
  const [isSkillsLoading, setIsSkillsLoading] = useState<boolean>(true);
  const [skillSearch, setSkillSearch] = useState<string>('');

  // Form Fields
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [responsibilities, setResponsibilities] = useState<string>('');
  const [workType, setWorkType] = useState<WorkType>('HYBRID');
  const [location, setLocation] = useState<string>('');
  const [duration, setDuration] = useState<string>('6 months');
  const [allowanceMin, setAllowanceMin] = useState<string>('');
  const [allowanceMax, setAllowanceMax] = useState<string>('');
  const [currency, setCurrency] = useState<string>('LKR');
  const [positions, setPositions] = useState<string>('1');
  const [applicationDeadline, setApplicationDeadline] = useState<string>('');

  // Selected Skills
  const [selectedSkills, setSelectedSkills] = useState<Map<string, SelectedSkillState>>(new Map());

  // Form State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [showDiscardModal, setShowDiscardModal] = useState<boolean>(false);

  // Check if form is dirty
  const isDirty = useMemo(() => {
    return (
      title.trim().length > 0 ||
      category.trim().length > 0 ||
      description.trim().length > 0 ||
      responsibilities.trim().length > 0 ||
      location.trim().length > 0 ||
      allowanceMin.trim().length > 0 ||
      allowanceMax.trim().length > 0 ||
      applicationDeadline.trim().length > 0 ||
      selectedSkills.size > 0
    );
  }, [
    title,
    category,
    description,
    responsibilities,
    location,
    allowanceMin,
    allowanceMax,
    applicationDeadline,
    selectedSkills,
  ]);

  // Window beforeunload warning for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Load Company Profile & Skills Catalog
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
        if (profileRes.profile.location && !location) {
          setLocation(profileRes.profile.location);
        }

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

  // Skill Search filtering
  const filteredCategories = useMemo(() => {
    const query = skillSearch.trim().toLowerCase();
    if (!query) return skillCategories;

    return skillCategories
      .map((cat) => ({
        ...cat,
        skills: cat.skills.filter((s) => s.name.toLowerCase().includes(query)),
      }))
      .filter((cat) => cat.skills.length > 0);
  }, [skillCategories, skillSearch]);

  // Toggle/Add Skill handler
  const handleToggleSkill = useCallback(
    (skillId: string, name: string, categoryName: string, defaultType: InternshipSkillType = 'REQUIRED') => {
      setSelectedSkills((prev) => {
        const next = new Map(prev);
        if (next.has(skillId)) {
          next.delete(skillId);
        } else {
          next.set(skillId, {
            skillId,
            name,
            categoryName,
            type: defaultType,
          });
        }
        return next;
      });
    },
    []
  );

  // Switch skill between REQUIRED and PREFERRED
  const handleSwitchSkillType = useCallback((skillId: string) => {
    setSelectedSkills((prev) => {
      const next = new Map(prev);
      const item = next.get(skillId);
      if (item) {
        next.set(skillId, {
          ...item,
          type: item.type === 'REQUIRED' ? 'PREFERRED' : 'REQUIRED',
        });
      }
      return next;
    });
  }, []);

  // Remove skill
  const handleRemoveSkill = useCallback((skillId: string) => {
    setSelectedSkills((prev) => {
      const next = new Map(prev);
      next.delete(skillId);
      return next;
    });
  }, []);

  // Form Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = 'Internship title is required';
    } else if (title.trim().length > 150) {
      errors.title = 'Title cannot exceed 150 characters';
    }

    if (!description.trim()) {
      errors.description = 'Description is required';
    } else if (description.trim().length > 5000) {
      errors.description = 'Description cannot exceed 5000 characters';
    }

    if (responsibilities.trim().length > 5000) {
      errors.responsibilities = 'Responsibilities cannot exceed 5000 characters';
    }

    if (category.trim().length > 150) {
      errors.category = 'Category cannot exceed 150 characters';
    }

    if (location.trim().length > 150) {
      errors.location = 'Location cannot exceed 150 characters';
    }

    if (duration.trim().length > 100) {
      errors.duration = 'Duration cannot exceed 100 characters';
    }

    const minNum = allowanceMin.trim() ? Number(allowanceMin) : null;
    const maxNum = allowanceMax.trim() ? Number(allowanceMax) : null;

    if (minNum != null && (isNaN(minNum) || minNum < 0)) {
      errors.allowanceMin = 'Minimum allowance cannot be negative';
    }
    if (maxNum != null && (isNaN(maxNum) || maxNum < 0)) {
      errors.allowanceMax = 'Maximum allowance cannot be negative';
    }
    if (minNum != null && maxNum != null && minNum > maxNum) {
      errors.allowanceMin = 'Minimum allowance cannot exceed maximum allowance';
    }

    const posNum = Number(positions);
    if (isNaN(posNum) || posNum < 1) {
      errors.positions = 'Positions must be at least 1';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler: Save Draft
  const handleSaveDraft = async () => {
    setApiError(null);

    if (!validateForm()) {
      const firstErrorKey = Object.keys(formErrors)[0];
      const el = document.getElementById(`field-${firstErrorKey}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateInternshipPayload = {
        title: title.trim(),
        category: category.trim() || null,
        description: description.trim(),
        responsibilities: responsibilities.trim() || null,
        location: location.trim() || null,
        workType,
        duration: duration.trim() || null,
        allowanceMin: allowanceMin.trim() ? Math.floor(Number(allowanceMin)) : null,
        allowanceMax: allowanceMax.trim() ? Math.floor(Number(allowanceMax)) : null,
        currency: currency.trim() || 'LKR',
        positions: positions.trim() ? Math.max(1, Math.floor(Number(positions))) : 1,
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline).toISOString() : null,
        skills: Array.from(selectedSkills.values()).map((s) => ({
          skillId: s.skillId,
          type: s.type,
        })),
      };

      const res = await internshipService.createInternship(payload);

      if (res.status === 'success') {
        navigate('/company/internships', { replace: true });
      }
    } catch (err: any) {
      console.error('Error creating internship draft:', err);
      setApiError(err?.message || 'Failed to save internship draft. Please check your inputs and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Safe navigation back
  const handleBackClick = (e: React.MouseEvent) => {
    if (isDirty) {
      e.preventDefault();
      setShowDiscardModal(true);
    }
  };

  if (isInitializing) {
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
          Loading internship workspace...
        </span>
      </div>
    );
  }

  const companyDisplayName = profile?.companyName || 'Company';

  const requiredSkills = Array.from(selectedSkills.values()).filter((s) => s.type === 'REQUIRED');
  const preferredSkills = Array.from(selectedSkills.values()).filter((s) => s.type === 'PREFERRED');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', paddingBottom: '6rem' }}>
      <CompanyNavbar companyName={companyDisplayName} logoUrl={profile?.logoUrl} />

      <main style={{ maxWidth: '920px', margin: '2rem auto', padding: '0 1.5rem' }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '1.25rem' }}>
          <Link
            to="/company/internships"
            onClick={handleBackClick}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--color-text-secondary)',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
          >
            <ArrowLeft size={16} />
            <span>Back to Internships</span>
          </Link>
        </div>

        {/* Top Header & Action Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1.25rem',
            flexWrap: 'wrap',
            marginBottom: '2rem',
          }}
        >
          <div>
            <h1
              className="page-heading"
              style={{
                fontSize: '1.85rem',
                fontWeight: 800,
                color: 'var(--color-text-primary)',
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              Create Internship
            </h1>
            <p
              style={{
                fontSize: '0.95rem',
                color: 'var(--color-text-secondary)',
                marginTop: '0.35rem',
                marginBottom: 0,
              }}
            >
              Create a new opportunity for students. Save as draft to refine anytime.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleBackClick}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              id="top-save-draft-btn"
              type="button"
              variant="primary"
              size="md"
              onClick={handleSaveDraft}
              isLoading={isSubmitting}
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              Save Draft
            </Button>
          </div>
        </div>

        {/* Global Error Banner */}
        {apiError && (
          <div
            style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem 1.25rem',
              marginBottom: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: 'var(--color-error)',
            }}
          >
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.9rem', fontWeight: 500, lineHeight: 1.4 }}>{apiError}</div>
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* SECTION 1: Basic Information */}
          <section
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Layers size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Basic Information</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Core details that define this opportunity.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Title Field */}
              <div id="field-title">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Internship Title <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-disabled)' }}>
                    {title.length}/150
                  </span>
                </div>
                <input
                  type="text"
                  value={title}
                  maxLength={150}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (formErrors.title) setFormErrors((p) => ({ ...p, title: '' }));
                  }}
                  placeholder="e.g. Software Engineering Intern"
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.95rem',
                    borderRadius: 'var(--radius-md)',
                    border: formErrors.title ? '1.5px solid var(--color-error)' : '1px solid var(--color-border)',
                    fontSize: '0.95rem',
                    fontFamily: 'var(--font-body)',
                    outline: 'none',
                    backgroundColor: 'var(--color-surface)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = formErrors.title ? 'var(--color-error)' : 'var(--color-primary)')}
                  onBlur={(e) => (e.target.style.borderColor = formErrors.title ? 'var(--color-error)' : 'var(--color-border)')}
                />
                {formErrors.title && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-error)', marginTop: '0.3rem', display: 'block' }}>
                    {formErrors.title}
                  </span>
                )}
              </div>

              {/* Category Field */}
              <div id="field-category">
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: '0.4rem' }}>
                  Category
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    list="categories-list"
                    value={category}
                    maxLength={150}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      if (formErrors.category) setFormErrors((p) => ({ ...p, category: '' }));
                    }}
                    placeholder="Select or enter category (e.g. Software Engineering)"
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.95rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.95rem',
                      fontFamily: 'var(--font-body)',
                      outline: 'none',
                    }}
                  />
                  <datalist id="categories-list">
                    {CATEGORY_SUGGESTIONS.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Description Field */}
              <div id="field-description">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Description <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-disabled)' }}>
                    {description.length}/5000
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={description}
                  maxLength={5000}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (formErrors.description) setFormErrors((p) => ({ ...p, description: '' }));
                  }}
                  placeholder="Provide an overview of the internship role, team structure, learning opportunities, and work culture..."
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.95rem',
                    borderRadius: 'var(--radius-md)',
                    border: formErrors.description ? '1.5px solid var(--color-error)' : '1px solid var(--color-border)',
                    fontSize: '0.925rem',
                    fontFamily: 'var(--font-body)',
                    lineHeight: 1.5,
                    resize: 'vertical',
                    outline: 'none',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = formErrors.description ? 'var(--color-error)' : 'var(--color-primary)')}
                  onBlur={(e) => (e.target.style.borderColor = formErrors.description ? 'var(--color-error)' : 'var(--color-border)')}
                />
                {formErrors.description && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-error)', marginTop: '0.3rem', display: 'block' }}>
                    {formErrors.description}
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* SECTION 2: Role Details */}
          <section
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Building2 size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Role Details</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Workplace arrangements, day-to-day responsibilities, and duration.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Responsibilities Field */}
              <div id="field-responsibilities">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Key Responsibilities
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-disabled)' }}>
                    {responsibilities.length}/5000
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={responsibilities}
                  maxLength={5000}
                  onChange={(e) => setResponsibilities(e.target.value)}
                  placeholder="• Assist with building scalable frontend features&#10;• Collaborate with cross-functional teams in agile sprints&#10;• Participate in design and code reviews"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.95rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.925rem',
                    fontFamily: 'var(--font-body)',
                    lineHeight: 1.5,
                    resize: 'vertical',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Work Type Selection */}
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                  Work Type <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                  {(['ONSITE', 'HYBRID', 'REMOTE'] as WorkType[]).map((type) => {
                    const isSelected = workType === type;
                    const labels: Record<WorkType, { title: string; desc: string }> = {
                      ONSITE: { title: 'On-site', desc: 'Work from office' },
                      HYBRID: { title: 'Hybrid', desc: 'Office & remote balance' },
                      REMOTE: { title: 'Remote', desc: 'Work anywhere' },
                    };

                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setWorkType(type)}
                        style={{
                          padding: '0.85rem 1rem',
                          borderRadius: 'var(--radius-lg)',
                          border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                          backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface)',
                          color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.2rem',
                        }}
                      >
                        <span style={{ fontWeight: 700, fontSize: '0.925rem' }}>{labels[type].title}</span>
                        <span style={{ fontSize: '0.75rem', color: isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                          {labels[type].desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location & Duration Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div id="field-location">
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: '0.4rem' }}>
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    maxLength={150}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Colombo, Sri Lanka"
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.95rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-disabled)', marginTop: '0.25rem', display: 'block' }}>
                    Primary office or regional location.
                  </span>
                </div>

                <div id="field-duration">
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: '0.4rem' }}>
                    Duration
                  </label>
                  <input
                    type="text"
                    value={duration}
                    maxLength={100}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 6 months"
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.95rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-disabled)', marginTop: '0.25rem', display: 'block' }}>
                    Typical placement duration (e.g. 3 months, 6 months).
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: Compensation & Availability */}
          <section
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DollarSign size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Compensation & Availability</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Monthly stipend, opening capacity, and deadline.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Allowance Group */}
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: '0.4rem' }}>
                  Monthly Allowance / Stipend
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', alignItems: 'start' }}>
                  <div>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={allowanceMin}
                      onChange={(e) => {
                        setAllowanceMin(e.target.value);
                        if (formErrors.allowanceMin) setFormErrors((p) => ({ ...p, allowanceMin: '' }));
                      }}
                      placeholder="Min (e.g. 30000)"
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.95rem',
                        borderRadius: 'var(--radius-md)',
                        border: formErrors.allowanceMin ? '1.5px solid var(--color-error)' : '1px solid var(--color-border)',
                        fontSize: '0.95rem',
                        outline: 'none',
                      }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-disabled)', marginTop: '0.2rem', display: 'block' }}>
                      Minimum (LKR)
                    </span>
                  </div>

                  <div>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={allowanceMax}
                      onChange={(e) => {
                        setAllowanceMax(e.target.value);
                        if (formErrors.allowanceMin) setFormErrors((p) => ({ ...p, allowanceMin: '' }));
                      }}
                      placeholder="Max (e.g. 40000)"
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.95rem',
                        borderRadius: 'var(--radius-md)',
                        border: formErrors.allowanceMin ? '1.5px solid var(--color-error)' : '1px solid var(--color-border)',
                        fontSize: '0.95rem',
                        outline: 'none',
                      }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-disabled)', marginTop: '0.2rem', display: 'block' }}>
                      Maximum (LKR)
                    </span>
                  </div>

                  <div>
                    <input
                      type="text"
                      maxLength={10}
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                      placeholder="Currency"
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.95rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        fontSize: '0.95rem',
                        outline: 'none',
                      }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-disabled)', marginTop: '0.2rem', display: 'block' }}>
                      Currency Code
                    </span>
                  </div>
                </div>

                {formErrors.allowanceMin && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-error)', marginTop: '0.35rem', display: 'block' }}>
                    {formErrors.allowanceMin}
                  </span>
                )}

                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.45rem', marginBottom: 0 }}>
                  💡 Leave both allowance fields blank if this role is unpaid or compensation is undisclosed. Set both to the same amount for a fixed stipend.
                </p>
              </div>

              {/* Positions & Deadline Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div id="field-positions">
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: '0.4rem' }}>
                    Available Positions <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={positions}
                    onChange={(e) => {
                      setPositions(e.target.value);
                      if (formErrors.positions) setFormErrors((p) => ({ ...p, positions: '' }));
                    }}
                    placeholder="1"
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.95rem',
                      borderRadius: 'var(--radius-md)',
                      border: formErrors.positions ? '1.5px solid var(--color-error)' : '1px solid var(--color-border)',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                  {formErrors.positions && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-error)', marginTop: '0.3rem', display: 'block' }}>
                      {formErrors.positions}
                    </span>
                  )}
                </div>

                <div id="field-deadline">
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: '0.4rem' }}>
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    value={applicationDeadline}
                    onChange={(e) => setApplicationDeadline(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.95rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.95rem',
                      fontFamily: 'var(--font-body)',
                      outline: 'none',
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-disabled)', marginTop: '0.25rem', display: 'block' }}>
                    Final date for candidates to submit applications.
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: Skills Selector */}
          <section
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Required & Preferred Skills</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Tag skills from our standardized catalog to enable transparent student skill comparisons.
                </span>
              </div>
            </div>

            {/* Selected Skills Preview Panel */}
            <div
              style={{
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                marginBottom: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Selected Skills ({selectedSkills.size})
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  Click a skill chip to toggle between Required and Preferred, or click × to remove.
                </span>
              </div>

              {selectedSkills.size === 0 ? (
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-disabled)', fontStyle: 'italic', padding: '0.5rem 0' }}>
                  No skills selected yet. Select skills from the catalog below.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  {/* Required Column */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                      <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#065F46' }}>
                        Required ({requiredSkills.length})
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                      {requiredSkills.length === 0 ? (
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-disabled)' }}>
                          No required skills added.
                        </span>
                      ) : (
                        requiredSkills.map((s) => (
                          <div
                            key={s.skillId}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              padding: '0.3rem 0.65rem',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: '#ECFDF5',
                              border: '1px solid #A7F3D0',
                              color: '#065F46',
                              fontSize: '0.825rem',
                              fontWeight: 600,
                            }}
                          >
                            <span>{s.name}</span>
                            <button
                              type="button"
                              onClick={() => handleSwitchSkillType(s.skillId)}
                              title="Switch to Preferred"
                              style={{
                                border: 'none',
                                background: 'transparent',
                                color: '#047857',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                padding: '0 0.2rem',
                              }}
                            >
                              make preferred
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(s.skillId)}
                              title="Remove skill"
                              style={{
                                border: 'none',
                                background: 'transparent',
                                color: '#065F46',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                padding: 0,
                              }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Preferred Column */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6366F1' }} />
                      <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#3730A3' }}>
                        Preferred ({preferredSkills.length})
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                      {preferredSkills.length === 0 ? (
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-disabled)' }}>
                          No preferred skills added.
                        </span>
                      ) : (
                        preferredSkills.map((s) => (
                          <div
                            key={s.skillId}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              padding: '0.3rem 0.65rem',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: '#EEF2FF',
                              border: '1px solid #C7D2FE',
                              color: '#3730A3',
                              fontSize: '0.825rem',
                              fontWeight: 600,
                            }}
                          >
                            <span>{s.name}</span>
                            <button
                              type="button"
                              onClick={() => handleSwitchSkillType(s.skillId)}
                              title="Switch to Required"
                              style={{
                                border: 'none',
                                background: 'transparent',
                                color: '#4338CA',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                padding: '0 0.2rem',
                              }}
                            >
                              make required
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(s.skillId)}
                              title="Remove skill"
                              style={{
                                border: 'none',
                                background: 'transparent',
                                color: '#3730A3',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                padding: 0,
                              }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Skill Catalog Search & Selector */}
            <div>
              <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                <Search
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.9rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-disabled)',
                  }}
                />
                <input
                  type="text"
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  placeholder="Search standardized skills (e.g. React, Python, Git)..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.95rem 0.65rem 2.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
                {skillSearch && (
                  <button
                    type="button"
                    onClick={() => setSkillSearch('')}
                    style={{
                      position: 'absolute',
                      right: '0.9rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--color-text-disabled)',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {isSkillsLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <LoadingSpinner size="md" color="var(--color-primary)" />
                </div>
              ) : filteredCategories.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  No skills matching "{skillSearch}" found.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '380px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {filteredCategories.map((cat) => (
                    <div key={cat.id}>
                      <h4
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          color: 'var(--color-text-secondary)',
                          marginBottom: '0.5rem',
                        }}
                      >
                        {cat.name}
                      </h4>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                        {cat.skills.map((skill) => {
                          const selected = selectedSkills.get(skill.id);
                          const isSelected = !!selected;

                          return (
                            <button
                              key={skill.id}
                              type="button"
                              onClick={() => handleToggleSkill(skill.id, skill.name, cat.name)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.35rem 0.75rem',
                                borderRadius: 'var(--radius-full)',
                                border: isSelected
                                  ? selected.type === 'REQUIRED'
                                    ? '1px solid #059669'
                                    : '1px solid #4F46E5'
                                  : '1px solid var(--color-border)',
                                backgroundColor: isSelected
                                  ? selected.type === 'REQUIRED'
                                    ? '#ECFDF5'
                                    : '#EEF2FF'
                                  : 'var(--color-surface)',
                                color: isSelected
                                  ? selected.type === 'REQUIRED'
                                    ? '#065F46'
                                    : '#3730A3'
                                  : 'var(--color-text-primary)',
                                fontSize: '0.825rem',
                                fontWeight: isSelected ? 700 : 500,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              {isSelected && <Check size={13} />}
                              <span>{skill.name}</span>
                              {isSelected && (
                                <span
                                  style={{
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    opacity: 0.8,
                                    marginLeft: '0.15rem',
                                  }}
                                >
                                  ({selected.type === 'REQUIRED' ? 'Req' : 'Pref'})
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Bottom Action Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '1rem',
              paddingTop: '0.5rem',
            }}
          >
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleBackClick}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              id="bottom-save-draft-btn"
              type="button"
              variant="primary"
              size="md"
              onClick={handleSaveDraft}
              isLoading={isSubmitting}
              style={{ minWidth: '140px', boxShadow: 'var(--shadow-sm)' }}
            >
              Save Draft
            </Button>
          </div>
        </form>
      </main>

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
                  backgroundColor: '#FFFBEB',
                  color: '#D97706',
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
              You have entered details for this internship listing. Leaving now will discard your progress.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDiscardModal(false)}
              >
                Stay
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => {
                  setShowDiscardModal(false);
                  navigate('/company/internships');
                }}
              >
                Discard & Leave
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
