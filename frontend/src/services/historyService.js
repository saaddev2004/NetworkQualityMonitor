import api from './api.js';

/**
 * Standard supported time ranges and their millisecond durations
 */
export const TIME_RANGES = {
  '1h': 1 * 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '12h': 12 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000
};

/**
 * Formats an ISO timestamp into a user-friendly local time string
 * 
 * @param {string|Date} timestamp - Raw timestamp
 * @param {string} range - Selected time range key ('1h', '6h', '12h', '24h', '7d')
 * @returns {string} Formatted local time string
 */
export function formatLocalTime(timestamp, range = '24h') {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '—';

  if (range === '7d') {
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Safely normalizes a single raw monitoring history record from the backend API.
 * Guarantees failed probes have null latency, never 0.
 * 
 * @param {Object} raw - Raw database row from API
 * @param {string} range - Time range for local formatting
 * @returns {Object} Normalized record
 */
export function mapHistoryRecord(raw, range = '24h') {
  if (!raw || typeof raw !== 'object') return null;

  const isAvailable = Boolean(raw.is_available);
  // Numeric latency or null if unavailable / failed probe
  const responseTime = isAvailable && raw.response_time_ms !== null && raw.response_time_ms !== undefined
    ? Number(raw.response_time_ms)
    : null;

  const httpStatus = raw.http_status_code !== null && raw.http_status_code !== undefined
    ? Number(raw.http_status_code)
    : null;

  return {
    id: Number(raw.id),
    target_id: Number(raw.target_id),
    checked_at: raw.checked_at || new Date().toISOString(),
    is_available: isAvailable,
    response_time_ms: responseTime,
    latency: responseTime, // Chart compatibility
    http_status_code: httpStatus,
    result_status: raw.result_status || (isAvailable ? 'online' : 'offline'),
    error_type: raw.error_type || null,
    error_message: raw.error_message || null,
    created_at: raw.created_at || raw.checked_at || new Date().toISOString(),
    time: formatLocalTime(raw.checked_at, range),
    timestamp: raw.checked_at,
    protocol: httpStatus !== null ? 'HTTP' : 'ICMP'
  };
}

/**
 * Computes min, max, avg and availability metrics from a series of normalized records.
 * 
 * @param {Array<Object>} records - Array of normalized history records
 * @returns {Object} Calculated summary metrics
 */
export function computeLatencyMetrics(records = []) {
  const validLatencies = records
    .map(r => r.latency)
    .filter(v => typeof v === 'number' && !isNaN(v));

  const totalChecks = records.length;
  const failedChecks = records.filter(r => !r.is_available).length;
  const successfulChecks = totalChecks - failedChecks;

  const avgLatency = validLatencies.length > 0
    ? Math.round(validLatencies.reduce((acc, val) => acc + val, 0) / validLatencies.length)
    : 0;

  const minLatency = validLatencies.length > 0
    ? Math.min(...validLatencies)
    : null;

  const maxLatency = validLatencies.length > 0
    ? Math.max(...validLatencies)
    : null;

  return {
    avgLatency,
    minLatency,
    maxLatency,
    totalChecks,
    successfulChecks,
    failedChecks,
    hasData: totalChecks > 0,
    hasValidLatency: validLatencies.length > 0
  };
}

/**
 * Fetches real historical monitoring probe results for a target from the backend REST API.
 * Automatically paginates through the backend API to guarantee complete time-window coverage.
 * Endpoint: GET /api/v1/targets/:targetId/history
 * 
 * @param {number|string} targetId - ID of target to query
 * @param {Object} [options={}] - Query options
 * @param {string} [options.range='24h'] - Time range key ('1h', '6h', '12h', '24h', '7d')
 * @param {string} [options.from] - Explicit ISO from date (overrides range)
 * @param {string} [options.to] - Optional explicit ISO to date
 * @param {number} [options.maxPages=10] - Safety cap on pages fetched (up to 2000 records)
 * @returns {Promise<Object>} History data including chronologically ordered points and metrics
 */
export async function getMonitoringHistory(targetId, options = {}) {
  if (!targetId) {
    throw new Error('Target ID is required to fetch monitoring history');
  }

  const range = options.range || '24h';
  const durationMs = TIME_RANGES[range] || TIME_RANGES['24h'];
  const pageSize = 200; // Use max supported backend limit per page
  const maxPages = options.maxPages || 10; // Safety cap at 2000 records

  const baseParams = {};
  if (options.from) {
    baseParams.from = options.from;
  } else if (durationMs) {
    baseParams.from = new Date(Date.now() - durationMs).toISOString();
  }

  if (options.to) {
    baseParams.to = options.to;
  }

  const rawList = [];
  let page = 1;

  while (page <= maxPages) {
    const response = await api.get(`/targets/${targetId}/history`, {
      params: { ...baseParams, page, limit: pageSize }
    });
    const pageData = Array.isArray(response.data) ? response.data : [];
    if (pageData.length === 0) break;
    rawList.push(...pageData);
    if (pageData.length < pageSize) break; // Finished fetching window
    page++;
  }

  // Normalize all rows
  const normalizedRecords = rawList
    .map(item => mapHistoryRecord(item, range))
    .filter(Boolean);

  // Backend returns records in DESC order (newest first).
  // For chronological time-series chart (left to right, oldest to newest), reverse the array.
  const chronologicalPoints = [...normalizedRecords].reverse();

  // Compute summary stats from the complete window
  const metrics = computeLatencyMetrics(normalizedRecords);

  return {
    targetId: Number(targetId),
    range,
    points: chronologicalPoints,
    records: normalizedRecords,
    ...metrics
  };
}
