import React, { useState, useEffect, useCallback } from 'react';
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Inbox,
  Sparkles,
} from 'lucide-react';
import { StudentNavbar } from '../../components/student/StudentNavbar';
import { Button } from '../../components/ui/Button';
import {
  StudentInternshipCard,
  StudentInternshipCardSkeleton,
} from '../../components/student/internships/StudentInternshipCard';
import { internshipDiscoveryService } from '../../services/internshipDiscovery.service';
import { studentService } from '../../services/student.service';
import { useAuth } from '../../context/AuthContext';
import type {
  DiscoveryInternshipItem,
  DiscoveryPagination,
} from '../../types/internshipDiscovery';

const ITEMS_PER_PAGE = 10;

export const StudentInternshipsPage: React.FC = () => {
  const { user } = useAuth();
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);

  const [internships, setInternships] = useState<DiscoveryInternshipItem[]>([]);
  const [pagination, setPagination] = useState<DiscoveryPagination | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch optional profile avatar for student navbar
  useEffect(() => {
    let isMounted = true;
    studentService
      .getProfile()
      .then((res) => {
        if (isMounted && res.profile?.profileImage) {
          setProfileAvatar(res.profile.profileImage);
        }
      })
      .catch(() => {
        // Non-blocking fallback to user context avatar
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch published internships
  const fetchInternships = useCallback(async (pageToLoad: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await internshipDiscoveryService.getPublishedInternships({
        page: pageToLoad,
        limit: ITEMS_PER_PAGE,
      });

      if (response.status === 'success') {
        setInternships(response.internships || []);
        setPagination(response.pagination);
      } else {
        throw new Error(response.message || 'Failed to retrieve published internships');
      }
    } catch (err: any) {
      console.error('Error loading internships:', err);
      setError(err.message || 'Unable to load internships. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInternships(currentPage);
  }, [fetchInternships, currentPage]);

  const handlePrevPage = () => {
    if (pagination?.hasPrevPage && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (pagination?.hasNextPage) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const totalItems = pagination?.total ?? 0;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', paddingBottom: '4rem' }}>
      {/* Student Top Navbar */}
      <StudentNavbar userName={user?.name} userAvatar={profileAvatar || user?.profileImage} />

      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
        {/* Page Header Banner */}
        <section
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.25rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--color-primary)',
                backgroundColor: 'var(--color-primary-light)',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <Briefcase size={13} />
              <span>Internship Discovery</span>
            </div>
            <h1
              className="page-heading"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.85rem',
                fontWeight: 800,
                color: 'var(--color-text-primary)',
                margin: '0 0 0.35rem 0',
              }}
            >
              Discover Internships
            </h1>
            <p
              style={{
                margin: 0,
                color: 'var(--color-text-secondary)',
                fontSize: '0.95rem',
                maxWidth: '650px',
                lineHeight: 1.5,
              }}
            >
              Explore verified opportunities from top companies and kickstart your professional journey.
            </p>
          </div>

          {/* Quick Counter / Refresh CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {pagination && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                  backgroundColor: 'rgba(241, 245, 249, 0.7)',
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <Sparkles size={15} style={{ color: 'var(--color-primary)' }} />
                <span>
                  {pagination.total} {pagination.total === 1 ? 'Opportunity' : 'Opportunities'}
                </span>
              </div>
            )}

            <Button
              id="refresh-internships-btn"
              variant="outline"
              size="sm"
              onClick={() => fetchInternships(currentPage)}
              disabled={isLoading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              title="Refresh listings"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </Button>
          </div>
        </section>

        {/* Content Section: Loading, Error, Empty, or Loaded Cards */}
        {isLoading ? (
          /* Loading State: Skeleton Cards Grid */
          <section
            id="internships-loading-state"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <StudentInternshipCardSkeleton />
            <StudentInternshipCardSkeleton />
            <StudentInternshipCardSkeleton />
            <StudentInternshipCardSkeleton />
          </section>
        ) : error ? (
          /* Error State */
          <section
            id="internships-error-state"
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
                Unable to load internships
              </h2>
              <p
                style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.9rem',
                  maxWidth: '450px',
                  margin: '0 auto',
                  lineHeight: 1.5,
                }}
              >
                {error}
              </p>
            </div>
            <Button
              id="retry-fetch-btn"
              variant="primary"
              size="md"
              onClick={() => fetchInternships(currentPage)}
              style={{ marginTop: '0.5rem' }}
            >
              Retry
            </Button>
          </section>
        ) : internships.length === 0 ? (
          /* Empty State */
          <section
            id="internships-empty-state"
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
              gap: '1rem',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(241, 245, 249, 0.8)',
                color: 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Inbox size={32} />
            </div>
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  margin: '0 0 0.5rem 0',
                }}
              >
                No internships available yet
              </h2>
              <p
                style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.95rem',
                  maxWidth: '460px',
                  margin: '0 auto',
                  lineHeight: 1.5,
                }}
              >
                Check back later for new opportunities. Companies frequently post new openings for talented students.
              </p>
            </div>
          </section>
        ) : (
          /* Loaded List & Pagination */
          <>
            {/* Internship Cards Grid */}
            <section
              id="internships-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {internships.map((internship) => (
                <StudentInternshipCard key={internship.id} internship={internship} />
              ))}
            </section>

            {/* Pagination Controls */}
            {pagination && (
              <footer
                id="internships-pagination"
                style={{
                  marginTop: '2.5rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                {/* Result count indicator */}
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
                  Showing <strong style={{ color: 'var(--color-text-primary)' }}>{startItem}–{endItem}</strong> of{' '}
                  <strong style={{ color: 'var(--color-text-primary)' }}>{totalItems}</strong> internships
                </div>

                {/* Navigation Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Button
                    id="pagination-prev-btn"
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={!pagination.hasPrevPage || currentPage <= 1 || isLoading}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <ChevronLeft size={16} />
                    <span>Previous</span>
                  </Button>

                  <span
                    id="pagination-page-indicator"
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      padding: '0 0.5rem',
                    }}
                  >
                    Page {pagination.page} of {Math.max(1, pagination.totalPages)}
                  </span>

                  <Button
                    id="pagination-next-btn"
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={!pagination.hasNextPage || isLoading}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </footer>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default StudentInternshipsPage;
