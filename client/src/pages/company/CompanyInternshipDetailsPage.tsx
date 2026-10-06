import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  Calendar,
  Clock,
  MapPin,
  Users,
  Banknote,
  Briefcase,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  X,
  Sparkles,
  Send,
  Lock,
  Archive,
  Info,
} from 'lucide-react';
import { CompanyNavbar } from '../../components/company/CompanyNavbar';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { InternshipActionModal } from '../../components/company/internships/InternshipActionModal';
import { companyService } from '../../services/company.service';
import { internshipService } from '../../services/internship.service';
import type { CompanyProfile } from '../../types/company';
import type { Internship, InternshipStatus } from '../../types/internship';

const getStatusBadgeStyle = (status: InternshipStatus) => {
  switch (status) {
    case 'PUBLISHED':
      return {
        bg: '#ECFDF5',
        color: '#065F46',
        border: '#A7F3D0',
        dot: '#10B981',
        label: 'PUBLISHED',
      };
    case 'DRAFT':
      return {
        bg: '#F1F5F9',
        color: '#475569',
        border: '#CBD5E1',
        dot: '#94A3B8',
        label: 'DRAFT',
      };
    case 'CLOSED':
      return {
        bg: '#FFFBEB',
        color: '#92400E',
        border: '#FDE68A',
        dot: '#F59E0B',
        label: 'CLOSED',
      };
    case 'ARCHIVED':
      return {
        bg: '#F3F4F6',
        color: '#6B7280',
        border: '#E5E7EB',
        dot: '#9CA3AF',
        label: 'ARCHIVED',
      };
  }
};

const formatWorkType = (workType: string): string => {
  switch (workType) {
    case 'REMOTE':
      return 'Remote';
    case 'HYBRID':
      return 'Hybrid';
    case 'ONSITE':
      return 'On-site';
    default:
      return workType;
  }
};

const formatHumanDate = (dateStr?: string | null): string => {
  if (!dateStr) return 'Not set';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Invalid date';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
};

const formatAllowance = (
  min?: number | null,
  max?: number | null,
  currency?: string | null
): string => {
  const curr = currency || 'LKR';
  if (min == null && max == null) return 'Unpaid / Undisclosed';
  if (min != null && max != null && min === max) {
    return `${curr} ${min.toLocaleString()}/mo`;
  }
  if (min != null && max != null) {
    return `${curr} ${min.toLocaleString()} – ${max.toLocaleString()}/mo`;
  }
  if (min != null) {
    return `From ${curr} ${min.toLocaleString()}/mo`;
  }
  if (max != null) {
    return `Up to ${curr} ${max.toLocaleString()}/mo`;
  }
  return 'Unpaid / Undisclosed';
};

type ActiveLifecycleAction = 'PUBLISH' | 'CLOSE' | 'ARCHIVE' | null;

export const CompanyInternshipDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [internship, setInternship] = useState<Internship | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Lifecycle Modal State
  const [activeModal, setActiveModal] = useState<ActiveLifecycleAction>(null);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Flash message passed via route state
  const [flashMessage, setFlashMessage] = useState<string | null>(
    (location.state as any)?.flashMessage || null
  );

  const fetchDetails = useCallback(async () => {
    if (!id) {
      setIsNotFound(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsNotFound(false);
    setError(null);

    try {
      const [profileRes, internshipRes] = await Promise.allSettled([
        companyService.getCompanyProfile(),
        internshipService.getCompanyInternshipById(id),
      ]);

      if (profileRes.status === 'fulfilled') {
        if (!profileRes.value.profile) {
          navigate('/company/onboarding', { replace: true });
          return;
        }
        setProfile(profileRes.value.profile);
      } else {
        throw new Error('Failed to load profile');
      }

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
          setError(errorReason?.message || 'We could not load this internship.');
        }
      }
    } catch (err: any) {
      console.error('Failed to load internship details:', err);
      setError(err?.message || 'We could not load this internship details.');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // Lifecycle Action Execution Handler
  const handleConfirmLifecycleAction = async () => {
    if (!id || !activeModal) return;

    setIsActionLoading(true);
    setActionError(null);

    try {
      let res;
      if (activeModal === 'PUBLISH') {
        res = await internshipService.publishCompanyInternship(id);
        setFlashMessage('Internship published successfully! It is now live for student discovery.');
      } else if (activeModal === 'CLOSE') {
        res = await internshipService.closeCompanyInternship(id);
        setFlashMessage('Internship closed successfully. Applications are now closed.');
      } else if (activeModal === 'ARCHIVE') {
        res = await internshipService.archiveCompanyInternship(id);
        setFlashMessage('Internship archived successfully.');
      }

      if (res?.internship) {
        setInternship(res.internship);
      } else {
        // Fallback refresh
        await fetchDetails();
      }

      setActiveModal(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error(`Error performing ${activeModal} action:`, err);
      setActionError(err?.message || `Failed to ${activeModal.toLowerCase()} internship.`);
      setActiveModal(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsActionLoading(false);
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
  if (error || !internship || !profile) {
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
            Unable to load details
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
            {error || 'An unexpected error occurred while loading this listing.'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/company/internships')}
            >
              Back to Internships
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={fetchDetails}
              leftIcon={<RefreshCw size={16} />}
            >
              Try Again
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const badge = getStatusBadgeStyle(internship.status);
  const requiredSkills = (internship.skills || []).filter((s) => s.type === 'REQUIRED');
  const preferredSkills = (internship.skills || []).filter((s) => s.type === 'PREFERRED');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', paddingBottom: '6rem' }}>
      <CompanyNavbar companyName={profile.companyName} logoUrl={profile.logoUrl} />

      <main style={{ maxWidth: '980px', margin: '2rem auto', padding: '0 1.5rem' }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '1.25rem' }}>
          <Link
            to="/company/internships"
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

        {/* Action Error Banner (e.g. Publish pre-requisite errors) */}
        {actionError && (
          <div
            style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.85rem',
              marginBottom: '1.75rem',
              color: '#991B1B',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <AlertCircle size={22} style={{ flexShrink: 0, marginTop: '2px', color: '#DC2626' }} />
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>Unable to complete lifecycle action</h4>
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.875rem', lineHeight: 1.5 }}>
                {actionError}
              </p>
            </div>
            {internship.status === 'DRAFT' && (
              <Link to={`/company/internships/${internship.id}/edit`} style={{ textDecoration: 'none' }}>
                <Button size="sm" variant="outline" style={{ flexShrink: 0, fontSize: '0.8rem' }}>
                  Edit Listing
                </Button>
              </Link>
            )}
            <button
              type="button"
              onClick={() => setActionError(null)}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#991B1B',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Flash Message Banner */}
        {flashMessage && (
          <div
            style={{
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: 'var(--radius-lg)',
              padding: '0.875rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              marginBottom: '1.75rem',
              color: '#065F46',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CheckCircle2 size={18} color="#10B981" />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{flashMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setFlashMessage(null)}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#065F46',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Hero Header Card */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '1.5rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: '280px' }}>
              {/* Category Pill + Status Badge Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                {internship.category && (
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      backgroundColor: 'var(--color-background)',
                      color: 'var(--color-text-secondary)',
                      border: '1px solid var(--color-border)',
                      padding: '0.2rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    {internship.category}
                  </span>
                )}

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    backgroundColor: badge.bg,
                    color: badge.color,
                    border: `1px solid ${badge.border}`,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    padding: '0.2rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: badge.dot,
                    }}
                  />
                  <span>{badge.label}</span>
                </div>
              </div>

              {/* Title */}
              <h1
                style={{
                  fontSize: '1.85rem',
                  fontWeight: 800,
                  color: 'var(--color-text-primary)',
                  margin: 0,
                  lineHeight: 1.25,
                }}
              >
                {internship.title}
              </h1>

              {/* Subtitle / Attributes */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                  marginTop: '0.75rem',
                  fontSize: '0.9rem',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <span>{formatWorkType(internship.workType)}</span>
                {internship.location && (
                  <>
                    <span>•</span>
                    <span>{internship.location}</span>
                  </>
                )}
                {internship.duration && (
                  <>
                    <span>•</span>
                    <span>{internship.duration}</span>
                  </>
                )}
              </div>
            </div>

            {/* Lifecycle & Edit Action Buttons Container */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              {/* Edit button available for DRAFT, PUBLISHED, and CLOSED */}
              {internship.status !== 'ARCHIVED' && (
                <Link to={`/company/internships/${internship.id}/edit`} style={{ textDecoration: 'none' }}>
                  <Button
                    id="edit-internship-btn"
                    variant="outline"
                    size="md"
                    leftIcon={<Edit3 size={15} />}
                  >
                    Edit Listing
                  </Button>
                </Link>
              )}

              {/* DRAFT Actions: [ Publish ] [ Archive ] */}
              {internship.status === 'DRAFT' && (
                <>
                  <Button
                    id="publish-internship-btn"
                    variant="primary"
                    size="md"
                    leftIcon={<Send size={15} />}
                    onClick={() => {
                      setActionError(null);
                      setActiveModal('PUBLISH');
                    }}
                    style={{
                      backgroundColor: '#10B981',
                      borderColor: '#10B981',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    Publish
                  </Button>

                  <Button
                    id="archive-internship-btn"
                    variant="outline"
                    size="md"
                    leftIcon={<Archive size={15} />}
                    onClick={() => {
                      setActionError(null);
                      setActiveModal('ARCHIVE');
                    }}
                  >
                    Archive
                  </Button>
                </>
              )}

              {/* PUBLISHED Actions: [ Close Internship ] (No Archive allowed directly) */}
              {internship.status === 'PUBLISHED' && (
                <Button
                  id="close-internship-btn"
                  variant="primary"
                  size="md"
                  leftIcon={<Lock size={15} />}
                  onClick={() => {
                    setActionError(null);
                    setActiveModal('CLOSE');
                  }}
                  style={{
                    backgroundColor: '#F59E0B',
                    borderColor: '#F59E0B',
                    color: '#FFFFFF',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  Close Internship
                </Button>
              )}

              {/* CLOSED Actions: [ Archive ] */}
              {internship.status === 'CLOSED' && (
                <Button
                  id="archive-internship-btn"
                  variant="primary"
                  size="md"
                  leftIcon={<Archive size={15} />}
                  onClick={() => {
                    setActionError(null);
                    setActiveModal('ARCHIVE');
                  }}
                  style={{
                    backgroundColor: '#475569',
                    borderColor: '#475569',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  Archive
                </Button>
              )}

              {/* ARCHIVED Notice */}
              {internship.status === 'ARCHIVED' && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#F3F4F6',
                    color: '#6B7280',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    border: '1px solid #E5E7EB',
                  }}
                >
                  <Info size={15} />
                  <span>This internship has been archived.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Layout: 2 Column Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Description, Responsibilities, Skills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* About this internship */}
            <section
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.75rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h2
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  margin: '0 0 1rem 0',
                }}
              >
                About this internship
              </h2>
              <div
                style={{
                  fontSize: '0.95rem',
                  lineHeight: 1.65,
                  color: 'var(--color-text-secondary)',
                  whiteSpace: 'pre-line',
                }}
              >
                {internship.description}
              </div>
            </section>

            {/* Responsibilities */}
            {internship.responsibilities && (
              <section
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.75rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <h2
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                  margin: '0 0 1rem 0',
                }}
              >
                Key Responsibilities
              </h2>
              <div
                style={{
                  fontSize: '0.95rem',
                  lineHeight: 1.65,
                  color: 'var(--color-text-secondary)',
                  whiteSpace: 'pre-line',
                }}
              >
                {internship.responsibilities}
              </div>
            </section>
          )}

          {/* Skills */}
          <section
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Sparkles size={20} color="var(--color-primary)" />
              <h2
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  margin: 0,
                }}
              >
                Required & Preferred Skills
              </h2>
            </div>

            {/* Required Skills */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                  marginBottom: '0.6rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Required Skills ({requiredSkills.length})
              </div>
              {requiredSkills.length === 0 ? (
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontStyle: 'italic', margin: 0 }}>
                  No required skills specified.
                </p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {requiredSkills.map((s) => (
                    <span
                      key={s.id}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        backgroundColor: '#EFF6FF',
                        color: '#1D4ED8',
                        border: '1px solid #BFDBFE',
                        padding: '0.35rem 0.8rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                      }}
                    >
                      {s.name}
                      {s.category && (
                        <span style={{ fontSize: '0.7rem', color: '#60A5FA', fontWeight: 400 }}>
                          • {s.category}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Preferred Skills */}
            <div>
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--color-text-secondary)',
                  marginBottom: '0.6rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Preferred Skills ({preferredSkills.length})
              </div>
              {preferredSkills.length === 0 ? (
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontStyle: 'italic', margin: 0 }}>
                  No preferred skills specified.
                </p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {preferredSkills.map((s) => (
                    <span
                      key={s.id}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        backgroundColor: '#F3F4F6',
                        color: '#374151',
                        border: '1px solid #E5E7EB',
                        padding: '0.35rem 0.8rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                      }}
                    >
                      {s.name}
                      {s.category && (
                        <span style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 400 }}>
                          • {s.category}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Key Details & Meta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Internship Details Card */}
          <section
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h2
              style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: '0 0 1.25rem 0',
              }}
            >
              Internship Details
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Work Type */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-background)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary)',
                    flexShrink: 0,
                  }}
                >
                  <Briefcase size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Work Type</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {formatWorkType(internship.workType)}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-background)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary)',
                    flexShrink: 0,
                  }}
                >
                  <MapPin size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Location</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {internship.location || 'Not specified'}
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-background)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary)',
                    flexShrink: 0,
                  }}
                >
                  <Clock size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Duration</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {internship.duration || 'Not specified'}
                  </div>
                </div>
              </div>

              {/* Positions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-background)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary)',
                    flexShrink: 0,
                  }}
                >
                  <Users size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Positions Available</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {internship.positions} {internship.positions === 1 ? 'opening' : 'openings'}
                  </div>
                </div>
              </div>

              {/* Allowance */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-background)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary)',
                    flexShrink: 0,
                  }}
                >
                  <Banknote size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Monthly Allowance</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {formatAllowance(internship.allowanceMin, internship.allowanceMax, internship.currency)}
                  </div>
                </div>
              </div>

              {/* Application Deadline */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-background)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary)',
                    flexShrink: 0,
                  }}
                >
                  <Calendar size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Application Deadline</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {formatHumanDate(internship.applicationDeadline)}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Listing Information Card */}
          <section
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h2
              style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: '0 0 1.25rem 0',
              }}
            >
              Listing Information
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Status</span>
                <span style={{ fontWeight: 600, color: badge.color }}>{badge.label}</span>
              </div>

              {internship.publishedAt && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Published On</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {formatHumanDate(internship.publishedAt)}
                  </span>
                </div>
              )}

              {internship.closedAt && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Closed On</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {formatHumanDate(internship.closedAt)}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Created On</span>
                <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {formatHumanDate(internship.createdAt)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Last Updated</span>
                <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {formatHumanDate(internship.updatedAt)}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>

    {/* Reusable Confirmation Modals for Lifecycle Actions */}
    {/* 1. Publish Modal */}
    <InternshipActionModal
      isOpen={activeModal === 'PUBLISH'}
      onClose={() => setActiveModal(null)}
      onConfirm={handleConfirmLifecycleAction}
      title="Publish internship?"
      message={
        <>
          Once published, this internship will become available for student discovery and application submissions.
          <br /><br />
          Make sure the internship details, deadline, and required skills are finalized before proceeding.
        </>
      }
      confirmLabel="Publish Internship"
      loadingLabel="Publishing..."
      confirmVariant="primary"
      isLoading={isActionLoading}
      icon={
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: '#ECFDF5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10B981',
          }}
        >
          <Send size={22} />
        </div>
      }
    />

    {/* 2. Close Modal */}
    <InternshipActionModal
      isOpen={activeModal === 'CLOSE'}
      onClose={() => setActiveModal(null)}
      onConfirm={handleConfirmLifecycleAction}
      title="Close internship?"
      message={
        <>
          Students will no longer be able to apply to this internship after it is closed.
          <br /><br />
          You will still be able to review existing student applications or archive the listing later.
        </>
      }
      confirmLabel="Close Internship"
      loadingLabel="Closing..."
      confirmVariant="primary"
      confirmStyle={{ backgroundColor: '#F59E0B', borderColor: '#F59E0B' }}
      isLoading={isActionLoading}
      icon={
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: '#FFFBEB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#D97706',
          }}
        >
          <Lock size={22} />
        </div>
      }
    />

    {/* 3. Archive Modal */}
    <InternshipActionModal
      isOpen={activeModal === 'ARCHIVE'}
      onClose={() => setActiveModal(null)}
      onConfirm={handleConfirmLifecycleAction}
      title="Archive internship?"
      message={
        <>
          This listing will be moved to your archived internships. Historical data will be preserved in your company workspace.
        </>
      }
      confirmLabel="Archive Internship"
      loadingLabel="Archiving..."
      confirmVariant="primary"
      confirmStyle={{ backgroundColor: '#475569', borderColor: '#475569' }}
      isLoading={isActionLoading}
      icon={
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: '#F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569',
          }}
        >
          <Archive size={22} />
        </div>
      }
    />
  </div>
);
};
