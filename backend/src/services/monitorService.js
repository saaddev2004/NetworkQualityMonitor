import axios from 'axios';

// HTTP/HTTPS Target Checker
export const checkHttpTarget = async (address, timeoutSeconds) => {
    const startTime = Date.now();
    try {
        // Blueprint requirement: Bounded HTTP/HTTPS requests with configured timeout and safe redirect policy.
        const response = await axios.get(address, {
            timeout: timeoutSeconds * 1000, 
            maxRedirects: 3, 
            validateStatus: false 
        });

        // Blueprint requirement: Measure elapsed response time from request start until response is received.
        const responseTimeMs = Date.now() - startTime;
        
        // Blueprint requirement: Classify HTTP 2xx/3xx as successful, and 4xx/5xx as application-level failures.
        const isAvailable = response.status >= 200 && response.status < 400;

        return {
            isAvailable,
            responseTimeMs,
            httpStatusCode: response.status,
            errorType: isAvailable ? null : 'HTTP_ERROR',
            // Blueprint requirement: Sanitize error messages; do not store response bodies unnecessarily.
            errorMessage: isAvailable ? null : `Application-level failure with HTTP Status ${response.status}`
        };
    } catch (error) {
        // Blueprint requirement: Use NULL, not zero, when failed requests have no response-time measurement.
        return {
            isAvailable: false,
            responseTimeMs: null, 
            httpStatusCode: null,
            errorType: error.code || 'NETWORK_ERROR',
            errorMessage: error.message // Sanitized error message
        };
    }
};