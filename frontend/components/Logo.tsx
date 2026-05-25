'use client';

interface LogoMarkProps {
  size?: number;
  className?: string;
}

/** The Kompete K-Mark: a geometric K with a precision dot at the junction,
 *  suggesting competitive targeting / intelligence gathering. */
export function LogoMark({ size = 32, className }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="url(#km-grad)" />
      {/* K — vertical bar */}
      <path d="M9 7 L9 25" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
      {/* K — upper diagonal */}
      <path d="M9 16 L22 7" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
      {/* K — lower diagonal */}
      <path d="M9 16 L22 25" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
      {/* Junction precision dot — the scope/targeting centre */}
      <circle cx="9" cy="16" r="2.2" fill="rgba(199,210,254,0.95)" />
      <defs>
        <linearGradient id="km-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
    </svg>
  );
}

interface LogoProps {
  showWordmark?: boolean;
  size?: number;
}

export function Logo({ showWordmark = true, size = 30 }: LogoProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <LogoMark size={size} />
      {showWordmark && (
        <span style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: `${Math.round(size * 0.54)}px`,
          color: '#f0f0f5',
          letterSpacing: '-0.04em',
          lineHeight: 1,
        }}>
          Kompete
        </span>
      )}
    </div>
  );
}
