import React from 'react';
import { Clock } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

/**
 * RecentProbesTable component
 * Renders execution telemetry audit log with status codes, latencies, and diagnostic messages
 */
export default function RecentProbesTable({ checkLogs = [] }) {
  return (
    <div className="lg:col-span-2 telemetry-card flex flex-col">
      <div className="telemetry-card-header">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[var(--text-muted)]" />
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Recent Probe Cycles
          </h2>
        </div>
        <span className="text-[11px] text-[var(--text-muted)] font-mono">
          Last 15 Cycles
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
            {checkLogs.map((log) => (
              <tr key={log.id}>
                <td className="font-mono text-xs text-[var(--text-muted)]">
                  {new Date(log.checked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </td>
                <td>
                  <StatusBadge status={log.result_status} />
                </td>
                <td>
                  {log.response_time_ms !== null ? (
                    <span className="font-mono text-xs font-semibold text-[var(--text-primary)]">
                      {log.response_time_ms} ms
                    </span>
                  ) : (
                    <span className="font-mono text-xs text-[var(--text-muted)]">—</span>
                  )}
                </td>
                <td>
                  <span className="font-mono text-xs text-[var(--text-secondary)]">
                    {log.http_status_code ? `HTTP ${log.http_status_code}` : log.is_available ? 'Echo Reply (ICMP)' : 'No Response'}
                  </span>
                </td>
                <td>
                  <span className="text-xs text-[var(--text-muted)] truncate block max-w-[200px]" title={log.error_message || 'Normal probe cycle'}>
                    {log.error_message || 'OK: Response within SLA'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
