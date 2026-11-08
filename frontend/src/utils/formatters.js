/**
 * Utility functions for date, time, duration, and telemetry data formatting
 */

/**
 * Formats an ISO date string into a localized short date and time
 */
export function formatTimestamp(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Formats a short time string (HH:MM:SS)
 */
export function formatTimeOnly(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Calculates human-readable duration between two ISO timestamps
 */
export function formatDuration(startIso, endIso) {
  if (!startIso) return '—';
  const start = new Date(startIso).getTime();
  const end = endIso ? new Date(endIso).getTime() : Date.now();
  const diffSec = Math.max(1, Math.round((end - start) / 1000));
  
  if (diffSec < 60) return `${diffSec} seconds`;
  if (diffSec < 3600) return `${Math.round(diffSec / 60)} minutes`;
  return `${(diffSec / 3600).toFixed(1)} hours`;
}

/**
 * Triggers a browser CSV file download from headers and row arrays
 */
export function exportToCSV(filename, headers, rows) {
  const csvContent = 'data:text/csv;charset=utf-8,' + [
    headers.join(','),
    ...rows.map(e => e.join(','))
  ].join('\n');
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
