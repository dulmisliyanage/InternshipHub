import React, { useState, useMemo } from 'react';
import { Search, X, Check, Code2 } from 'lucide-react';
import type { SkillCategory, SelectedSkill, ProficiencyLevel } from '../../../types/student';

interface SkillEditorProps {
  categories: SkillCategory[];
  selectedSkills: SelectedSkill[];
  onToggleSkill: (skill: { id: string; name: string }, categoryName: string) => void;
  onSetProficiency: (skillId: string, level: ProficiencyLevel) => void;
  onRemoveSkill: (skillId: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export const SkillEditor: React.FC<SkillEditorProps> = ({
  categories,
  selectedSkills,
  onToggleSkill,
  onSetProficiency,
  onRemoveSkill,
  isLoading = false,
  error = null,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('ALL');

  // Filter skills based on search query
  const filteredCategories = useMemo(() => {
    let result = categories;

    if (activeCategoryTab !== 'ALL') {
      result = result.filter((cat) => cat.id === activeCategoryTab);
    }

    if (!searchQuery.trim()) return result;

    const query = searchQuery.toLowerCase().trim();
    return result
      .map((cat) => ({
        ...cat,
        skills: cat.skills.filter((skill) =>
          skill.name.toLowerCase().includes(query)
        ),
      }))
      .filter((cat) => cat.skills.length > 0);
  }, [categories, searchQuery, activeCategoryTab]);

  const selectedSkillIds = useMemo(
    () => new Set(selectedSkills.map((s) => s.skillId)),
    [selectedSkills]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Search Input */}
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
          placeholder="Search skills (e.g. React, TypeScript, Docker, SQL)..."
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

      {/* Category Tabs */}
      {categories.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.35rem',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveCategoryTab('ALL')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              backgroundColor:
                activeCategoryTab === 'ALL'
                  ? 'var(--color-primary)'
                  : 'var(--color-surface)',
              color:
                activeCategoryTab === 'ALL'
                  ? '#ffffff'
                  : 'var(--color-text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            All Categories
          </button>
          {categories.map((cat) => {
            const isActive = activeCategoryTab === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategoryTab(cat.id)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: isActive
                    ? 'var(--color-primary)'
                    : 'var(--color-surface)',
                  color: isActive ? '#ffffff' : 'var(--color-text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Selected Skills Section */}
      {selectedSkills.length > 0 && (
        <div
          style={{
            backgroundColor: 'var(--color-background)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.25rem',
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
                Your Skills ({selectedSkills.length})
              </span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              Set proficiency for each skill
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
                  padding: '0.65rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.925rem', color: 'var(--color-text-primary)' }}>
                    {item.name}
                  </span>
                  {item.category && (
                    <span
                      style={{
                        marginLeft: '0.5rem',
                        fontSize: '0.75rem',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      ({item.category})
                    </span>
                  )}
                </div>

                {/* Proficiency Pill Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as ProficiencyLevel[]).map((level) => {
                    const isSelected = item.proficiency === level;
                    let activeBg = 'var(--color-primary-light)';
                    let activeColor = 'var(--color-primary)';
                    if (level === 'ADVANCED') {
                      activeBg = '#ecfdf5';
                      activeColor = '#059669';
                    } else if (level === 'INTERMEDIATE') {
                      activeBg = '#eff6ff';
                      activeColor = '#2563eb';
                    } else {
                      activeBg = '#fffbeb';
                      activeColor = '#d97706';
                    }

                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => onSetProficiency(item.skillId, level)}
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.25rem 0.65rem',
                          borderRadius: 'var(--radius-full)',
                          border: isSelected ? '1px solid currentColor' : '1px solid var(--color-border)',
                          backgroundColor: isSelected ? activeBg : 'var(--color-surface)',
                          color: isSelected ? activeColor : 'var(--color-text-secondary)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {level.charAt(0) + level.slice(1).toLowerCase()}
                      </button>
                    );
                  })}

                  {/* Remove skill button */}
                  <button
                    type="button"
                    onClick={() => onRemoveSkill(item.skillId)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      marginLeft: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title={`Remove ${item.name}`}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Skills Catalog */}
      <div
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <span
          style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            display: 'block',
            marginBottom: '0.875rem',
          }}
        >
          Click skills to add or remove
        </span>

        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading skills catalog...
          </div>
        ) : error ? (
          <div style={{ color: 'var(--color-error)', fontSize: '0.9rem' }}>
            {error}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            No skills found matching "{searchQuery}"
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredCategories.map((cat) => (
              <div key={cat.id}>
                <div
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Code2 size={14} color="var(--color-primary)" />
                  <span>{cat.name}</span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {cat.skills.map((skill) => {
                    const isSelected = selectedSkillIds.has(skill.id);
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => onToggleSkill(skill, cat.name)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.35rem 0.75rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.85rem',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          border: isSelected
                            ? '1px solid var(--color-primary)'
                            : '1px solid var(--color-border)',
                          backgroundColor: isSelected
                            ? 'var(--color-primary-light)'
                            : 'var(--color-surface)',
                          color: isSelected
                            ? 'var(--color-primary-dark)'
                            : 'var(--color-text-primary)',
                        }}
                      >
                        {isSelected && <Check size={13} strokeWidth={2.5} />}
                        <span>{skill.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
