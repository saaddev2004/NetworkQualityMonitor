import React from 'react';
import { Clock, RotateCw, AlertCircle } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

/**
 * RecentProbesTable component
 * Renders execution telemetry audit log with status codes, latencies, and diagnostic messages
 */
export default function RecentProbesTable({ 
  checkLogs = [], 
  isLoading = false, 
  error = null, 
  onRetry = null,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore = null
}) {
  return (
    <div className="lg:col-span-2 telemetry-card flex flex-col">
      <div className="telemetry-card-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[var(--text-muted)]" />
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Recent Probe Cycles
          </h2>
        </div>
        <span className="text-[11px] text-[var(--text-muted)] font-mono">
          {isLoading ? 'Connecting...' : `Showing ${checkLogs.length} Cycles`}
        </span>
      </div>

      <div className="table-container flex-1">
        <table className="telemetry-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Result</th>
              <th>Response Time</th>
              <th>HTTP / Ping Status</th>
              <th>Diagnostics</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-xs text-[var(--text-muted)] font-mono">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RotateCw className="w-5 h-5 animate-spin text-[var(--brand-primary)]" />
                    <span>Loading probe history from NetPulse engine...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="5" className="py-10 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto text-xs">
                    <div className="flex items-center gap-2 text-[var(--status-critical)] font-semibold">
                      <AlertCircle className="w-4 h-4" />
                      <span>Probe History Unavailable</span>
                    </div>
                    <p className="text-[var(--text-muted)] text-[11px] font-mono leading-relaxed">
                      {error}
                    </p>
                    {onRetry && (
                      <button
                        onClick={onRetry}
                        className="btn-telemetry btn-secondary mt-1 inline-flex items-center gap-1.5 text-xs"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Retry</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : checkLogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-xs text-[var(--text-muted)]">
                  No monitoring probe cycles recorded yet for this target.
                </td>
              </tr>
            ) : (
              checkLogs.map((log) => (
                <tr key={log.id}>
                  <td className="font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">
                    <div>
                      {log.checked_at ? new Date(log.checked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)]">
                      {log.checked_at ? new Date(log.checked_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={log.result_status || (log.is_available ? 'online' : 'offline')} />
                  </td>
                  <td>
                    {log.response_time_ms !== null && log.response_time_ms !== undefined ? (
                      <span className="font-mono text-xs font-semibold text-[var(--text-primary)]">
                        {log.response_time_ms} ms
                      </span>
                    ) : (
                      <span className="font-mono text-xs text-[var(--text-muted)]">—</span>
                    )}
                  </td>
                  <td>
                    <span className="font-mono text-xs text-[var(--text-secondary)]">
                      {log.http_status_code 
                        ? `HTTP ${log.http_status_code}` 
                        : log.is_available 
                          ? 'Echo Reply (ICMP)' 
                          : (log.error_type || 'No Response')}
                    </span>
                  </td>
                  <td>
                    <span 
                      className="text-xs text-[var(--text-muted)] truncate block max-w-[200px]" 
                      title={log.error_message || (log.is_available ? 'OK: Response within SLA' : (log.error_type || 'Probe cycle failed'))}
                    >
                      {log.error_message || (log.is_available ? 'OK: Response within SLA' : (log.error_type || 'Failed'))}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {hasMore && onLoadMore && !isLoading && (
        <div className="p-2.5 border-t border-[var(--border-subtle)] text-center">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="btn-telemetry btn-secondary text-xs inline-flex items-center gap-1.5 py-1 px-3"
          >
            {isLoadingMore ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Loading More...</span>
              </>
            ) : (
              <span>Load More Probe Cycles</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
