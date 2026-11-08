import React from 'react';

/**
 * Reusable StatusBadge component
 * Displays online, warning, critical, offline, or disabled status indicator pills
 */
export default function StatusBadge({ status, isEnabled = true }) {
  if (isEnabled === false || status === 'disabled') {
    return (
      <span className="status-badge status-disabled">
        <span className="status-dot" />
        <span>Disabled</span>
      </span>
    );
  }

  const s = (status || 'unknown').toLowerCase();
  const labels = {
    online: 'Online',
    warning: 'Warning',
    critical: 'Critical',
    offline: 'Offline',
    disabled: 'Disabled',
    unknown: 'Unknown'
  };

  return (
    <span className={`status-badge status-${s}`}>
      <span className="status-dot" />
      <span>{labels[s] || s}</span>
    </span>
  );
}
