import React from 'react';
import { Layers, Edit3 } from 'lucide-react';

/**
 * TargetConfigCard component
 * Displays detailed probe specifications, intervals, latency thresholds, and quick configuration trigger
 */
export default function TargetConfigCard({ target, onConfigure }) {
  return (
    <div className="telemetry-card p-4 flex flex-col justify-between">
      <div>
        <h2 className="text-sm font-semibold text-[var(--text-primary)] pb-3 border-b border-[var(--border-subtle)] mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[var(--brand-primary)]" />
          Monitoring Configuration
        </h2>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)]">Target ID</span>
            <span className="font-mono text-[var(--text-secondary)]">#{target.id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)]">Check Protocol</span>
            <span className="font-mono uppercase font-semibold text-[var(--text-primary)]">{target.check_method}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)]">Polling Interval</span>
            <span className="font-mono text-[var(--text-primary)]">{target.check_interval_seconds} seconds</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)]">Request Timeout</span>
            <span className="font-mono text-[var(--text-primary)]">{target.timeout_seconds} seconds</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)]">Warning Threshold</span>
            <span className="font-mono text-[var(--status-warning)] font-semibold">{target.warning_threshold_ms} ms</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)]">Critical Threshold</span>
            <span className="font-mono text-[var(--status-critical)] font-semibold">{target.critical_threshold_ms} ms</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)]">Active Telemetry</span>
            <span className={`font-mono text-xs font-semibold ${target.is_enabled ? 'text-[var(--status-online)]' : 'text-[var(--status-disabled)]'}`}>
              {target.is_enabled ? 'ENABLED' : 'PAUSED'}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
            <span className="text-[var(--text-muted)]">Provisioned Date</span>
            <span className="font-mono text-[11px] text-[var(--text-muted)]">
              {target.created_at ? new Date(target.created_at).toLocaleDateString() : '—'}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onConfigure}
        className="btn-telemetry btn-secondary w-full mt-4 justify-center"
      >
        <Edit3 className="w-3.5 h-3.5" />
        <span>Modify Alert Thresholds</span>
      </button>
    </div>
  );
}
