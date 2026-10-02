import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  MapPin,
  Briefcase,
  Laptop,
  Building2,
  Globe,
  FileText,
  Pencil,
  ExternalLink,
} from 'lucide-react';
import { Button, LoadingSpinner } from '../../components/ui';
import { StudentNavbar } from '../../components/student/StudentNavbar';
import { ProfileAvatar } from '../../components/student/profile/ProfileAvatar';
import { ProfileCompletionCard } from '../../components/profile';
import { studentService } from '../../services/student.service';
import type { StudentProfile } from '../../types/student';

const GithubIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const LinkedinIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const StudentProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const res = await studentService.getStudentProfile();
        if (!isMounted) return;

        if (res.profile === null) {
          // If no profile exists yet, send to onboarding
          navigate('/student/onboarding', { replace: true });
          return;
        }

        setProfile(res.profile);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

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
          Loading your student profile...
        </span>
      </div>
    );
  }

  const displayName = profile?.name || 'Student';
  const graduationDate = profile?.expectedGraduation
    ? new Date(profile.expectedGraduation).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', paddingBottom: '4rem' }}>
      <StudentNavbar userName={displayName} userAvatar={profile?.profileImage} />

      <main style={{ maxWidth: '880px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
        {/* Profile Header Card */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.25rem',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <ProfileAvatar
              src={profile?.profileImage}
              name={displayName}
              size={92}
            />

            <div>
              <h1
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: 'var(--color-text-primary)',
                  margin: '0 0 0.35rem',
                }}
              >
                {displayName}
              </h1>

              <div
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                  marginBottom: '0.4rem',
                }}
              >
                {profile?.degree || 'Student'}
                {profile?.fieldOfStudy ? ` • ${profile.fieldOfStudy}` : ''}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  flexWrap: 'wrap',
                  fontSize: '0.875rem',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {profile?.university && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <GraduationCap size={15} />
                    <span>{profile.university}</span>
                  </span>
                )}

                {profile?.location && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={15} />
                    <span>{profile.location}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <Link to="/student/profile/edit" style={{ textDecoration: 'none' }}>
            <Button variant="outline" size="md">
              <Pencil size={15} />
              <span>Edit Profile</span>
            </Button>
          </Link>
        </div>

        {/* Profile Completion Card */}
        {profile?.completion && (
          <div style={{ marginBottom: '1.5rem' }}>
            <ProfileCompletionCard
              completion={profile.completion}
              title="Complete your profile"
              description="A complete profile helps you stand out and get discovered by top employers on InternshipHub."
              editPath="/student/profile/edit"
              ctaLabel="Complete Profile"
              variant="full"
            />
          </div>
        )}

        {/* About Section */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.75rem 2rem',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '1.5rem',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.15rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              margin: '0 0 0.875rem',
            }}
          >
            About
          </h2>
          <div
            style={{
              fontSize: '0.95rem',
              lineHeight: 1.65,
              color: profile?.bio ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            }}
          >
            {profile?.bio ? (
              <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{profile.bio}</p>
            ) : (
              <p style={{ margin: 0, fontStyle: 'italic' }}>
                No bio provided yet. Click "Edit Profile" to tell employers about yourself.
              </p>
            )}
          </div>
        </div>

        {/* Skills Section */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.75rem 2rem',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
            >
              Skills & Proficiencies
            </h2>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
              }}
            >
              {profile?.skills?.length || 0} skills
            </span>
          </div>

          {profile?.skills && profile.skills.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
              {profile.skills.map((skill) => {
                let badgeColor = 'var(--color-primary)';
                let bgBadge = 'var(--color-primary-light)';
                if (skill.proficiency === 'ADVANCED') {
                  badgeColor = '#059669';
                  bgBadge = '#ecfdf5';
                } else if (skill.proficiency === 'INTERMEDIATE') {
                  badgeColor = '#2563eb';
                  bgBadge = '#eff6ff';
                } else {
                  badgeColor = '#d97706';
                  bgBadge = '#fffbeb';
                }

                return (
                  <div
                    key={skill.id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.4rem 0.85rem',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      fontSize: '0.875rem',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {skill.name}
                    </span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: badgeColor,
                        backgroundColor: bgBadge,
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      {skill.proficiency.charAt(0) + skill.proficiency.slice(1).toLowerCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0, fontStyle: 'italic' }}>
              No skills selected yet.
            </p>
          )}
        </div>

        {/* Education & Career Preferences Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          {/* Education Card */}
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
                margin: '0 0 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <GraduationCap size={18} color="var(--color-primary)" />
              <span>Education</span>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.95rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block' }}>
                  University / Institution
                </span>
                <strong style={{ color: 'var(--color-text-primary)' }}>
                  {profile?.university || 'Not specified'}
                </strong>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block' }}>
                  Degree & Major
                </span>
                <strong style={{ color: 'var(--color-text-primary)' }}>
                  {profile?.degree || 'Degree'}{' '}
                  {profile?.fieldOfStudy ? `in ${profile.fieldOfStudy}` : ''}
                </strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block' }}>
                    Current Year
                  </span>
                  <strong style={{ color: 'var(--color-text-primary)' }}>
                    {profile?.currentYear ? `Year ${profile.currentYear}` : 'Not specified'}
                  </strong>
                </div>

                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block' }}>
                    Expected Graduation
                  </span>
                  <strong style={{ color: 'var(--color-text-primary)' }}>
                    {graduationDate || 'Not specified'}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Career Preferences Card */}
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
                margin: '0 0 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Briefcase size={18} color="var(--color-primary)" />
              <span>Career Preferences</span>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.95rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block' }}>
                  Desired Internship Role
                </span>
                <strong style={{ color: 'var(--color-text-primary)' }}>
                  {profile?.preferredRole || 'Not specified'}
                </strong>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block' }}>
                  Preferred Work Type
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    marginTop: '0.25rem',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary-dark)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                >
                  {profile?.preferredWorkType === 'REMOTE' && <Laptop size={14} />}
                  {profile?.preferredWorkType === 'HYBRID' && <Building2 size={14} />}
                  {profile?.preferredWorkType === 'ONSITE' && <MapPin size={14} />}
                  <span>{profile?.preferredWorkType || 'REMOTE'}</span>
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block' }}>
                  Location
                </span>
                <span style={{ color: 'var(--color-text-primary)' }}>
                  {profile?.location || 'Not specified'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Links */}
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
              margin: '0 0 1rem',
            }}
          >
            Professional Links & Profiles
          </h2>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {profile?.githubUrl ? (
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <Button variant="outline" size="sm">
                  <GithubIcon size={15} />
                  <span>GitHub</span>
                  <ExternalLink size={12} style={{ opacity: 0.6 }} />
                </Button>
              </a>
            ) : null}

            {profile?.linkedinUrl ? (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <Button variant="outline" size="sm">
                  <LinkedinIcon size={15} />
                  <span>LinkedIn</span>
                  <ExternalLink size={12} style={{ opacity: 0.6 }} />
                </Button>
              </a>
            ) : null}

            {profile?.portfolioUrl ? (
              <a
                href={profile.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <Button variant="outline" size="sm">
                  <Globe size={15} />
                  <span>Portfolio</span>
                  <ExternalLink size={12} style={{ opacity: 0.6 }} />
                </Button>
              </a>
            ) : null}

            {profile?.cvUrl ? (
              <a
                href={profile.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <Button variant="outline" size="sm">
                  <FileText size={15} />
                  <span>View CV / Resume</span>
                  <ExternalLink size={12} style={{ opacity: 0.6 }} />
                </Button>
              </a>
            ) : null}

            {!profile?.githubUrl &&
              !profile?.linkedinUrl &&
              !profile?.portfolioUrl &&
              !profile?.cvUrl && (
                <p
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.9rem',
                    margin: 0,
                    fontStyle: 'italic',
                  }}
                >
                  No external profile links added yet. Click "Edit Profile" to link your GitHub,
                  LinkedIn, and portfolio.
                </p>
              )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentProfilePage;
