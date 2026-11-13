
import pool from '../config/db.js';
import { checkAndRecord } from '../services/checkRunner.js';

const runChecks = async () => {
    try {
        console.log('[Worker] Starting monitoring cycle...');

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

        console.log(`[Worker] ${targets.length} target(s) due for checking.`);

        for (const target of targets) {
            const result = await checkAndRecord(target.id);
            console.log(`[Worker] ${target.name}: ${result.outcome}`);
        }

        console.log('[Worker] Monitoring cycle completed.');
    } catch (error) {
        console.error('[Worker] Error:', error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
};

runChecks();
