import React, { useState } from 'react';

export interface CompanyLogoProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  style?: React.CSSProperties;
}

const sizeMap = {
  sm: { dimension: 32, fontSize: '0.75rem', radius: 'var(--radius-md)' },
  md: { dimension: 44, fontSize: '0.95rem', radius: 'var(--radius-lg)' },
  lg: { dimension: 64, fontSize: '1.4rem', radius: 'var(--radius-xl)' },
  xl: { dimension: 88, fontSize: '2rem', radius: 'var(--radius-2xl)' },
};

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  src,
  name = 'Company',
  size = 'md',
  className = '',
  style,
}) => {
  const [imageError, setImageError] = useState(false);

  let dimension: number;
  let fontSize: string;
  let radius: string;

  if (typeof size === 'number') {
    dimension = size;
    fontSize = `${Math.max(12, Math.round(size * 0.38))}px`;
    radius = 'var(--radius-lg)';
  } else {
    const preset = sizeMap[size] || sizeMap.md;
    dimension = preset.dimension;
    fontSize = preset.fontSize;
    radius = preset.radius;
  }

  // Generate initials (e.g., "Nova Technologies" -> "NT", "Virtusa" -> "V")
  const getInitials = (companyName: string): string => {
    if (!companyName || !companyName.trim()) return 'CO';
    const words = companyName.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  };

  const hasImage = !!src && !imageError;

  return (
    <div
      className={`ih-company-logo ${className}`}
      style={{
        position: 'relative',
        width: `${dimension}px`,
        height: `${dimension}px`,
        borderRadius: radius,
        flexShrink: 0,
        overflow: 'hidden',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-xs)',
        backgroundColor: hasImage ? '#FFFFFF' : '#ECFDF5', // Neutral surface for actual logo (transparency-friendly)
        padding: hasImage ? '3px' : 0,
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
            objectFit: 'contain', // Organization logos use contain to preserve brand aspect ratio
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
            backgroundColor: '#ECFDF5',
            color: '#065F46',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize,
            letterSpacing: '0.04em',
          }}
        >
          {getInitials(name)}
        </div>
      )}
    </div>
  );
};
