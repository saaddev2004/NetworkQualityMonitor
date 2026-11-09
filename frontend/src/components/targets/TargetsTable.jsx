import React from 'react';
import { Globe, Server, Cpu, Play, Power, Edit3, Trash2, RotateCw, AlertCircle } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import Sparkline from '../common/Sparkline';

/**
 * TargetsTable component
 * Renders inventory table with probe metrics, uptime conformance, sparklines, loading states, and row actions
 */
export default function TargetsTable({
  targets = [],
  isLoading = false,
  error = null,
  onRetry = null,
  checkingId = null,
  deletingId = null,
  togglingId = null,
  onRowClick,
  onManualCheck,
  onToggle,
  onEdit,
  onDelete
}) {
  return (
    <div className="telemetry-card">
      <div className="table-container">
        <table className="telemetry-table">
          <thead>
            <tr>
              <th>Target</th>
              <th>Method</th>
              <th>Status</th>
              <th>Latency</th>
              <th>Uptime (24h)</th>
              <th>Trend</th>
              <th>Last Checked</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="8" className="py-14 text-center text-xs text-[var(--text-muted)] font-mono">
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <RotateCw className="w-5 h-5 animate-spin text-[var(--brand-primary)]" />
                    <span>Connecting to NetPulse telemetry engine & fetching monitored targets...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="8" className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto text-xs">
                    <div className="flex items-center gap-2 text-[var(--status-critical)] font-semibold">
                      <AlertCircle className="w-4 h-4" />
                      <span>Target Synchronization Failed</span>
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
                        <span>Retry Fetching Targets</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : targets.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-12 text-center text-xs text-[var(--text-muted)]">
                  No monitored targets match your current search and filter criteria.
                </td>
              </tr>
            ) : (
              targets.map((target) => {
                const isChecking = checkingId === target.id;
                const uptimeNum = parseFloat(target.uptime_percentage);
                const uptimeColor = isNaN(uptimeNum)
                  ? 'var(--text-muted)'
                  : uptimeNum >= 99
                    ? 'var(--status-online)'
                    : uptimeNum >= 95
                      ? 'var(--status-warning)'
                      : 'var(--status-critical)';

                return (
                  <tr
                    key={target.id}
                    className="clickable-row"
                    onClick={() => onRowClick(target.id)}
                  >
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="p-1 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                          {target.target_type === 'website' && <Globe className="w-3.5 h-3.5" />}
                          {target.target_type === 'http_service' && <Server className="w-3.5 h-3.5" />}
                          {target.target_type === 'host' && <Cpu className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="font-semibold text-[var(--text-primary)] hover:text-[var(--brand-primary)] transition">
                            {target.name}
                          </div>
                          <div className="font-mono text-[11px] text-[var(--text-muted)] truncate max-w-[240px]">
                            {target.address}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                        {target.check_method}
                      </span>
                    </td>

                    <td>
                      <StatusBadge status={target.current_status} isEnabled={target.is_enabled} />
                    </td>

                    <td>
                      {target.latency !== null && target.latency !== undefined ? (
                        <div className="font-mono text-xs font-semibold text-[var(--text-primary)]">
                          {target.latency} ms
                        </div>
                      ) : (
                        <span className="font-mono text-xs text-[var(--text-muted)]">—</span>
                      )}
                    </td>

                    <td>
                      <span className="font-mono font-medium text-xs" style={{ color: uptimeColor }}>
                        {target.uptime_percentage || '—'}
                      </span>
                    </td>

                    <td>
                      <Sparkline data={target.history_sparkline} status={target.current_status} width={80} height={20} />
                    </td>

                    <td>
                      <span className="font-mono text-[11px] text-[var(--text-muted)]">
                        {target.last_checked_at 
                          ? new Date(target.last_checked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                          : 'Never'}
                      </span>
                    </td>

                    <td className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {/* Probe Button */}
                        <button
                          onClick={(e) => onManualCheck(e, target)}
                          disabled={isChecking || !target.is_enabled}
                          className="btn-telemetry btn-icon btn-secondary"
                          title="Trigger immediate probe"
                          aria-label="Probe target"
                        >
                          <Play className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-[var(--brand-primary)]' : ''}`} />
                        </button>

                        {/* Pause / Resume Button */}
                        <button
                          onClick={(e) => onToggle(e, target)}
                          disabled={togglingId === target.id}
                          className={`btn-telemetry btn-icon btn-secondary ${!target.is_enabled ? 'text-[var(--status-warning)]' : ''}`}
                          title={target.is_enabled ? 'Pause monitoring' : 'Resume monitoring'}
                          aria-label={target.is_enabled ? 'Pause' : 'Resume'}
                        >
                          <Power className={`w-3.5 h-3.5 ${togglingId === target.id ? 'animate-spin text-[var(--brand-primary)]' : ''}`} />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={(e) => onEdit(e, target)}
                          className="btn-telemetry btn-icon btn-secondary"
                          title="Configure target settings"
                          aria-label="Edit target"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={(e) => onDelete(e, target)}
                          disabled={deletingId === target.id}
                          className="btn-telemetry btn-icon btn-danger"
                          title="Delete monitored target"
                          aria-label="Delete target"
                        >
                          <Trash2 className={`w-3.5 h-3.5 ${deletingId === target.id ? 'opacity-50 animate-pulse' : ''}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
