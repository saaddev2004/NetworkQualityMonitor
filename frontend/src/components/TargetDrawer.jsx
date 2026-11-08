import React, { useState, useEffect } from 'react';
import { X, Server, Globe, Cpu, Check, AlertCircle } from 'lucide-react';

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
      newErrors.critical_threshold_ms = 'Critical threshold must be strictly higher than warning threshold';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      ...(target ? { id: target.id } : {}),
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
            {/* Group 1: Basic Information */}
            <div>
              <div className="text-[11px] font-semibold tracking-wider text-[var(--text-muted)] uppercase mb-3">
                1. Target Identity
              </div>
              
              <div className="form-group">
                <label className="form-label">Target Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Production Payment Gateway"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                />
                {errors.name && (
                  <span className="text-[11px] text-[var(--status-critical)] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.name}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label">Target Category</label>
                  <select
                    value={formData.target_type}
                    onChange={(e) => setFormData({ ...formData, target_type: e.target.value })}
                    className="form-input"
                  >
                    <option value="website">Public Website</option>
                    <option value="http_service">HTTP Microservice</option>
                    <option value="host">Server Host / Node</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Check Method</label>
                  <select
                    value={formData.check_method}
                    onChange={(e) => {
                      const method = e.target.value;
                      setFormData({
                        ...formData,
                        check_method: method,
                        address: method === 'icmp' && formData.address.startsWith('http') ? '10.0.0.1' : formData.address
                      });
                    }}
                    className="form-input"
                  >
                    <option value="http">HTTP / HTTPS</option>
                    <option value="icmp">ICMP Ping</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Endpoint Address / Host *</label>
                <input
                  type="text"
                  placeholder={formData.check_method === 'http' ? 'https://api.domain.com/health' : '10.0.0.1'}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="form-input font-mono text-xs"
                />
                {errors.address && (
                  <span className="text-[11px] text-[var(--status-critical)] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.address}
                  </span>
                )}
                <span className="form-hint">
                  {formData.check_method === 'http' ? 'Valid HTTP/HTTPS endpoint probed periodically' : 'IP address or hostname reachable by ping'}
                </span>
              </div>
            </div>

            {/* Group 2: Monitoring Schedule */}
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
                    onChange={(e) => setFormData({ ...formData, check_interval_seconds: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, timeout_seconds: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, is_enabled: e.target.checked })}
                  className="rounded border-[var(--border-subtle)] text-[var(--brand-primary)]"
                />
                <label htmlFor="target-enabled-cb" className="text-xs text-[var(--text-primary)] cursor-pointer select-none">
                  Enable active telemetry probe monitoring
                </label>
              </div>
            </div>

            {/* Group 3: Latency Alert Thresholds */}
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
                    onChange={(e) => setFormData({ ...formData, warning_threshold_ms: e.target.value })}
                    className="form-input font-mono text-[var(--status-warning)]"
                  />
                  <span className="form-hint">Triggers Warning event</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Critical (ms)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.critical_threshold_ms}
                    onChange={(e) => setFormData({ ...formData, critical_threshold_ms: e.target.value })}
                    className="form-input font-mono text-[var(--status-critical)]"
                  />
                  <span className="form-hint">Triggers Critical incident</span>
                </div>
              </div>

              {errors.critical_threshold_ms && (
                <span className="text-[11px] text-[var(--status-critical)] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.critical_threshold_ms}
                </span>
              )}
            </div>
          </div>

          {/* Actions Bar */}
          <div className="pt-6 border-t border-[var(--border-subtle)] flex items-center justify-end gap-3 mt-6">
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
              <span>{target ? 'Save Target' : 'Create Target'}</span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
