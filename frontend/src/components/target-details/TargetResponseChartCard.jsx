import React from 'react';
import ResponseChart from '../ResponseChart';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

/**
 * TargetResponseChartCard component
 * Displays full target response curve with warning and critical SLA latency threshold lines
 * Supports asynchronous loading, retryable errors, and empty collection states.
 */
export default function TargetResponseChartCard({
  target,
  timeSeries = [],
  chartRange = '24h',
  onRangeChange,
  isLoading = false,
  error = null,
  onRetry = null
}) {
  const ranges = ['1h', '6h', '12h', '24h', '7d'];

  return (
    <div className="telemetry-card p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)] mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Response Time & SLA Latency History
            </h2>
            {isLoading && (
              <span className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] font-mono">
                <Loader2 className="w-3 h-3 animate-spin text-[var(--brand-primary)]" />
                <span>Loading...</span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
            Warning threshold ({target.warning_threshold_ms}ms) and Critical threshold ({target.critical_threshold_ms}ms)
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => onRangeChange(r)}
              disabled={isLoading}
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

      <div className="w-full overflow-hidden min-h-[210px] flex items-center justify-center">
        {isLoading && timeSeries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-[var(--text-muted)]">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--brand-primary)] mb-2" />
            <span className="text-xs font-mono">Fetching telemetry curve...</span>
          </div>
        ) : error && timeSeries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="w-6 h-6 text-[var(--status-critical)] mb-2" />
            <span className="text-xs font-semibold text-[var(--text-primary)] mb-1">Failed to load latency history</span>
            <span className="text-[11px] text-[var(--text-muted)] max-w-sm mb-3">{error}</span>
            {onRetry && (
              <button
                onClick={onRetry}
                className="btn-telemetry btn-secondary text-xs inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            )}
          </div>
        ) : timeSeries.length < 2 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <span className="text-xs text-[var(--text-muted)] font-mono">
              Awaiting telemetry data collection for {target.name} ({chartRange} window)...
            </span>
            <span className="text-[11px] text-[var(--text-muted)] mt-1">
              Active probe cycles will populate the latency curve automatically.
            </span>
          </div>
        ) : (
          <div className="w-full">
            <ResponseChart points={timeSeries} target={target} height={210} />
          </div>
        )}
      </div>
    </div>
  );
}
