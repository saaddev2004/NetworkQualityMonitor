import pool from '../config/db.js';

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