import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  FileCheck,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  FileText,
  ExternalLink,
  Ban,
} from 'lucide-react';
import { StudentNavbar } from '../../components/student/StudentNavbar';
import { CompanyLogo } from '../../components/company/CompanyLogo';
import { Button } from '../../components/ui/Button';
import { ApplicationStatusBadge } from '../../components/student/applications/ApplicationStatusBadge';
import { ApplicationStatusTimeline } from '../../components/student/applications/ApplicationStatusTimeline';
import { WithdrawApplicationModal } from '../../components/student/applications/WithdrawApplicationModal';
import { studentApplicationService } from '../../services/studentApplication.service';
import { studentService } from '../../services/student.service';
import { getWorkTypeBadge } from '../../utils/internshipFormatters';
import type {
  ApplicationDetail,
  ApplicationStatus,
} from '../../types/application';

// Statuses where withdrawal is permitted
const WITHDRAWABLE_STATUSES: ApplicationStatus[] = [
  'APPLIED',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'INTERVIEW',
];

export const StudentApplicationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);

  // Withdrawal modal state
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState<boolean>(false);
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  // Preserve return URL with query filters from history state
  const rawFrom = (location.state as any)?.from;
  const returnUrl =
    typeof rawFrom === 'string' && rawFrom.startsWith('/student/applications')
      ? rawFrom
      : '/student/applications';

  // Fetch student avatar for navbar
  useEffect(() => {
    studentService.getProfile()
      .then((res) => {
        if (res.status === 'success' && res.profile?.profileImage) {
          setProfileAvatar(res.profile.profileImage);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch application details
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
      const res = await studentApplicationService.getStudentApplicationById(id);
      if (res.status === 'success' && res.data) {
        setApplication(res.data);
      } else {
        setIsNotFound(true);
      }
    } catch (err: any) {
      console.error('Failed to load application details:', err);
      if (err.status === 404) {
        setIsNotFound(true);
      } else {
        setError(err.message || 'Unable to load application details. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // Handle application withdrawal
  const handleConfirmWithdraw = async () => {
    if (!id) return;
    setIsWithdrawing(true);
    setWithdrawError(null);

    try {
      await studentApplicationService.withdrawApplication(id);
      setIsWithdrawModalOpen(false);
      // Refresh application details to reflect WITHDRAWN status and updated timeline
      await fetchDetails();
    } catch (err: any) {
      console.error('Withdrawal failed:', err);
      setWithdrawError(
        err.message ||
          'Failed to withdraw application. The status may have changed. Please refresh the page.'
      );
    } finally {
      setIsWithdrawing(false);
    }
  };

  const isWithdrawable =
    application !== null && WITHDRAWABLE_STATUSES.includes(application.status);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      <StudentNavbar userAvatar={profileAvatar} />

      <main
        style={{
          maxWidth: '1040px',
          margin: '0 auto',
          padding: '2.5rem 1.5rem 5rem 1.5rem',
        }}
      >
        {/* Breadcrumb Back Button */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to={returnUrl}
            id="back-to-applications-link"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-primary)';
              e.currentTarget.style.borderColor = 'var(--color-primary-light)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text-secondary)';
              e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to My Applications</span>
          </Link>
        </div>

        {/* State: Loading Skeleton */}
        {isLoading && (
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-2xl)',
              border: '1px solid var(--color-border)',
              padding: '3rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              opacity: 0.6,
              animation: 'pulse 1.5s infinite',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 'var(--radius-xl)',
                  backgroundColor: 'var(--color-border)',
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    width: '50%',
                    height: 24,
                    backgroundColor: 'var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '0.75rem',
                  }}
                />
                <div
                  style={{
                    width: '30%',
                    height: 16,
                    backgroundColor: 'var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* State: 404 Not Found */}
        {!isLoading && isNotFound && (
          <div
            id="application-not-found"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-2xl)',
              padding: '4rem 2rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto',
              }}
            >
              <FileText size={32} />
            </div>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: '0 0 0.5rem 0',
              }}
            >
              Application Not Found
            </h2>
            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: '1rem',
                margin: '0 auto 2rem auto',
                maxWidth: '480px',
                lineHeight: 1.5,
              }}
            >
              The requested application could not be found or does not belong to your student account.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/student/applications')}
            >
              View My Applications
            </Button>
          </div>
        )}

        {/* State: Network Error */}
        {!isLoading && !isNotFound && error && (
          <div
            id="application-details-error"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid #FCA5A5',
              borderRadius: 'var(--radius-2xl)',
              padding: '3rem 2rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 'var(--radius-full)',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
              }}
            >
              <AlertCircle size={30} />
            </div>
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: '0 0 0.5rem 0',
              }}
            >
              Unable to load application
            </h3>
            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: '0.9375rem',
                margin: '0 auto 1.75rem auto',
                maxWidth: '460px',
              }}
            >
              {error}
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={fetchDetails}
              leftIcon={<RefreshCw size={16} />}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Application Details Content */}
        {!isLoading && !isNotFound && !error && application && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* 1. Header Card: Internship Info & Current Status */}
            <div
              id="application-header-card"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-2xl)',
                padding: '2rem',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1.5rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flex: 1, minWidth: '280px' }}>
                <CompanyLogo
                  src={application.internship.company?.logoUrl}
                  name={application.internship.company?.companyName || 'Company'}
                  size={64}
                />
                <div>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-heading)',
                      lineHeight: 1.3,
                    }}
                  >
                    {application.internship.title}
                  </h1>
                  <p
                    style={{
                      margin: '0.25rem 0 0.5rem 0',
                      fontSize: '1rem',
                      color: 'var(--color-text-secondary)',
                      fontWeight: 600,
                    }}
                  >
                    {application.internship.company?.companyName || 'Company'}
                  </p>

                  {/* Attributes line */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      flexWrap: 'wrap',
                      fontSize: '0.8125rem',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    <span
                      style={{
                        padding: '0.15rem 0.55rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: getWorkTypeBadge(application.internship.workType).bg,
                        color: getWorkTypeBadge(application.internship.workType).color,
                        border: `1px solid ${getWorkTypeBadge(application.internship.workType).border}`,
                        fontWeight: 600,
                      }}
                    >
                      {getWorkTypeBadge(application.internship.workType).label}
                    </span>

                    {application.internship.location && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={13} style={{ color: 'var(--color-text-muted)' }} />
                        <span>{application.internship.location}</span>
                      </span>
                    )}

                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={13} style={{ color: 'var(--color-text-muted)' }} />
                      <span>
                        Applied on{' '}
                        {new Intl.DateTimeFormat('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        }).format(new Date(application.appliedAt))}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Badge & Withdraw Action */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '1rem',
                  minWidth: '160px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ApplicationStatusBadge status={application.status} size="lg" />
                </div>

                {isWithdrawable && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setWithdrawError(null);
                      setIsWithdrawModalOpen(true);
                    }}
                    id="withdraw-application-action"
                    style={{
                      color: '#DC2626',
                      borderColor: '#FECACA',
                      backgroundColor: '#FEF2F2',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <Ban size={14} style={{ marginRight: '0.35rem' }} />
                    Withdraw Application
                  </Button>
                )}
              </div>
            </div>

            {/* 2. Main Content Grid (Overview, Cover Letter, CV / Right Column: Timeline) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem',
                alignItems: 'start',
              }}
            >
              {/* Left Column: Application Details & CV */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {/* Cover Letter Section */}
                <div
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '1.75rem',
                    boxShadow: 'var(--shadow-xs)',
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
                      id="application-cover-letter"
                      style={{
                        padding: '1.25rem',
                        backgroundColor: 'var(--color-background)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)',
                        fontSize: '0.9375rem',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {application.coverLetter}
                    </div>
                  ) : (
                    <p
                      style={{
                        margin: 0,
                        color: 'var(--color-text-secondary)',
                        fontSize: '0.875rem',
                        fontStyle: 'italic',
                      }}
                    >
                      No cover letter was included with this application.
                    </p>
                  )}
                </div>

                {/* CV Attachment Section */}
                <div
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '1.75rem',
                    boxShadow: 'var(--shadow-xs)',
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
                    <span>Curriculum Vitae (CV)</span>
                  </h3>

                  {application.hasCv ? (
                    <div
                      id="application-cv-status"
                      style={{
                        padding: '1.25rem',
                        backgroundColor: '#F0FDF4',
                        border: '1px solid #BBF7D0',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: '#DCFCE7',
                            color: '#16A34A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <FileCheck size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#166534' }}>
                            CV Attached (Verified PDF)
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: '#15803D' }}>
                            Private &amp; accessible exclusively to the hiring team
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          color: '#15803D',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        <ShieldCheck size={14} />
                        <span>Private</span>
                      </div>
                    </div>
                  ) : (
                    <p
                      style={{
                        margin: 0,
                        color: 'var(--color-text-secondary)',
                        fontSize: '0.875rem',
                      }}
                    >
                      No CV file is attached to this application.
                    </p>
                  )}
                </div>

                {/* Internship Listing Link Card */}
                <div
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <h4
                      style={{
                        margin: '0 0 0.25rem 0',
                        fontSize: '0.9375rem',
                        fontWeight: 700,
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      Original Internship Listing
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.8125rem',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      Review position requirements, required skills, and allowance details.
                    </p>
                  </div>

                  <Link
                    to={`/student/internships/${application.internship.id}`}
                    id="view-original-listing-link"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      color: 'var(--color-primary)',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      padding: '0.45rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-primary-light)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span>View Listing</span>
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </div>

              {/* Right Column: Status Timeline & Helpful Tips */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                <ApplicationStatusTimeline
                  statusHistory={application.statusHistory || []}
                  currentStatus={application.status}
                />

                {/* Next Steps Guidance Card */}
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: 'var(--radius-xl)',
                    padding: '1.5rem',
                  }}
                >
                  <h4
                    style={{
                      margin: '0 0 0.5rem 0',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: '#334155',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    What&apos;s Next?
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.875rem',
                      color: '#64748B',
                      lineHeight: 1.5,
                    }}
                  >
                    {application.status === 'APPLIED' &&
                      'The employer has received your application and will review your profile shortly.'}
                    {application.status === 'UNDER_REVIEW' &&
                      'Your application is actively being screened by the technical recruiters.'}
                    {application.status === 'SHORTLISTED' &&
                      'Congratulations! You have passed the initial screening and are in the shortlisted candidate pool.'}
                    {application.status === 'INTERVIEW' &&
                      'You have been invited for an interview. Please monitor your registered email for schedule invites.'}
                    {application.status === 'ACCEPTED' &&
                      'Congratulations! An internship offer has been extended to you.'}
                    {application.status === 'REJECTED' &&
                      'Thank you for your interest. We encourage you to explore and apply to other open internships.'}
                    {application.status === 'WITHDRAWN' &&
                      'This application was withdrawn and is no longer being processed.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Withdrawal Confirmation Modal */}
      {application && (
        <WithdrawApplicationModal
          isOpen={isWithdrawModalOpen}
          onClose={() => {
            if (!isWithdrawing) {
              setIsWithdrawModalOpen(false);
              setWithdrawError(null);
            }
          }}
          onConfirm={handleConfirmWithdraw}
          internshipTitle={application.internship.title}
          companyName={application.internship.company?.companyName || 'the employer'}
          isSubmitting={isWithdrawing}
          error={withdrawError}
        />
      )}
    </div>
  );
};
