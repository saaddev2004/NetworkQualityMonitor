import React from 'react';
import { X, AlertTriangle, AlertCircle, Info, Server, Clock, CheckCircle2 } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function EventDetailDrawer({ isOpen, onClose, event }) {
  if (!isOpen || !event) return null;

  const isResolved = !!event.is_resolved;
  const isCritical = event.severity === 'critical';
  const isWarning = event.severity === 'warning';

  const formatTimestamp = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getDuration = () => {
    const start = new Date(event.occurred_at).getTime();
    const end = event.resolved_at ? new Date(event.resolved_at).getTime() : Date.now();
    const diffSec = Math.max(1, Math.round((end - start) / 1000));
    if (diffSec < 60) return `${diffSec} seconds`;
    if (diffSec < 3600) return `${Math.round(diffSec / 60)} minutes`;
    return `${(diffSec / 3600).toFixed(1)} hours`;
  };

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className={`telemetry-drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded ${
              isCritical ? 'bg-rose-500/10 text-[var(--status-critical)]' :
              isWarning ? 'bg-amber-500/10 text-[var(--status-warning)]' :
              'bg-emerald-500/10 text-[var(--status-online)]'
            }`}>
              {isCritical ? <AlertCircle className="w-4 h-4" /> :
               isWarning ? <AlertTriangle className="w-4 h-4" /> :
               <Info className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">
                Incident Diagnostics #{event.id}
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] font-mono uppercase">
                {event.event_type}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-telemetry btn-icon btn-secondary"
            aria-label="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="drawer-body space-y-5">
          {/* Status Banner */}
          <div className="p-3 rounded-lg border flex items-center justify-between" style={{
            backgroundColor: isResolved ? 'var(--status-online-bg)' : isCritical ? 'var(--status-critical-bg)' : 'var(--status-warning-bg)',
            borderColor: isResolved ? 'var(--status-online-border)' : isCritical ? 'var(--status-critical-border)' : 'var(--status-warning-border)'
          }}>
            <div className="flex items-center gap-2">
              <span className="status-dot" style={{
                backgroundColor: isResolved ? 'var(--status-online)' : isCritical ? 'var(--status-critical)' : 'var(--status-warning)'
              }} />
              <span className="text-xs font-semibold" style={{
                color: isResolved ? 'var(--status-online)' : isCritical ? 'var(--status-critical)' : 'var(--status-warning)'
              }}>
                {isResolved ? 'INCIDENT RESOLVED' : 'ACTIVE UNRESOLVED ALERT'}
              </span>
            </div>
            <span className="text-[11px] font-mono font-medium" style={{
              color: isResolved ? 'var(--status-online)' : isCritical ? 'var(--status-critical)' : 'var(--status-warning)'
            }}>
              Duration: {getDuration()}
            </span>
          </div>

          {/* Incident Description */}
          <div className="telemetry-card p-4">
            <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
              Incident Diagnostics Description
            </span>
            <p className="text-sm text-[var(--text-primary)] font-medium leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Target Details */}
          <div className="telemetry-card p-4">
            <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-3">
              Affected Endpoint
            </span>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)]">Target Name</span>
                <span className="font-semibold text-[var(--text-primary)]">{event.target_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)]">Address</span>
                <span className="font-mono text-[var(--text-secondary)]">{event.target_address}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)]">Target Probe ID</span>
                <span className="font-mono text-[var(--text-secondary)]">#{event.target_id}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="telemetry-card p-4">
            <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-3">
              Event Timeline
            </span>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <Clock className="w-3.5 h-3.5 text-[var(--text-muted)] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold text-[var(--text-primary)]">Incident Triggered</div>
                  <div className="font-mono text-[11px] text-[var(--text-muted)] mt-0.5">
                    {formatTimestamp(event.occurred_at)}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                  isResolved ? 'text-[var(--status-online)]' : 'text-[var(--text-muted)]'
                }`} />
                <div className="flex-1">
                  <div className="font-semibold text-[var(--text-primary)]">
                    {isResolved ? 'Automated Recovery Recorded' : 'Awaiting Resolution'}
                  </div>
                  <div className="font-mono text-[11px] text-[var(--text-muted)] mt-0.5">
                    {isResolved ? formatTimestamp(event.resolved_at) : 'Active probe cycles currently failing'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
