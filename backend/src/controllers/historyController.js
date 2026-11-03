import { z } from 'zod';
import pool from '../config/db.js';
import { sendValidationError } from '../middleware/validate.js';

const dateRange = {
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional()
};

const historyQuerySchema = z.object({
    ...dateRange,
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(200).default(50)
});

const uptimeQuerySchema = z.object(dateRange);

const targetExists = async (id) => {
    const [rows] = await pool.query('SELECT id FROM monitored_targets WHERE id = ?', [id]);
    return rows.length > 0;
};

const notFound = (res) =>
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Target not found' } });

// GET /targets/:id/history?from=&to=&page=&limit=
export const getTargetHistory = async (req, res, next) => {
    try {
        const { id } = req.params;

        const parsed = historyQuerySchema.safeParse(req.query);
        if (!parsed.success) return sendValidationError(res, parsed.error);
        const { from, to, page, limit } = parsed.data;

        if (!(await targetExists(id))) return notFound(res);

        let query = 'SELECT * FROM monitoring_results WHERE target_id = ?';
        const params = [id];

        if (from) {
            query += ' AND checked_at >= ?';
            params.push(from);
        }
        if (to) {
            query += ' AND checked_at <= ?';
            params.push(to);
        }

        query += ' ORDER BY checked_at DESC, id DESC LIMIT ? OFFSET ?';
        params.push(limit, (page - 1) * limit);

        const [results] = await pool.query(query, params);
        res.status(200).json(results);
    } catch (error) {
        next(error);
    }
};

// GET /targets/:id/uptime?from=&to=
// Uptime = (successful checks / all completed checks) * 100.
// A check counts as successful when the target answered (online, warning or critical).
export const getTargetUptime = async (req, res, next) => {
    try {
        const { id } = req.params;

        const parsed = uptimeQuerySchema.safeParse(req.query);
        if (!parsed.success) return sendValidationError(res, parsed.error);
        const { from, to } = parsed.data;

        if (!(await targetExists(id))) return notFound(res);

        let query = `SELECT COUNT(*) AS total, COALESCE(SUM(is_available), 0) AS success
                     FROM monitoring_results WHERE target_id = ?`;
        const params = [id];

        if (from) {
            query += ' AND checked_at >= ?';
            params.push(from);
        }
        if (to) {
            query += ' AND checked_at <= ?';
            params.push(to);
        }

        const [[row]] = await pool.query(query, params);
        const total = Number(row.total);
        const success = Number(row.success);
        const uptimePercent = total > 0 ? (success / total) * 100 : 0;

        res.status(200).json({
            uptimePercentage: uptimePercent.toFixed(2) + '%',
            uptimePercent: Number(uptimePercent.toFixed(2)),
            successfulChecks: success,
            totalEligibleChecks: total
        });
    } catch (error) {
        next(error);
    }
};
