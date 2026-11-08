import React from 'react';
import { Search } from 'lucide-react';

/**
 * EventsFilterBar component
 * Provides severity chip filtering (All, Active, Critical, Warning, Resolved) and incident text search
 */
export default function EventsFilterBar({
  searchQuery,
  onSearchChange,
  severityFilter,
  onSeverityChange,
  statusFilter,
  onStatusChange,
  totalEvents = 0,
  activeCount = 0,
  criticalCount = 0,
  warningCount = 0
}) {
  return (
    <div className="telemetry-card p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Severity & Resolution Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
        <button
          onClick={() => { onSeverityChange('all'); onStatusChange('all'); }}
          className={`text-xs py-1 px-2.5 rounded-md transition ${
            severityFilter === 'all' && statusFilter === 'all'
              ? 'bg-[var(--brand-subtle)] text-[var(--text-primary)] border border-[var(--brand-primary)] font-semibold'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] border border-transparent'
          }`}
        >
          All Events ({totalEvents})
        </button>

        <button
          onClick={() => { onStatusChange('active'); }}
          className={`text-xs py-1 px-2.5 rounded-md transition flex items-center gap-1.5 ${
            statusFilter === 'active'
              ? 'bg-[var(--status-critical-bg)] text-[var(--status-critical)] border border-[var(--status-critical-border)] font-semibold'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] border border-transparent'
          }`}
        >
          <span className="status-dot" style={{ background: 'var(--status-critical)' }} />
          <span>Active Alerts ({activeCount})</span>
        </button>

        <button
          onClick={() => { onSeverityChange('critical'); }}
          className={`text-xs py-1 px-2.5 rounded-md transition flex items-center gap-1.5 ${
            severityFilter === 'critical'
              ? 'bg-[var(--status-critical-bg)] text-[var(--status-critical)] border border-[var(--status-critical-border)] font-semibold'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] border border-transparent'
          }`}
        >
          <span>Critical Only ({criticalCount})</span>
        </button>

        <button
          onClick={() => { onSeverityChange('warning'); }}
          className={`text-xs py-1 px-2.5 rounded-md transition flex items-center gap-1.5 ${
            severityFilter === 'warning'
              ? 'bg-[var(--status-warning-bg)] text-[var(--status-warning)] border border-[var(--status-warning-border)] font-semibold'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] border border-transparent'
          }`}
        >
          <span>Warnings ({warningCount})</span>
        </button>

        <button
          onClick={() => { onStatusChange('resolved'); }}
          className={`text-xs py-1 px-2.5 rounded-md transition ${
            statusFilter === 'resolved'
              ? 'bg-[var(--status-online-bg)] text-[var(--status-online)] border border-[var(--status-online-border)] font-semibold'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] border border-transparent'
          }`}
        >
          Resolved ({totalEvents - activeCount})
        </button>
      </div>

      {/* Search Input */}
      <div className="relative w-full md:w-64">
        <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search events log..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="form-input pl-8 text-xs"
        />
      </div>
    </div>
  );
}
