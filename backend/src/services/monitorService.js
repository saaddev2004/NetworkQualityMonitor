import axios from 'axios';
import ping from 'ping'; // <-- Naya import add karein

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

export const checkIcmpTarget = async (address, timeoutSeconds) => {
    try {
        // Blueprint requirement: Wrap the selected ping package, avoid unsafe shell command construction.
        const response = await ping.promise.probe(address, {
            timeout: timeoutSeconds,
            extra: ['-c', '3'] // Send 3 packets for a reliable average
        });

        if (response.alive) {
            return {
                isAvailable: true,
                responseTimeMs: parseFloat(response.avg) || 0,
                httpStatusCode: null,
                errorType: null,
                errorMessage: null
            };
        } else {
            // Blueprint requirement: Use NULL for response time when failed.
            return {
                isAvailable: false,
                responseTimeMs: null, 
                httpStatusCode: null,
                errorType: 'PING_FAILED',
                errorMessage: 'Host unreachable or ICMP blocked'
            };
        }
    } catch (error) {
        // Blueprint requirement: Detect unsupported platform/permissions and return a controlled method error while allowing the application to continue.
        return {
            isAvailable: false,
            responseTimeMs: null,
            httpStatusCode: null,
            errorType: 'PING_UNSUPPORTED_OR_ERROR',
            errorMessage: 'ICMP ping not supported or permission denied: ' + error.message
        };
    }
};

// Main function to route to the correct method based on target configuration
export const executeCheck = async (target) => {
    if (target.check_method === 'http') {
        return await checkHttpTarget(target.address, target.timeout_seconds);
    } else if (target.check_method === 'icmp') {
        return await checkIcmpTarget(target.address, target.timeout_seconds);
    }
    throw new Error('Unsupported check method');
};