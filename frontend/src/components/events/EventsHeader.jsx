import React from 'react';
import PageHeader from '../common/PageHeader';

/**
 * EventsHeader component
 * Displays page title, incident count ratio, and real-time active alert status pill
 */
export default function EventsHeader({ filteredCount, totalCount, activeCount }) {
  const incidentBadge = (
    <span className="font-mono text-xs px-2 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
      {filteredCount} / {totalCount} Incidents
    </span>
  );

  const actions = (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs">
        <span className="status-dot" style={{ background: 'var(--status-critical)' }} />
        <span className="font-mono font-bold text-[var(--status-critical)]">{activeCount}</span>
        <span className="text-[var(--text-muted)]">Active Unresolved Alerts</span>
      </div>
    </div>
  );

  return (
    <PageHeader
      title="Event Log"
      subtitle="Audit trail of network alerts, state transitions, SLA breaches, and recovery events."
      badge={incidentBadge}
      actions={actions}
    />
  );
}
