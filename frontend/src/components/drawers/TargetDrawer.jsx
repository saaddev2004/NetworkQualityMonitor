import React, { useState, useEffect } from 'react';
import { X, Server, Globe, Cpu, Check, AlertCircle } from 'lucide-react';
import TargetIdentityFields from '../forms/TargetIdentityFields';
import TargetScheduleFields from '../forms/TargetScheduleFields';
import TargetThresholdFields from '../forms/TargetThresholdFields';

/**
 * TargetDrawer component
 * Slide-out drawer modal for provisioning and configuring monitored endpoints
 */
export default function TargetDrawer({ isOpen, onClose, target, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    target_type: 'website',
    address: 'https://',
    check_method: 'http',
    check_interval_seconds: 60,
    warning_threshold_ms: 300,
    critical_threshold_ms: 800,
    timeout_seconds: 5,
    is_enabled: true
  });

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (target) {
      setFormData({
        name: target.name || '',
        target_type: target.target_type || 'website',
        address: target.address || 'https://',
        check_method: target.check_method || 'http',
        check_interval_seconds: target.check_interval_seconds || 60,
        warning_threshold_ms: target.warning_threshold_ms || 300,
        critical_threshold_ms: target.critical_threshold_ms || 800,
        timeout_seconds: target.timeout_seconds || 5,
        is_enabled: target.is_enabled !== undefined ? !!target.is_enabled : true
      });
    } else {
      setFormData({
        name: '',
        target_type: 'website',
        address: 'https://',
        check_method: 'http',
        check_interval_seconds: 60,
        warning_threshold_ms: 300,
        critical_threshold_ms: 800,
        timeout_seconds: 5,
        is_enabled: true
      });
    }
    setErrors({});
    setFormError(null);
    setIsSubmitting(false);
  }, [target, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Target name is required';
    if (!formData.address.trim()) newErrors.address = 'Host or URL is required';
    
    if (formData.check_method === 'http' && !formData.address.startsWith('http://') && !formData.address.startsWith('https://')) {
      newErrors.address = 'HTTP targets must begin with http:// or https://';
    }

    if (Number(formData.warning_threshold_ms) <= 0) {
      newErrors.warning_threshold_ms = 'Must be greater than 0';
    }

    if (Number(formData.critical_threshold_ms) <= Number(formData.warning_threshold_ms)) {
      newErrors.critical_threshold_ms = 'Must be greater than Warning threshold';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear field-level error when user modifies that field
    const keys = Object.keys(updates);
    if (keys.some(k => errors[k])) {
      setErrors(prev => {
        const next = { ...prev };
        keys.forEach(k => delete next[k]);
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      setFormError(null);

      await onSave({
        name: formData.name.trim(),
        target_type: formData.target_type,
        address: formData.address.trim(),
        check_method: formData.check_method,
        check_interval_seconds: Number(formData.check_interval_seconds),
        warning_threshold_ms: Number(formData.warning_threshold_ms),
        critical_threshold_ms: Number(formData.critical_threshold_ms),
        timeout_seconds: Number(formData.timeout_seconds),
        is_enabled: formData.is_enabled
      });

      onClose();
    } catch (err) {
      console.error('Target form submit error:', err);
      // Map server validation details if present
      if (err.details && Array.isArray(err.details)) {
        const fieldMap = {
          name: 'name',
          targetType: 'target_type',
          address: 'address',
          checkMethod: 'check_method',
          checkIntervalSeconds: 'check_interval_seconds',
          warningThresholdMs: 'warning_threshold_ms',
          criticalThresholdMs: 'critical_threshold_ms',
          timeoutSeconds: 'timeout_seconds'
        };
        const fieldErrors = {};
        err.details.forEach(issue => {
          const fieldKey = fieldMap[issue.path?.[0]] || issue.path?.[0];
          if (fieldKey) fieldErrors[fieldKey] = issue.message;
        });
        setErrors(prev => ({ ...prev, ...fieldErrors }));
      }
      setFormError(err.message || 'Failed to save target. Please verify inputs and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className={`telemetry-drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-[var(--brand-subtle)] text-[var(--brand-primary)]">
              {formData.target_type === 'website' && <Globe className="w-4 h-4" />}
              {formData.target_type === 'http_service' && <Server className="w-4 h-4" />}
              {formData.target_type === 'host' && <Cpu className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">
                {target ? 'Edit Monitored Target' : 'Provision New Target'}
              </h2>
              <p className="text-[11px] text-[var(--text-muted)]">
                {target ? `Updating target #${target.id}` : 'Configure continuous health probing'}
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

        <form onSubmit={handleSubmit} className="drawer-body flex flex-col justify-between">
          <div className="space-y-5">
            {formError && (
              <div className="p-3 rounded-lg border border-[var(--status-critical-border)] bg-[var(--status-critical-bg)] text-[var(--status-critical)] text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <strong className="font-semibold">{target ? 'Update Failed:' : 'Request Failed:'}</strong> {formError}
                </div>
              </div>
            )}

            <TargetIdentityFields
              formData={formData}
              errors={errors}
              onChange={handleFieldChange}
            />

            <TargetScheduleFields
              formData={formData}
              onChange={handleFieldChange}
            />

            <TargetThresholdFields
              formData={formData}
              errors={errors}
              onChange={handleFieldChange}
            />
          </div>

          {/* Sticky Drawer Footer */}
          <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-sidebar)] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 flex-shrink-0 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-telemetry btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-telemetry btn-primary"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>{target ? 'Saving Changes...' : 'Creating...'}</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{target ? 'Save Changes' : 'Create Monitored Target'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
