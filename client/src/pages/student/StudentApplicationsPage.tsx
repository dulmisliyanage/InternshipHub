import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Briefcase,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { StudentNavbar } from '../../components/student/StudentNavbar';
import { ApplicationCard } from '../../components/student/applications/ApplicationCard';
import { Button } from '../../components/ui/Button';
import { studentApplicationService } from '../../services/studentApplication.service';
import { studentService } from '../../services/student.service';
import type {
  ApplicationItem,
  ApplicationStatus,
} from '../../types/application';

const STATUS_FILTERS: { label: string; value?: ApplicationStatus }[] = [
  { label: 'All Applications', value: undefined },
  { label: 'Applied', value: 'APPLIED' },
  { label: 'Under Review', value: 'UNDER_REVIEW' },
  { label: 'Shortlisted', value: 'SHORTLISTED' },
  { label: 'Interview', value: 'INTERVIEW' },
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Withdrawn', value: 'WITHDRAWN' },
];

export const StudentApplicationsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL state synchronization
  const currentStatusParam = searchParams.get('status') as ApplicationStatus | null;
  const currentPageParam = parseInt(searchParams.get('page') || '1', 10);
  const activeStatus = currentStatusParam || undefined;
  const activePage = isNaN(currentPageParam) || currentPageParam < 1 ? 1 : currentPageParam;

  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit] = useState<number>(10);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);

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

  // Fetch applications list with server-side pagination & filtering
  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await studentApplicationService.getStudentApplications({
        page: activePage,
        limit,
        status: activeStatus,
      });

      if (res.status === 'success') {
        setApplications(res.data);
        setTotalCount(res.pagination.total);
        setTotalPages(res.pagination.totalPages || 1);
      }
    } catch (err: any) {
      console.error('Failed to load student applications:', err);
      setError(err.message || 'Unable to load your applications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [activePage, limit, activeStatus]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Handle filter selection
  const handleStatusChange = (status?: ApplicationStatus) => {
    const nextParams = new URLSearchParams();
    if (status) {
      nextParams.set('status', status);
    }
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  // Handle pagination navigation
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', String(newPage));
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentListUrl = `/student/applications${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      <StudentNavbar userAvatar={profileAvatar} />

      <main
        style={{
          maxWidth: '1080px',
          margin: '0 auto',
          padding: '2.5rem 1.5rem 5rem 1.5rem',
        }}
      >
        {/* Page Title & Subtitle */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={22} />
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: '1.875rem',
                fontWeight: 800,
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-heading)',
              }}
            >
              My Applications
            </h1>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: '1rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            Track your internship applications and recruitment progress in real time.
          </p>
        </div>

        {/* Filter Bar & Summary */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={16} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Filter by Status:
              </span>
            </div>

            {!isLoading && (
              <span
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 500,
                }}
              >
                Showing <strong>{totalCount}</strong> {totalCount === 1 ? 'application' : 'applications'}
                {activeStatus && ` (${activeStatus.replace('_', ' ')})`}
              </span>
            )}
          </div>

          {/* Status Filter Pills */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.25rem',
              scrollbarWidth: 'thin',
            }}
          >
            {STATUS_FILTERS.map((f) => {
              const isSelected = activeStatus === f.value;
              return (
                <button
                  key={f.label}
                  onClick={() => handleStatusChange(f.value)}
                  id={`filter-${f.value || 'all'}`}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8125rem',
                    fontWeight: isSelected ? 700 : 500,
                    border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: isSelected ? '#FFFFFF' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* State: Loading Skeletons */}
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  opacity: 0.6,
                  animation: 'pulse 1.5s infinite',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--color-border)',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        width: '40%',
                        height: 18,
                        backgroundColor: 'var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '0.5rem',
                      }}
                    />
                    <div
                      style={{
                        width: '25%',
                        height: 14,
                        backgroundColor: 'var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* State: Network Error Banner with Retry */}
        {!isLoading && error && (
          <div
            id="tracker-error-alert"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid #FCA5A5',
              borderRadius: 'var(--radius-xl)',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 'var(--radius-full)',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
              }}
            >
              <AlertCircle size={28} />
            </div>
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: '0 0 0.5rem 0',
              }}
            >
              Failed to load applications
            </h3>
            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: '0.9375rem',
                margin: '0 auto 1.5rem auto',
                maxWidth: '460px',
              }}
            >
              {error}
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={fetchApplications}
              leftIcon={<RefreshCw size={16} />}
            >
              Retry
            </Button>
          </div>
        )}

        {/* State: Empty - No applications matching filter */}
        {!isLoading && !error && applications.length === 0 && activeStatus && (
          <div
            id="tracker-empty-filter"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '3.5rem 2rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
              }}
            >
              <Search size={28} />
            </div>
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: '0 0 0.5rem 0',
              }}
            >
              No {activeStatus.replace('_', ' ').toLowerCase()} applications found
            </h3>
            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: '0.9375rem',
                margin: '0 auto 1.5rem auto',
                maxWidth: '420px',
              }}
            >
              You don&apos;t have any applications currently in this status.
            </p>
            <Button
              variant="secondary"
              size="md"
              onClick={() => handleStatusChange(undefined)}
            >
              Clear Filter
            </Button>
          </div>
        )}

        {/* State: Empty - Zero applications overall */}
        {!isLoading && !error && applications.length === 0 && !activeStatus && (
          <div
            id="tracker-empty-all"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '3.5rem 2rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
              }}
            >
              <Briefcase size={30} />
            </div>
            <h3
              style={{
                fontSize: '1.35rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: '0 0 0.5rem 0',
              }}
            >
              No applications submitted yet
            </h3>
            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: '0.95rem',
                margin: '0 auto 1.75rem auto',
                maxWidth: '460px',
                lineHeight: 1.5,
              }}
            >
              Explore top published internship opportunities tailored for students, attach your CV, and start applying today!
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/student/internships')}
            >
              Discover Internships
            </Button>
          </div>
        )}

        {/* Applications List */}
        {!isLoading && !error && applications.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {applications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                fromUrl={currentListUrl}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && !error && totalPages > 1 && (
          <div
            id="tracker-pagination"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '2.5rem',
            }}
          >
            <Button
              variant="secondary"
              size="sm"
              disabled={activePage <= 1}
              onClick={() => handlePageChange(activePage - 1)}
              leftIcon={<ChevronLeft size={16} />}
              id="tracker-prev-page"
            >
              Previous
            </Button>

            <span
              style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary)',
                fontWeight: 500,
              }}
            >
              Page <strong>{activePage}</strong> of <strong>{totalPages}</strong>
            </span>

            <Button
              variant="secondary"
              size="sm"
              disabled={activePage >= totalPages}
              onClick={() => handlePageChange(activePage + 1)}
              rightIcon={<ChevronRight size={16} />}
              id="tracker-next-page"
            >
              Next
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};
