import React from 'react';
import { ArrowLeft, Globe, Server, Cpu, Play, Edit3 } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

/**
 * TargetDetailsHeader component
 * Header navigation bar providing breadcrumb return, endpoint identity, and probe controls
 */
export default function TargetDetailsHeader({
  target,
  isChecking = false,
  onBack,
  onManualCheck,
  onConfigure,
  onModifyThresholds
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:items-center justify-between gap-4 pb-1">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="btn-telemetry btn-icon btn-secondary"
          title="Return to Targets Inventory"
          aria-label="Back to Targets"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              {target.name}
            </h1>
            <StatusBadge status={target.current_status} isEnabled={target.is_enabled} />
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs">
            <span className="font-mono text-[var(--text-muted)] flex items-center gap-1">
              {target.target_type === 'website' && <Globe className="w-3 h-3" />}
              {target.target_type === 'http_service' && <Server className="w-3 h-3" />}
              {target.target_type === 'host' && <Cpu className="w-3 h-3" />}
              {target.address}
            </span>
            <span className="text-[var(--border-card-hover)]">•</span>
            <span className="text-[var(--text-muted)] font-mono uppercase text-[10px] px-1.5 py-0.2 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
              {target.check_method}
            </span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onManualCheck}
          disabled={isChecking || !target.is_enabled}
          className="btn-telemetry btn-secondary"
        >
          <Play className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-[var(--brand-primary)]' : ''}`} />
          <span>{isChecking ? 'Probing...' : 'Check Now'}</span>
        </button>

        <button
          onClick={onModifyThresholds}
          className="btn-telemetry btn-primary"
          title="Jump to Monitoring Configuration & Thresholds"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Modify Alert Threshold</span>
        </button>
      </div>
    </div>
  );
}
