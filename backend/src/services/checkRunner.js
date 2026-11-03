import pool from '../config/db.js';
import { executeCheck } from './monitorService.js';
import { createEvent, resolveOpenEvents } from './eventService.js';

// After this many failed checks in a row, one "repeated_failure" event is raised.
export const REPEATED_FAILURE_THRESHOLD = Number(process.env.REPEATED_FAILURE_THRESHOLD) || 3;

// Targets whose check is running right now. Prevents two checks of the same
// target from overlapping (slow check + short interval, or manual + scheduled).
const inFlight = new Set();

// Threshold evaluator: turns a raw check result into a status.
export const evaluateStatus = (result, target) => {
    if (!result.isAvailable) return 'offline';
    if (result.responseTimeMs >= target.critical_threshold_ms) return 'critical';
    if (result.responseTimeMs >= target.warning_threshold_ms) return 'warning';
    return 'online';
};

// Events are created ONLY when the status changes.
const handleTransition = async (target, previousStatus, newStatus, result) => {
    // The target is no longer in any of its old states, so close those events.
    await resolveOpenEvents(target.id, newStatus);

    if (newStatus === 'online') {
        await createEvent(target.id, 'recovery', 'info',
            `Recovered: latest check online (${result.responseTimeMs} ms)`, { resolved: true });
        return;
    }

    // Back from offline but still slow: record the recovery AND the degraded state.
    if (previousStatus === 'offline' && newStatus !== 'offline') {
        await createEvent(target.id, 'recovery', 'info',
            `Recovered: target reachable again (${result.responseTimeMs} ms)`, { resolved: true });
    }

    if (newStatus === 'offline') {
        await createEvent(target.id, 'offline', 'critical',
            `Target unreachable: ${result.errorMessage || 'Connection timed out'}`);
    } else if (newStatus === 'critical') {
        await createEvent(target.id, 'critical', 'critical',
            `Response time ${result.responseTimeMs} ms exceeded critical threshold ${target.critical_threshold_ms} ms`);
    } else if (newStatus === 'warning') {
        await createEvent(target.id, 'warning', 'warning',
            `Response time ${result.responseTimeMs} ms exceeded warning threshold ${target.warning_threshold_ms} ms`);
    }
};

// Raises exactly one repeated_failure event per outage (on the Nth failure in a row).
const checkRepeatedFailure = async (target) => {
    const [recent] = await pool.query(
        'SELECT is_available FROM monitoring_results WHERE target_id = ? ORDER BY checked_at DESC, id DESC LIMIT ?',
        [target.id, REPEATED_FAILURE_THRESHOLD + 1]
    );
    let consecutive = 0;
    for (const row of recent) {
        if (row.is_available) break;
        consecutive++;
    }
    if (consecutive === REPEATED_FAILURE_THRESHOLD) {
        await createEvent(target.id, 'repeated_failure', 'critical',
            `${consecutive} consecutive failed checks`);
    }
};

// The single place where a check is executed AND recorded.
// Used by both the scheduler and the manual-check endpoint.
// It always re-reads the target from the DB, so it never works with stale
// config/status, and a deleted or disabled target is detected right away.
//
// Returns { outcome: 'done' | 'missing' | 'disabled' | 'busy', ... }
export const checkAndRecord = async (targetId) => {
    const id = Number(targetId);
    if (inFlight.has(id)) return { outcome: 'busy' };
    inFlight.add(id);

    try {
        const [rows] = await pool.query('SELECT * FROM monitored_targets WHERE id = ?', [id]);
        if (rows.length === 0) return { outcome: 'missing' };

        const target = rows[0];
        if (!target.is_enabled) return { outcome: 'disabled', target };

        const result = await executeCheck(target);
        const status = evaluateStatus(result, target);
        const previousStatus = target.current_status;

        // 1. Save history
        await pool.query(
            `INSERT INTO monitoring_results
             (target_id, checked_at, is_available, response_time_ms, http_status_code, result_status, error_type, error_message, created_at)
             VALUES (?, UTC_TIMESTAMP(3), ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(3))`,
            [target.id, result.isAvailable, result.responseTimeMs, result.httpStatusCode, status, result.errorType, result.errorMessage]
        );

        // 2. Update the target's current status
        await pool.query(
            // is_enabled guard: if the target was disabled while this check was running,
            // do not overwrite its 'disabled' status.
            'UPDATE monitored_targets SET current_status = ?, last_checked_at = UTC_TIMESTAMP(3) WHERE id = ? AND is_enabled = TRUE',
            [status, target.id]
        );

        // 3. Events (no event on the very first check: previous status is 'unknown')
        if (previousStatus && previousStatus !== 'unknown' && previousStatus !== 'disabled' && previousStatus !== status) {
            await handleTransition(target, previousStatus, status, result);
        }
        if (status === 'offline') {
            await checkRepeatedFailure(target);
        }

        return { outcome: 'done', target, result, status, previousStatus };
    } finally {
        inFlight.delete(id);
    }
};
