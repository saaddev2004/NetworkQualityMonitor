
import pool from '../config/db.js';
import { checkAndRecord } from '../services/checkRunner.js';
import { resolveOpenEvents } from '../services/eventService.js';
import { validateMergedTarget, sendValidationError } from '../middleware/validate.js';

const notFound = (res) =>
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Target not found' } });

const VALID_STATUSES = new Set(['online', 'warning', 'critical', 'offline']);

// Create a new target (POST /targets)
export const createTarget = async (req, res, next) => {
    try {
        const {
            name,
            targetType,
            address,
            checkMethod,
            checkIntervalSeconds,
            warningThresholdMs,
            criticalThresholdMs,
            timeoutSeconds
        } = req.body;

        const query = `
            INSERT INTO monitored_targets
            (name, target_type, address, check_method, check_interval_seconds,
             warning_threshold_ms, critical_threshold_ms, timeout_seconds,
             created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(3), UTC_TIMESTAMP(3))
        `;

        const [result] = await pool.query(query, [
            name, targetType, address, checkMethod,
            checkIntervalSeconds, warningThresholdMs,
            criticalThresholdMs, timeoutSeconds
        ]);

        res.status(201).json({
            id: result.insertId,
            name,
            currentStatus: 'unknown',
            message: 'Target created successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Get all targets (GET /targets)
// Supports optional status filtering
export const getTargets = async (req, res, next) => {
    try {
        const { status } = req.query;

        if (status !== undefined) {
            if (typeof status !== 'string' || !VALID_STATUSES.has(status)) {
                return res.status(400).json({
                    error: {
                        code: 'INVALID_STATUS',
                        message: 'Invalid status value. Allowed values are: online, warning, critical, offline'
                    }
                });
            }

            const [rows] = await pool.query(
                'SELECT * FROM monitored_targets WHERE current_status = ? ORDER BY created_at DESC',
                [status]
            );

            return res.status(200).json(rows);
        }

        // No status filter: return all targets
        const [rows] = await pool.query(
            'SELECT * FROM monitored_targets ORDER BY created_at DESC'
        );

        return res.status(200).json(rows);
    } catch (error) {
        next(error);
    }
};

// Get a single target by ID (GET /targets/:id)
export const getTargetById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(
            'SELECT * FROM monitored_targets WHERE id = ?',
            [id]
        );

        if (rows.length === 0) return notFound(res);

        res.status(200).json(rows[0]);
    } catch (error) {
        next(error);
    }
};

// Update a target (PATCH /targets/:id)
export const updateTarget = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [existing] = await pool.query(
            'SELECT * FROM monitored_targets WHERE id = ?',
            [id]
        );

        if (existing.length === 0) return notFound(res);

        const merged = validateMergedTarget(existing[0], req.body);
        if (!merged.success) return sendValidationError(res, merged.error);

        const {
            name,
            targetType,
            address,
            checkMethod,
            checkIntervalSeconds,
            warningThresholdMs,
            criticalThresholdMs,
            timeoutSeconds
        } = merged.data;

        await pool.query(
            `UPDATE monitored_targets
             SET name=?, target_type=?, address=?, check_method=?,
                 check_interval_seconds=?, warning_threshold_ms=?,
                 critical_threshold_ms=?, timeout_seconds=?,
                 updated_at=UTC_TIMESTAMP(3)
             WHERE id=?`,
            [
                name, targetType, address, checkMethod,
                checkIntervalSeconds, warningThresholdMs,
                criticalThresholdMs, timeoutSeconds, id
            ]
        );

        res.status(200).json({ message: 'Target updated successfully' });
    } catch (error) {
        next(error);
    }
};

// Delete a target (DELETE /targets/:id)
export const deleteTarget = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            'DELETE FROM monitored_targets WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) return notFound(res);

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

// Enable / disable a target (PATCH /targets/:id/enabled)
export const toggleTargetEnabled = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isEnabled } = req.body;

        const newStatus = isEnabled ? 'unknown' : 'disabled';

        const [result] = await pool.query(
            `UPDATE monitored_targets
             SET is_enabled = ?, current_status = ?, updated_at = UTC_TIMESTAMP(3)
             WHERE id = ?`,
            [isEnabled, newStatus, id]
        );

        if (result.affectedRows === 0) return notFound(res);

        if (!isEnabled) {
            await resolveOpenEvents(id, null);
        }

        res.status(200).json({
            message: `Target ${isEnabled ? 'enabled' : 'disabled'} successfully`,
            currentStatus: newStatus
        });
    } catch (error) {
        next(error);
    }
};

// Run a manual check (POST /targets/:id/check)
export const runManualCheck = async (req, res, next) => {
    try {
        const { id } = req.params;

        const outcome = await checkAndRecord(id);

        if (outcome.outcome === 'missing') return notFound(res);

        if (outcome.outcome === 'disabled') {
            return res.status(409).json({
                error: {
                    code: 'TARGET_DISABLED',
                    message: 'Target is disabled. Enable it before running a check.'
                }
            });
        }

        if (outcome.outcome === 'busy') {
            return res.status(409).json({
                error: {
                    code: 'CHECK_IN_PROGRESS',
                    message: 'A check for this target is already running. Try again in a moment.'
                }
            });
        }

        res.status(200).json({
            message: 'Manual check executed successfully',
            target: outcome.target.name,
            method: outcome.target.check_method,
            status: outcome.status,
            previousStatus: outcome.previousStatus,
            result: outcome.result
        });
    } catch (error) {
        next(error);
    }
};
