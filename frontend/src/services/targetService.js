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
 * Converts frontend domain/form target data to the backend API payload (camelCase, type cast).
 * When isPartial is true, only fields actually provided in data are included, which satisfies
 * backend partialTargetSchema.strict().
 */
export function mapTargetToApiPayload(data, isPartial = false) {
  if (!data) return {};

  const payload = {};

  if (data.name !== undefined) {
    payload.name = String(data.name).trim();
  } else if (!isPartial) {
    payload.name = '';
  }

  const targetType = data.target_type ?? data.targetType;
  if (targetType !== undefined) {
    payload.targetType = targetType;
  } else if (!isPartial) {
    payload.targetType = 'website';
  }

  if (data.address !== undefined) {
    payload.address = String(data.address).trim();
  } else if (!isPartial) {
    payload.address = '';
  }

  const checkMethod = data.check_method ?? data.checkMethod;
  if (checkMethod !== undefined) {
    payload.checkMethod = checkMethod;
  } else if (!isPartial) {
    payload.checkMethod = 'http';
  }

  const checkInterval = data.check_interval_seconds ?? data.checkIntervalSeconds;
  if (checkInterval !== undefined) {
    payload.checkIntervalSeconds = Number(checkInterval);
  } else if (!isPartial) {
    payload.checkIntervalSeconds = 60;
  }

  const warningThreshold = data.warning_threshold_ms ?? data.warningThresholdMs;
  if (warningThreshold !== undefined) {
    payload.warningThresholdMs = Number(warningThreshold);
  } else if (!isPartial) {
    payload.warningThresholdMs = 300;
  }

  const criticalThreshold = data.critical_threshold_ms ?? data.criticalThresholdMs;
  if (criticalThreshold !== undefined) {
    payload.criticalThresholdMs = Number(criticalThreshold);
  } else if (!isPartial) {
    payload.criticalThresholdMs = 800;
  }

  const timeout = data.timeout_seconds ?? data.timeoutSeconds;
  if (timeout !== undefined) {
    payload.timeoutSeconds = Number(timeout);
  } else if (!isPartial) {
    payload.timeoutSeconds = 5;
  }

  return payload;
}

/**
 * Normalizes a target record from the backend API into the frontend domain format.
 * Guarantees field defaults, type casting, date safety, and backward compatibility with UI components.
 */
export function mapTargetFromApi(target) {
  if (!target) return null;

  const isEnabled = target.is_enabled !== undefined ? Boolean(target.is_enabled) : true;
  const status = !isEnabled ? 'disabled' : (target.current_status || target.currentStatus || 'unknown');
  const latency = target.latency !== undefined && target.latency !== null
    ? Number(target.latency)
    : target.response_time_ms !== undefined && target.response_time_ms !== null
      ? Number(target.response_time_ms)
      : null;

  return {
    ...target,
    id: Number(target.id),
    name: target.name || 'Unnamed Target',
    target_type: target.target_type || target.targetType || 'website',
    address: target.address || '',
    check_method: target.check_method || target.checkMethod || 'http',
    check_interval_seconds: Number(target.check_interval_seconds || target.checkIntervalSeconds) || 60,
    warning_threshold_ms: Number(target.warning_threshold_ms || target.warningThresholdMs) || 300,
    critical_threshold_ms: Number(target.critical_threshold_ms || target.criticalThresholdMs) || 800,
    timeout_seconds: Number(target.timeout_seconds || target.timeoutSeconds) || 5,
    is_enabled: isEnabled,
    current_status: status,
    latency: latency,
    response_time_ms: latency,
    uptime_percentage: target.uptime_percentage 
      ? String(target.uptime_percentage) 
      : (status === 'online' ? '100.00%' : '—'),
    last_checked_at: safeIsoDate(target.last_checked_at, null),
    created_at: safeIsoDate(target.created_at, new Date().toISOString()),
    history_sparkline: Array.isArray(target.history_sparkline) ? target.history_sparkline : []
  };
}

/**
 * Fetches all monitored targets from the backend REST API
 * Endpoint: GET /api/v1/targets
 * 
 * @returns {Promise<Array>} Array of mapped monitored targets
 */
export async function getTargets() {
  const response = await api.get('/targets');
  const rawData = Array.isArray(response.data) ? response.data : [];
  return rawData.map(mapTargetFromApi);
}

/**
 * Creates a new monitored target in the backend database
 * Endpoint: POST /api/v1/targets
 * 
 * @param {Object} targetData - Target properties from form
 * @returns {Promise<Object>} Normalized monitored target
 */
export async function createTarget(targetData) {
  const payload = mapTargetToApiPayload(targetData);
  const response = await api.post('/targets', payload);
  const data = response.data || {};

  // The backend POST /targets returns: { id, name, currentStatus, message }
  // Merge returned fields with the submitted attributes to guarantee full UI domain structure
  const mergedRecord = {
    ...targetData,
    id: data.id,
    name: data.name || targetData.name,
    current_status: data.currentStatus || 'unknown',
    is_enabled: targetData.is_enabled !== undefined ? Boolean(targetData.is_enabled) : true,
    created_at: new Date().toISOString(),
    last_checked_at: null,
    latency: null,
    response_time_ms: null,
    uptime_percentage: '—',
    history_sparkline: []
  };

  return mapTargetFromApi(mergedRecord);
}

/**
 * Updates an existing monitored target in the backend database
 * Endpoint: PATCH /api/v1/targets/:id
 * 
 * @param {number|string} targetId - ID of target to update
 * @param {Object} targetData - Partial or full target properties from form
 * @returns {Promise<Object>} Normalized updated monitored target
 */
export async function updateTarget(targetId, targetData) {
  if (!targetId) {
    throw new Error('Target ID is required to update target');
  }

  const payload = mapTargetToApiPayload(targetData, true);
  if (Object.keys(payload).length === 0) {
    throw new Error('At least one field is required to update target');
  }

  const response = await api.patch(`/targets/${targetId}`, payload);
  const data = response.data || {};

  // The backend PATCH /targets/:id returns: { message: 'Target updated successfully' }
  // Merge updated fields onto the targetData with the given targetId
  const mergedRecord = {
    ...targetData,
    id: Number(targetId)
  };

  return mapTargetFromApi(mergedRecord);
}

/**
 * Permanently deletes a monitored target from the backend database
 * Endpoint: DELETE /api/v1/targets/:id
 * 
 * @param {number|string} targetId - ID of target to delete
 * @returns {Promise<boolean>} True upon successful deletion
 */
export async function deleteTarget(targetId) {
  if (!targetId) {
    throw new Error('Target ID is required to delete target');
  }
  await api.delete(`/targets/${targetId}`);
  return true;
}

/**
 * Enables or disables a monitored target in the backend database
 * Endpoint: PATCH /api/v1/targets/:id/enabled
 * 
 * @param {number|string} targetId - ID of target to toggle
 * @param {boolean} isEnabled - New enabled status
 * @returns {Promise<{ id: number, isEnabled: boolean, currentStatus: string, message: string }>}
 */
export async function toggleTarget(targetId, isEnabled) {
  if (!targetId) {
    throw new Error('Target ID is required to toggle status');
  }

  const booleanValue = Boolean(isEnabled);
  const response = await api.patch(`/targets/${targetId}/enabled`, {
    isEnabled: booleanValue
  });

  const data = response.data || {};
  return {
    id: Number(targetId),
    isEnabled: booleanValue,
    currentStatus: data.currentStatus || (booleanValue ? 'unknown' : 'disabled'),
    message: data.message || `Target ${booleanValue ? 'enabled' : 'disabled'} successfully`
  };
}

/**
 * Executes an immediate manual health check probe for a monitored target
 * Endpoint: POST /api/v1/targets/:id/check
 * 
 * @param {number|string} targetId - ID of target to probe
 * @returns {Promise<Object>} Live probe outcome and response metrics
 */
export async function checkTarget(targetId) {
  if (!targetId) {
    throw new Error('Target ID is required to execute health check');
  }

  const response = await api.post(`/targets/${targetId}/check`);
  return response.data;
}
