import React from 'react';

/**
 * Reusable KPI / Metric card component
 * Used across dashboards and telemetry summary sections
 */
export default function KpiCard({
  title,
  value,
  subtext,
  icon: Icon,
  accentColor,
  statusDotColor,
  valueColor,
  className = '',
  children
}) {
  const cardStyle = accentColor ? {
    borderLeftWidth: '3px',
    borderLeftColor: accentColor
  } : {};

  return (
    <div 
      className={`telemetry-card kpi-card ${className}`} 
      style={cardStyle}
    >
      <div 
        className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider"
        style={accentColor ? { color: accentColor } : { color: 'var(--text-muted)' }}
      >
        <span>{title}</span>
        {statusDotColor ? (
          <span className="status-dot" style={{ background: statusDotColor }} />
        ) : Icon ? (
          <Icon className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
        ) : null}
      </div>

      <div className="my-1">
        <div 
          className="kpi-value" 
          style={valueColor ? { color: valueColor } : { color: 'var(--text-primary)' }}
        >
          {value}
        </div>
        {subtext && (
          <div className="text-[11px] text-[var(--text-muted)] mt-0.5 truncate">
            {subtext}
          </div>
        )}
      </div>

      {children}
    </div>
  );
}
