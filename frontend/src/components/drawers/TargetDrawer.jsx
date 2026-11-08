import React, { useState, useEffect } from 'react';
import { X, Server, Globe, Cpu, Check } from 'lucide-react';
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
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
              className="btn-telemetry btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-telemetry btn-primary"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{target ? 'Save Changes' : 'Create Monitored Target'}</span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
