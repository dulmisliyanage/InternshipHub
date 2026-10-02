import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { StudentNavbar } from '../../components/student/StudentNavbar';
import { ProfileAvatar } from '../../components/student/profile/ProfileAvatar';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/student.service';
import type { StudentProfile } from '../../types/student';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const res = await studentService.getProfile();
        if (!isMounted) return;

        if (res.profile === null) {
          // If no profile exists, automatically redirect to onboarding
          navigate('/student/onboarding', { replace: true });
          return;
        }

        setProfile(res.profile);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        if (isMounted) setIsLoadingProfile(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (isLoadingProfile) {
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
        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          Loading your student dashboard...
        </span>
      </div>
    );
  }

  const displayName = profile?.name || user?.name || 'Student';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', paddingBottom: '4rem' }}>
      {/* Top Navigation */}
      <StudentNavbar userName={displayName} userAvatar={profile?.profileImage} />

      {/* Main Container */}
      <main style={{ maxWidth: '900px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
        {/* Welcome Header Banner */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <ProfileAvatar src={profile?.profileImage} name={displayName} size={64} />
            <div>
              <h1 className="page-heading" style={{ fontSize: '1.5rem', margin: 0 }}>
                Welcome back, {displayName}
              </h1>
              <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                {profile?.preferredRole ? `${profile.preferredRole} • ` : ''}
                {profile?.university || 'Student Profile'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--color-success)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              ✓ Profile Complete
            </span>

            <Link to="/student/profile" style={{ textDecoration: 'none' }}>
              <Button size="sm" variant="outline">
                View Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile Overview Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Academic Info Card */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text-primary)' }}>
              🏛️ Academic Background
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '0.8rem' }}>University</span>
                <strong>{profile?.university || 'Not specified'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '0.8rem' }}>Degree & Field</span>
                <strong>{profile?.degree || 'Degree'} {profile?.fieldOfStudy ? `in ${profile.fieldOfStudy}` : ''}</strong>
              </div>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '0.8rem' }}>Current Year</span>
                  <strong>{profile?.currentYear ? `Year ${profile.currentYear}` : 'N/A'}</strong>
                </div>
                {profile?.expectedGraduation && (
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '0.8rem' }}>Graduation</span>
                    <strong>{new Date(profile.expectedGraduation).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preferences & Bio Card */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text-primary)' }}>
              💼 Career Preferences
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '0.8rem' }}>Desired Role</span>
                <strong>{profile?.preferredRole || 'Not specified'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '0.8rem' }}>Work Type</span>
                <span
                  style={{
                    display: 'inline-block',
                    marginTop: '0.2rem',
                    padding: '0.2rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary-dark)',
                  }}
                >
                  {profile?.preferredWorkType || 'REMOTE'}
                </span>
              </div>
              {profile?.location && (
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '0.8rem' }}>Location</span>
                  <span>{profile.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Skills Card */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
              ⚡ Skills & Proficiencies ({profile?.skills?.length || 0})
            </h2>
          </div>

          {profile?.skills && profile.skills.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
              {profile.skills.map((s) => {
                let badgeColor = 'var(--color-primary)';
                let bgBadge = 'var(--color-primary-light)';
                if (s.proficiency === 'ADVANCED') {
                  badgeColor = '#059669';
                  bgBadge = '#ecfdf5';
                } else if (s.proficiency === 'INTERMEDIATE') {
                  badgeColor = '#2563eb';
                  bgBadge = '#eff6ff';
                } else {
                  badgeColor = '#d97706';
                  bgBadge = '#fffbeb';
                }

                return (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{s.name}</span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: badgeColor,
                        backgroundColor: bgBadge,
                        padding: '0.15rem 0.45rem',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      {s.proficiency}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              No skills selected yet.
            </p>
          )}
        </div>

        {/* Bio & Social Links Card */}
        {(profile?.bio || profile?.githubUrl || profile?.linkedinUrl || profile?.portfolioUrl || profile?.cvUrl) && (
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {profile.bio && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-secondary)', margin: '0 0 0.5rem' }}>
                  About Me
                </h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)', margin: 0, lineHeight: 1.6 }}>
                  {profile.bio}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', paddingTop: profile.bio ? '1rem' : 0, borderTop: profile.bio ? '1px solid var(--color-border)' : 'none' }}>
              {profile.githubUrl && (
                <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <Button size="sm" variant="outline">
                    💻 GitHub
                  </Button>
                </a>
              )}
              {profile.linkedinUrl && (
                <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <Button size="sm" variant="outline">
                    💼 LinkedIn
                  </Button>
                </a>
              )}
              {profile.portfolioUrl && (
                <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <Button size="sm" variant="outline">
                    🌐 Portfolio
                  </Button>
                </a>
              )}
              {profile.cvUrl && (
                <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <Button size="sm" variant="outline">
                    📄 View CV
                  </Button>
                </a>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
