import cron from 'node-cron';
import pool from '../config/db.js';
import { executeCheck } from '../services/monitorService.js';
import { createEvent } from '../services/eventService.js';

// Active jobs ko track karne ke liye Map taake hum unhein update/cancel kar sakein
const activeJobs = new Map();

const processTarget = async (target) => {
    try {
        console.log(`[Scheduler] Checking target: ${target.name} (${target.address})`);
        
        // 1. Monitoring service run karein
        const result = await executeCheck(target);

        // 2. Threshold evaluator: Result status tay karein
        let newStatus = result.isAvailable ? 'online' : 'offline';
        if (result.isAvailable) {
            if (result.responseTimeMs >= target.critical_threshold_ms) {
                newStatus = 'critical';
            } else if (result.responseTimeMs >= target.warning_threshold_ms) {
                newStatus = 'warning';
            }
        }

        const previousStatus = target.current_status;

        // 3. Events Generator: Sirf tab event banayein jab state tabdeel (transition) ho
        if (previousStatus && previousStatus !== 'unknown' && previousStatus !== newStatus) {
            if (previousStatus === 'offline' && result.isAvailable) {
                await createEvent(target.id, 'recovery', 'info', `Recovered: latest check online (${result.responseTimeMs} ms)`);
            } else if (newStatus === 'offline') {
                await createEvent(target.id, 'offline', 'critical', `Target unreachable: ${result.errorMessage || 'Connection timed out'}`);
            } else if (newStatus === 'critical') {
                await createEvent(target.id, 'critical', 'critical', `Response time ${result.responseTimeMs} ms exceeded critical threshold ${target.critical_threshold_ms} ms`);
            } else if (newStatus === 'warning') {
                await createEvent(target.id, 'warning', 'warning', `Response time ${result.responseTimeMs} ms exceeded warning threshold ${target.warning_threshold_ms} ms`);
            }
        }

        // 4. MySQL mein result history save karein
        const insertQuery = `
            INSERT INTO monitoring_results 
            (target_id, checked_at, is_available, response_time_ms, http_status_code, result_status, error_type, error_message, created_at)
            VALUES (?, UTC_TIMESTAMP(), ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())
        `;
        await pool.query(insertQuery, [
            target.id, result.isAvailable, result.responseTimeMs, result.httpStatusCode, newStatus, result.errorType, result.errorMessage
        ]);

        // 5. Target ka current status aur last check time update karein
        await pool.query('UPDATE monitored_targets SET current_status = ?, last_checked_at = UTC_TIMESTAMP() WHERE id = ?', [newStatus, target.id]);
        
        // Memory mein bhi target update kar dein
        target.current_status = newStatus;

        console.log(`[Scheduler] Result saved for ${target.name} - Status: ${newStatus}`);
    } catch (error) {
        console.error(`[Scheduler] Error processing target ${target.id}:`, error.message);
    }
};

// Target ko schedule/register karne ka function
export const scheduleTarget = (target) => {
    // Agar pehle se job chal rahi hai toh usay stop karein (Update/Cancel case)
    if (activeJobs.has(target.id)) {
        activeJobs.get(target.id).stop();
        activeJobs.delete(target.id);
    }

    // Agar target disabled hai, toh mazeed schedule na karein
    if (!target.is_enabled) return;

    // Interval ko cron format mein convert karein
    let cronExpression = `*/${target.check_interval_seconds} * * * * *`;
    if (target.check_interval_seconds >= 60) {
        cronExpression = `* * * * *`; 
    }

    const job = cron.schedule(cronExpression, () => {
        processTarget(target);
    });

    activeJobs.set(target.id, job);
};

// Server start hone par tamam enabled targets ko load karna
export const initScheduler = async () => {
    try {
        const [targets] = await pool.query('SELECT * FROM monitored_targets WHERE is_enabled = true');
        targets.forEach(scheduleTarget);
        console.log(`[Scheduler] Started automated monitoring for ${targets.length} active targets.`);
    } catch (error) {
        console.error('[Scheduler] Initialization failed:', error.message);
    }
};