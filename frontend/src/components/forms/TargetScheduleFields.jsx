import React from 'react';

/**
 * TargetScheduleFields component
 * Form section for check interval, request timeout, and active status checkbox
 */
export default function TargetScheduleFields({
  formData,
  onChange
}) {
  return (
    <div className="pt-3 border-t border-[var(--border-subtle)]">
      <div className="text-[11px] font-semibold tracking-wider text-[var(--text-muted)] uppercase mb-3">
        2. Probe Scheduling
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="form-group">
          <label className="form-label">Check Interval (sec)</label>
          <input
            type="number"
            min="5"
            max="86400"
            value={formData.check_interval_seconds}
            onChange={(e) => onChange({ check_interval_seconds: e.target.value })}
            className="form-input font-mono"
          />
          <span className="form-hint">Frequency of health probes</span>
        </div>

        <div className="form-group">
          <label className="form-label">Timeout (sec)</label>
          <input
            type="number"
            min="1"
            max="60"
            value={formData.timeout_seconds}
            onChange={(e) => onChange({ timeout_seconds: e.target.value })}
            className="form-input font-mono"
          />
          <span className="form-hint">Max wait before failing</span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id="target-enabled-cb"
          checked={formData.is_enabled}
          onChange={(e) => onChange({ is_enabled: e.target.checked })}
          className="rounded border-[var(--border-subtle)] text-[var(--brand-primary)]"
        />
        <label htmlFor="target-enabled-cb" className="text-xs text-[var(--text-primary)] cursor-pointer select-none">
          Enable active telemetry probe monitoring
        </label>
      </div>
    </div>
  );
}
