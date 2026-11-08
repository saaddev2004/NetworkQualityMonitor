import React from 'react';
import { Download, Plus } from 'lucide-react';
import PageHeader from '../common/PageHeader';

/**
 * TargetsHeader component
 * Displays page title, probe inventory ratio badge, CSV export trigger, and provisioning button
 */
export default function TargetsHeader({
  filteredCount,
  totalCount,
  onExportCSV,
  onAddTarget
}) {
  const probeBadge = (
    <span className="font-mono text-xs px-2 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
      {filteredCount} / {totalCount} Probes
    </span>
  );

  const actions = (
    <>
      <button
        onClick={onExportCSV}
        className="btn-telemetry btn-secondary"
        title="Download CSV report"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Export CSV</span>
      </button>

      <button
        onClick={onAddTarget}
        className="btn-telemetry btn-primary"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Target</span>
      </button>
    </>
  );

  return (
    <PageHeader
      title="Monitored Targets"
      subtitle="Complete inventory of monitored websites, HTTP microservices, and network hosts."
      badge={probeBadge}
      actions={actions}
    />
  );
}
