import api from './api';

/**
 * Safely converts any date value into an ISO 8601 string, with fallback
 */
function safeIsoDate(val, fallback = null) {
  if (!val) return fallback;
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? fallback : d.toISOString();
  } catch {
    return fallback;
  }
}

/**
 * Normalizes an incident event record from the backend API into the frontend domain format.
 * Guarantees field defaults, boolean conversion, date safety, and fallback labels.
 */
export function mapEventFromApi(event) {
  if (!event) return null;

  const targetId = Number(event.target_id || event.targetId || 0);

  return {
    ...event,
    id: Number(event.id),
    target_id: targetId,
    target_name: event.target_name || event.targetName || (targetId ? `Target #${targetId}` : 'System Engine'),
    target_address: event.target_address || event.targetAddress || '',
    event_type: event.event_type || event.eventType || 'unknown',
    severity: event.severity || 'info',
    description: event.description || 'No incident description provided',
    occurred_at: safeIsoDate(event.occurred_at || event.occurredAt, new Date().toISOString()),
    resolved_at: safeIsoDate(event.resolved_at || event.resolvedAt, null),
    is_resolved: Boolean(event.is_resolved !== undefined ? event.is_resolved : event.isResolved)
  };
}

/**
 * Fetches incident events from the backend REST API
 * Endpoint: GET /api/v1/events
 * 
 * @param {Object} [params] - Optional query filters (targetId, isResolved, page, limit)
 * @returns {Promise<Array>} Array of normalized incident events
 */
export async function getEvents(params = {}) {
  const queryParams = {};
  if (params.targetId) queryParams.targetId = params.targetId;
  if (params.isResolved !== undefined) queryParams.isResolved = String(params.isResolved);
  if (params.page) queryParams.page = params.page;
  if (params.limit) queryParams.limit = params.limit;

  const response = await api.get('/events', { params: queryParams });
  const rawData = Array.isArray(response.data) ? response.data : [];
  return rawData.map(mapEventFromApi);
}
