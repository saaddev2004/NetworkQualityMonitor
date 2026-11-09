import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, ArrowUpRight, RotateCw } from 'lucide-react';

/**
 * EventsTable component
 * Renders chronological audit log of alerts, state changes, SLA breaches, and recovery events
 */
export default function EventsTable({ 
  events = [], 
  isLoading = false, 
  error = null, 
  onRetry = null, 
  onOpenEvent 
}) {
  const renderSeverityBadge = (severity) => {
    if (severity === 'critical') {
      return (
        <span className="status-badge status-critical">
          <AlertCircle className="w-3 h-3" />
          <span>Critical</span>
        </span>
      );
    }
    if (severity === 'warning') {
      return (
        <span className="status-badge status-warning">
          <AlertTriangle className="w-3 h-3" />
          <span>Warning</span>
        </span>
      );
    }
    return (
      <span className="status-badge status-online">
        <CheckCircle2 className="w-3 h-3" />
        <span>Info</span>
      </span>
    );
  };

  return (
    <div className="telemetry-card">
      <div className="table-container">
        <table className="telemetry-table">
          <thead>
            <tr>
              <th>Severity</th>
              <th>Target</th>
              <th>Event Type</th>
              <th>Description</th>
              <th>Triggered At</th>
              <th>Resolution Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="7" className="py-14 text-center text-xs text-[var(--text-muted)] font-mono">
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <RotateCw className="w-5 h-5 animate-spin text-[var(--brand-primary)]" />
                    <span>Connecting to NetPulse telemetry engine & fetching incident events...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="7" className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto text-xs">
                    <div className="flex items-center gap-2 text-[var(--status-critical)] font-semibold">
                      <AlertCircle className="w-4 h-4" />
                      <span>Incident Events Synchronization Failed</span>
                    </div>
                    <p className="text-[var(--text-muted)] text-[11px] font-mono leading-relaxed">
                      {error}
                    </p>
                    {onRetry && (
                      <button
                        onClick={onRetry}
                        className="btn-telemetry btn-secondary mt-2 inline-flex items-center gap-1.5 text-xs"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Retry Fetching Events</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : events.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-xs text-[var(--text-muted)]">
                  No incident events match your active filters or recorded yet.
                </td>
              </tr>
            ) : (
              events.map((evt) => (
                <tr
                  key={evt.id}
                  className="clickable-row"
                  onClick={() => onOpenEvent(evt)}
                >
                  <td>
                    {renderSeverityBadge(evt.severity)}
                  </td>

                  <td>
                    <div className="font-semibold text-[var(--text-primary)]">
                      {evt.target_name}
                    </div>
                    <div className="font-mono text-[11px] text-[var(--text-muted)] truncate max-w-[180px]">
                      {evt.target_address}
                    </div>
                  </td>

                  <td>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                      {evt.event_type.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="max-w-xs">
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>
                  </td>

                  <td>
                    <span className="text-xs text-[var(--text-muted)] font-mono whitespace-nowrap">
                      {new Date(evt.occurred_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="text-[10px] text-[var(--text-muted)] font-mono">
                      {new Date(evt.occurred_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </div>
                  </td>

                  <td>
                    {evt.is_resolved ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--status-online)]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Resolved</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--status-critical)]">
                        <span className="status-dot" style={{ background: 'var(--status-critical)' }} />
                        <span>Active Alert</span>
                      </span>
                    )}
                  </td>

                  <td className="text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenEvent(evt);
                      }}
                      className="btn-telemetry btn-secondary text-xs inline-flex items-center gap-1"
                    >
                      <span>Diagnostics</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
