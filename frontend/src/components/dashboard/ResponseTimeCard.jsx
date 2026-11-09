import React from 'react';
import { RotateCw, AlertCircle, Database } from 'lucide-react';
import ResponseChart from '../ResponseChart';

/**
 * ResponseTimeCard component
 * Displays response time history chart, time range filters, target selector,
 * real min/avg/max latency statistics strip, and loading/empty/error states.
 */
export default function ResponseTimeCard({
  points = [],
  target = null,
  targets = [],
  selectedTargetId = null,
  onTargetChange,
  avgLatency = null,
  minLatency = null,
  maxLatency = null,
  timeRange = '24h',
  onTimeRangeChange,
  isLoading = false,
  error = null,
  onRetry
}) {
  const ranges = ['1h', '6h', '12h', '24h', '7d'];

  const protocol = target?.check_method ? target.check_method.toUpperCase() : 'PROBE';
  const warnThreshold = target?.warning_threshold_ms || 300;

  const displayStat = (val) => {
    if (isLoading && (val === null || val === undefined)) return '...';
    if (val === null || val === undefined || isNaN(val)) return '—';
    return `${val} ms`;
  };

  return (
    <div className="lg:col-span-2 telemetry-card flex flex-col">
      <div className="telemetry-card-header flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Response Time History
              </h2>
              {target && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--bg-elevated)] text-[var(--brand-primary)] border border-[var(--border-subtle)]">
                  {protocol}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              {target 
                ? `${target.name} (${target.address}) — Historical round-trip latency`
                : 'Historical round-trip latency across active probe cycles'}
            </p>
          </div>

          {/* Target Selector Dropdown */}
          {targets && targets.length > 1 && (
            <div className="sm:ml-2">
              <select
                aria-label="Select target for latency history"
                value={selectedTargetId || (target?.id ?? '')}
                onChange={(e) => onTargetChange && onTargetChange(Number(e.target.value))}
                className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs rounded px-2 py-1 font-mono focus:outline-none focus:border-[var(--brand-primary)]"
              >
                {targets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.check_method?.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Time Range Filter Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {ranges.map((range) => (
            <button
              key={range}
              onClick={() => onTimeRangeChange && onTimeRangeChange(range)}
              disabled={isLoading}
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
            <span className="font-mono font-bold text-sm text-[var(--text-primary)]">
              {displayStat(avgLatency)}
            </span>
          </div>
          <div className="h-6 w-px bg-[var(--border-subtle)]" />
          <div>
            <span className="text-[var(--text-muted)] block text-[10px] uppercase font-semibold">Min Latency</span>
            <span className="font-mono font-bold text-sm text-[var(--status-online)]">
              {displayStat(minLatency)}
            </span>
          </div>
          <div className="h-6 w-px bg-[var(--border-subtle)]" />
          <div>
            <span className="text-[var(--text-muted)] block text-[10px] uppercase font-semibold">Max Peak</span>
            <span className="font-mono font-bold text-sm text-[var(--status-warning)]">
              {displayStat(maxLatency)}
            </span>
          </div>
          <div className="h-6 w-px bg-[var(--border-subtle)] hidden sm:block" />
          <div className="hidden sm:block">
            <span className="text-[var(--text-muted)] block text-[10px] uppercase font-semibold">Warning Threshold</span>
            <span className="font-mono font-bold text-sm text-[var(--text-secondary)]">
              &lt; {warnThreshold} ms
            </span>
          </div>
        </div>

        {/* Chart Body with Loading, Error, Empty and SVG States */}
        <div className="w-full overflow-hidden min-h-[190px] flex items-center justify-center">
          {error && (!points || points.length === 0) ? (
            <div className="flex flex-col items-center justify-center p-6 text-center text-xs">
              <AlertCircle className="w-5 h-5 text-[var(--status-critical)] mb-2" />
              <div className="text-[var(--status-critical)] font-medium mb-1">
                Failed to load response time telemetry
              </div>
              <p className="text-[11px] text-[var(--text-muted)] mb-3 max-w-sm">
                {error}
              </p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  disabled={isLoading}
                  className="btn-telemetry btn-secondary text-xs flex items-center gap-1.5"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Retry Request</span>
                </button>
              )}
            </div>
          ) : isLoading && (!points || points.length === 0) ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-xs text-[var(--text-muted)] font-mono">
              <RotateCw className="w-5 h-5 animate-spin text-[var(--brand-primary)] mb-2" />
              <span>Fetching telemetry curve ({timeRange})...</span>
            </div>
          ) : !points || points.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-xs text-[var(--text-muted)] font-mono">
              <Database className="w-5 h-5 text-[var(--text-muted)] mb-2 opacity-50" />
              <span>No telemetry records logged for {target?.name || 'target'} in the last {timeRange}.</span>
            </div>
          ) : (
            <div className="w-full relative">
              {isLoading && (
                <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-muted)]">
                  <RotateCw className="w-3 h-3 animate-spin text-[var(--brand-primary)]" />
                  <span>Updating...</span>
                </div>
              )}
              <ResponseChart points={points} target={target} height={190} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
