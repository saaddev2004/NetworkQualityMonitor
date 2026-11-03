import pool from '../config/db.js';

// Creates an event row. Pass { resolved: true } for events that are
// informational and should never show up as "active" (e.g. recovery).
export const createEvent = async (targetId, eventType, severity, description, { resolved = false } = {}) => {
    try {
        const query = `
            INSERT INTO events
            (target_id, event_type, severity, description, occurred_at, resolved_at, is_resolved, created_at)
            VALUES (?, ?, ?, ?, UTC_TIMESTAMP(3), ${resolved ? 'UTC_TIMESTAMP(3)' : 'NULL'}, ?, UTC_TIMESTAMP(3))
        `;
        await pool.query(query, [targetId, eventType, severity, description, resolved]);
        console.log(`[EVENT] Target ID: ${targetId} | Type: ${eventType.toUpperCase()} | ${description}`);
    } catch (error) {
        console.error('[Event Service] Error creating event:', error.message);
    }
};

// Marks every still-open event of a target as resolved, except events whose
// type equals `keepType` (the state the target is currently in).
// Pass keepType = null to resolve everything (e.g. target disabled).
export const resolveOpenEvents = async (targetId, keepType = null) => {
    try {
        const [result] = await pool.query(
            `UPDATE events
             SET is_resolved = TRUE, resolved_at = UTC_TIMESTAMP(3)
             WHERE target_id = ? AND is_resolved = FALSE AND (? IS NULL OR event_type <> ?)`,
            [targetId, keepType, keepType]
        );
        return result.affectedRows;
    } catch (error) {
        console.error('[Event Service] Error resolving events:', error.message);
        return 0;
    }
};
