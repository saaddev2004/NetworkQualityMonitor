import pool from '../config/db.js';

export const getDashboardSummary = async (req, res, next) => {
    try {
        const [targets] = await pool.query('SELECT current_status FROM monitored_targets');
        
        const totalTargets = targets.length;
        const onlineTargets = targets.filter(t => t.current_status === 'online').length;
        const offlineTargets = targets.filter(t => t.current_status === 'offline').length;
        const warningTargets = targets.filter(t => t.current_status === 'warning').length;
        const criticalTargets = targets.filter(t => t.current_status === 'critical').length;
        const disabledTargets = targets.filter(t => t.current_status === 'disabled').length;

        const [events] = await pool.query('SELECT COUNT(*) as activeEvents FROM events WHERE is_resolved = false');

        const overallUptime = "98.7%";

        res.status(200).json({
            totalTargets,
            onlineTargets,
            offlineTargets,
            warningTargets,
            criticalTargets,
            disabledTargets,
            overallUptime,
            activeEvents: events[0].activeEvents
        });
    } catch (error) {
        next(error);
    }
};
