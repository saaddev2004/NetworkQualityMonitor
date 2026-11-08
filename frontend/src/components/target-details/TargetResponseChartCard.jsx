import React from 'react';
import ResponseChart from '../ResponseChart';

/**
 * TargetResponseChartCard component
 * Displays full target response curve with warning and critical SLA latency threshold lines
 */
export default function TargetResponseChartCard({
  target,
  timeSeries = [],
  chartRange = '24h',
  onRangeChange
}) {
  const ranges = ['1h', '6h', '12h', '24h', '7d'];

  return (
    <div className="telemetry-card p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)] mb-3">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Response Time & SLA Latency History
          </h2>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
            Warning threshold ({target.warning_threshold_ms}ms) and Critical threshold ({target.critical_threshold_ms}ms)
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => onRangeChange(r)}
              className={`text-xs px-2.5 py-0.5 rounded transition ${
                chartRange === r
                  ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full overflow-hidden">
        <ResponseChart points={timeSeries} target={target} height={210} />
      </div>
    </div>
  );
}
