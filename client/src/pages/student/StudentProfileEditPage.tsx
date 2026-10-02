import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  Laptop,
  Building2,
  MapPin,
  Check,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { Button, FormField, Input, Alert, LoadingSpinner } from '../../components/ui';
import { StudentNavbar } from '../../components/student/StudentNavbar';
import { ProfileAvatar } from '../../components/student/profile/ProfileAvatar';
import { SkillEditor } from '../../components/student/profile/SkillEditor';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/student.service';
import { ApiError } from '../../services/auth.service';
import { validateImageFile, ALLOWED_IMAGE_EXTENSIONS } from '../../utils/upload';
import type {
  StudentProfile,
  SkillCategory,
  SelectedSkill,
  ProficiencyLevel,
  WorkType,
  UpdateStudentProfilePayload,
} from '../../types/student';

interface FormState {
  university: string;
  degree: string;
  fieldOfStudy: string;
  currentYear: string;
  expectedGraduation: string; // YYYY-MM
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

const emptyFormState: FormState = {
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

export const StudentProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateUser, refreshUser } = useAuth();

  // Loading & Data States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<FormState>(emptyFormState);
  const [initialData, setInitialData] = useState<FormState>(emptyFormState);

  // Profile Image preview & upload states
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isRemovingPhoto, setIsRemovingPhoto] = useState<boolean>(false);
  const [showRemoveModal, setShowRemoveModal] = useState<boolean>(false);
  const [photoSuccessMsg, setPhotoSuccessMsg] = useState<string | null>(null);

  // UI & Submit States
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStepText, setSaveStepText] = useState<string>('Saving changes...');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDiscardModal, setShowDiscardModal] = useState<boolean>(false);

  // 1. Fetch existing profile and skill catalog
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [profileRes, skillsRes] = await Promise.all([
          studentService.getStudentProfile(),
          studentService.getSkillCatalog(),
        ]);

        if (!isMounted) return;

        if (profileRes.profile === null) {
          navigate('/student/onboarding', { replace: true });
          return;
        }

        const p = profileRes.profile;
        setProfile(p);
        setCategories(skillsRes.categories || []);

        // Pre-populate form
        let gradDateString = '';
        if (p.expectedGraduation) {
          try {
            const d = new Date(p.expectedGraduation);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            gradDateString = `${year}-${month}`;
          } catch {
            gradDateString = '';
          }
        }

        const initialSkills: SelectedSkill[] = (p.skills || []).map((s) => ({
          skillId: s.id,
          name: s.name,
          category: s.category || '',
          proficiency: s.proficiency,
        }));

        const populated: FormState = {
          university: p.university || '',
          degree: p.degree || '',
          fieldOfStudy: p.fieldOfStudy || '',
          currentYear: p.currentYear ? String(p.currentYear) : '3',
          expectedGraduation: gradDateString,
          location: p.location || '',
          preferredRole: p.preferredRole || '',
          preferredWorkType: p.preferredWorkType || 'REMOTE',
          selectedSkills: initialSkills,
          bio: p.bio || '',
          githubUrl: p.githubUrl || '',
          linkedinUrl: p.linkedinUrl || '',
          portfolioUrl: p.portfolioUrl || '',
          cvUrl: p.cvUrl || '',
        };

        setFormData(populated);
        setInitialData(populated);
      } catch (err) {
        console.error('Failed to load profile edit data:', err);
        if (isMounted) {
          setCatalogError('Could not load profile information. Please refresh the page.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Compute dirty state
  const isDirty = useMemo(() => {
    if (selectedFile !== null) return true;
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  }, [formData, initialData, selectedFile]);

  // Handle Photo Picker Selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    setPhotoSuccessMsg(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const validationErr = validateImageFile(file);
    if (validationErr) {
      setImageError(validationErr);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewImage(objectUrl);
  };

  // Handle Remove Profile Photo Confirm
  const handleRemovePhotoConfirm = async () => {
    setIsRemovingPhoto(true);
    setImageError(null);
    setPhotoSuccessMsg(null);

    try {
      await studentService.removeProfileImage();
      setProfile((prev) => (prev ? { ...prev, profileImage: null } : null));
      setPreviewImage(null);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      updateUser({ profileImage: null });
      await refreshUser();
      setShowRemoveModal(false);
      setPhotoSuccessMsg('Profile photo removed. Initial avatar fallback active.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to remove profile photo.';
      setImageError(msg);
    } finally {
      setIsRemovingPhoto(false);
    }
  };

  // Skill Editor Handlers
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
            proficiency: 'INTERMEDIATE',
            category: categoryName,
          },
        ],
      };
    });
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

  // Cancel / Back Navigation
  const handleCancelClick = () => {
    if (isDirty) {
      setShowDiscardModal(true);
    } else {
      navigate('/student/profile');
    }
  };

  // Form Submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSaveStepText('Saving changes...');

    try {
      // 1. If a new photo was selected, upload it first to Cloudinary
      if (selectedFile) {
        setSaveStepText('Uploading photo securely...');
        try {
          const uploadRes = await studentService.uploadProfileImage(selectedFile);
          if (uploadRes?.profileImage) {
            updateUser({ profileImage: uploadRes.profileImage });
            setProfile((prev) => (prev ? { ...prev, profileImage: uploadRes.profileImage } : null));
          }
        } catch (photoErr: unknown) {
          const msg =
            photoErr instanceof Error
              ? photoErr.message
              : "Couldn't upload your photo. Your other profile changes have not been lost. Please try again.";
          setErrorMessage(msg);
          setIsSaving(false);
          return;
        }
      }

      // 2. Save profile information
      setSaveStepText('Saving profile information...');
      let gradIso: string | null = null;
      if (formData.expectedGraduation) {
        gradIso = new Date(`${formData.expectedGraduation}-01`).toISOString();
      }

      const payload: UpdateStudentProfilePayload = {
        university: formData.university.trim() || null,
        degree: formData.degree.trim() || null,
        fieldOfStudy: formData.fieldOfStudy.trim() || null,
        currentYear: formData.currentYear ? parseInt(formData.currentYear, 10) : null,
        expectedGraduation: gradIso,
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
      await refreshUser();

      setSaveSuccess(true);
      setTimeout(() => {
        navigate('/student/profile');
      }, 1000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Couldn't update your profile. Your changes haven't been lost. Please try again.");
      }
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

  const displayName = profile?.name || 'Student';
  const displayAvatar = previewImage || profile?.profileImage;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', paddingBottom: '5rem' }}>
      <StudentNavbar userName={displayName} userAvatar={displayAvatar} />

      <main style={{ maxWidth: '840px', margin: '2rem auto', padding: '0 1.5rem' }}>
        {/* Back Link */}
        <div style={{ marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={handleCancelClick}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '0.35rem 0',
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to profile</span>
          </button>
        </div>

        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.85rem',
              fontWeight: 800,
              color: 'var(--color-text-primary)',
              margin: '0 0 0.35rem',
            }}
          >
            Edit Profile
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', margin: 0 }}>
            Keep your information accurate and up to date for internships.
          </p>
        </div>

        {/* Global Save Feedback Alerts */}
        {saveSuccess && (
          <div style={{ marginBottom: '1.5rem' }}>
            <Alert variant="success" title="Success">
              Profile updated successfully! Redirecting to your profile...
            </Alert>
          </div>
        )}

        {errorMessage && (
          <div style={{ marginBottom: '1.5rem' }}>
            <Alert variant="error" title="Couldn't update your profile">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <span>{errorMessage}</span>
                <div>
                  <Button size="sm" variant="outline" onClick={() => handleSubmit()}>
                    Try Again
                  </Button>
                </div>
              </div>
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Section 1: Profile Photo */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.75rem 2rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: '0 0 1.25rem',
              }}
            >
              Profile Photo
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <ProfileAvatar src={displayAvatar} name={displayName} size={88} />

              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                  {displayName}
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', marginBottom: '0.85rem' }}>
                  Allowed formats: JPG, PNG, or WebP. Maximum 5 MB.
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept={ALLOWED_IMAGE_EXTENSIONS}
                    onChange={handlePhotoSelect}
                    style={{ display: 'none' }}
                  />

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera size={14} />
                    <span>{displayAvatar ? 'Change Photo' : 'Upload Photo'}</span>
                  </Button>

                  {/* Revert preview if user selected a new file */}
                  {selectedFile && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setPreviewImage(null);
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      Revert
                    </Button>
                  )}

                  {/* Remove photo button if photo exists and no file is pending */}
                  {profile?.profileImage && !selectedFile && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowRemoveModal(true)}
                      style={{ color: 'var(--color-error)' }}
                    >
                      <Trash2 size={14} />
                      <span>Remove</span>
                    </Button>
                  )}
                </div>

                {imageError && (
                  <div style={{ color: 'var(--color-error)', fontSize: '0.85rem', marginTop: '0.65rem' }}>
                    {imageError}
                  </div>
                )}

                {photoSuccessMsg && (
                  <div style={{ color: 'var(--color-success)', fontSize: '0.85rem', marginTop: '0.65rem', fontWeight: 600 }}>
                    ✓ {photoSuccessMsg}
                  </div>
                )}

                {selectedFile && !imageError && (
                  <div style={{ color: 'var(--color-primary)', fontSize: '0.825rem', marginTop: '0.65rem', fontWeight: 600 }}>
                    ✓ Photo ready to upload on "Save Changes"
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Personal & Education */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.75rem 2rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: '0 0 1.25rem',
              }}
            >
              Personal & Education
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem',
              }}
            >
              <FormField label="University / Institution" htmlFor="university">
                <Input
                  id="university"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  placeholder="e.g. University of Colombo"
                />
              </FormField>

              <FormField label="Degree Program" htmlFor="degree">
                <Input
                  id="degree"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  placeholder="e.g. BSc Information Systems"
                />
              </FormField>

              <FormField label="Field of Study" htmlFor="fieldOfStudy">
                <Input
                  id="fieldOfStudy"
                  value={formData.fieldOfStudy}
                  onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                  placeholder="e.g. Software Engineering"
                />
              </FormField>

              <FormField label="Current Year" htmlFor="currentYear">
                <select
                  id="currentYear"
                  value={formData.currentYear}
                  onChange={(e) => setFormData({ ...formData, currentYear: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    fontSize: '0.95rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    outline: 'none',
                  }}
                >
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                  <option value="5">Year 5 / Postgrad</option>
                </select>
              </FormField>

              <FormField label="Expected Graduation" htmlFor="expectedGraduation">
                <Input
                  id="expectedGraduation"
                  type="month"
                  value={formData.expectedGraduation}
                  onChange={(e) => setFormData({ ...formData, expectedGraduation: e.target.value })}
                />
              </FormField>

              <FormField label="Location" htmlFor="location">
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Colombo, Sri Lanka"
                />
              </FormField>
            </div>
          </div>

          {/* Section 3: Career Preferences */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.75rem 2rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: '0 0 1.25rem',
              }}
            >
              Career Preferences
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <FormField label="Desired Internship Role" htmlFor="preferredRole">
                <Input
                  id="preferredRole"
                  value={formData.preferredRole}
                  onChange={(e) => setFormData({ ...formData, preferredRole: e.target.value })}
                  placeholder="e.g. Frontend Developer Intern, Full Stack Intern"
                />
              </FormField>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    marginBottom: '0.5rem',
                  }}
                >
                  Work Type Preference
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                  {[
                    { type: 'REMOTE' as WorkType, label: 'Remote', icon: Laptop },
                    { type: 'HYBRID' as WorkType, label: 'Hybrid', icon: Building2 },
                    { type: 'ONSITE' as WorkType, label: 'On-site', icon: MapPin },
                  ].map(({ type, label, icon: Icon }) => {
                    const isSelected = formData.preferredWorkType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, preferredWorkType: type })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          padding: '0.85rem 1rem',
                          borderRadius: 'var(--radius-lg)',
                          border: isSelected
                            ? '2px solid var(--color-primary)'
                            : '1px solid var(--color-border)',
                          backgroundColor: isSelected
                            ? 'var(--color-primary-light)'
                            : 'var(--color-surface)',
                          color: isSelected
                            ? 'var(--color-primary-dark)'
                            : 'var(--color-text-primary)',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Icon size={16} />
                        <span>{label}</span>
                        {isSelected && <Check size={14} strokeWidth={2.5} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Skills */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.75rem 2rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: '0 0 1.25rem',
              }}
            >
              Skills & Proficiencies
            </h2>

            <SkillEditor
              categories={categories}
              selectedSkills={formData.selectedSkills}
              onToggleSkill={handleToggleSkill}
              onSetProficiency={handleSetProficiency}
              onRemoveSkill={handleRemoveSkill}
              isLoading={isLoading}
              error={catalogError}
            />
          </div>

          {/* Section 5: About / Bio */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.75rem 2rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: '0 0 1.25rem',
              }}
            >
              About
            </h2>

            <FormField label="Bio & Introduction" htmlFor="bio">
              <textarea
                id="bio"
                rows={4}
                maxLength={1000}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Briefly introduce yourself, your career goals, and what you are looking for in an internship..."
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  lineHeight: 1.5,
                }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  fontSize: '0.75rem',
                  color: 'var(--color-text-secondary)',
                  marginTop: '0.35rem',
                }}
              >
                {formData.bio.length} / 1000 characters
              </div>
            </FormField>
          </div>

          {/* Section 6: Professional Links */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.75rem 2rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: '0 0 1.25rem',
              }}
            >
              Professional Links
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem',
              }}
            >
              <FormField label="GitHub Profile URL" htmlFor="githubUrl">
                <div style={{ position: 'relative' }}>
                  <Input
                    id="githubUrl"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    placeholder="https://github.com/yourusername"
                  />
                </div>
              </FormField>

              <FormField label="LinkedIn Profile URL" htmlFor="linkedinUrl">
                <Input
                  id="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/yourusername"
                />
              </FormField>

              <FormField label="Portfolio Website" htmlFor="portfolioUrl">
                <Input
                  id="portfolioUrl"
                  value={formData.portfolioUrl}
                  onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                  placeholder="https://yourportfolio.dev"
                />
              </FormField>

              <FormField label="CV / Resume Link" htmlFor="cvUrl">
                <Input
                  id="cvUrl"
                  value={formData.cvUrl}
                  onChange={(e) => setFormData({ ...formData, cvUrl: e.target.value })}
                  placeholder="https://drive.google.com/your-cv-link"
                />
              </FormField>
            </div>
          </div>

          {/* Action Footer */}
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
              onClick={handleCancelClick}
              disabled={isSaving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
            >
              {isSaving ? saveStepText : 'Save Changes'}
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
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(3px)',
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
              You have changes that haven't been saved yet. Leaving this page will discard your changes.
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
                  navigate('/student/profile');
                }}
              >
                Discard Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Photo Confirmation Modal */}
      {showRemoveModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(3px)',
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
                  backgroundColor: '#fef2f2',
                  color: 'var(--color-error)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Trash2 size={20} />
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
                Remove profile photo?
              </h3>
            </div>

            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
              This will remove your photo from cloud storage and return your avatar to your initials fallback.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowRemoveModal(false)}
                disabled={isRemovingPhoto}
              >
                Keep Photo
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleRemovePhotoConfirm}
                isLoading={isRemovingPhoto}
              >
                {isRemovingPhoto ? 'Removing...' : 'Remove Photo'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfileEditPage;
