
import pool from '../config/db.js';
import { checkAndRecord } from '../services/checkRunner.js';

export const runScheduledMonitoring = async (req, res, next) => {
    try {
        const [targets] = await pool.query(`
            SELECT id, name
            FROM monitored_targets
            WHERE is_enabled = TRUE
            AND (
                last_checked_at IS NULL
                OR last_checked_at <= DATE_SUB(
                    UTC_TIMESTAMP(),
                    INTERVAL check_interval_seconds SECOND
                )
            )
        `);

        const results = [];

        for (const target of targets) {
            const result = await checkAndRecord(target.id);

            results.push({
                id: target.id,
                name: target.name,
                outcome: result.outcome
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Monitoring cycle completed',
            checked: results.length,
            results
        });
    } catch (error) {
        next(error);
    }
};
