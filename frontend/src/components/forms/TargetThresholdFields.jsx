import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * TargetThresholdFields component
 * Form section for warning and critical latency SLA thresholds
 */
export default function TargetThresholdFields({
  formData,
  errors,
  onChange
}) {
  return (
    <div className="pt-3 border-t border-[var(--border-subtle)]">
      <div className="text-[11px] font-semibold tracking-wider text-[var(--text-muted)] uppercase mb-3">
        3. SLA Latency Thresholds
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="form-group">
          <label className="form-label">Warning (ms)</label>
          <input
            type="number"
            min="1"
            value={formData.warning_threshold_ms}
            onChange={(e) => onChange({ warning_threshold_ms: e.target.value })}
            className="form-input font-mono text-[var(--status-warning)]"
          />
          <span className="form-hint">Triggers Warning event</span>
          {errors.warning_threshold_ms && (
            <span className="text-[11px] text-[var(--status-critical)] mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.warning_threshold_ms}
            </span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Critical (ms)</label>
          <input
            type="number"
            min="1"
            value={formData.critical_threshold_ms}
            onChange={(e) => onChange({ critical_threshold_ms: e.target.value })}
            className="form-input font-mono text-[var(--status-critical)]"
          />
          <span className="form-hint">Triggers Critical state</span>
          {errors.critical_threshold_ms && (
            <span className="text-[11px] text-[var(--status-critical)] mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.critical_threshold_ms}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
