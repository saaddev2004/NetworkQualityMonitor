import pool from '../config/db.js';

// Event generate karne ka function
export const createEvent = async (targetId, eventType, severity, description) => {
    try {
        const query = `
            INSERT INTO events 
            (target_id, event_type, severity, description, occurred_at, created_at)
            VALUES (?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())
        `;
        await pool.query(query, [targetId, eventType, severity, description]);
        console.log(`[EVENT] Target ID: ${targetId} | Type: ${eventType.toUpperCase()} | ${description}`);
    } catch (error) {
        console.error('[Event Service] Error creating event:', error.message);
    }
};