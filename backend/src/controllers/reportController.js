import { z } from 'zod';
import pool from '../config/db.js';
import { toCsv } from '../utils/csv.js';
import { sendValidationError } from '../middleware/validate.js';

const TARGET_COLUMNS = [
    'id', 'name', 'target_type', 'address', 'check_method', 'check_interval_seconds',
    'warning_threshold_ms', 'critical_threshold_ms', 'timeout_seconds', 'is_enabled',
    'current_status', 'last_checked_at', 'created_at', 'updated_at'
];

const RESULT_COLUMNS = [
    'id', 'target_id', 'checked_at', 'is_available', 'response_time_ms',
    'http_status_code', 'result_status', 'error_type', 'error_message', 'created_at'
];

// Safety cap so one export can never load millions of rows into memory.
const MAX_EXPORT_ROWS = 100000;

const resultsQuerySchema = z.object({
    targetId: z.coerce.number().int().positive().optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional()
});

export const exportTargetsCSV = async (req, res, next) => {
    try {
        const [targets] = await pool.query('SELECT * FROM monitored_targets ORDER BY created_at DESC');

        res.header('Content-Type', 'text/csv');
        res.attachment('targets.csv');
        res.status(200).send(toCsv(targets, TARGET_COLUMNS));
    } catch (error) {
        next(error);
    }
};

export const exportResultsCSV = async (req, res, next) => {
    try {
        const parsed = resultsQuerySchema.safeParse(req.query);
        if (!parsed.success) return sendValidationError(res, parsed.error);
        const { targetId, from, to } = parsed.data;

        let query = 'SELECT * FROM monitoring_results WHERE 1=1';
        const params = [];

        if (targetId) {
            query += ' AND target_id = ?';
            params.push(targetId);
        }
        if (from) {
            query += ' AND checked_at >= ?';
            params.push(from);
        }
        if (to) {
            query += ' AND checked_at <= ?';
            params.push(to);
        }

        query += ' ORDER BY checked_at DESC LIMIT ?';
        params.push(MAX_EXPORT_ROWS);

        const [results] = await pool.query(query, params);

        res.header('Content-Type', 'text/csv');
        res.attachment('results.csv');
        res.status(200).send(toCsv(results, RESULT_COLUMNS));
    } catch (error) {
        next(error);
    }
};
