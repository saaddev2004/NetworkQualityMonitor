import React from 'react';
import { Globe, Server, Cpu, Play, Power, Edit3, Trash2 } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import Sparkline from '../common/Sparkline';

/**
 * TargetsTable component
 * Renders inventory table with probe metrics, uptime conformance, sparklines, and row actions
 */
export default function TargetsTable({
  targets = [],
  checkingId = null,
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
            {targets.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-12 text-center text-xs text-[var(--text-muted)]">
                  No monitored targets match your current search and filter criteria.
                </td>
              </tr>
            ) : (
              targets.map((target) => {
                const isChecking = checkingId === target.id;

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
                      <span className="font-mono font-medium text-xs" style={{
                        color: parseFloat(target.uptime_percentage) >= 99 ? 'var(--status-online)' :
                               parseFloat(target.uptime_percentage) >= 95 ? 'var(--status-warning)' : 'var(--status-critical)'
                      }}>
                        {target.uptime_percentage}
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
                          className={`btn-telemetry btn-icon btn-secondary ${!target.is_enabled ? 'text-[var(--status-warning)]' : ''}`}
                          title={target.is_enabled ? 'Pause monitoring' : 'Resume monitoring'}
                          aria-label={target.is_enabled ? 'Pause' : 'Resume'}
                        >
                          <Power className="w-3.5 h-3.5" />
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
                          className="btn-telemetry btn-icon btn-danger"
                          title="Delete monitored target"
                          aria-label="Delete target"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
