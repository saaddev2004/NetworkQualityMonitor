import React from 'react';
import ResponseChart from '../ResponseChart';

/**
 * ResponseTimeCard component
 * Displays response time history chart, time range filters, and latency statistics strip
 */
export default function ResponseTimeCard({
  points = [],
  avgLatency = 0,
  timeRange = '24h',
  onTimeRangeChange
}) {
  const ranges = ['1h', '6h', '12h', '24h', '7d'];

  return (
    <div className="lg:col-span-2 telemetry-card flex flex-col">
      <div className="telemetry-card-header flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Response Time History
          </h2>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
            Historical round-trip latency across active probe cycles
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {ranges.map((range) => (
            <button
              key={range}
              onClick={() => onTimeRangeChange(range)}
              className={`text-xs px-2.5 py-0.5 rounded transition ${
                timeRange === range
                  ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        {/* Latency Summary Stats */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-3 text-xs">
          <div>
            <span className="text-[var(--text-muted)] block text-[10px] uppercase font-semibold">Average Latency</span>
            <span className="font-mono font-bold text-sm text-[var(--text-primary)]">{avgLatency} ms</span>
          </div>
          <div className="h-6 w-px bg-[var(--border-subtle)]" />
          <div>
            <span className="text-[var(--text-muted)] block text-[10px] uppercase font-semibold">Min Latency</span>
            <span className="font-mono font-bold text-sm text-[var(--status-online)]">24 ms</span>
          </div>
          <div className="h-6 w-px bg-[var(--border-subtle)]" />
          <div>
            <span className="text-[var(--text-muted)] block text-[10px] uppercase font-semibold">Max Peak</span>
            <span className="font-mono font-bold text-sm text-[var(--status-warning)]">180 ms</span>
          </div>
          <div className="h-6 w-px bg-[var(--border-subtle)] hidden sm:block" />
          <div className="hidden sm:block">
            <span className="text-[var(--text-muted)] block text-[10px] uppercase font-semibold">Baseline SLA</span>
            <span className="font-mono font-bold text-sm text-[var(--text-secondary)]">&lt; 300 ms</span>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="w-full overflow-hidden">
          <ResponseChart points={points} height={190} />
        </div>
      </div>
    </div>
  );
}
