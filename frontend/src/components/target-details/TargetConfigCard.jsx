import React, { useState, useEffect } from 'react';
import { Layers, Edit3, Check, X, AlertCircle } from 'lucide-react';

/**
 * TargetConfigCard component
 * Displays detailed probe specifications, intervals, latency thresholds, and
 * provides an inline editing form for SLA Warning and Critical thresholds.
 */
export default function TargetConfigCard({
  target,
  onConfigure,
  onUpdateTarget,
  showToast,
  isEditing: controlledIsEditing,
  setIsEditing: controlledSetIsEditing
}) {
  const [internalIsEditing, setInternalIsEditing] = useState(false);
  const isEditing = controlledIsEditing !== undefined ? controlledIsEditing : internalIsEditing;
  const setIsEditing = controlledSetIsEditing !== undefined ? controlledSetIsEditing : setInternalIsEditing;

  const [warningThreshold, setWarningThreshold] = useState(target?.warning_threshold_ms || 300);
  const [criticalThreshold, setCriticalThreshold] = useState(target?.critical_threshold_ms || 800);
  const [validationError, setValidationError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Synchronize local form inputs when target prop changes or when opening edit mode
  useEffect(() => {
    if (target) {
      setWarningThreshold(target.warning_threshold_ms || 300);
      setCriticalThreshold(target.critical_threshold_ms || 800);
      setValidationError(null);
    }
  }, [target, isEditing]);

  const handleValidate = (warn, crit) => {
    const w = Number(warn);
    const c = Number(crit);

    if (isNaN(w) || w <= 0) {
      return 'Warning threshold must be a positive number greater than 0 ms.';
    }
    if (isNaN(c) || c <= 0) {
      return 'Critical threshold must be a positive number greater than 0 ms.';
    }
    if (c <= w) {
      return 'Critical threshold must be strictly greater than Warning threshold.';
    }
    return null;
  };

  const handleWarningChange = (e) => {
    const val = e.target.value;
    setWarningThreshold(val);
    setValidationError(handleValidate(val, criticalThreshold));
  };

  const handleCriticalChange = (e) => {
    const val = e.target.value;
    setCriticalThreshold(val);
    setValidationError(handleValidate(warningThreshold, val));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    const err = handleValidate(warningThreshold, criticalThreshold);
    if (err) {
      setValidationError(err);
      return;
    }

    try {
      setIsSaving(true);
      setValidationError(null);

      if (onUpdateTarget) {
        await onUpdateTarget({
          ...target,
          warning_threshold_ms: Number(warningThreshold),
          critical_threshold_ms: Number(criticalThreshold)
        });
      }

      if (showToast) {
        showToast(`Alert thresholds updated for ${target.name}`);
      }

      setIsEditing(false);
    } catch (saveErr) {
      console.error('Failed to update thresholds:', saveErr);
      setValidationError(saveErr.message || 'Failed to save updated thresholds. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setWarningThreshold(target?.warning_threshold_ms || 300);
    setCriticalThreshold(target?.critical_threshold_ms || 800);
    setValidationError(null);
    setIsEditing(false);
  };

  return (
    <div className="telemetry-card p-4">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-3">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <Layers className="w-4 h-4 text-[var(--brand-primary)]" />
          <span>Monitoring Configuration</span>
        </h2>
        {isEditing && (
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[var(--brand-subtle)] text-[var(--brand-primary)] font-bold">
            Editing Thresholds
          </span>
        )}
      </div>

      {isEditing ? (
        /* Inline Threshold Editing Form */
        <form onSubmit={handleSave} className="space-y-4">
          <div className="p-2.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
            Configure SLA response-time boundaries to trigger incident warnings and critical alerts.
          </div>

          {validationError && (
            <div className="p-2.5 rounded bg-[var(--status-critical-bg)] border border-[var(--status-critical-border)] text-[var(--status-critical)] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div>
            <label 
              htmlFor="input-warning-threshold"
              className="text-xs font-semibold text-[var(--text-primary)] block mb-1"
            >
              Warning Threshold (ms)
            </label>
            <div className="relative">
              <input
                id="input-warning-threshold"
                type="number"
                min="1"
                max="60000"
                step="1"
                value={warningThreshold}
                onChange={handleWarningChange}
                disabled={isSaving}
                className="telemetry-input font-mono w-full"
                placeholder="e.g. 300"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] font-mono">
                ms
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">
              Response times above this value trigger a <strong>Warning</strong> status.
            </p>
          </div>

          <div>
            <label 
              htmlFor="input-critical-threshold"
              className="text-xs font-semibold text-[var(--text-primary)] block mb-1"
            >
              Critical Threshold (ms)
            </label>
            <div className="relative">
              <input
                id="input-critical-threshold"
                type="number"
                min="1"
                max="60000"
                step="1"
                value={criticalThreshold}
                onChange={handleCriticalChange}
                disabled={isSaving}
                className="telemetry-input font-mono w-full"
                placeholder="e.g. 800"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] font-mono">
                ms
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">
              Response times above this value trigger a <strong>Critical</strong> incident. Must exceed warning threshold.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="submit"
              disabled={isSaving || !!validationError}
              className="btn-telemetry btn-primary flex-1 justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Updating...' : 'Save Changes'}</span>
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="btn-telemetry btn-secondary flex-1 justify-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          </div>
        </form>
      ) : (
        /* Read-Only Configuration Parameters in Exact Required Order */
        <div>
          <div className="space-y-3 text-xs">
            {/* 1. Target ID */}
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Target ID</span>
              <span className="font-mono text-[var(--text-secondary)]">#{target.id}</span>
            </div>

            {/* 2. Check Protocol */}
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Check Protocol</span>
              <span className="font-mono uppercase font-semibold text-[var(--text-primary)]">{target.check_method}</span>
            </div>

            {/* 3. Polling Interval */}
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Polling Interval</span>
              <span className="font-mono text-[var(--text-primary)]">{target.check_interval_seconds} seconds</span>
            </div>

            {/* 4. Request Timeout */}
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Request Timeout</span>
              <span className="font-mono text-[var(--text-primary)]">{target.timeout_seconds} seconds</span>
            </div>

            {/* 5. Warning Threshold */}
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Warning Threshold</span>
              <span className="font-mono text-[var(--status-warning)] font-semibold">{target.warning_threshold_ms} ms</span>
            </div>

            {/* 6. Critical Threshold */}
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Critical Threshold</span>
              <span className="font-mono text-[var(--status-critical)] font-semibold">{target.critical_threshold_ms} ms</span>
            </div>

            {/* 7. Active Telemetry */}
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Active Telemetry</span>
              <span className={`font-mono text-xs font-semibold ${target.is_enabled ? 'text-[var(--status-online)]' : 'text-[var(--status-disabled)]'}`}>
                {target.is_enabled ? 'ENABLED' : 'PAUSED'}
              </span>
            </div>

            {/* 8. Provisioned Date */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
              <span className="text-[var(--text-muted)]">Provisioned Date</span>
              <span className="font-mono text-[11px] text-[var(--text-muted)]">
                {target.created_at ? new Date(target.created_at).toLocaleDateString() : '—'}
              </span>
            </div>
          </div>

          {/* Buttons immediately following Provisioned Date */}
          <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] space-y-2">
            {/* 9. Modify Alert Threshold button */}
            <button
              onClick={() => setIsEditing(true)}
              className="btn-telemetry btn-primary w-full justify-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Modify Alert Threshold</span>
            </button>

            {/* 10. Edit Target button */}
            {onConfigure && (
              <button
                onClick={onConfigure}
                className="btn-telemetry btn-secondary w-full justify-center text-xs"
              >
                <span>Edit Target</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
