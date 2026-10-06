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
import { CompanyNavbar } from '../CompanyNavbar';
import { Button } from '../../ui/Button';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import type { CompanyProfile } from '../../../types/company';
import type {
  WorkType,
  InternshipSkillType,
  SkillCategoryCatalogItem,
  CreateInternshipPayload,
} from '../../../types/internship';

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

export interface SelectedSkillState {
  skillId: string;
  name: string;
  categoryName?: string;
  type: InternshipSkillType;
}

export interface InternshipFormProps {
  initialData?: Partial<CreateInternshipPayload>;
  initialSkills?: SelectedSkillState[];
  onSubmit: (payload: CreateInternshipPayload) => Promise<void>;
  isSubmitting: boolean;
  submitButtonText?: string;
  submittingButtonText?: string;
  pageTitle: string;
  pageSubtitle: string;
  backUrl: string;
  backLabel?: string;
  apiError?: string | null;
  profile: CompanyProfile;
  skillCategories: SkillCategoryCatalogItem[];
  isSkillsLoading?: boolean;
}

function formatDateForInput(dateStr?: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

export const InternshipForm: React.FC<InternshipFormProps> = ({
  initialData,
  initialSkills = [],
  onSubmit,
  isSubmitting,
  submitButtonText = 'Save Draft',
  submittingButtonText = 'Saving...',
  pageTitle,
  pageSubtitle,
  backUrl,
  backLabel = 'Back to Internships',
  apiError,
  profile,
  skillCategories,
  isSkillsLoading = false,
}) => {
  const navigate = useNavigate();

  // Form Fields
  const [title, setTitle] = useState<string>(initialData?.title || '');
  const [category, setCategory] = useState<string>(initialData?.category || '');
  const [description, setDescription] = useState<string>(initialData?.description || '');
  const [responsibilities, setResponsibilities] = useState<string>(
    initialData?.responsibilities || ''
  );
  const [workType, setWorkType] = useState<WorkType>(initialData?.workType || 'HYBRID');
  const [location, setLocation] = useState<string>(
    initialData?.location !== undefined ? initialData.location || '' : profile?.location || ''
  );
  const [duration, setDuration] = useState<string>(
    initialData?.duration !== undefined ? initialData.duration || '' : '6 months'
  );
  const [allowanceMin, setAllowanceMin] = useState<string>(
    initialData?.allowanceMin != null ? String(initialData.allowanceMin) : ''
  );
  const [allowanceMax, setAllowanceMax] = useState<string>(
    initialData?.allowanceMax != null ? String(initialData.allowanceMax) : ''
  );
  const [currency, setCurrency] = useState<string>(initialData?.currency || 'LKR');
  const [positions, setPositions] = useState<string>(
    initialData?.positions != null ? String(initialData.positions) : '1'
  );
  const [applicationDeadline, setApplicationDeadline] = useState<string>(
    formatDateForInput(initialData?.applicationDeadline)
  );

  // Selected Skills
  const [selectedSkills, setSelectedSkills] = useState<Map<string, SelectedSkillState>>(() => {
    const map = new Map<string, SelectedSkillState>();
    initialSkills.forEach((s) => map.set(s.skillId, s));
    return map;
  });

  // UI state
  const [skillSearch, setSkillSearch] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showDiscardModal, setShowDiscardModal] = useState<boolean>(false);

  // Initial reference state for dirty comparison
  const initialMapHash = useMemo(() => {
    return Array.from(selectedSkills.entries())
      .map(([id, item]) => `${id}:${item.type}`)
      .sort()
      .join('|');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDirty = useMemo(() => {
    if (initialData) {
      // Edit mode: compare against initial data
      const origTitle = initialData.title || '';
      const origCategory = initialData.category || '';
      const origDescription = initialData.description || '';
      const origResponsibilities = initialData.responsibilities || '';
      const origWorkType = initialData.workType || 'HYBRID';
      const origLocation = initialData.location || '';
      const origDuration = initialData.duration || '6 months';
      const origMin = initialData.allowanceMin != null ? String(initialData.allowanceMin) : '';
      const origMax = initialData.allowanceMax != null ? String(initialData.allowanceMax) : '';
      const origCurrency = initialData.currency || 'LKR';
      const origPositions = initialData.positions != null ? String(initialData.positions) : '1';
      const origDeadline = formatDateForInput(initialData.applicationDeadline);

      const currentSkillsHash = Array.from(selectedSkills.entries())
        .map(([id, item]) => `${id}:${item.type}`)
        .sort()
        .join('|');

      return (
        title !== origTitle ||
        category !== origCategory ||
        description !== origDescription ||
        responsibilities !== origResponsibilities ||
        workType !== origWorkType ||
        location !== origLocation ||
        duration !== origDuration ||
        allowanceMin !== origMin ||
        allowanceMax !== origMax ||
        currency !== origCurrency ||
        positions !== origPositions ||
        applicationDeadline !== origDeadline ||
        currentSkillsHash !== initialMapHash
      );
    }

    // Create mode: dirty if user typed anything
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
    initialData,
    initialMapHash,
    title,
    category,
    description,
    responsibilities,
    workType,
    location,
    duration,
    allowanceMin,
    allowanceMax,
    currency,
    positions,
    applicationDeadline,
    selectedSkills,
  ]);

  // Window beforeunload warning
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

  // Flatten catalog skills for search
  const flatCatalogSkills = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      categoryName: string;
      categoryId: string;
    }> = [];

    skillCategories.forEach((cat) => {
      cat.skills.forEach((skill) => {
        list.push({
          id: skill.id,
          name: skill.name,
          categoryName: cat.name,
          categoryId: cat.id,
        });
      });
    });

    return list;
  }, [skillCategories]);

  // Filter skills based on search term
  const filteredSkills = useMemo(() => {
    const term = skillSearch.trim().toLowerCase();
    if (!term) return flatCatalogSkills;
    return flatCatalogSkills.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.categoryName.toLowerCase().includes(term)
    );
  }, [flatCatalogSkills, skillSearch]);

  // Toggle skill selection
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

    // Work type validation
    if (!['ONSITE', 'HYBRID', 'REMOTE'].includes(workType)) {
      errors.workType = 'Please select a valid work type';
    }

    // Positions validation
    const posNum = parseInt(positions, 10);
    if (isNaN(posNum) || posNum < 1) {
      errors.positions = 'Number of positions must be at least 1';
    }

    // Allowance validation
    let minVal: number | null = null;
    let maxVal: number | null = null;

    if (allowanceMin.trim()) {
      const minParsed = parseFloat(allowanceMin);
      if (isNaN(minParsed) || minParsed < 0) {
        errors.allowanceMin = 'Minimum allowance cannot be negative';
      } else {
        minVal = minParsed;
      }
    }

    if (allowanceMax.trim()) {
      const maxParsed = parseFloat(allowanceMax);
      if (isNaN(maxParsed) || maxParsed < 0) {
        errors.allowanceMax = 'Maximum allowance cannot be negative';
      } else {
        maxVal = maxParsed;
      }
    }

    if (minVal !== null && maxVal !== null && minVal > maxVal) {
      errors.allowanceMin = 'Minimum allowance cannot be greater than maximum allowance';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const skillsPayload = Array.from(selectedSkills.values()).map((s) => ({
      skillId: s.skillId,
      type: s.type,
    }));

    const payload: CreateInternshipPayload = {
      title: title.trim(),
      category: category.trim() || null,
      description: description.trim(),
      responsibilities: responsibilities.trim() || null,
      workType,
      location: location.trim() || null,
      duration: duration.trim() || null,
      allowanceMin: allowanceMin.trim() ? parseFloat(allowanceMin) : null,
      allowanceMax: allowanceMax.trim() ? parseFloat(allowanceMax) : null,
      currency: currency.trim() || 'LKR',
      positions: parseInt(positions, 10) || 1,
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline).toISOString() : null,
      skills: skillsPayload,
    };

    await onSubmit(payload);
  };

  const handleBackClick = (e: React.MouseEvent) => {
    if (isDirty) {
      e.preventDefault();
      setShowDiscardModal(true);
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardModal(false);
    navigate(backUrl);
  };

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
            to={backUrl}
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
            <span>{backLabel}</span>
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
              {pageTitle}
            </h1>
            <p
              style={{
                fontSize: '0.95rem',
                color: 'var(--color-text-secondary)',
                marginTop: '0.35rem',
                marginBottom: 0,
              }}
            >
              {pageSubtitle}
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
              id="top-save-btn"
              type="submit"
              form="internship-form"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              {isSubmitting ? submittingButtonText : submitButtonText}
            </Button>
          </div>
        </div>

        {/* API Error Banner */}
        {apiError && (
          <div
            style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              marginBottom: '1.75rem',
              color: '#991B1B',
            }}
          >
            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>Unable to save listing</h4>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', lineHeight: 1.4 }}>{apiError}</p>
            </div>
          </div>
        )}

        <form id="internship-form" onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* SECTION 1: BASIC INFORMATION */}
            <section
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '2rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <h2
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Building2 size={20} color="var(--color-primary)" />
                  Basic Information
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem', marginBottom: 0 }}>
                  Define the core identity and summary of the internship role.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Title */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label
                      htmlFor="internship-title"
                      style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}
                    >
                      Internship Title <span style={{ color: 'var(--color-error)' }}>*</span>
                    </label>
                    <span style={{ fontSize: '0.8rem', color: title.length > 150 ? 'var(--color-error)' : 'var(--color-text-muted)' }}>
                      {title.length}/150
                    </span>
                  </div>
                  <input
                    id="internship-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Software Engineering Intern"
                    maxLength={150}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${formErrors.title ? 'var(--color-error)' : 'var(--color-border)'}`,
                      fontSize: '0.95rem',
                      color: 'var(--color-text-primary)',
                      backgroundColor: 'var(--color-background)',
                      outline: 'none',
                      transition: 'border-color 0.15s ease',
                    }}
                  />
                  {formErrors.title && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-error)', margin: '0.35rem 0 0 0' }}>
                      {formErrors.title}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label
                      htmlFor="internship-category"
                      style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}
                    >
                      Category
                    </label>
                  </div>
                  <input
                    id="internship-category"
                    type="text"
                    list="category-suggestions"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Select or enter a category (e.g. Software Engineering)"
                    maxLength={150}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${formErrors.category ? 'var(--color-error)' : 'var(--color-border)'}`,
                      fontSize: '0.95rem',
                      color: 'var(--color-text-primary)',
                      backgroundColor: 'var(--color-background)',
                      outline: 'none',
                    }}
                  />
                  <datalist id="category-suggestions">
                    {CATEGORY_SUGGESTIONS.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                  {formErrors.category && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-error)', margin: '0.35rem 0 0 0' }}>
                      {formErrors.category}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label
                      htmlFor="internship-description"
                      style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}
                    >
                      Description <span style={{ color: 'var(--color-error)' }}>*</span>
                    </label>
                    <span style={{ fontSize: '0.8rem', color: description.length > 5000 ? 'var(--color-error)' : 'var(--color-text-muted)' }}>
                      {description.length}/5000
                    </span>
                  </div>
                  <textarea
                    id="internship-description"
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a comprehensive summary of the role, what the intern will learn, and what your team does..."
                    maxLength={5000}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${formErrors.description ? 'var(--color-error)' : 'var(--color-border)'}`,
                      fontSize: '0.95rem',
                      color: 'var(--color-text-primary)',
                      backgroundColor: 'var(--color-background)',
                      outline: 'none',
                      fontFamily: 'inherit',
                      lineHeight: 1.5,
                      resize: 'vertical',
                    }}
                  />
                  {formErrors.description && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-error)', margin: '0.35rem 0 0 0' }}>
                      {formErrors.description}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* SECTION 2: ROLE DETAILS */}
            <section
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '2rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <h2
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Layers size={20} color="var(--color-primary)" />
                  Role Details
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem', marginBottom: 0 }}>
                  Specify daily responsibilities, work environment, and duration.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Responsibilities */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label
                      htmlFor="internship-responsibilities"
                      style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}
                    >
                      Responsibilities
                    </label>
                    <span style={{ fontSize: '0.8rem', color: responsibilities.length > 5000 ? 'var(--color-error)' : 'var(--color-text-muted)' }}>
                      {responsibilities.length}/5000
                    </span>
                  </div>
                  <textarea
                    id="internship-responsibilities"
                    rows={5}
                    value={responsibilities}
                    onChange={(e) => setResponsibilities(e.target.value)}
                    placeholder="• Assist with developing React features&#10;• Fix bugs and write unit tests&#10;• Participate in daily standups and sprint reviews"
                    maxLength={5000}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${formErrors.responsibilities ? 'var(--color-error)' : 'var(--color-border)'}`,
                      fontSize: '0.95rem',
                      color: 'var(--color-text-primary)',
                      backgroundColor: 'var(--color-background)',
                      outline: 'none',
                      fontFamily: 'inherit',
                      lineHeight: 1.5,
                      resize: 'vertical',
                    }}
                  />
                  {formErrors.responsibilities && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-error)', margin: '0.35rem 0 0 0' }}>
                      {formErrors.responsibilities}
                    </p>
                  )}
                </div>

                {/* Work Type */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Work Type <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: '0.75rem',
                    }}
                  >
                    {[
                      { type: 'ONSITE' as WorkType, label: 'On-site', desc: 'Work from company office' },
                      { type: 'HYBRID' as WorkType, label: 'Hybrid', desc: 'Mix of office and remote' },
                      { type: 'REMOTE' as WorkType, label: 'Remote', desc: 'Work from anywhere' },
                    ].map((opt) => {
                      const isSelected = workType === opt.type;
                      return (
                        <button
                          key={opt.type}
                          type="button"
                          onClick={() => setWorkType(opt.type)}
                          style={{
                            padding: '1rem',
                            borderRadius: 'var(--radius-lg)',
                            border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                            backgroundColor: isSelected ? 'var(--color-primary-light, #EFF6FF)' : 'var(--color-background)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: '0.95rem',
                              color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)',
                            }}
                          >
                            {opt.label}
                          </div>
                          <div
                            style={{
                              fontSize: '0.8rem',
                              color: 'var(--color-text-secondary)',
                              marginTop: '0.2rem',
                            }}
                          >
                            {opt.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {formErrors.workType && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-error)', margin: '0.35rem 0 0 0' }}>
                      {formErrors.workType}
                    </p>
                  )}
                </div>

                {/* Two Column Group: Location & Duration */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  <div>
                    <label
                      htmlFor="internship-location"
                      style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                        marginBottom: '0.4rem',
                      }}
                    >
                      Location
                    </label>
                    <input
                      id="internship-location"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Colombo, Sri Lanka"
                      maxLength={150}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${formErrors.location ? 'var(--color-error)' : 'var(--color-border)'}`,
                        fontSize: '0.95rem',
                        color: 'var(--color-text-primary)',
                        backgroundColor: 'var(--color-background)',
                        outline: 'none',
                      }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
                      {workType === 'REMOTE' ? 'Optional geographic restriction or base country' : 'Office location city/region'}
                    </span>
                    {formErrors.location && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-error)', margin: '0.35rem 0 0 0' }}>
                        {formErrors.location}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="internship-duration"
                      style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                        marginBottom: '0.4rem',
                      }}
                    >
                      Duration
                    </label>
                    <input
                      id="internship-duration"
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 6 months"
                      maxLength={100}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${formErrors.duration ? 'var(--color-error)' : 'var(--color-border)'}`,
                        fontSize: '0.95rem',
                        color: 'var(--color-text-primary)',
                        backgroundColor: 'var(--color-background)',
                        outline: 'none',
                      }}
                    />
                    {formErrors.duration && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-error)', margin: '0.35rem 0 0 0' }}>
                        {formErrors.duration}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 3: COMPENSATION & AVAILABILITY */}
            <section
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '2rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <h2
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <DollarSign size={20} color="var(--color-primary)" />
                  Compensation & Availability
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem', marginBottom: 0 }}>
                  Set monthly allowance details, available headcounts, and application deadline.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Allowance Fields */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <label
                      htmlFor="internship-allowance-min"
                      style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                        marginBottom: '0.4rem',
                      }}
                    >
                      Minimum Allowance
                    </label>
                    <input
                      id="internship-allowance-min"
                      type="number"
                      min="0"
                      value={allowanceMin}
                      onChange={(e) => setAllowanceMin(e.target.value)}
                      placeholder="e.g. 30000"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${formErrors.allowanceMin ? 'var(--color-error)' : 'var(--color-border)'}`,
                        fontSize: '0.95rem',
                        color: 'var(--color-text-primary)',
                        backgroundColor: 'var(--color-background)',
                        outline: 'none',
                      }}
                    />
                    {formErrors.allowanceMin && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-error)', margin: '0.35rem 0 0 0' }}>
                        {formErrors.allowanceMin}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="internship-allowance-max"
                      style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                        marginBottom: '0.4rem',
                      }}
                    >
                      Maximum Allowance
                    </label>
                    <input
                      id="internship-allowance-max"
                      type="number"
                      min="0"
                      value={allowanceMax}
                      onChange={(e) => setAllowanceMax(e.target.value)}
                      placeholder="e.g. 40000"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${formErrors.allowanceMax ? 'var(--color-error)' : 'var(--color-border)'}`,
                        fontSize: '0.95rem',
                        color: 'var(--color-text-primary)',
                        backgroundColor: 'var(--color-background)',
                        outline: 'none',
                      }}
                    />
                    {formErrors.allowanceMax && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-error)', margin: '0.35rem 0 0 0' }}>
                        {formErrors.allowanceMax}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="internship-currency"
                      style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                        marginBottom: '0.4rem',
                      }}
                    >
                      Currency
                    </label>
                    <input
                      id="internship-currency"
                      type="text"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                      placeholder="LKR"
                      maxLength={10}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        fontSize: '0.95rem',
                        color: 'var(--color-text-primary)',
                        backgroundColor: 'var(--color-background)',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--color-background)',
                    border: '1px dashed var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem',
                    fontSize: '0.85rem',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  💡 <strong>Tip:</strong> Allowance fields can be left empty if this internship is unpaid or compensation is discussed during interview stages.
                </div>

                {/* Positions & Deadline */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  <div>
                    <label
                      htmlFor="internship-positions"
                      style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                        marginBottom: '0.4rem',
                      }}
                    >
                      Number of Positions <span style={{ color: 'var(--color-error)' }}>*</span>
                    </label>
                    <input
                      id="internship-positions"
                      type="number"
                      min="1"
                      value={positions}
                      onChange={(e) => setPositions(e.target.value)}
                      placeholder="1"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${formErrors.positions ? 'var(--color-error)' : 'var(--color-border)'}`,
                        fontSize: '0.95rem',
                        color: 'var(--color-text-primary)',
                        backgroundColor: 'var(--color-background)',
                        outline: 'none',
                      }}
                    />
                    {formErrors.positions && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-error)', margin: '0.35rem 0 0 0' }}>
                        {formErrors.positions}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="internship-deadline"
                      style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                        marginBottom: '0.4rem',
                      }}
                    >
                      Application Deadline
                    </label>
                    <input
                      id="internship-deadline"
                      type="date"
                      value={applicationDeadline}
                      onChange={(e) => setApplicationDeadline(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        fontSize: '0.95rem',
                        color: 'var(--color-text-primary)',
                        backgroundColor: 'var(--color-background)',
                        outline: 'none',
                      }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
                      Leave empty for ongoing rolling recruitment
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 4: STANDARDIZED SKILLS SELECTOR */}
            <section
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '2rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h2
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: 'var(--color-text-primary)',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Sparkles size={20} color="var(--color-primary)" />
                      Skills Catalog
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem', marginBottom: 0 }}>
                      Select standardized skills to connect with matched students and support skill-gap analysis.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        padding: '0.25rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: '#EFF6FF',
                        color: '#1D4ED8',
                      }}
                    >
                      {requiredSkills.length} Required
                    </span>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        padding: '0.25rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: '#F3F4F6',
                        color: '#4B5563',
                      }}
                    >
                      {preferredSkills.length} Preferred
                    </span>
                  </div>
                </div>
              </div>

              {/* Selected Skills Buckets */}
              <div style={{ marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Required Skills Container */}
                <div
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1rem',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                    REQUIRED SKILLS ({requiredSkills.length})
                  </div>
                  {requiredSkills.length === 0 ? (
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                      No required skills selected yet. Click any skill below to add it.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {requiredSkills.map((item) => (
                        <div
                          key={item.skillId}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            backgroundColor: '#EFF6FF',
                            color: '#1D4ED8',
                            border: '1px solid #BFDBFE',
                            padding: '0.35rem 0.75rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                          }}
                        >
                          <span>{item.name}</span>
                          <button
                            type="button"
                            onClick={() => handleSwitchSkillType(item.skillId)}
                            title="Switch to Preferred"
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#3B82F6',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              padding: '0 0.2rem',
                            }}
                          >
                            ⇄ Pref
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(item.skillId)}
                            title="Remove skill"
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#EF4444',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              padding: 0,
                            }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Preferred Skills Container */}
                <div
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1rem',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                    PREFERRED / NICE-TO-HAVE SKILLS ({preferredSkills.length})
                  </div>
                  {preferredSkills.length === 0 ? (
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                      No preferred skills selected yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {preferredSkills.map((item) => (
                        <div
                          key={item.skillId}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            backgroundColor: '#F3F4F6',
                            color: '#374151',
                            border: '1px solid #E5E7EB',
                            padding: '0.35rem 0.75rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                          }}
                        >
                          <span>{item.name}</span>
                          <button
                            type="button"
                            onClick={() => handleSwitchSkillType(item.skillId)}
                            title="Switch to Required"
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: 'var(--color-primary)',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              padding: '0 0.2rem',
                            }}
                          >
                            ⇄ Req
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(item.skillId)}
                            title="Remove skill"
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#EF4444',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              padding: 0,
                            }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Skill Search Input */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Search
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '0.85rem',
                      color: 'var(--color-text-muted)',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    type="text"
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    placeholder="Search 35 standardized skills (e.g. React, Node, Git, SQL)..."
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.4rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.9rem',
                      color: 'var(--color-text-primary)',
                      backgroundColor: 'var(--color-background)',
                      outline: 'none',
                    }}
                  />
                  {skillSearch && (
                    <button
                      type="button"
                      onClick={() => setSkillSearch('')}
                      style={{
                        position: 'absolute',
                        right: '0.85rem',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Skills Catalog Browser / Category Groups */}
              {isSkillsLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <LoadingSpinner size="md" />
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                    Loading skills catalog...
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    paddingRight: '0.5rem',
                  }}
                >
                  {skillSearch.trim() ? (
                    // Flat filtered view
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                        MATCHING SKILLS ({filteredSkills.length})
                      </div>
                      {filteredSkills.length === 0 ? (
                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                          No skills found matching "{skillSearch}"
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {filteredSkills.map((s) => {
                            const isSelected = selectedSkills.has(s.id);
                            const current = selectedSkills.get(s.id);
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => handleToggleSkill(s.id, s.name, s.categoryName, 'REQUIRED')}
                                style={{
                                  padding: '0.4rem 0.8rem',
                                  borderRadius: 'var(--radius-full)',
                                  border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                  backgroundColor: isSelected
                                    ? current?.type === 'REQUIRED'
                                      ? '#EFF6FF'
                                      : '#F3F4F6'
                                    : 'var(--color-background)',
                                  color: isSelected
                                    ? current?.type === 'REQUIRED'
                                      ? '#1D4ED8'
                                      : '#374151'
                                    : 'var(--color-text-primary)',
                                  fontWeight: isSelected ? 600 : 500,
                                  fontSize: '0.85rem',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                {isSelected ? <Check size={14} /> : <span>+</span>}
                                {s.name}
                                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginLeft: '0.2rem' }}>
                                  ({s.categoryName})
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Categorized Catalog View
                    skillCategories.map((cat) => (
                      <div key={cat.id}>
                        <div
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: 'var(--color-text-secondary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            marginBottom: '0.45rem',
                          }}
                        >
                          {cat.name}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {cat.skills.map((skill) => {
                            const isSelected = selectedSkills.has(skill.id);
                            const current = selectedSkills.get(skill.id);
                            return (
                              <button
                                key={skill.id}
                                type="button"
                                onClick={() => handleToggleSkill(skill.id, skill.name, cat.name, 'REQUIRED')}
                                style={{
                                  padding: '0.4rem 0.8rem',
                                  borderRadius: 'var(--radius-full)',
                                  border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                  backgroundColor: isSelected
                                    ? current?.type === 'REQUIRED'
                                      ? '#EFF6FF'
                                      : '#F3F4F6'
                                    : 'var(--color-background)',
                                  color: isSelected
                                    ? current?.type === 'REQUIRED'
                                      ? '#1D4ED8'
                                      : '#374151'
                                    : 'var(--color-text-primary)',
                                  fontWeight: isSelected ? 600 : 500,
                                  fontSize: '0.85rem',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                {isSelected ? <Check size={14} /> : <span>+</span>}
                                {skill.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </section>

            {/* Bottom Actions Row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--color-border)',
              }}
            >
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleBackClick}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                id="bottom-save-btn"
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                isLoading={isSubmitting}
              >
                {isSubmitting ? submittingButtonText : submitButtonText}
              </Button>
            </div>
          </div>
        </form>
      </main>

      {/* Unsaved Changes Confirmation Modal */}
      {showDiscardModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 1000,
            backdropFilter: 'blur(2px)',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.75rem',
              maxWidth: '460px',
              width: '100%',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#FEE2E2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-error)',
                marginBottom: '1rem',
              }}
            >
              <AlertCircle size={22} />
            </div>

            <h3
              style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
            >
              Discard unsaved changes?
            </h3>

            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--color-text-secondary)',
                marginTop: '0.5rem',
                marginBottom: '1.5rem',
                lineHeight: 1.5,
              }}
            >
              You have made modifications to this internship listing. If you leave now, your unsaved edits will be lost.
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
              }}
            >
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setShowDiscardModal(false)}
              >
                Stay and Edit
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleConfirmDiscard}
                style={{ backgroundColor: 'var(--color-error)', borderColor: 'var(--color-error)' }}
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
