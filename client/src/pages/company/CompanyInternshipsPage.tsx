import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Briefcase,
  AlertCircle,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { CompanyNavbar } from '../../components/company/CompanyNavbar';
import { CompanyInternshipCard } from '../../components/company/CompanyInternshipCard';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { companyService } from '../../services/company.service';
import { internshipService } from '../../services/internship.service';
import type { CompanyProfile } from '../../types/company';
import type { Internship, InternshipStatus } from '../../types/internship';

type FilterStatus = 'ALL' | InternshipStatus;

interface StatusTabConfig {
  key: FilterStatus;
  label: string;
}

const STATUS_TABS: StatusTabConfig[] = [
  { key: 'ALL', label: 'All' },
  { key: 'DRAFT', label: 'Draft' },
  { key: 'PUBLISHED', label: 'Published' },
  { key: 'CLOSED', label: 'Closed' },
  { key: 'ARCHIVED', label: 'Archived' },
];

export const CompanyInternshipsPage: React.FC = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('ALL');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch company profile and internships
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch Company Profile
      const profileRes = await companyService.getCompanyProfile();
      if (!profileRes.profile) {
        navigate('/company/onboarding', { replace: true });
        return;
      }
      setProfile(profileRes.profile);

      // 2. Fetch Internships
      const internshipsRes = await internshipService.getCompanyInternships();
      setInternships(internshipsRes.internships || []);
    } catch (err: any) {
      console.error('Failed to load internships:', err);
      setError(err?.message || 'We could not load your internships. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Counts per filter
  const counts = useMemo(() => {
    const map: Record<FilterStatus, number> = {
      ALL: internships.length,
      DRAFT: 0,
      PUBLISHED: 0,
      CLOSED: 0,
      ARCHIVED: 0,
    };

    internships.forEach((item) => {
      if (map[item.status] !== undefined) {
        map[item.status]++;
      }
    });

    return map;
  }, [internships]);

  // Filtered internships
  const filteredInternships = useMemo(() => {
    if (activeFilter === 'ALL') {
      return internships;
    }
    return internships.filter((item) => item.status === activeFilter);
  }, [internships, activeFilter]);

  const companyDisplayName = profile?.companyName || 'Company';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', paddingBottom: '5rem' }}>
      <CompanyNavbar companyName={companyDisplayName} logoUrl={profile?.logoUrl} />

      <main style={{ maxWidth: '1040px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
        {/* Top Header Section */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1.25rem',
            flexWrap: 'wrap',
            marginBottom: '2rem',
          }}
        >
          <div>
            <h1
              className="page-heading"
              style={{
                fontSize: '1.85rem',
                fontWeight: 800,
                color: 'var(--color-text-primary)',
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              Internships
            </h1>
            <p
              style={{
                fontSize: '0.95rem',
                color: 'var(--color-text-secondary)',
                marginTop: '0.35rem',
                marginBottom: 0,
              }}
            >
              Create, publish and manage your internship opportunities.
            </p>
          </div>

          {/* Create Internship CTA */}
          <Link to="/company/internships/new" style={{ textDecoration: 'none' }}>
            <Button
              id="create-internship-btn"
              variant="primary"
              size="md"
              leftIcon={<Plus size={18} />}
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              Create Internship
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '4rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <LoadingSpinner size="lg" color="var(--color-primary)" />
            <span style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Loading your internship listings...
            </span>
          </div>
        )}

        {/* Error State with Retry Button */}
        {!isLoading && error && (
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid #FCA5A5',
              borderRadius: 'var(--radius-xl)',
              padding: '3rem 2rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#FEE2E2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-error)',
              }}
            >
              <AlertCircle size={26} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                We couldn't load your internships
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem', maxWidth: '420px' }}>
                {error}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              leftIcon={<RefreshCw size={14} />}
              style={{ marginTop: '0.5rem' }}
            >
              Try again
            </Button>
          </div>
        )}

        {/* Loaded Content */}
        {!isLoading && !error && (
          <>
            {/* Filter Tabs Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                overflowX: 'auto',
                paddingBottom: '0.5rem',
                marginBottom: '1.75rem',
                scrollbarWidth: 'none',
              }}
            >
              {STATUS_TABS.map((tab) => {
                const isActive = activeFilter === tab.key;
                const count = counts[tab.key] || 0;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveFilter(tab.key)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-full)',
                      border: isActive
                        ? '1px solid var(--color-primary)'
                        : '1px solid var(--color-border)',
                      backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-surface)',
                      color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                      fontSize: '0.85rem',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    <span>{tab.label}</span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.45rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'var(--color-background)',
                        color: isActive ? '#FFFFFF' : 'var(--color-text-disabled)',
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Global Empty State (0 internships in company) */}
            {internships.length === 0 ? (
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px dashed var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '4.5rem 2rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '1.25rem',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary)',
                  }}
                >
                  <Briefcase size={30} />
                </div>

                <div style={{ maxWidth: '440px' }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.35rem',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                      margin: 0,
                    }}
                  >
                    No internships yet
                  </h3>
                  <p
                    style={{
                      fontSize: '0.925rem',
                      color: 'var(--color-text-secondary)',
                      marginTop: '0.45rem',
                      lineHeight: 1.5,
                    }}
                  >
                    Create your first internship opportunity and start connecting with qualified students.
                  </p>
                </div>

                <Link to="/company/internships/new" style={{ textDecoration: 'none' }}>
                  <Button
                    id="empty-create-internship-btn"
                    variant="primary"
                    size="md"
                    leftIcon={<Plus size={18} />}
                  >
                    Create Internship
                  </Button>
                </Link>
              </div>
            ) : filteredInternships.length === 0 ? (
              /* Filter-Specific Empty State */
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '3.5rem 2rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-background)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text-disabled)',
                  }}
                >
                  <FolderOpen size={26} />
                </div>

                <div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                      margin: 0,
                    }}
                  >
                    No {activeFilter.toLowerCase()} internships
                  </h3>
                  <p
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--color-text-secondary)',
                      marginTop: '0.35rem',
                    }}
                  >
                    {activeFilter === 'ARCHIVED'
                      ? 'Archived internship listings will appear here.'
                      : activeFilter === 'CLOSED'
                      ? 'Closed listings will appear here once applications are finalized.'
                      : activeFilter === 'PUBLISHED'
                      ? 'Published listings that are active and live will appear here.'
                      : 'Draft listings you are preparing will appear here.'}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveFilter('ALL')}
                >
                  View all internships
                </Button>
              </div>
            ) : (
              /* Cards List */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {filteredInternships.map((internship) => (
                  <CompanyInternshipCard key={internship.id} internship={internship} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
