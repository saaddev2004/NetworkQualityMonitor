import api from './api';

/**
 * Normalizes dashboard summary metrics returned from the backend API.
 * Ensures all numbers, percentages, and status counters are safe and clean.
 * 
 * @param {Object} data - Raw dashboard summary object from backend
 * @returns {Object} Normalized dashboard summary metrics
 */
export function mapDashboardSummaryFromApi(data) {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const overallUptimePercent = data.overallUptimePercent !== null && data.overallUptimePercent !== undefined
    ? Number(data.overallUptimePercent)
    : null;

  return {
    totalTargets: Number(data.totalTargets) || 0,
    onlineTargets: Number(data.onlineTargets) || 0,
    offlineTargets: Number(data.offlineTargets) || 0,
    warningTargets: Number(data.warningTargets) || 0,
    criticalTargets: Number(data.criticalTargets) || 0,
    disabledTargets: Number(data.disabledTargets) || 0,
    unknownTargets: Number(data.unknownTargets) || 0,
    overallUptime: data.overallUptime || (overallUptimePercent !== null ? `${overallUptimePercent}%` : 'N/A'),
    overallUptimePercent,
    activeEvents: Number(data.activeEvents) || 0
  };
}

/**
 * Fetches high-level fleet health summary and statistics
 * Endpoint: GET /api/v1/dashboard/summary
 * 
 * @returns {Promise<Object>} Normalized dashboard summary metrics
 */
export async function getDashboardSummary() {
  const response = await api.get('/dashboard/summary');
  return mapDashboardSummaryFromApi(response.data);
}
