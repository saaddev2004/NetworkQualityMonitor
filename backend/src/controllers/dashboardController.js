import pool from '../config/db.js';

// GET /dashboard/summary
export const getDashboardSummary = async (req, res, next) => {
    try {
        const [statusRows] = await pool.query(
            'SELECT current_status, COUNT(*) AS count FROM monitored_targets GROUP BY current_status'
        );
        const counts = Object.fromEntries(statusRows.map((r) => [r.current_status, Number(r.count)]));
        const totalTargets = Object.values(counts).reduce((a, b) => a + b, 0);

        const [[events]] = await pool.query('SELECT COUNT(*) AS activeEvents FROM events WHERE is_resolved = FALSE');

        // Real uptime over the last 24 hours, across all targets
        const [[uptime]] = await pool.query(
            `SELECT COUNT(*) AS total, COALESCE(SUM(is_available), 0) AS success
             FROM monitoring_results
             WHERE checked_at >= UTC_TIMESTAMP() - INTERVAL 24 HOUR`
        );
        const total = Number(uptime.total);
        const overallUptimePercent = total > 0 ? Number(((Number(uptime.success) / total) * 100).toFixed(1)) : null;

        res.status(200).json({
            totalTargets,
            onlineTargets: counts.online || 0,
            offlineTargets: counts.offline || 0,
            warningTargets: counts.warning || 0,
            criticalTargets: counts.critical || 0,
            disabledTargets: counts.disabled || 0,
            unknownTargets: counts.unknown || 0,
            overallUptime: overallUptimePercent === null ? 'N/A' : `${overallUptimePercent}%`,
            overallUptimePercent, // number, or null when there are no checks in the last 24h
            activeEvents: Number(events.activeEvents)
        });
    } catch (error) {
        next(error);
    }
};
