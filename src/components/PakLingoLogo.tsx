import React, { useId } from 'react';

interface PakLingoMarkProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<PakLingoMarkProps['size']>, string> = {
  xs: 'w-6 h-6 rounded-lg',
  sm: 'w-8 h-8 rounded-xl',
  md: 'w-9 h-9 sm:w-10 sm:h-10 rounded-xl',
  lg: 'w-11 h-11 rounded-2xl',
  xl: 'w-14 h-14 rounded-2xl',
};

/**
 * PakLingoMark — Iconic Emblem for PakLingo AI
 * Combines:
 * - Deep navy & emerald architectural crest
 * - Sculpted Pakistani crescent arc with emerald-to-pink neural gradient
 * - Linguistic dialogue wave & AI neural star node
 * - Sharp SVG geometry that scales from 16px favicon to hero display
 */
export const PakLingoMark: React.FC<PakLingoMarkProps> = ({
  size = 'md',
  className = '',
}) => {
  const uid = useId().replace(/:/g, '');

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none overflow-hidden shadow-xs ${SIZE_CLASSES[size]} ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full block"
      >
        <defs>
          {/* Deep Navy & Emerald Base Gradient */}
          <linearGradient id={`pl-bg-${uid}`} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#071324" />
            <stop offset="52%" stopColor="#0B2928" />
            <stop offset="100%" stopColor="#064E3B" />
          </linearGradient>

          {/* Emerald to Pink AI Accent Ribbon */}
          <linearGradient id={`pl-crescent-${uid}`} x1="8" y1="8" x2="38" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="55%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>

          {/* Pink to White Neural Spark Gradient */}
          <linearGradient id={`pl-spark-${uid}`} x1="22" y1="10" x2="38" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="55%" stopColor="#F9A8D4" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>

          {/* Subtle Inner Rim Highlight */}
          <linearGradient id={`pl-rim-${uid}`} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" stopOpacity="0.65" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#EC4899" stopOpacity="0.65" />
          </linearGradient>
        </defs>

        {/* Rounded Squircle Background */}
        <rect width="48" height="48" rx="12" fill={`url(#pl-bg-${uid})`} />

        {/* Subtle Ambient Glows */}
        <circle cx="14" cy="14" r="14" fill="#10B981" fillOpacity="0.16" />
        <circle cx="36" cy="35" r="13" fill="#EC4899" fillOpacity="0.18" />

        {/* Crisp Inner Border Rim */}
        <rect
          x="1"
          y="1"
          width="46"
          height="46"
          rx="11"
          stroke={`url(#pl-rim-${uid})`}
          strokeWidth="1.25"
        />

        {/* Outer Sculpted Pakistani Crescent & Speech Bubble Tail */}
        <path
          d="M25.8 9.2C16.85 9.2 9.6 16.45 9.6 25.4C9.6 29.35 11.02 32.97 13.38 35.78L11.2 40.2L16.75 38.58C19.38 40.48 22.46 41.6 25.8 41.6C32.45 41.6 38.16 37.59 40.66 31.85C37.92 34.48 34.21 36.1 30.12 36.1C21.72 36.1 14.92 29.3 14.92 20.9C14.92 15.88 17.36 11.43 21.12 8.66C22.62 9.01 24.19 9.2 25.8 9.2Z"
          fill={`url(#pl-crescent-${uid})`}
        />

        {/* AI Neural Soundwave & Script Connection Arcs */}
        <path
          d="M21.5 23.5H24.2L26.2 19.2L28.8 27.6L31.1 22.2L32.8 24.5H36.2"
          stroke="#FFFFFF"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* AI 4-Point Star & Crescent North Star */}
        <path
          d="M32.5 10.2L33.9 14.1L37.8 15.5L33.9 16.9L32.5 20.8L31.1 16.9L27.2 15.5L31.1 14.1L32.5 10.2Z"
          fill={`url(#pl-spark-${uid})`}
        />

        {/* Linguistic Diversity Nodes (Emerald, White, Pink) */}
        <circle cx="21.5" cy="23.5" r="1.7" fill="#34D399" />
        <circle cx="36.2" cy="24.5" r="1.7" fill="#F472B6" />
        <circle cx="25.5" cy="31.2" r="1.4" fill="#FFFFFF" fillOpacity="0.9" />
      </svg>
    </div>
  );
};

interface PakLingoLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  taglineText?: string;
  className?: string;
}

/**
 * PakLingoLogo — Complete Brand Lockup (Emblem + Wordmark + Optional Tagline)
 */
export const PakLingoLogo: React.FC<PakLingoLogoProps> = ({
  size = 'md',
  showTagline = true,
  taglineText = "AI for Pakistan's Languages",
  className = '',
}) => {
  const titleSizeClass =
    size === 'lg'
      ? 'text-lg sm:text-xl'
      : size === 'sm'
      ? 'text-sm sm:text-base'
      : 'text-base sm:text-lg';

  return (
    <div className={`inline-flex items-center gap-2.5 min-w-0 select-none ${className}`}>
      <PakLingoMark size={size} className="group-hover:scale-[1.03] transition-transform duration-200" />
      <div className="flex flex-col justify-center min-w-0 text-start">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`${titleSizeClass} font-extrabold tracking-tight text-[var(--text-primary)] whitespace-nowrap leading-none`}
          >
            PakLingo
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-emerald-600 via-emerald-500 to-pink-500 text-white shadow-2xs leading-none keep-white">
            AI
          </span>
        </div>
        {showTagline && (
          <span className="hidden sm:block text-[10px] sm:text-[11px] text-[var(--text-muted)] font-medium tracking-tight leading-tight whitespace-nowrap mt-1">
            {taglineText}
          </span>
        )}
      </div>
    </div>
  );
};
