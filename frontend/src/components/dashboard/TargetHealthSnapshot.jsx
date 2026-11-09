import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, ArrowRight } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import Sparkline from '../common/Sparkline';

/**
 * TargetHealthSnapshot component
 * Displays a summarized inventory table of monitored endpoints on the overview dashboard
 */
export default function TargetHealthSnapshot({ targets = [] }) {
  const navigate = useNavigate();
  const total = targets.length;

  return (
    <div className="lg:col-span-2 telemetry-card flex flex-col">
      <div className="telemetry-card-header">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-[var(--brand-primary)]" />
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Target Health
          </h2>
        </div>
        <button
          onClick={() => navigate('/targets')}
          className="text-xs font-medium text-[var(--brand-primary)] hover:underline flex items-center gap-1"
        >
          View All {total} Targets <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="table-container flex-1">
        <table className="telemetry-table">
          <thead>
            <tr>
              <th>Target</th>
              <th>Method</th>
              <th>Status</th>
              <th>Latency</th>
              <th>Uptime</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {targets.slice(0, 6).map((target) => {
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
                  onClick={() => navigate(`/targets/${target.id}`)}
                >
                  <td>
                    <div className="font-semibold text-[var(--text-primary)]">{target.name}</div>
                    <div className="font-mono text-[11px] text-[var(--text-muted)] truncate max-w-[220px]">
                      {target.address}
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
                      <span className="font-mono font-medium text-[var(--text-primary)]">
                        {target.latency} ms
                      </span>
                    ) : (
                      <span className="font-mono text-[var(--text-muted)]">—</span>
                    )}
                  </td>
                  <td>
                    <span className="font-mono font-medium" style={{ color: uptimeColor }}>
                      {target.uptime_percentage || '—'}
                    </span>
                  </td>
                  <td>
                    <Sparkline data={target.history_sparkline} status={target.current_status} width={75} height={20} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
