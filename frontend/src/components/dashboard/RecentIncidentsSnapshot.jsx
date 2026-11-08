import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, ArrowUpRight } from 'lucide-react';

/**
 * RecentIncidentsSnapshot component
 * Displays latest security and SLA breach alerts with interactive detail drawer triggers
 */
export default function RecentIncidentsSnapshot({ events = [], onOpenEvent }) {
  const navigate = useNavigate();

  return (
    <div className="telemetry-card flex flex-col">
      <div className="telemetry-card-header">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[var(--status-warning)]" />
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Recent Incidents
          </h2>
        </div>
        <button
          onClick={() => navigate('/events')}
          className="text-xs font-medium text-[var(--brand-primary)] hover:underline flex items-center gap-1"
        >
          Event Log <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="p-3 flex-1 space-y-2.5 overflow-y-auto max-h-[360px]">
        {events.slice(0, 5).map((evt) => (
          <div
            key={evt.id}
            onClick={() => onOpenEvent(evt)}
            className="p-3 rounded-md bg-[var(--bg-canvas)] border border-[var(--border-subtle)] hover:border-[var(--border-card-hover)] cursor-pointer transition"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="status-dot" style={{
                  background: evt.severity === 'critical' ? 'var(--status-critical)' :
                              evt.severity === 'warning' ? 'var(--status-warning)' : 'var(--status-online)'
                }} />
                <span className="text-xs font-semibold text-[var(--text-primary)] truncate max-w-[170px]">
                  {evt.target_name}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">
                {new Date(evt.occurred_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
              {evt.description}
            </p>
            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-muted)]">
              <span className="uppercase">{evt.event_type}</span>
              <span className="text-[var(--brand-primary)] flex items-center gap-0.5">
                Inspect <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
