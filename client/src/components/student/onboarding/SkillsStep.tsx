import React, { useState, useMemo } from 'react';
import {
  Code2,
  Search,
  X,
  Check,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { Button, LoadingSpinner, Alert } from '../../ui';
import type {
  SkillCategory,
  SelectedSkill,
  ProficiencyLevel,
} from '../../../types/student';

interface SkillsStepProps {
  categories: SkillCategory[];
  selectedSkills: SelectedSkill[];
  isLoading: boolean;
  error: string | null;
  validationError?: string;
  onRetry: () => void;
  onToggleSkill: (skill: { id: string; name: string }, categoryName: string) => void;
  onSetProficiency: (skillId: string, level: ProficiencyLevel) => void;
  onRemoveSkill: (skillId: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export const SkillsStep: React.FC<SkillsStepProps> = ({
  categories,
  selectedSkills,
  isLoading,
  error,
  validationError,
  onRetry,
  onToggleSkill,
  onSetProficiency,
  onRemoveSkill,
  onBack,
  onNext,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Client-side search filtering
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;

    const query = searchQuery.toLowerCase().trim();
    return categories
      .map((cat) => ({
        ...cat,
        skills: cat.skills.filter((skill) =>
          skill.name.toLowerCase().includes(query)
        ),
      }))
      .filter((cat) => cat.skills.length > 0);
  }, [categories, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Step Header */}
      <div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--color-primary)',
            backgroundColor: 'var(--color-primary-light)',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
          }}
        >
          <Code2 size={16} />
          <span>Core Competencies</span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.65rem',
            fontWeight: 800,
            color: 'var(--color-text-primary)',
            margin: '0 0 0.4rem',
          }}
        >
          Your skills & proficiency
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', margin: 0 }}>
          Select the technologies, tools, and skills you know. We use these for our intelligent matching engine.
        </p>
      </div>

      {/* Validation Banner */}
      {validationError && (
        <Alert variant="warning" title="Skills Required">
          {validationError}
        </Alert>
      )}

      {/* Loading state */}
      {isLoading && (
        <div style={{ padding: '3.5rem', textAlign: 'center' }}>
          <LoadingSpinner size="lg" color="var(--color-primary)" />
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '1rem', fontSize: '0.95rem' }}>
            Retrieving skill catalog...
          </p>
        </div>
      )}

      {/* API Error state */}
      {error && !isLoading && (
        <Alert variant="error" title="Couldn't load skills">
          {error}
          <div style={{ marginTop: '0.75rem' }}>
            <Button size="sm" variant="outline" onClick={onRetry}>
              Try Again
            </Button>
          </div>
        </Alert>
      )}

      {/* Main Skill Selector */}
      {!isLoading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              <Search size={18} />
            </div>

            <input
              type="text"
              placeholder="Search skills (e.g. React, PostgreSQL, Docker)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 2.5rem 0.75rem 2.6rem',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                outline: 'none',
                boxSizing: 'border-box',
                boxShadow: 'var(--shadow-xs)',
              }}
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                }}
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Selected Skills Section */}
          {selectedSkills.length > 0 && (
            <div
              style={{
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.25rem 1.5rem',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    Selected Skills
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: 'var(--color-primary-light)',
                      color: 'var(--color-primary)',
                      padding: '0.15rem 0.55rem',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    {selectedSkills.length} selected
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  Set your proficiency for each
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {selectedSkills.map((item) => (
                  <div
                    key={item.skillId}
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      boxShadow: 'var(--shadow-xs)',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                        {item.name}
                      </span>
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                        {item.category}
                      </span>
                    </div>

                    {/* Segmented Proficiency Picker */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          backgroundColor: 'var(--color-background)',
                          padding: '3px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border)',
                        }}
                      >
                        {(
                          [
                            { level: 'BEGINNER', label: 'Beginner' },
                            { level: 'INTERMEDIATE', label: 'Intermediate' },
                            { level: 'ADVANCED', label: 'Advanced' },
                          ] as const
                        ).map(({ level, label }) => {
                          const isActive = item.proficiency === level;
                          return (
                            <button
                              key={level}
                              type="button"
                              onClick={() => onSetProficiency(item.skillId, level)}
                              style={{
                                border: 'none',
                                backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                                color: isActive ? '#ffffff' : 'var(--color-text-secondary)',
                                fontSize: '0.75rem',
                                fontWeight: isActive ? 700 : 500,
                                padding: '0.3rem 0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => onRemoveSkill(item.skillId)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-text-secondary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0.3rem',
                          borderRadius: 'var(--radius-sm)',
                        }}
                        title="Remove skill"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skill Catalog Categories */}
          {filteredCategories.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {filteredCategories.map((category) => (
                <div key={category.id}>
                  <h2
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'var(--color-text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      margin: '0 0 0.625rem',
                    }}
                  >
                    {category.name}
                  </h2>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {category.skills.map((skill) => {
                      const isSelected = selectedSkills.some((s) => s.skillId === skill.id);

                      return (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() => onToggleSkill(skill, category.name)}
                          style={{
                            border: `1.5px solid ${
                              isSelected ? 'var(--color-primary)' : 'var(--color-border)'
                            }`,
                            backgroundColor: isSelected
                              ? 'var(--color-primary-light)'
                              : 'var(--color-surface)',
                            color: isSelected
                              ? 'var(--color-primary-dark)'
                              : 'var(--color-text-primary)',
                            fontWeight: isSelected ? 700 : 500,
                            fontSize: '0.875rem',
                            padding: '0.45rem 0.95rem',
                            borderRadius: 'var(--radius-full)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                            outline: 'none',
                          }}
                        >
                          <span>{skill.name}</span>
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty Search Results State */
            <div
              style={{
                padding: '3rem 1.5rem',
                textAlign: 'center',
                backgroundColor: 'var(--color-background)',
                borderRadius: 'var(--radius-xl)',
                border: '1px dashed var(--color-border)',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem',
                }}
              >
                <AlertCircle size={22} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.25rem', color: 'var(--color-text-primary)' }}>
                No skills found
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: '0 0 1rem' }}>
                Try searching for a different term or explore the standard categories.
              </p>
              <Button size="sm" variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '1.25rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <Button type="button" variant="outline" size="md" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back</span>
        </Button>

        <Button type="button" variant="primary" size="lg" onClick={onNext}>
          <span>Continue</span>
          <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
};
