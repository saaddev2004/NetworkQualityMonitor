import React from 'react';

/**
 * TargetMetricsStrip component
 * 5-card diagnostic summary strip highlighting live latency, compliance SLA, roundtrips, and probe timing
 */
export default function TargetMetricsStrip({
  target,
  avgLatency = 0,
  minLatency = 0,
  maxLatency = 0,
  uptimeData = null,
  isLoadingUptime = false
}) {
  const uptimeNum = uptimeData?.uptimePercent !== null && uptimeData?.uptimePercent !== undefined 
    ? Number(uptimeData.uptimePercent) 
    : parseFloat(target?.uptime_percentage);

  const uptimeColor = isNaN(uptimeNum) || uptimeNum === null
    ? 'var(--text-muted)'
    : uptimeNum >= 99
      ? 'var(--status-online)'
      : uptimeNum >= 95
        ? 'var(--status-warning)'
        : 'var(--status-critical)';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {/* 1. Current Latency */}
      <div className="telemetry-card p-3.5">
        <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
          Current Latency
        </span>
        <div className="text-2xl font-bold font-mono text-[var(--text-primary)] mt-1">
          {target.latency !== null && target.latency !== undefined ? `${target.latency} ms` : '—'}
        </div>
        <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
          Probe response time
        </span>
      </div>

      {/* 2. Uptime SLA */}
      <div className="telemetry-card p-3.5">
        <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
          Uptime SLA
        </span>
        <div className="text-2xl font-bold font-mono mt-1" style={{ color: uptimeColor }}>
          {isLoadingUptime ? '...' : (uptimeData?.uptimePercentage || target.uptime_percentage || '—')}
        </div>
        <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block truncate">
          {isLoadingUptime 
            ? 'Calculating SLA...' 
            : uptimeData 
              ? `${uptimeData.successfulChecks} / ${uptimeData.totalEligibleChecks} passing` 
              : 'Historical SLA compliance'}
        </span>
      </div>

      {/* 3. Avg Probe Roundtrip */}
      <div className="telemetry-card p-3.5">
        <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
          Avg Probe Roundtrip
        </span>
        <div className="text-2xl font-bold font-mono text-[var(--text-primary)] mt-1">
          {avgLatency} ms
        </div>
        <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
          Min: {minLatency}ms / Max: {maxLatency}ms
        </span>
      </div>

      {/* 4. Probe Frequency */}
      <div className="telemetry-card p-3.5">
        <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
          Probe Frequency
        </span>
        <div className="text-2xl font-bold font-mono text-[var(--text-primary)] mt-1">
          {target.check_interval_seconds}s
        </div>
        <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
          Timeout: {target.timeout_seconds}s
        </span>
      </div>

      {/* 5. Last Checked */}
      <div className="telemetry-card p-3.5">
        <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
          Last Checked
        </span>
        <div className="text-base font-bold font-mono text-[var(--text-primary)] mt-1.5 truncate">
          {target.last_checked_at ? new Date(target.last_checked_at).toLocaleTimeString() : 'Never'}
        </div>
        <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block truncate">
          {target.last_checked_at ? new Date(target.last_checked_at).toLocaleDateString() : 'Awaiting check'}
        </span>
      </div>
    </div>
  );
}
