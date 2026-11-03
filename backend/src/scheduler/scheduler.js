import cron from 'node-cron';
import pool from '../config/db.js';
import { checkAndRecord } from '../services/checkRunner.js';

// One timer per target. Keys are always NUMBERS (req.params ids are strings,
// so every public function converts with Number()).
const activeJobs = new Map();
let retentionJob = null;

export const unscheduleTarget = (id) => {
    const key = Number(id);
    const timer = activeJobs.get(key);
    if (timer) {
        clearInterval(timer);
        activeJobs.delete(key);
    }
};

export const isScheduled = (id) => activeJobs.has(Number(id));

// (Re)schedules a target. Safe to call again after edit / enable / disable:
// the old timer is always cleared first.
export const scheduleTarget = (target) => {
    const id = Number(target.id);
    unscheduleTarget(id);

    if (!target.is_enabled) return;

    // setInterval honours ANY interval (45s, 300s, ...), unlike a cron expression.
    const intervalMs = Number(target.check_interval_seconds) * 1000;

    const run = async () => {
        try {
            const out = await checkAndRecord(id);
            if (out.outcome === 'missing' || out.outcome === 'disabled') {
                unscheduleTarget(id); // deleted or disabled in the meantime
            } else if (out.outcome === 'done') {
                console.log(`[Scheduler] ${out.target.name} -> ${out.status}`);
            }
            // 'busy' = previous check still running; skip this tick.
        } catch (error) {
            console.error(`[Scheduler] Error processing target ${id}:`, error.message);
        }
    };

    activeJobs.set(id, setInterval(run, intervalMs));
    run(); // first check right away, do not wait a full interval
};

// Server start: load every enabled target.
export const initScheduler = async () => {
    try {
        const [targets] = await pool.query('SELECT * FROM monitored_targets WHERE is_enabled = true');
        targets.forEach(scheduleTarget);
        console.log(`[Scheduler] Started automated monitoring for ${targets.length} active targets.`);
    } catch (error) {
        console.error('[Scheduler] Initialization failed:', error.message);
    }

    initRetention();
};

// Daily cleanup so monitoring_results does not grow forever.
// Keep N days (RESULT_RETENTION_DAYS, default 30). Runs every day at 03:00.
const initRetention = () => {
    if (retentionJob) return;
    const days = Number(process.env.RESULT_RETENTION_DAYS) || 30;

    retentionJob = cron.schedule('0 3 * * *', async () => {
        try {
            const [result] = await pool.query(
                'DELETE FROM monitoring_results WHERE checked_at < UTC_TIMESTAMP() - INTERVAL ? DAY',
                [days]
            );
            console.log(`[Retention] Deleted ${result.affectedRows} results older than ${days} days.`);
        } catch (error) {
            console.error('[Retention] Cleanup failed:', error.message);
        }
    });
};

// Used for graceful shutdown.
export const stopAllJobs = () => {
    for (const id of [...activeJobs.keys()]) unscheduleTarget(id);
    if (retentionJob) {
        retentionJob.stop();
        retentionJob = null;
    }
};
