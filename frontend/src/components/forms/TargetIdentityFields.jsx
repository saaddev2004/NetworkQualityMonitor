import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * TargetIdentityFields component
 * Form section for target name, category, check protocol, and endpoint address
 */
export default function TargetIdentityFields({
  formData,
  errors,
  onChange
}) {
  return (
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
          onChange={(e) => onChange({ name: e.target.value })}
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
            onChange={(e) => onChange({ target_type: e.target.value })}
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
              onChange({
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
          onChange={(e) => onChange({ address: e.target.value })}
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
  );
}
