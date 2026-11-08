import React from 'react';

/**
 * TargetStatusFilters component
 * Renders horizontal scrolling status filter pills with count badges
 */
export default function TargetStatusFilters({
  statusFilter = 'all',
  onStatusFilterChange,
  counts = {}
}) {
  const chips = [
    { id: 'all', label: 'All Targets', count: counts.all || 0 },
    { id: 'online', label: 'Online', count: counts.online || 0, color: 'var(--status-online)' },
    { id: 'warning', label: 'Warning', count: counts.warning || 0, color: 'var(--status-warning)' },
    { id: 'critical', label: 'Critical', count: counts.critical || 0, color: 'var(--status-critical)' },
    { id: 'offline', label: 'Offline', count: counts.offline || 0, color: 'var(--status-offline)' },
    { id: 'disabled', label: 'Disabled', count: counts.disabled || 0, color: 'var(--status-disabled)' }
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
      {chips.map(chip => (
        <button
          key={chip.id}
          onClick={() => onStatusFilterChange(chip.id)}
          className={`text-xs py-1 px-2.5 rounded-md transition flex items-center gap-1.5 border ${
            statusFilter === chip.id
              ? 'bg-[var(--brand-subtle)] text-[var(--text-primary)] border-[var(--brand-primary)] font-semibold'
              : 'text-[var(--text-secondary)] border-transparent hover:bg-[var(--bg-elevated)]'
          }`}
        >
          {chip.color && (
            <span className="status-dot" style={{ background: chip.color }} />
          )}
          <span>{chip.label}</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
            {chip.count}
          </span>
        </button>
      ))}
    </div>
  );
}
