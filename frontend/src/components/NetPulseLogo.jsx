import React from 'react';

/**
 * NetPulse Brand Icon SVG
 * Represents network node connectivity with an active real-time telemetry pulse waveform.
 * Primary palette: Deep Navy (#101B2D), Teal (#48D9C2), White (#FFFFFF)
 */
export function NetPulseIcon({ size = 32, className = '' }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 32 32" 
      width={size} 
      height={size} 
      className={`flex-shrink-0 select-none ${className}`}
      aria-label="NetPulse Logo Icon"
    >
      <defs>
        <linearGradient id="netPulseBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#101B2D" />
          <stop offset="100%" stopColor="#0B1320" />
        </linearGradient>
      </defs>

      {/* Deep Navy Rounded Container with Teal Accent Border */}
      <rect 
        width="32" 
        height="32" 
        rx="8" 
        fill="url(#netPulseBg)" 
        stroke="#48D9C2" 
        strokeWidth="1.2" 
        strokeOpacity="0.4"
      />
      
      {/* Subtle Apex Node Telemetry Halo */}
      <circle 
        cx="15.5" 
        cy="8" 
        r="4.5" 
        fill="none" 
        stroke="#48D9C2" 
        strokeWidth="0.8" 
        strokeOpacity="0.3" 
      />
      
      {/* Network Pulse Waveform (ECG / Telemetry Trace) */}
      <path 
        d="M 5.5 16 H 9.5 L 12 20 L 15.5 8 L 19 23 L 21.5 13 L 23.5 16 H 26.5" 
        fill="none" 
        stroke="#48D9C2" 
        strokeWidth="2.2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Left Ingestion Node */}
      <circle cx="5.5" cy="16" r="2" fill="#FFFFFF" stroke="#48D9C2" strokeWidth="1.2" />

      {/* Apex Monitoring Node */}
      <circle cx="15.5" cy="8" r="2.2" fill="#48D9C2" stroke="#FFFFFF" strokeWidth="1.2" />

      {/* Right Target / Fleet Node */}
      <circle cx="26.5" cy="16" r="2" fill="#FFFFFF" stroke="#48D9C2" strokeWidth="1.2" />
    </svg>
  );
}

/**
 * NetPulse Complete Logo Component
 * Supports:
 * - 'icon': standalone icon badge
 * - 'compact': icon + NetPulse wordmark
 * - 'horizontal': icon + NetPulse wordmark + official tagline
 */
export default function NetPulseLogo({ 
  variant = 'horizontal', 
  size = 'md', 
  showTagline = true,
  className = '' 
}) {
  const iconSizes = {
    sm: 26,
    md: 32,
    lg: 40
  };

  const currentSize = typeof size === 'number' ? size : (iconSizes[size] || 32);

  if (variant === 'icon') {
    return <NetPulseIcon size={currentSize} className={className} />;
  }

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <NetPulseIcon size={currentSize} />
      
      <div className="flex flex-col min-w-0">
        <div className="flex items-center tracking-tight leading-none">
          <span className="font-extrabold text-base text-[var(--text-primary)]">
            Net
          </span>
          <span className="font-extrabold text-base text-[#48D9C2] ml-0.5">
            Pulse
          </span>
        </div>

        {(variant === 'horizontal' && showTagline) && (
          <span className="text-[10px] font-medium tracking-tight text-[var(--text-muted)] truncate mt-0.5">
            Network Monitoring & Performance Intelligence
          </span>
        )}
      </div>
    </div>
  );
}
