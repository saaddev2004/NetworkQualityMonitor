import React from 'react';
import { Download, Plus, RotateCw } from 'lucide-react';
import PageHeader from '../common/PageHeader';

/**
 * TargetsHeader component
 * Displays page title, probe inventory ratio badge, CSV report export triggers, and provisioning button
 */
export default function TargetsHeader({
  filteredCount,
  totalCount,
  onExportTargets,
  onExportResults,
  onExportCSV, // Backwards compatible alias
  isExportingTargets = false,
  isExportingResults = false,
  onAddTarget
}) {
  const probeBadge = (
    <span className="font-mono text-xs px-2 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
      {filteredCount} / {totalCount} Probes
    </span>
  );

  const handleExportTargetsClick = onExportTargets || onExportCSV;
  const isExportingAny = isExportingTargets || isExportingResults;

  const actions = (
    <>
      {/* 1. Targets Inventory CSV Export */}
      <button
        onClick={handleExportTargetsClick}
        disabled={isExportingAny}
        className="btn-telemetry btn-secondary"
        title="Download complete configured targets CSV report"
      >
        {isExportingTargets ? (
          <RotateCw className="w-3.5 h-3.5 animate-spin text-[var(--brand-primary)]" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        <span>{isExportingTargets ? 'Exporting...' : 'Export Targets'}</span>
      </button>

      {/* 2. Historical Probe Results CSV Export */}
      {onExportResults && (
        <button
          onClick={onExportResults}
          disabled={isExportingAny}
          className="btn-telemetry btn-secondary"
          title="Download historical monitoring probe results CSV report"
        >
          {isExportingResults ? (
            <RotateCw className="w-3.5 h-3.5 animate-spin text-[var(--brand-primary)]" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span>{isExportingResults ? 'Exporting...' : 'Export Results'}</span>
        </button>
      )}

      {/* 3. Add Target Trigger */}
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
