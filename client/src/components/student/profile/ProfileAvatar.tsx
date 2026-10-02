import React, { useState } from 'react';
import { Camera } from 'lucide-react';

export interface ProfileAvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  style?: React.CSSProperties;
  showEditOverlay?: boolean;
  onEditClick?: () => void;
}

const sizeMap = {
  sm: { dimension: 32, fontSize: '0.75rem', iconSize: 12 },
  md: { dimension: 44, fontSize: '0.95rem', iconSize: 16 },
  lg: { dimension: 72, fontSize: '1.5rem', iconSize: 20 },
  xl: { dimension: 104, fontSize: '2.25rem', iconSize: 24 },
};

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  src,
  name = 'Student',
  size = 'md',
  className = '',
  style,
  showEditOverlay = false,
  onEditClick,
}) => {
  const [imageError, setImageError] = useState(false);

  // Compute dimensions
  let dimension: number;
  let fontSize: string;
  let iconSize: number;

  if (typeof size === 'number') {
    dimension = size;
    fontSize = `${Math.max(12, Math.round(size * 0.38))}px`;
    iconSize = Math.max(12, Math.round(size * 0.22));
  } else {
    const preset = sizeMap[size] || sizeMap.md;
    dimension = preset.dimension;
    fontSize = preset.fontSize;
    iconSize = preset.iconSize;
  }

  // Generate initials (e.g., "Sarah Perera" -> "SP")
  const getInitials = (fullName: string): string => {
    if (!fullName || !fullName.trim()) return 'S';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const hasImage = !!src && !imageError;

  return (
    <div
      className={`ih-profile-avatar ${className}`}
      style={{
        position: 'relative',
        width: `${dimension}px`,
        height: `${dimension}px`,
        borderRadius: '50%',
        flexShrink: 0,
        overflow: 'hidden',
        userSelect: 'none',
        border: '2px solid var(--color-surface)',
        boxShadow: 'var(--shadow-sm)',
        backgroundColor: 'var(--color-primary-light)',
        ...style,
      }}
    >
      {hasImage ? (
        <img
          src={src}
          alt={name}
          onError={() => setImageError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary-dark)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize,
            letterSpacing: '0.02em',
          }}
        >
          {getInitials(name)}
        </div>
      )}

      {/* Optional Camera / Edit overlay */}
      {showEditOverlay && (
        <button
          type="button"
          onClick={onEditClick}
          aria-label="Change profile photo"
          title="Change profile photo"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            border: 'none',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            opacity: 0.9,
            transition: 'opacity 0.2s ease',
          }}
        >
          <Camera size={iconSize} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
};
