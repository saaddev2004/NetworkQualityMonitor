import api from './api.js';

/**
 * Triggers a browser download of a given Blob with the specified filename
 * and cleanly revokes the object URL.
 * 
 * @param {Blob} blob - The file blob to download
 * @param {string} filename - Target file name for download
 */
export function triggerBlobDownload(blob, filename) {
  if (typeof window === 'undefined' || !window.URL) return;

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}

/**
 * Extracts filename from Content-Disposition header if present
 * 
 * @param {string} contentDisposition - Header value
 * @param {string} fallback - Fallback filename
 * @returns {string} Extracted or fallback filename
 */
export function extractFilename(contentDisposition, fallback) {
  if (!contentDisposition) return fallback;
  const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i);
  if (match && match[1]) {
    return match[1].replace(/['"]/g, '').trim();
  }
  return fallback;
}

/**
 * Parses and unwraps error message from a failed Blob response
 * 
 * @param {Error} err - Axios error object
 * @returns {Promise<Error>} Error with resolved message
 */
export async function parseBlobError(err) {
  if (err.response?.data instanceof Blob) {
    try {
      const text = await err.response.data.text();
      const json = JSON.parse(text);
      if (json?.error?.message) {
        err.message = json.error.message;
      }
    } catch {
      // Keep original error message
    }
  }
  return err;
}

/**
 * Downloads configured targets CSV report from backend API
 * Endpoint: GET /api/v1/targets/reports/targets.csv
 * 
 * @returns {Promise<{ success: boolean, filename: string, size: number }>}
 */
export async function exportTargetsReport() {
  try {
    const response = await api.get('/targets/reports/targets.csv', {
      responseType: 'blob'
    });

    const filename = extractFilename(
      response.headers['content-disposition'],
      'targets.csv'
    );

    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    triggerBlobDownload(blob, filename);

    return { success: true, filename, size: blob.size };
  } catch (err) {
    await parseBlobError(err);
    throw err;
  }
}

/**
 * Downloads historical monitoring probe results CSV report from backend API
 * Endpoint: GET /api/v1/targets/reports/results.csv
 * 
 * @param {Object} [params={}] - Optional filters (targetId, from, to)
 * @returns {Promise<{ success: boolean, filename: string, size: number }>}
 */
export async function exportProbeResultsReport(params = {}) {
  try {
    const queryParams = {};
    if (params.targetId) queryParams.targetId = Number(params.targetId);
    if (params.from) queryParams.from = params.from;
    if (params.to) queryParams.to = params.to;

    const response = await api.get('/targets/reports/results.csv', {
      params: queryParams,
      responseType: 'blob'
    });

    const defaultFilename = params.targetId
      ? `probe-results-target-${params.targetId}.csv`
      : 'probe-results.csv';

    const filename = extractFilename(
      response.headers['content-disposition'],
      defaultFilename
    );

    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    triggerBlobDownload(blob, filename);

    return { success: true, filename, size: blob.size };
  } catch (err) {
    await parseBlobError(err);
    throw err;
  }
}
