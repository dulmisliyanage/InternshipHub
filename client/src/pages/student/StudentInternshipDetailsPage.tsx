import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  AlertCircle,
  FileQuestion,
  FileText,
  CheckCircle,
} from 'lucide-react';
import { StudentNavbar } from '../../components/student/StudentNavbar';
import { Button } from '../../components/ui/Button';
import { CompanyLogo } from '../../components/company/CompanyLogo';
import { InternshipOverview } from '../../components/student/internships/InternshipOverview';
import { InternshipSkillsSection } from '../../components/student/internships/InternshipSkillsSection';
import { InternshipSkillComparison } from '../../components/student/internships/InternshipSkillComparison';
import { InternshipCompanySection } from '../../components/student/internships/InternshipCompanySection';
import { internshipDiscoveryService } from '../../services/internshipDiscovery.service';
import { studentService } from '../../services/student.service';
import { useAuth } from '../../context/AuthContext';
import { getWorkTypeBadge } from '../../utils/internshipFormatters';
import type { DiscoveryInternshipItem } from '../../types/internshipDiscovery';
import type { StudentSkill } from '../../types/student';

export const StudentInternshipDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { user } = useAuth();
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);

  const [internship, setInternship] = useState<DiscoveryInternshipItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Student profile skills state for skill requirement comparison
  const [studentSkills, setStudentSkills] = useState<StudentSkill[] | null>(null);
  const [isLoadingSkills, setIsLoadingSkills] = useState<boolean>(true);
  const [skillsError, setSkillsError] = useState<string | null>(null);

  // Validate and determine safe return URL from navigation state
  const rawFrom = (location.state as any)?.from;
  const returnUrl =
    typeof rawFrom === 'string' && rawFrom.startsWith('/student/internships')
      ? rawFrom
      : '/student/internships';

  // Fetch student profile skills (and optional avatar) for skill compatibility comparison
  const fetchStudentSkills = useCallback(async () => {
    setIsLoadingSkills(true);
    setSkillsError(null);

    try {
      const res = await studentService.getProfile();
      if (res.status === 'success') {
        setStudentSkills(res.profile?.skills || []);
        if (res.profile?.profileImage) {
          setProfileAvatar(res.profile.profileImage);
        }
      } else {
        throw new Error(res.message || 'Failed to load profile');
      }
    } catch (err: any) {
      console.error('Error loading student profile skills:', err);
      setSkillsError(err.message || 'Unable to load profile skills. Please try again.');
    } finally {
      setIsLoadingSkills(false);
    }
  }, []);

  useEffect(() => {
    fetchStudentSkills();
  }, [fetchStudentSkills]);

  // Fetch internship details by ID
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
      const res = await internshipDiscoveryService.getPublishedInternshipById(id);
      if (res.status === 'success' && res.internship) {
        setInternship(res.internship);
      } else {
        throw new Error(res.message || 'Internship not found');
      }
    } catch (err: any) {
      console.error('Error loading internship details:', err);
      if (err.statusCode === 404 || err.message?.includes('404') || err.message?.includes('not found')) {
        setIsNotFound(true);
      } else {
        setError(err.message || 'Unable to load internship details. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const companyName = internship?.company?.companyName || 'Verified Company';
  const workTypeConfig = getWorkTypeBadge(internship?.workType);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', paddingBottom: '4rem' }}>
      {/* Top Navbar */}
      <StudentNavbar userName={user?.name} userAvatar={profileAvatar || user?.profileImage} />

      <main style={{ maxWidth: '980px', margin: '2rem auto', padding: '0 1.5rem' }}>
        {/* Back Navigation Button */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to={returnUrl}
            id="back-to-internships-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-xs)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-primary)';
              e.currentTarget.style.borderColor = 'var(--color-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text-secondary)';
              e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Internships</span>
          </Link>
        </div>

        {/* Loading State: Skeleton Details */}
        {isLoading ? (
          <div
            id="internship-details-loading"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              opacity: 0.75,
            }}
          >
            {/* Header Skeleton */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '2rem',
                display: 'flex',
                gap: '1.5rem',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-border)',
                  animation: 'pulse 1.5s infinite ease-in-out',
                }}
              />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div
                  style={{
                    height: 24,
                    width: '60%',
                    backgroundColor: 'var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    animation: 'pulse 1.5s infinite ease-in-out',
                  }}
                />
                <div
                  style={{
                    height: 16,
                    width: '35%',
                    backgroundColor: 'var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    animation: 'pulse 1.5s infinite ease-in-out',
                  }}
                />
              </div>
            </div>

            {/* Overview Grid Skeleton */}
            <div
              style={{
                height: 160,
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                animation: 'pulse 1.5s infinite ease-in-out',
              }}
            />

            {/* Content Body Skeleton */}
            <div
              style={{
                height: 240,
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                animation: 'pulse 1.5s infinite ease-in-out',
              }}
            />
          </div>
        ) : isNotFound ? (
          /* 404 / Unavailable State */
          <section
            id="internship-not-found-state"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px dashed var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '4rem 2rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.25rem',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 'var(--radius-full)',
                backgroundColor: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileQuestion size={32} />
            </div>
            <div>
              <h1
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  margin: '0 0 0.5rem 0',
                }}
              >
                This internship is no longer available or could not be found
              </h1>
              <p
                style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.95rem',
                  maxWidth: '480px',
                  margin: '0 auto',
                  lineHeight: 1.5,
                }}
              >
                The listing may have expired, been closed, or moved. Explore other active opportunities on the discovery page.
              </p>
            </div>
            <Link to={returnUrl} style={{ textDecoration: 'none' }}>
              <Button id="not-found-browse-btn" variant="primary" size="md">
                Browse Internships
              </Button>
            </Link>
          </section>
        ) : error ? (
          /* Network Error State */
          <section
            id="internship-error-state"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid #FECACA',
              borderRadius: 'var(--radius-xl)',
              padding: '3rem 2rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 'var(--radius-full)',
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertCircle size={28} />
            </div>
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  margin: '0 0 0.5rem 0',
                }}
              >
                Unable to load internship details
              </h2>
              <p
                style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.9rem',
                  maxWidth: '460px',
                  margin: '0 auto',
                  lineHeight: 1.5,
                }}
              >
                {error}
              </p>
            </div>
            <Button id="retry-details-btn" variant="primary" size="md" onClick={fetchDetails}>
              Retry
            </Button>
          </section>
        ) : internship ? (
          /* Loaded Internship Details Content */
          <>
            {/* Header Hero Card */}
            <header
              id="internship-details-header"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '2rem',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flex: 1, minWidth: 260 }}>
                <CompanyLogo
                  src={internship.company?.logoUrl}
                  name={companyName}
                  size="lg"
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h1
                    id="internship-title"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.75rem',
                      fontWeight: 800,
                      color: 'var(--color-text-primary)',
                      margin: '0 0 0.35rem 0',
                      lineHeight: 1.25,
                    }}
                  >
                    {internship.title}
                  </h1>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: 'var(--color-text-secondary)',
                      fontSize: '0.95rem',
                      fontWeight: 500,
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Building2 size={16} />
                      <strong style={{ color: 'var(--color-text-primary)' }}>{companyName}</strong>
                    </span>

                    {internship.category && (
                      <>
                        <span style={{ opacity: 0.5 }}>•</span>
                        <span
                          style={{
                            padding: '0.15rem 0.55rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.8rem',
                            backgroundColor: 'rgba(241, 245, 249, 0.9)',
                            border: '1px solid var(--color-border)',
                          }}
                        >
                          {internship.category}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Work Type Pill */}
              <span
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  backgroundColor: workTypeConfig.bg,
                  color: workTypeConfig.color,
                  border: `1px solid ${workTypeConfig.border}`,
                  letterSpacing: '0.02em',
                }}
              >
                {workTypeConfig.label}
              </span>
            </header>

            {/* 1. Quick Overview Grid */}
            <InternshipOverview internship={internship} />

            {/* 2. Description Section */}
            <section
              aria-label="About the Internship"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.75rem',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <FileText size={18} style={{ color: 'var(--color-primary)' }} />
                <h2
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    margin: 0,
                  }}
                >
                  About the Internship
                </h2>
              </div>
              <p
                style={{
                  color: 'var(--color-text-primary)',
                  fontSize: '0.95rem',
                  lineHeight: 1.7,
                  margin: 0,
                  whiteSpace: 'pre-line',
                }}
              >
                {internship.description}
              </p>
            </section>

            {/* 3. Responsibilities Section */}
            {internship.responsibilities && internship.responsibilities.trim().length > 0 && (
              <section
                aria-label="Responsibilities"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.75rem',
                  boxShadow: 'var(--shadow-sm)',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <CheckCircle size={18} style={{ color: '#0284C7' }} />
                  <h2
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                      margin: 0,
                    }}
                  >
                    Responsibilities & Daily Tasks
                  </h2>
                </div>
                <p
                  style={{
                    color: 'var(--color-text-primary)',
                    fontSize: '0.95rem',
                    lineHeight: 1.7,
                    margin: 0,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {internship.responsibilities}
                </p>
              </section>
            )}

            {/* 4. Skills Requirements Section (Employer Requirements) */}
            <InternshipSkillsSection skills={internship.skills || []} />

            {/* 5. Your Skill Compatibility Preview (Student Profile Match) */}
            <InternshipSkillComparison
              internshipSkills={internship.skills || []}
              studentSkills={studentSkills}
              isLoading={isLoadingSkills}
              error={skillsError}
              onRetry={fetchStudentSkills}
            />

            {/* 6. Company Overview & Safe Links Section */}
            <InternshipCompanySection company={internship.company} />
          </>
        ) : null}
      </main>
    </div>
  );
};

export default StudentInternshipDetailsPage;
