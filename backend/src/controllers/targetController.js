import pool from '../config/db.js';
import { executeCheck } from '../services/monitorService.js'; 
import { scheduleTarget } from '../scheduler/scheduler.js'; // <-- Scheduler yahan import kiya gaya hai

// Create a new target (POST /targets)
export const createTarget = async (req, res, next) => {
    try {
        const { name, targetType, address, checkMethod, checkIntervalSeconds, warningThresholdMs, criticalThresholdMs, timeoutSeconds } = req.body;
        
        const query = `
            INSERT INTO monitored_targets 
            (name, target_type, address, check_method, check_interval_seconds, warning_threshold_ms, critical_threshold_ms, timeout_seconds, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())
        `;
        
        const [result] = await pool.query(query, [name, targetType, address, checkMethod, checkIntervalSeconds, warningThresholdMs, criticalThresholdMs, timeoutSeconds]);

        // Blueprint requirement: Naya target bante hi scheduler mein register karein
        const [newTarget] = await pool.query('SELECT * FROM monitored_targets WHERE id = ?', [result.insertId]);
        scheduleTarget(newTarget[0]);

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
export const getTargets = async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT * FROM monitored_targets ORDER BY created_at DESC');
        res.status(200).json(rows);
    } catch (error) {
        next(error);
    }
};

// Get a single target by ID (GET /targets/:id)
export const getTargetById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM monitored_targets WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Target not found' } });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        next(error);
    }
};

// Update a target (PATCH /targets/:id)
export const updateTarget = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, targetType, address, checkMethod, checkIntervalSeconds, warningThresholdMs, criticalThresholdMs, timeoutSeconds } = req.body;

        const query = `
            UPDATE monitored_targets 
            SET name=?, target_type=?, address=?, check_method=?, check_interval_seconds=?, 
                warning_threshold_ms=?, critical_threshold_ms=?, timeout_seconds=?, updated_at=UTC_TIMESTAMP()
            WHERE id=?
        `;
        
        const [result] = await pool.query(query, [name, targetType, address, checkMethod, checkIntervalSeconds, warningThresholdMs, criticalThresholdMs, timeoutSeconds, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Target not found' } });
        }

        // Blueprint requirement: Edit hone par scheduled job cancel kar ke naye interval par chalayein[cite: 3]
        const [updatedTarget] = await pool.query('SELECT * FROM monitored_targets WHERE id = ?', [id]);
        scheduleTarget(updatedTarget[0]);

        res.status(200).json({ message: 'Target updated successfully' }); 
    } catch (error) {
        next(error);
    }
};

// Delete a target (DELETE /targets/:id)
export const deleteTarget = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM monitored_targets WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Target not found' } });
        }

        // Blueprint requirement: Target delete hone par scheduled job bhi foran ruk jani chahiye[cite: 3]
        scheduleTarget({ id: id, is_enabled: false });

        res.status(204).send(); 
    } catch (error) {
        next(error);
    }
};

// Toggle target enabled/disabled status (PATCH /targets/:id/enabled)
export const toggleTargetEnabled = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isEnabled } = req.body; 

        const newStatus = isEnabled ? 'unknown' : 'disabled';

        const [result] = await pool.query(
            'UPDATE monitored_targets SET is_enabled = ?, current_status = ?, updated_at = UTC_TIMESTAMP() WHERE id = ?',
            [isEnabled, newStatus, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Target not found' } });
        }

        // Blueprint requirement: Enable/Disable hone par cron job start ya stop karein[cite: 3]
        const [toggledTarget] = await pool.query('SELECT * FROM monitored_targets WHERE id = ?', [id]);
        scheduleTarget(toggledTarget[0]);

        res.status(200).json({ message: `Target ${isEnabled ? 'enabled' : 'disabled'} successfully`, currentStatus: newStatus });
    } catch (error) {
        next(error);
    }
};

// Run a manual check (POST /targets/:id/check)
export const runManualCheck = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const [rows] = await pool.query('SELECT * FROM monitored_targets WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Target not found' } });
        }
        const target = rows[0];

        const checkResult = await executeCheck(target);

        res.status(200).json({
            message: 'Manual check executed successfully',
            target: target.name,
            method: target.check_method,
            result: checkResult
        });

    } catch (error) {
        next(error);
    }
};