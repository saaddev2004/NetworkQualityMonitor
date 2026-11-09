import React from 'react';
import { RotateCw, AlertCircle } from 'lucide-react';

/**
 * TargetAvailabilityBar component
 * Renders verified SLA availability metrics, success/failure probe ratio, and total execution count
 */
export default function TargetAvailabilityBar({
  uptimeData = null,
  isLoading = false,
  error = null,
  onRetry = null
}) {
  const uptimeNum = uptimeData?.uptimePercent !== null && uptimeData?.uptimePercent !== undefined 
    ? Number(uptimeData.uptimePercent) 
    : null;

  const uptimeColor = uptimeNum === null
    ? 'var(--text-muted)'
    : uptimeNum >= 99
      ? 'var(--status-online)'
      : uptimeNum >= 95
        ? 'var(--status-warning)'
        : 'var(--status-critical)';

  const total = uptimeData?.totalEligibleChecks || 0;
  const success = uptimeData?.successfulChecks || 0;
  const failed = Math.max(0, total - success);
  const successPercent = Math.min(100, Math.max(0, uptimeNum ?? (total > 0 ? (success / total) * 100 : 0)));
  const failPercent = Math.max(0, 100 - successPercent);

  return (
    <div className="telemetry-card p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            SLA Availability & Probe Conformance
          </h2>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
            Calculated uptime ratio across recorded monitoring probe cycles
          </p>
        </div>

        {isLoading ? (
          <span className="text-xs font-mono text-[var(--text-muted)] flex items-center gap-1.5">
            <RotateCw className="w-3.5 h-3.5 animate-spin text-[var(--brand-primary)]" />
            <span>Calculating...</span>
          </span>
        ) : error ? (
          <span className="text-xs font-mono text-[var(--status-critical)]">
            Unavailable
          </span>
        ) : (
          <span className="text-xs font-mono font-bold" style={{ color: uptimeColor }}>
            {uptimeData?.uptimePercentage || 'N/A'}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="py-4 text-center text-xs font-mono text-[var(--text-muted)] flex flex-col items-center justify-center gap-2">
          <div className="w-full h-3 rounded-full bg-[var(--bg-elevated)] overflow-hidden animate-pulse" />
          <span>Querying database for SLA availability telemetry...</span>
        </div>
      ) : error ? (
        <div className="py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--status-critical)]">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Failed to load SLA uptime metrics: {error}</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="btn-telemetry btn-secondary text-xs inline-flex items-center gap-1 py-1 px-2.5"
            >
              <RotateCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          )}
        </div>
      ) : total === 0 ? (
        <div className="py-4 text-center text-xs text-[var(--text-muted)] font-mono">
          No monitoring probe cycles recorded yet. Run a health check to establish SLA compliance.
        </div>
      ) : (
        <>
          {/* Visual SLA Ratio Bar */}
          <div className="w-full h-3.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden flex my-2 border border-[var(--border-subtle)]">
            <div 
              style={{ width: `${successPercent}%` }} 
              className="h-full bg-[var(--status-online)] transition-all duration-300" 
              title={`Successful probes: ${success.toLocaleString()} (${successPercent.toFixed(1)}%)`}
            />
            {failPercent > 0 && (
              <div 
                style={{ width: `${failPercent}%` }} 
                className="h-full bg-[var(--status-critical)] transition-all duration-300" 
                title={`Failed/unreachable probes: ${failed.toLocaleString()} (${failPercent.toFixed(1)}%)`}
              />
            )}
          </div>

          {/* Metrics Legend & Total Probes Counter */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs font-mono text-[var(--text-muted)] border-t border-[var(--border-subtle)] mt-2">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <span className="status-dot" style={{ background: 'var(--status-online)' }} />
                <span>Successful: <strong className="text-[var(--text-primary)]">{success.toLocaleString()}</strong></span>
              </span>
              <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <span className="status-dot" style={{ background: failed > 0 ? 'var(--status-critical)' : 'var(--text-muted)' }} />
                <span>Failed: <strong className={failed > 0 ? 'text-[var(--status-critical)]' : 'text-[var(--text-primary)]'}>{failed.toLocaleString()}</strong></span>
              </span>
            </div>
            <span className="text-[11px] text-[var(--text-muted)]">
              Total Evaluated Probes: <strong className="text-[var(--text-primary)]">{total.toLocaleString()}</strong>
            </span>
          </div>
        </>
      )}
    </div>
  );
}
