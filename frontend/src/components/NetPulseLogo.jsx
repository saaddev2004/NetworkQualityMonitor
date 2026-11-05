import React from 'react';

/**
 * NetPulse Brand Icon SVG
 * Custom vector logo combining terminal network nodes with a precision telemetry EKG pulse waveform.
 * Exact visual match to the NetPulse brand identity specification.
 * Primary palette: Teal (#48D9C2), White (#FFFFFF), Deep Navy (#101B2D).
 */
export function NetPulseIcon({ width = 56, height = 28, className = '' }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 64 32" 
      width={width} 
      height={height} 
      className={`flex-shrink-0 select-none ${className}`}
      aria-label="NetPulse Logo Icon"
    >
      <defs>
        {/* Subtle soft glow for network nodes */}
        <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#48D9C2" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Network Pulse Waveform */}
      <path 
        d="M 6 16 L 16 16 L 21 21 L 28 5 L 37 27 L 45 12 L 49 16 L 58 16" 
        fill="none" 
        stroke="#48D9C2" 
        strokeWidth="2.75" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Left Network Node */}
      <circle cx="6" cy="16" r="3.75" fill="#48D9C2" filter="url(#nodeGlow)" />
      <circle cx="6" cy="16" r="1.6" fill="#FFFFFF" />

      {/* Right Network Node */}
      <circle cx="58" cy="16" r="3.75" fill="#48D9C2" filter="url(#nodeGlow)" />
      <circle cx="58" cy="16" r="1.6" fill="#FFFFFF" />
    </svg>
  );
}

/**
 * NetPulse Complete Wordmark & Horizontal Logo Component
 * Matches the official NetPulse brand identity:
 * [ Pulse Icon ] | NetPulse
 *                | Network Quality Monitoring & Performance Intelligence
 */
export default function NetPulseLogo({ 
  variant = 'horizontal', // 'horizontal' | 'compact' | 'icon' | 'stacked'
  size = 'md', // 'sm' | 'md' | 'lg'
  showTagline = true,
  tagline = 'Network Quality Monitoring & Performance Intelligence',
  className = '' 
}) {
  const iconConfig = {
    sm: { width: 44, height: 22, titleSize: 'text-base', tagSize: 'text-[9.5px]' },
    md: { width: 56, height: 28, titleSize: 'text-lg', tagSize: 'text-[11px]' },
    lg: { width: 72, height: 36, titleSize: 'text-2xl', tagSize: 'text-xs' }
  };

  const current = iconConfig[size] || iconConfig.md;

  if (variant === 'icon') {
    return <NetPulseIcon width={current.width} height={current.height} className={className} />;
  }

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Vector Icon */}
      <NetPulseIcon width={current.width} height={current.height} />

      {/* Elegant Vertical Divider Line */}
      <div className="h-7 w-[1px] bg-[var(--border-subtle)] opacity-70 flex-shrink-0" />

      {/* Wordmark and Tagline */}
      <div className="flex flex-col justify-center min-w-0">
        <div className={`flex items-center tracking-tight leading-none ${current.titleSize}`}>
          <span className="font-bold text-[var(--text-primary)]">
            Net
          </span>
          <span className="font-bold text-[#48D9C2]">
            Pulse
          </span>
        </div>

        {(variant === 'horizontal' && showTagline) && (
          <span className={`font-normal tracking-tight text-[var(--text-secondary)] truncate mt-1 ${current.tagSize}`}>
            {tagline}
          </span>
        )}
      </div>
    </div>
  );
}
