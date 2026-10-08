import React from 'react';
import {
  Search,
  MapPin,
  Briefcase,
  Layers,
  X,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../ui/Button';

import {
  DISCOVERY_CATEGORIES,
  WORK_TYPE_OPTIONS,
} from '../../../types/internshipDiscovery';

export interface FilterValues {
  search: string;
  workType: string;
  category: string;
  location: string;
}

export interface InternshipFiltersProps {
  values: FilterValues;
  onChange: (field: keyof FilterValues, value: string) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
  totalResults?: number;
  isLoading?: boolean;
}

export const InternshipFilters: React.FC<InternshipFiltersProps> = ({
  values,
  onChange,
  onClear,
  hasActiveFilters,
  totalResults,
  isLoading,
}) => {
  return (
    <section
      aria-label="Filter internships"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      {/* Filters Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* 1. Keyword Search */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label
            htmlFor="filter-search-input"
            style={{
              fontSize: '0.825rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Search size={14} style={{ color: 'var(--color-primary)' }} />
            <span>Search internships</span>
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              id="filter-search-input"
              type="text"
              value={values.search}
              onChange={(e) => onChange('search', e.target.value)}
              placeholder="Title, skill, or keyword..."
              style={{
                width: '100%',
                padding: '0.65rem 2rem 0.65rem 0.85rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text-primary)',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
            />
            {values.search && (
              <button
                type="button"
                onClick={() => onChange('search', '')}
                aria-label="Clear search keyword"
                style={{
                  position: 'absolute',
                  right: '0.65rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* 2. Work Arrangement */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label
            htmlFor="filter-worktype-select"
            style={{
              fontSize: '0.825rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Briefcase size={14} style={{ color: '#0284C7' }} />
            <span>Work type</span>
          </label>
          <select
            id="filter-worktype-select"
            value={values.workType}
            onChange={(e) => onChange('workType', e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-text-primary)',
              fontSize: '0.9rem',
              outline: 'none',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
          >
            {WORK_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Category */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label
            htmlFor="filter-category-select"
            style={{
              fontSize: '0.825rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Layers size={14} style={{ color: '#7C3AED' }} />
            <span>Category</span>
          </label>
          <select
            id="filter-category-select"
            value={values.category}
            onChange={(e) => onChange('category', e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-text-primary)',
              fontSize: '0.9rem',
              outline: 'none',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
          >
            <option value="">All Categories</option>
            {DISCOVERY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Location */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label
            htmlFor="filter-location-input"
            style={{
              fontSize: '0.825rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <MapPin size={14} style={{ color: '#059669' }} />
            <span>Location</span>
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              id="filter-location-input"
              type="text"
              value={values.location}
              onChange={(e) => onChange('location', e.target.value)}
              placeholder="e.g. Colombo, Kandy..."
              style={{
                width: '100%',
                padding: '0.65rem 2rem 0.65rem 0.85rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text-primary)',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
            />
            {values.location && (
              <button
                type="button"
                onClick={() => onChange('location', '')}
                aria-label="Clear location filter"
                style={{
                  position: 'absolute',
                  right: '0.65rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Badges & Results Summary Row */}
      <div
        style={{
          borderTop: '1px solid var(--color-border)',
          paddingTop: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        {/* Results Counter / Loading Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
          <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            {isLoading ? (
              <span>Updating results...</span>
            ) : totalResults !== undefined ? (
              <span>
                <strong style={{ color: 'var(--color-text-primary)' }}>{totalResults}</strong>{' '}
                {totalResults === 1 ? 'internship found' : 'internships found'}
              </span>
            ) : null}
          </span>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            id="filter-clear-btn"
            variant="ghost"
            size="sm"
            onClick={onClear}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            <RotateCcw size={14} />
            <span>Clear filters</span>
          </Button>
        )}
      </div>
    </section>
  );
};
