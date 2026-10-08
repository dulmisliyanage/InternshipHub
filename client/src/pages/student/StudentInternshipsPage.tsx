import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Inbox,
  SearchX,
  RotateCcw,
} from 'lucide-react';
import { StudentNavbar } from '../../components/student/StudentNavbar';
import { Button } from '../../components/ui/Button';
import {
  StudentInternshipCard,
  StudentInternshipCardSkeleton,
} from '../../components/student/internships/StudentInternshipCard';
import { InternshipFilters } from '../../components/student/internships/InternshipFilters';
import type { FilterValues } from '../../components/student/internships/InternshipFilters';
import { internshipDiscoveryService } from '../../services/internshipDiscovery.service';
import { studentService } from '../../services/student.service';
import { useAuth } from '../../context/AuthContext';
import type {
  DiscoveryInternshipItem,
  DiscoveryPagination,
} from '../../types/internshipDiscovery';

const ITEMS_PER_PAGE = 10;
const DEBOUNCE_MS = 350;

export const StudentInternshipsPage: React.FC = () => {
  const { user } = useAuth();
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);

  // URL Search Parameters are the canonical source of applied filter state
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse active filters from URL
  const urlSearch = searchParams.get('search') || '';
  const urlWorkType = searchParams.get('workType') || '';
  const urlCategory = searchParams.get('category') || '';
  const urlLocation = searchParams.get('location') || '';
  const parsedPage = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

  // Local state for debounced text inputs (search and location)
  const [inputSearch, setInputSearch] = useState<string>(urlSearch);
  const [prevUrlSearch, setPrevUrlSearch] = useState<string>(urlSearch);
  if (urlSearch !== prevUrlSearch) {
    setPrevUrlSearch(urlSearch);
    setInputSearch(urlSearch);
  }

  const [inputLocation, setInputLocation] = useState<string>(urlLocation);
  const [prevUrlLocation, setPrevUrlLocation] = useState<string>(urlLocation);
  if (urlLocation !== prevUrlLocation) {
    setPrevUrlLocation(urlLocation);
    setInputLocation(urlLocation);
  }

  const [internships, setInternships] = useState<DiscoveryInternshipItem[]>([]);
  const [pagination, setPagination] = useState<DiscoveryPagination | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Concurrent request tracking & AbortController ref
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef<number>(0);

  // Fetch optional student profile avatar for navbar
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
        // Non-blocking fallback
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch published internships with active filters and AbortController protection
  const fetchInternships = useCallback(
    async (
      page: number,
      search: string,
      workType: string,
      category: string,
      location: string
    ) => {
      // Abort previous in-flight request if any
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;
      const currentRequestId = ++requestIdRef.current;

      setIsLoading(true);
      setError(null);

      try {
        const response = await internshipDiscoveryService.getPublishedInternships(
          {
            page,
            limit: ITEMS_PER_PAGE,
            search: search.trim() ? search.trim() : undefined,
            workType: (workType as any) || undefined,
            category: category.trim() ? category.trim() : undefined,
            location: location.trim() ? location.trim() : undefined,
          },
          { signal: controller.signal }
        );

        // Stale response check
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        if (response.status === 'success') {
          setInternships(response.internships || []);
          setPagination(response.pagination);
        } else {
          throw new Error(response.message || 'Failed to retrieve published internships');
        }
      } catch (err: any) {
        // Silently ignore aborted requests
        if (err.name === 'AbortError' || controller.signal.aborted) {
          return;
        }

        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        console.error('Error loading internships:', err);
        setError(err.message || 'Unable to load internships. Please check your connection and try again.');
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    []
  );

  // Trigger fetch whenever canonical URL parameters change
  useEffect(() => {
    fetchInternships(currentPage, urlSearch, urlWorkType, urlCategory, urlLocation);
  }, [fetchInternships, currentPage, urlSearch, urlWorkType, urlCategory, urlLocation]);

  // Debounced update for search keyword
  useEffect(() => {
    if (inputSearch === urlSearch) return;

    const timer = setTimeout(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const trimmed = inputSearch.trim();
          if (trimmed) {
            next.set('search', trimmed);
          } else {
            next.delete('search');
          }
          next.set('page', '1'); // Reset to page 1 on search change
          return next;
        },
        { replace: true }
      );
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [inputSearch, urlSearch, setSearchParams]);

  // Debounced update for location
  useEffect(() => {
    if (inputLocation === urlLocation) return;

    const timer = setTimeout(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const trimmed = inputLocation.trim();
          if (trimmed) {
            next.set('location', trimmed);
          } else {
            next.delete('location');
          }
          next.set('page', '1'); // Reset to page 1 on location change
          return next;
        },
        { replace: true }
      );
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [inputLocation, urlLocation, setSearchParams]);

  // Handler for immediate changes (workType, category) or typing changes
  const handleFilterChange = (field: keyof FilterValues, value: string) => {
    if (field === 'search') {
      setInputSearch(value);
    } else if (field === 'location') {
      setInputLocation(value);
    } else if (field === 'workType') {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value) {
            next.set('workType', value);
          } else {
            next.delete('workType');
          }
          next.set('page', '1');
          return next;
        },
        { replace: false }
      );
    } else if (field === 'category') {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value) {
            next.set('category', value);
          } else {
            next.delete('category');
          }
          next.set('page', '1');
          return next;
        },
        { replace: false }
      );
    }
  };

  // Reset all filters and return to page 1
  const handleClearFilters = () => {
    setInputSearch('');
    setInputLocation('');
    setSearchParams({}, { replace: true });
  };

  // Pagination page change handlers
  const handlePrevPage = () => {
    if (pagination?.hasPrevPage && currentPage > 1) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('page', String(currentPage - 1));
          return next;
        },
        { replace: false }
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (pagination?.hasNextPage) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('page', String(currentPage + 1));
          return next;
        },
        { replace: false }
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const hasActiveFilters = Boolean(urlSearch || urlWorkType || urlCategory || urlLocation);

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
            marginBottom: '1.5rem',
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
              Find opportunities that match your interests, skills, and preferred work arrangements.
            </p>
          </div>

          {/* Quick Refresh CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <Button
              id="refresh-internships-btn"
              variant="outline"
              size="sm"
              onClick={() => fetchInternships(currentPage, urlSearch, urlWorkType, urlCategory, urlLocation)}
              disabled={isLoading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              title="Refresh listings"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </Button>
          </div>
        </section>

        {/* Interactive Search & Filter Controls */}
        <InternshipFilters
          values={{
            search: inputSearch,
            workType: urlWorkType,
            category: urlCategory,
            location: inputLocation,
          }}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
          totalResults={pagination?.total}
          isLoading={isLoading}
        />

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
              onClick={() => fetchInternships(currentPage, urlSearch, urlWorkType, urlCategory, urlLocation)}
              style={{ marginTop: '0.5rem' }}
            >
              Retry
            </Button>
          </section>
        ) : internships.length === 0 ? (
          /* Distinct Empty States: Filter-specific vs Global empty */
          hasActiveFilters ? (
            /* Situation 2: No Matching Internships for active filters */
            <section
              id="internships-no-matches-state"
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
                  backgroundColor: 'rgba(239, 246, 255, 0.9)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SearchX size={32} />
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
                  No matching internships found
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
                  Try changing your search terms, selecting a different work arrangement, or clearing active filters.
                </p>
              </div>
              <Button
                id="empty-clear-filters-btn"
                variant="outline"
                size="md"
                onClick={handleClearFilters}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <RotateCcw size={15} />
                <span>Clear All Filters</span>
              </Button>
            </section>
          ) : (
            /* Situation 1: No Published Internships at all */
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
                  No internship opportunities available yet
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
          )
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
