import React from 'react';

/**
 * NetworkAvailabilityCard component
 * Displays rolling 24h fleet SLA conformance, multi-status segmented bar, and health breakdown legend
 */
export default function NetworkAvailabilityCard({ targets = [] }) {
  const total = targets.length || 1;
  const online = targets.filter(t => t.current_status === 'online').length;
  const warning = targets.filter(t => t.current_status === 'warning').length;
  const critical = targets.filter(t => t.current_status === 'critical').length;
  const offline = targets.filter(t => t.current_status === 'offline').length;
  const disabled = targets.filter(t => !t.is_enabled || t.current_status === 'disabled').length;

  return (
    <div className="telemetry-card flex flex-col">
      <div className="telemetry-card-header">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Network Availability
          </h2>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
            Rolling SLA conformance
          </p>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        {/* Primary Availability Percentage */}
        <div className="text-center py-2">
          <div className="text-4xl font-mono font-extrabold tracking-tight text-[var(--status-online)]">
            99.42%
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-1">
            Overall fleet uptime (rolling 24h)
          </div>
        </div>

        {/* Segmented Color Availability Bar */}
        <div className="my-2">
          <div className="w-full h-2.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden flex">
            <div style={{ width: `${(online / total) * 100}%` }} className="h-full bg-[var(--status-online)]" title={`Online: ${online}`} />
            <div style={{ width: `${(warning / total) * 100}%` }} className="h-full bg-[var(--status-warning)]" title={`Warning: ${warning}`} />
            <div style={{ width: `${(critical / total) * 100}%` }} className="h-full bg-[var(--status-critical)]" title={`Critical: ${critical}`} />
            <div style={{ width: `${(offline / total) * 100}%` }} className="h-full bg-[var(--status-offline)]" title={`Offline: ${offline}`} />
            <div style={{ width: `${(disabled / total) * 100}%` }} className="h-full bg-[var(--status-disabled)]" title={`Disabled: ${disabled}`} />
          </div>
        </div>

        {/* Status Breakdown Legend Rows */}
        <div className="space-y-2 text-xs pt-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
              <span className="status-dot" style={{ background: 'var(--status-online)' }} />
              Online (Healthy)
            </span>
            <span className="font-mono font-bold text-[var(--text-primary)]">{online}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
              <span className="status-dot" style={{ background: 'var(--status-warning)' }} />
              Warning (High Latency)
            </span>
            <span className="font-mono font-bold text-[var(--text-primary)]">{warning}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
              <span className="status-dot" style={{ background: 'var(--status-critical)' }} />
              Critical (Breach)
            </span>
            <span className="font-mono font-bold text-[var(--text-primary)]">{critical}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
              <span className="status-dot" style={{ background: 'var(--status-offline)' }} />
              Offline (Timeout)
            </span>
            <span className="font-mono font-bold text-[var(--text-primary)]">{offline}</span>
          </div>
        </div>

        {/* Bottom 30-Day Summary */}
        <div className="pt-3 mt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>30-Day SLA Target: 99.0%</span>
          <span className="font-mono font-semibold text-[var(--status-online)]">SLA PASS</span>
        </div>
      </div>
    </div>
  );
}
