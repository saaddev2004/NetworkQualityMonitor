import React from 'react';

/**
 * NetworkAvailabilityCard component
 * Displays rolling 24h fleet SLA conformance, multi-status segmented bar, and health breakdown legend
 */
export default function NetworkAvailabilityCard({ summary = null, isLoading = false }) {
  // Use real backend summary metrics exclusively. Show placeholder on loading or absence.
  const online = summary?.onlineTargets ?? 0;
  const warning = summary?.warningTargets ?? 0;
  const critical = summary?.criticalTargets ?? 0;
  const offline = summary?.offlineTargets ?? 0;
  const disabled = summary?.disabledTargets ?? 0;
  const total = summary ? (summary.totalTargets || 1) : 1;

  const uptimeNum = summary?.overallUptimePercent !== null && summary?.overallUptimePercent !== undefined
    ? Number(summary.overallUptimePercent)
    : null;

  const uptimeColor = uptimeNum === null
    ? 'var(--text-muted)'
    : uptimeNum >= 99
      ? 'var(--status-online)'
      : uptimeNum >= 95
        ? 'var(--status-warning)'
        : 'var(--status-critical)';

  const uptimeDisplay = isLoading && !summary
    ? '...'
    : (summary ? summary.overallUptime : '—');

  const formatCount = (val) => {
    if (isLoading && !summary) return '...';
    if (!summary || val === undefined || val === null) return '—';
    return val;
  };

  return (
    <div className="telemetry-card flex flex-col">
      <div className="telemetry-card-header">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Network Availability (24h)
          </h2>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
            Rolling 24h fleet SLA conformance
          </p>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        {/* Primary Availability Percentage */}
        <div className="text-center py-2">
          <div 
            className="text-4xl font-mono font-extrabold tracking-tight"
            style={{ color: uptimeColor }}
          >
            {uptimeDisplay}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-1">
            Overall fleet uptime (rolling 24h)
          </div>
        </div>

        {/* Segmented Color Availability Bar */}
        <div className="my-2">
          <div className="w-full h-2.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden flex">
            {summary ? (
              <>
                <div style={{ width: `${(online / total) * 100}%` }} className="h-full bg-[var(--status-online)]" title={`Online: ${online}`} />
                <div style={{ width: `${(warning / total) * 100}%` }} className="h-full bg-[var(--status-warning)]" title={`Warning: ${warning}`} />
                <div style={{ width: `${(critical / total) * 100}%` }} className="h-full bg-[var(--status-critical)]" title={`Critical: ${critical}`} />
                <div style={{ width: `${(offline / total) * 100}%` }} className="h-full bg-[var(--status-offline)]" title={`Offline: ${offline}`} />
                <div style={{ width: `${(disabled / total) * 100}%` }} className="h-full bg-[var(--status-disabled)]" title={`Disabled: ${disabled}`} />
              </>
            ) : null}
          </div>
        </div>

        {/* Status Breakdown Legend Rows */}
        <div className="space-y-2 text-xs pt-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
              <span className="status-dot" style={{ background: 'var(--status-online)' }} />
              Online (Healthy)
            </span>
            <span className="font-mono font-bold text-[var(--text-primary)]">{formatCount(summary?.onlineTargets)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
              <span className="status-dot" style={{ background: 'var(--status-warning)' }} />
              Warning (High Latency)
            </span>
            <span className="font-mono font-bold text-[var(--text-primary)]">{formatCount(summary?.warningTargets)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
              <span className="status-dot" style={{ background: 'var(--status-critical)' }} />
              Critical (Breach)
            </span>
            <span className="font-mono font-bold text-[var(--text-primary)]">{formatCount(summary?.criticalTargets)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
              <span className="status-dot" style={{ background: 'var(--status-offline)' }} />
              Offline (Timeout)
            </span>
            <span className="font-mono font-bold text-[var(--text-primary)]">{formatCount(summary?.offlineTargets)}</span>
          </div>
        </div>

        {/* Bottom 24h SLA Summary */}
        <div className="pt-3 mt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>Fleet SLA Target: 99.0%</span>
          <span 
            className="font-mono font-semibold"
            style={{
              color: uptimeNum === null
                ? 'var(--text-muted)'
                : uptimeNum >= 99.0
                  ? 'var(--status-online)'
                  : 'var(--status-warning)'
            }}
          >
            {uptimeNum === null ? 'Awaiting Data' : uptimeNum >= 99.0 ? 'SLA PASS' : 'SLA ELEVATED'}
          </span>
        </div>
      </div>
    </div>
  );
}
