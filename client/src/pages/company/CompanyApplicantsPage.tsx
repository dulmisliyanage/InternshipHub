import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Users,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Filter,
  AlertCircle,
  Briefcase,
  RefreshCw,
  SearchX,
} from 'lucide-react';
import { CompanyNavbar } from '../../components/company/CompanyNavbar';
import { ApplicantCard } from '../../components/company/applicants/ApplicantCard';
import { Button } from '../../components/ui';
import { companyApplicantService } from '../../services/companyApplicant.service';
import { internshipService } from '../../services/internship.service';
import { companyService } from '../../services/company.service';
import type { CompanyApplicantItem } from '../../types/companyApplicant';
import type { ApplicationStatus } from '../../types/application';
import type { Internship } from '../../types/internship';
import type { CompanyProfile } from '../../types/company';

const STATUS_FILTERS: { label: string; value: ApplicationStatus | 'ALL' }[] = [
  { label: 'All Applicants', value: 'ALL' },
  { label: 'Applied', value: 'APPLIED' },
  { label: 'Under Review', value: 'UNDER_REVIEW' },
  { label: 'Shortlisted', value: 'SHORTLISTED' },
  { label: 'Interview', value: 'INTERVIEW' },
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Withdrawn', value: 'WITHDRAWN' },
];

const VALID_STATUSES: Set<string> = new Set([
  'APPLIED',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'INTERVIEW',
  'ACCEPTED',
  'REJECTED',
  'WITHDRAWN',
]);

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

export const CompanyApplicantsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [internship, setInternship] = useState<Internship | null>(null);
  const [applicants, setApplicants] = useState<CompanyApplicantItem[]>([]);
  const [totalApplicants, setTotalApplicants] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInternshipLoading, setIsInternshipLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);

  // Parse filters from URL
  const statusParam = searchParams.get('status');
  const selectedStatus: ApplicationStatus | 'ALL' =
    statusParam && VALID_STATUSES.has(statusParam)
      ? (statusParam as ApplicationStatus)
      : 'ALL';

  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const pageSize = 10;

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

  // 2. Fetch Internship Summary Details
  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setIsInternshipLoading(true);

    internshipService
      .getCompanyInternshipById(id)
      .then((res) => {
        if (isMounted) {
          if (res.internship) {
            setInternship(res.internship);
          } else {
            setIsNotFound(true);
          }
          setIsInternshipLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          if (err?.status === 404) {
            setIsNotFound(true);
          }
          setIsInternshipLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // 3. Fetch Applicants for this Internship
  const fetchApplicants = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    setIsNotFound(false);

    try {
      const res = await companyApplicantService.getInternshipApplicants(id, {
        page: currentPage,
        limit: pageSize,
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
      });

      setApplicants(res.data);
      setTotalApplicants(res.pagination.total);
      setTotalPages(res.pagination.totalPages || 1);
    } catch (err: any) {
      if (err?.status === 404) {
        setIsNotFound(true);
      } else {
        setError(err.message || 'Failed to load applicants.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, currentPage, selectedStatus]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  // Update query params when filter changes
  const handleStatusFilterChange = (status: ApplicationStatus | 'ALL') => {
    const newParams = new URLSearchParams(searchParams);
    if (status === 'ALL') {
      newParams.delete('status');
    } else {
      newParams.set('status', status);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage));
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            Internship Not Found
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
            This internship listing could not be found or you do not have permission to view its applicants.
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', paddingBottom: '5rem' }}>
      <CompanyNavbar
        companyName={profile?.companyName || 'Company'}
        logoUrl={profile?.logoUrl}
      />

      <main style={{ maxWidth: '1080px', margin: '2rem auto', padding: '0 1.5rem' }}>
        {/* Breadcrumb Navigation */}
        <div style={{ marginBottom: '1.25rem' }}>
          <Link
            to={`/company/internships/${id}`}
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
            <span>Back to Internship Details</span>
          </Link>
        </div>

        {/* Page Header / Context Banner */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.75rem 2rem',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--color-primary)',
                  backgroundColor: 'var(--color-primary-light, #EFF6FF)',
                  padding: '0.15rem 0.55rem',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                Applicants
              </span>
              {internship?.workType && (
                <span style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
                  · {formatWorkType(internship.workType)}
                </span>
              )}
            </div>

            <h1
              style={{
                fontSize: '1.85rem',
                fontWeight: 800,
                color: 'var(--color-text-primary)',
                margin: 0,
                lineHeight: 1.25,
              }}
            >
              {isInternshipLoading ? 'Loading internship...' : internship?.title || 'Internship Applicants'}
            </h1>

            <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.925rem', color: 'var(--color-text-secondary)' }}>
              Review student profiles, explore credentials, and inspect attached CVs.
            </p>
          </div>

          {/* Metric Summary Counter */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <Users size={22} style={{ color: 'var(--color-primary)' }} />
            <div>
              <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>
                {totalApplicants}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                {selectedStatus === 'ALL' ? 'Total Applications' : `${selectedStatus} Applications`}
              </span>
            </div>
          </div>
        </div>

        {/* Status Filters Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-text-secondary)', marginRight: '0.5rem', flexShrink: 0 }}>
            <Filter size={15} />
            <span style={{ fontSize: '0.825rem', fontWeight: 600 }}>Filter:</span>
          </div>

          {STATUS_FILTERS.map((f) => {
            const isSelected = selectedStatus === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => handleStatusFilterChange(f.value)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8125rem',
                  fontWeight: isSelected ? 700 : 500,
                  border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                  backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: isSelected ? '#FFFFFF' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Error State */}
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
                <h4 style={{ margin: 0, fontWeight: 700 }}>Failed to load applicants</h4>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.875rem' }}>{error}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw size={14} />}
              onClick={fetchApplicants}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.75rem',
                  height: '140px',
                  opacity: 0.6,
                  animation: 'pulse 1.5s infinite',
                }}
              />
            ))}
          </div>
        )}

        {/* Empty State: No applications at all */}
        {!isLoading && !error && applicants.length === 0 && selectedStatus === 'ALL' && (
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '3.5rem 2rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-light, #EFF6FF)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
              }}
            >
              <Briefcase size={28} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              No Applications Yet
            </h3>
            <p
              style={{
                margin: '0.5rem auto 1.5rem auto',
                fontSize: '0.925rem',
                color: 'var(--color-text-secondary)',
                maxWidth: '440px',
                lineHeight: 1.5,
              }}
            >
              This internship listing has not received any applications yet. As students discover and apply, their profiles and CVs will appear here.
            </p>
          </div>
        )}

        {/* Empty State: Filter produced no matches */}
        {!isLoading && !error && applicants.length === 0 && selectedStatus !== 'ALL' && (
          <div
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
                width: 52,
                height: 52,
                borderRadius: '50%',
                backgroundColor: '#F1F5F9',
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
              }}
            >
              <SearchX size={26} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              No {selectedStatus} Applications Found
            </h3>
            <p
              style={{
                margin: '0.4rem auto 1.25rem auto',
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary)',
                maxWidth: '400px',
              }}
            >
              There are currently no applicants for this internship with status <strong>{selectedStatus}</strong>.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusFilterChange('ALL')}
            >
              Clear Status Filter
            </Button>
          </div>
        )}

        {/* Applicant List Cards */}
        {!isLoading && !error && applicants.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {applicants.map((applicant) => (
              <ApplicantCard key={applicant.id} applicant={applicant} />
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {!isLoading && !error && totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '2.5rem',
            }}
          >
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ChevronLeft size={16} />}
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </Button>

            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              rightIcon={<ChevronRight size={16} />}
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};
