import api from './api.js';

/**
 * Fetches real-time system health, database connection status,
 * and monitoring scheduler engine telemetry from backend.
 * Endpoint: GET /api/v1/health
 * 
 * @returns {Promise<Object>} System health and engine telemetry payload
 */
export async function getSystemHealth() {
  const response = await api.get('/health');
  return response.data;
}
