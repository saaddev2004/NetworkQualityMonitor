import pool from '../config/db.js';

// GET /targets/:id/history
export const getTargetHistory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { from, to, page = 1, limit = 50 } = req.query;

        let query = 'SELECT * FROM monitoring_results WHERE target_id = ?';
        const params = [id];

        if (from) {
            query += ' AND checked_at >= ?';
            params.push(from);
        }
        if (to) {
            query += ' AND checked_at <= ?';
            params.push(to);
        }

        query += ' ORDER BY checked_at DESC LIMIT ? OFFSET ?';
        const offset = (Number(page) - 1) * Number(limit);
        params.push(Number(limit), offset);

        const [results] = await pool.query(query, params);
        res.status(200).json(results);
    } catch (error) {
        next(error);
    }
};

// GET /targets/:id/uptime
export const getTargetUptime = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Blueprint rule: Uptime = (Successful eligible checks / All eligible completed checks) * 100
        
        // Pehle tamam eligible checks nikalein (jahan status 'disabled' ya 'unknown' nahi tha)
        const [totalChecksRow] = await pool.query(
            `SELECT COUNT(*) as total FROM monitoring_results 
             WHERE target_id = ? AND result_status NOT IN ('disabled', 'unknown')`, 
             [id]
        );
        const total = totalChecksRow[0].total;

        // Phir sirf successful checks nikalein
        const [successChecksRow] = await pool.query(
            `SELECT COUNT(*) as success FROM monitoring_results 
             WHERE target_id = ? AND is_available = true AND result_status NOT IN ('disabled', 'unknown')`, 
             [id]
        );
        const success = successChecksRow[0].success;

        let uptimePercentage = 0;
        if (total > 0) {
            uptimePercentage = (success / total) * 100;
        }

        res.status(200).json({
            uptimePercentage: uptimePercentage.toFixed(2) + '%',
            successfulChecks: success,
            totalEligibleChecks: total
        });
    } catch (error) {
        next(error);
    }
};