import pool from '../config/db.js';

export const getEvents = async (req, res, next) => {
    try {
        const [events] = await pool.query(`
            SELECT e.*, t.name as target_name, t.address as target_address
            FROM events e
            LEFT JOIN monitored_targets t ON e.target_id = t.id
            ORDER BY e.occurred_at DESC
            LIMIT 100
        `);
        res.status(200).json(events);
    } catch (error) {
        next(error);
    }
};

