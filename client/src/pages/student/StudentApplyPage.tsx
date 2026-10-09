import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  AlertTriangle,
  FileQuestion,
  Calendar,
  MapPin,
  Briefcase,
} from 'lucide-react';
import { StudentNavbar } from '../../components/student/StudentNavbar';
import { CompanyLogo } from '../../components/company/CompanyLogo';
import { Button } from '../../components/ui/Button';
import { ApplicationForm } from '../../components/student/applications/ApplicationForm';
import { internshipDiscoveryService } from '../../services/internshipDiscovery.service';
import { studentService } from '../../services/student.service';
import { studentApplicationService } from '../../services/studentApplication.service';
import type { DiscoveryInternshipItem } from '../../types/internshipDiscovery';
import type { StudentProfile } from '../../types/student';
import type { ApplicationItem } from '../../types/application';

export const StudentApplyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [internship, setInternship] = useState<DiscoveryInternshipItem | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [existingApplication, setExistingApplication] = useState<ApplicationItem | null>(null);
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Load internship, student profile, and check existing application
  const loadData = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setSubmissionError(null);

    try {
      const [internshipRes, profileRes, applicationsRes] = await Promise.all([
        internshipDiscoveryService.getPublishedInternshipById(id).catch(() => null),
        studentService.getProfile().catch(() => null),
        studentApplicationService.getStudentApplications().catch(() => null),
      ]);

      if (internshipRes?.status === 'success' && internshipRes.internship) {
        setInternship(internshipRes.internship);
      }

      if (profileRes?.status === 'success' && profileRes.profile) {
        setStudentProfile(profileRes.profile);
        if (profileRes.profile.profileImage) {
          setProfileAvatar(profileRes.profile.profileImage);
        }
      }

      if (applicationsRes?.status === 'success' && Array.isArray(applicationsRes.data)) {
        const found = applicationsRes.data.find(
          (app) => app.internship.id === id || app.internshipId === id
        );
        if (found) {
          setExistingApplication(found);
        }
      }
    } catch (err) {
      console.error('Error loading application data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle application submission
  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const res = await studentApplicationService.submitApplicationWithCv(formData);
      if (res.status === 'success') {
        setIsSuccess(true);
      }
    } catch (err: any) {
      console.error('Error submitting application:', err);
      if (err.status === 409) {
        setSubmissionError('You have already submitted an application for this internship.');
        setExistingApplication({
          id: 'existing',
          status: 'APPLIED',
          appliedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          internship: internship!,
        });
      } else {
        setSubmissionError(err.message || 'Failed to submit application. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eligibility evaluation
  const isDeadlinePassed =
    internship?.applicationDeadline &&
    new Date(internship.applicationDeadline).getTime() < Date.now();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      <StudentNavbar userAvatar={profileAvatar} />

      <main
        style={{
          maxWidth: '820px',
          margin: '0 auto',
          padding: '2.5rem 1.5rem 5rem 1.5rem',
        }}
      >
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to={id ? `/student/internships/${id}` : '/student/internships'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Internship Details</span>
          </Link>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div
            id="apply-loading-state"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '3rem 2rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-full)',
                border: '3px solid rgba(37, 99, 235, 0.2)',
                borderTopColor: 'var(--color-primary)',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1.25rem auto',
              }}
            />
            <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontWeight: 500 }}>
              Loading internship details...
            </p>
          </div>
        ) : !internship ? (
          /* Not Found State */
          <div
            id="apply-not-found-state"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '3.5rem 2rem',
              textAlign: 'center',
            }}
          >
            <FileQuestion size={48} style={{ color: '#D97706', margin: '0 auto 1rem auto' }} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
              Internship Not Found
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 1.5rem 0' }}>
              This internship listing is no longer available or could not be loaded.
            </p>
            <Button variant="primary" onClick={() => navigate('/student/internships')}>
              Browse Available Internships
            </Button>
          </div>
        ) : isSuccess ? (
          /* 1. Success Confirmation State */
          <div
            id="application-success-card"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1.5px solid #BBF7D0',
              borderRadius: 'var(--radius-xl)',
              padding: '3.5rem 2rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-md)',
              animation: 'fadeIn 0.3s ease',
            }}
          >
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: 'var(--radius-full)',
                backgroundColor: '#DCFCE7',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto',
              }}
            >
              <CheckCircle2 size={38} />
            </div>

            <h2
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: 'var(--color-text-primary)',
                margin: '0 0 0.75rem 0',
              }}
            >
              Application Submitted!
            </h2>

            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: '1rem',
                maxWidth: '520px',
                margin: '0 auto 2rem auto',
                lineHeight: 1.6,
              }}
            >
              Your application for <strong>{internship.title}</strong> at{' '}
              <strong>{internship.company?.companyName}</strong> has been successfully delivered. The hiring team has received your profile and secure CV.
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/student/internships')}
              >
                Browse More Internships
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate(`/student/internships/${internship.id}`)}
              >
                View Internship Details
              </Button>
            </div>
          </div>
        ) : existingApplication ? (
          /* 2. Already Applied Banner State */
          <div
            id="already-applied-card"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1.5px solid #BAE6FD',
              borderRadius: 'var(--radius-xl)',
              padding: '3rem 2rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 'var(--radius-full)',
                backgroundColor: '#E0F2FE',
                color: '#0284C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
              }}
            >
              <CheckCircle2 size={32} />
            </div>

            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: 'var(--color-text-primary)',
                margin: '0 0 0.5rem 0',
              }}
            >
              You've Already Applied
            </h2>

            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: '0.95rem',
                maxWidth: '480px',
                margin: '0 auto 1.75rem auto',
                lineHeight: 1.5,
              }}
            >
              You submitted an application for <strong>{internship.title}</strong>. Your application status is currently{' '}
              <span
                style={{
                  display: 'inline-block',
                  padding: '0.2rem 0.55rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: '9999px',
                  backgroundColor: '#EFF6FF',
                  color: '#1D4ED8',
                  border: '1px solid #BFDBFE',
                }}
              >
                {existingApplication.status}
              </span>.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Button
                variant="primary"
                onClick={() => navigate('/student/internships')}
              >
                Browse Other Internships
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate(`/student/internships/${internship.id}`)}
              >
                View Listing
              </Button>
            </div>
          </div>
        ) : isDeadlinePassed ? (
          /* 3. Deadline Passed State */
          <div
            id="deadline-passed-card"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1.5px solid #FED7AA',
              borderRadius: 'var(--radius-xl)',
              padding: '3rem 2rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <AlertTriangle size={48} style={{ color: '#EA580C', margin: '0 auto 1rem auto' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
              Applications Closed
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 1.5rem 0' }}>
              The application deadline for <strong>{internship.title}</strong> has passed. Applications are no longer being accepted.
            </p>
            <Button variant="primary" onClick={() => navigate('/student/internships')}>
              Explore Other Open Positions
            </Button>
          </div>
        ) : (
          /* 4. Active Application Form Layout */
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '2.5rem 2rem',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {/* Header: Target Opportunity Summary */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1.25rem',
                paddingBottom: '1.75rem',
                borderBottom: '1px solid var(--color-border)',
                marginBottom: '2rem',
              }}
            >
              <CompanyLogo
                src={internship.company?.logoUrl}
                name={internship.company?.companyName || 'Company'}
                size="lg"
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--color-primary)',
                  }}
                >
                  Applying For
                </span>
                <h1
                  id="apply-opportunity-title"
                  style={{
                    fontSize: '1.65rem',
                    fontWeight: 800,
                    color: 'var(--color-text-primary)',
                    margin: '0.2rem 0 0.4rem 0',
                    lineHeight: 1.25,
                  }}
                >
                  {internship.title}
                </h1>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    flexWrap: 'wrap',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.875rem',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                    <Building2 size={15} />
                    {internship.company?.companyName}
                  </span>

                  {internship.location && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={14} />
                      {internship.location}
                    </span>
                  )}

                  {internship.workType && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Briefcase size={14} />
                      {internship.workType}
                    </span>
                  )}

                  {internship.applicationDeadline && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#D97706' }}>
                      <Calendar size={14} />
                      Deadline: {new Date(internship.applicationDeadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Application Form */}
            <ApplicationForm
              internship={internship}
              studentProfile={studentProfile}
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/student/internships/${internship.id}`)}
              isSubmitting={isSubmitting}
              submissionError={submissionError}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentApplyPage;
