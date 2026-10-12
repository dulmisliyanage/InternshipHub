import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  FileCheck,
  Download,
  ExternalLink,
  Globe,
  Mail,
  AlertCircle,
  FileText,
  User,
  RefreshCw,
  Briefcase,
  Lock,
} from 'lucide-react';
import { CompanyNavbar } from '../../components/company/CompanyNavbar';
import { ApplicationStatusBadge } from '../../components/student/applications/ApplicationStatusBadge';
import { CompanyStatusTimeline } from '../../components/company/applicants/CompanyStatusTimeline';
import { ApplicationStatusWorkflowCard } from '../../components/company/applicants/ApplicationStatusWorkflowCard';
import { Button } from '../../components/ui';
import { companyApplicantService } from '../../services/companyApplicant.service';
import { companyService } from '../../services/company.service';
import type { CompanyApplicantDetail } from '../../types/companyApplicant';
import type { CompanyProfile } from '../../types/company';

const GithubIcon: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const LinkedinIcon: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const formatWorkType = (workType?: string): string => {
  switch (workType) {
    case 'REMOTE':
      return 'Remote';
    case 'HYBRID':
      return 'Hybrid';
    case 'ONSITE':
      return 'On-site';
    default:
      return workType || '';
  }
};

const formatAppliedDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
};

export const CompanyApplicationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [application, setApplication] = useState<CompanyApplicantDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);

  // CV download state
  const [isDownloadingCv, setIsDownloadingCv] = useState<boolean>(false);
  const [cvActionError, setCvActionError] = useState<string | null>(null);

  // Retrieve return search query from location state if available
  const returnSearch = (location.state as any)?.returnSearch || '';

  // 1. Fetch Company Profile
  useEffect(() => {
    let isMounted = true;
    companyService
      .getCompanyProfile()
      .then((res) => {
        if (isMounted) {
          if (!res.profile) {
            navigate('/company/onboarding', { replace: true });
          } else {
            setProfile(res.profile);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load company profile:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // 2. Fetch Application Review Details
  const fetchDetails = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    setIsNotFound(false);
    setCvActionError(null);

    try {
      const res = await companyApplicantService.getApplicationDetails(id);
      setApplication(res.data);
    } catch (err: any) {
      if (err?.status === 404) {
        setIsNotFound(true);
      } else {
        setError(err.message || 'Failed to retrieve application details.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // Secure CV Download / Preview Handler
  const handleOpenCv = async (mode: 'download' | 'preview') => {
    if (!application?.id || !application.hasCv) return;

    setIsDownloadingCv(true);
    setCvActionError(null);

    try {
      const blob = await companyApplicantService.downloadCvBlob(application.id);
      const objectUrl = URL.createObjectURL(blob);

      if (mode === 'preview') {
        const previewWindow = window.open(objectUrl, '_blank');
        if (!previewWindow) {
          // Fallback to direct download if popup blocked
          triggerDownload(objectUrl, `${application.student.name.replace(/\s+/g, '_')}_CV.pdf`);
        }
        // Revoke after browser opens preview
        setTimeout(() => {
          URL.revokeObjectURL(objectUrl);
        }, 60000);
      } else {
        triggerDownload(objectUrl, `${application.student.name.replace(/\s+/g, '_')}_CV.pdf`);
        // Revoke after download trigger
        setTimeout(() => {
          URL.revokeObjectURL(objectUrl);
        }, 1000);
      }
    } catch (err: any) {
      console.error('Failed to retrieve applicant CV:', err);
      setCvActionError(err?.message || 'Unable to download CV. Please try again.');
    } finally {
      setIsDownloadingCv(false);
    }
  };

  const triggerDownload = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Safe 404 Not Found State
  if (isNotFound) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
        <CompanyNavbar
          companyName={profile?.companyName || 'Company'}
          logoUrl={profile?.logoUrl}
        />
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
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
            Application Not Found
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
            This application record does not exist or you do not have permission to view it.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/company/internships')}
            leftIcon={<ArrowLeft size={16} />}
          >
            Back to Internships
          </Button>
        </main>
      </div>
    );
  }

  const backLink = application
    ? `/company/internships/${application.internship.id}/applications${returnSearch}`
    : '/company/internships';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', paddingBottom: '6rem' }}>
      <CompanyNavbar
        companyName={profile?.companyName || 'Company'}
        logoUrl={profile?.logoUrl}
      />

      <main style={{ maxWidth: '1080px', margin: '2rem auto', padding: '0 1.5rem' }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '1.25rem' }}>
          <Link
            to={backLink}
            id="back-to-applicants-link"
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
            <span>Back to Applicants</span>
          </Link>
        </div>

        {/* Error Banner */}
        {error && (
          <div
            style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              marginBottom: '2rem',
              color: '#991B1B',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertCircle size={22} color="#DC2626" />
              <div>
                <h4 style={{ margin: 0, fontWeight: 700 }}>Failed to load application</h4>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.875rem' }}>{error}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw size={14} />}
              onClick={fetchDetails}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '2rem',
                height: '160px',
                opacity: 0.6,
                animation: 'pulse 1.5s infinite',
              }}
            />
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '2rem',
                height: '280px',
                opacity: 0.6,
                animation: 'pulse 1.5s infinite',
              }}
            />
          </div>
        )}

        {/* Application Content */}
        {!isLoading && application && (
          <>
            {/* Header Card */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '2rem',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: '1.75rem',
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
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flex: 1, minWidth: '280px' }}>
                  {/* Student Avatar */}
                  {application.student.profileImage ? (
                    <img
                      src={application.student.profileImage}
                      alt={application.student.name}
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid var(--color-border)',
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary-light, #EFF6FF)',
                        color: 'var(--color-primary, #2563EB)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1.65rem',
                        border: '2px solid #BFDBFE',
                        flexShrink: 0,
                      }}
                    >
                      {application.student.name ? application.student.name.charAt(0).toUpperCase() : <User size={28} />}
                    </div>
                  )}

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                      <h1
                        style={{
                          margin: 0,
                          fontSize: '1.65rem',
                          fontWeight: 800,
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {application.student.name}
                      </h1>
                      <ApplicationStatusBadge status={application.status} size="md" />
                    </div>

                    <p
                      style={{
                        margin: '0.2rem 0 0 0',
                        fontSize: '0.95rem',
                        color: 'var(--color-text-secondary)',
                        fontWeight: 500,
                      }}
                    >
                      Applying for{' '}
                      <strong style={{ color: 'var(--color-text-primary)' }}>
                        {application.internship.title}
                      </strong>
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginTop: '0.65rem',
                        fontSize: '0.825rem',
                        color: 'var(--color-text-muted)',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={14} />
                        <span>Submitted {formatAppliedDate(application.appliedAt)}</span>
                      </span>

                      {application.student.email && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Mail size={14} />
                          <a
                            href={`mailto:${application.student.email}`}
                            style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
                          >
                            {application.student.email}
                          </a>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Read-Only Status Indicator */}
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: 'var(--radius-lg)',
                    padding: '0.65rem 1rem',
                    fontSize: '0.8rem',
                    color: 'var(--color-text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                  }}
                >
                  <Lock size={14} style={{ color: 'var(--color-text-muted)' }} />
                  <span>Review Mode · Status workflow read-only</span>
                </div>
              </div>
            </div>

            {/* 2-Column Grid Layout */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)',
                gap: '1.75rem',
              }}
            >
              {/* Left Column: Student Profile, Skills, Cover Letter */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {/* Academic & Background Card */}
                <div
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '1.75rem',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <h3
                    style={{
                      margin: '0 0 1.25rem 0',
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    Applicant Background
                  </h3>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '1.25rem',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                        University / Institution
                      </span>
                      <span style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {application.student.university || 'Not specified'}
                      </span>
                    </div>

                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                        Degree Program
                      </span>
                      <span style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {application.student.degree || 'Not specified'}
                      </span>
                    </div>

                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                        Field of Study
                      </span>
                      <span style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {application.student.fieldOfStudy || 'Not specified'}
                      </span>
                    </div>

                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                        Current Year
                      </span>
                      <span style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {application.student.currentYear ? `Year ${application.student.currentYear}` : 'Not specified'}
                      </span>
                    </div>

                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                        Location
                      </span>
                      <span style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {application.student.location || 'Not specified'}
                      </span>
                    </div>
                  </div>

                  {/* Bio / Summary */}
                  {application.student.bio && (
                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '1rem' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        About the Applicant
                      </span>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
                        {application.student.bio}
                      </p>
                    </div>
                  )}

                  {/* Professional Links */}
                  {(application.student.githubUrl || application.student.linkedinUrl || application.student.portfolioUrl) && (
                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {application.student.githubUrl && (
                        <a
                          href={application.student.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.8125rem',
                            color: 'var(--color-text-secondary)',
                            textDecoration: 'none',
                          }}
                        >
                          <GithubIcon size={15} />
                          <span>GitHub</span>
                          <ExternalLink size={12} />
                        </a>
                      )}

                      {application.student.linkedinUrl && (
                        <a
                          href={application.student.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.8125rem',
                            color: '#0A66C2',
                            textDecoration: 'none',
                          }}
                        >
                          <LinkedinIcon size={15} />
                          <span>LinkedIn</span>
                          <ExternalLink size={12} />
                        </a>
                      )}

                      {application.student.portfolioUrl && (
                        <a
                          href={application.student.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.8125rem',
                            color: 'var(--color-primary)',
                            textDecoration: 'none',
                          }}
                        >
                          <Globe size={15} />
                          <span>Portfolio</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Skills Matrix Card */}
                <div
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '1.75rem',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <h3
                    style={{
                      margin: '0 0 1rem 0',
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    Skills & Competencies
                  </h3>

                  {(!application.student.skills || application.student.skills.length === 0) ? (
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                      No specific skills listed in applicant profile.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {application.student.skills.map((skill) => (
                        <div
                          key={skill.id}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            padding: '0.35rem 0.75rem',
                            borderRadius: 'var(--radius-lg)',
                          }}
                        >
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {skill.name}
                          </span>
                          {skill.proficiency && (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                color: '#475569',
                                backgroundColor: '#E2E8F0',
                                padding: '0.1rem 0.4rem',
                                borderRadius: 'var(--radius-sm)',
                              }}
                            >
                              {skill.proficiency}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cover Letter Card */}
                <div
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '1.75rem',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <h3
                    style={{
                      margin: '0 0 1rem 0',
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <FileText size={18} style={{ color: 'var(--color-primary)' }} />
                    <span>Cover Letter</span>
                  </h3>

                  {application.coverLetter ? (
                    <div
                      style={{
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1.25rem',
                        fontSize: '0.9rem',
                        color: 'var(--color-text-primary)',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {application.coverLetter}
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                      No cover letter was submitted with this application.
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Status Workflow, CV Attachment, Timeline, Internship Summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {/* Recruitment Status Workflow & Decisions */}
                <ApplicationStatusWorkflowCard
                  currentStatus={application.status}
                  applicationId={application.id}
                  candidateName={application.student.name}
                  internshipTitle={application.internship.title}
                  onStatusUpdated={fetchDetails}
                  onConflictReload={fetchDetails}
                />

                {/* CV Attachment Card */}
                <div
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '1.75rem',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <h3
                    style={{
                      margin: '0 0 1rem 0',
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <FileCheck size={18} style={{ color: '#059669' }} />
                    <span>Applicant CV / Resume</span>
                  </h3>

                  {application.hasCv ? (
                    <div>
                      <div
                        style={{
                          backgroundColor: '#F0FDF4',
                          border: '1px solid #BBF7D0',
                          borderRadius: 'var(--radius-lg)',
                          padding: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          marginBottom: '1.25rem',
                        }}
                      >
                        <FileCheck size={24} style={{ color: '#16A34A', flexShrink: 0 }} />
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.875rem', color: '#15803D' }}>
                            Private PDF CV Available
                          </strong>
                          <span style={{ fontSize: '0.785rem', color: '#166534' }}>
                            Stored securely. Accessible only to authorized company.
                          </span>
                        </div>
                      </div>

                      {cvActionError && (
                        <div
                          style={{
                            backgroundColor: '#FEF2F2',
                            border: '1px solid #FECACA',
                            borderRadius: 'var(--radius-md)',
                            padding: '0.65rem 0.85rem',
                            marginBottom: '1rem',
                            fontSize: '0.8125rem',
                            color: '#991B1B',
                          }}
                        >
                          {cvActionError}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <Button
                          id="preview-cv-btn"
                          variant="primary"
                          size="sm"
                          leftIcon={<ExternalLink size={15} />}
                          isLoading={isDownloadingCv}
                          disabled={isDownloadingCv}
                          onClick={() => handleOpenCv('preview')}
                        >
                          Preview in Browser
                        </Button>

                        <Button
                          id="download-cv-btn"
                          variant="outline"
                          size="sm"
                          leftIcon={<Download size={15} />}
                          isLoading={isDownloadingCv}
                          disabled={isDownloadingCv}
                          onClick={() => handleOpenCv('download')}
                        >
                          Download PDF
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1.25rem',
                        textAlign: 'center',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                        No CV attached to this application.
                      </span>
                    </div>
                  )}
                </div>

                {/* Recruitment Timeline */}
                <CompanyStatusTimeline
                  statusHistory={application.statusHistory}
                  currentStatus={application.status}
                />

                {/* Internship Context Summary */}
                <div
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '1.5rem',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <h4
                    style={{
                      margin: '0 0 0.85rem 0',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <Briefcase size={16} style={{ color: 'var(--color-primary)' }} />
                    <span>Internship Position</span>
                  </h4>

                  <span style={{ display: 'block', fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {application.internship.title}
                  </span>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      fontSize: '0.8125rem',
                      color: 'var(--color-text-secondary)',
                      marginTop: '0.5rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    {application.internship.workType && (
                      <span>{formatWorkType(application.internship.workType)}</span>
                    )}
                    {application.internship.category && (
                      <span>· {application.internship.category}</span>
                    )}
                    {application.internship.location && (
                      <span>· {application.internship.location}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
