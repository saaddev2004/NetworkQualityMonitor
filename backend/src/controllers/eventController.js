import { z } from 'zod';
import pool from '../config/db.js';
import { sendValidationError } from '../middleware/validate.js';

const eventsQuerySchema = z.object({
    targetId: z.coerce.number().int().positive().optional(),
    isResolved: z.enum(['true', 'false']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(200).default(100)
});

// GET /events?targetId=&isResolved=true|false&page=&limit=
export const getEvents = async (req, res, next) => {
    try {
        const parsed = eventsQuerySchema.safeParse(req.query);
        if (!parsed.success) return sendValidationError(res, parsed.error);
        const { targetId, isResolved, page, limit } = parsed.data;

        let query = `
            SELECT e.*, t.name AS target_name, t.address AS target_address
            FROM events e
            LEFT JOIN monitored_targets t ON e.target_id = t.id
            WHERE 1=1`;
        const params = [];

        if (targetId) {
            query += ' AND e.target_id = ?';
            params.push(targetId);
        }
        if (isResolved !== undefined) {
            query += ' AND e.is_resolved = ?';
            params.push(isResolved === 'true');
        }

        query += ' ORDER BY e.occurred_at DESC, e.id DESC LIMIT ? OFFSET ?';
        params.push(limit, (page - 1) * limit);

        const [events] = await pool.query(query, params);
        res.status(200).json(events);
    } catch (error) {
        next(error);
    }
};
