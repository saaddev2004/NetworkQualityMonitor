import pool from '../config/db.js';

// Convert array of objects to CSV format manually since we can't install new packages right now
const jsonToCsv = (data) => {
    if (!data || !data.length) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
        Object.values(row).map(val => {
            if (val === null || val === undefined) return '';
            let str = String(val).replace(/"/g, '""');
            // Check if string contains comma, quote, or newline
            if (str.search(/("|,|\n)/g) >= 0) {
                str = `"${str}"`;
            }
            return str;
        }).join(',')
    );
    return [headers, ...rows].join('\n');
};

export const exportTargetsCSV = async (req, res, next) => {
    try {
        const [targets] = await pool.query('SELECT * FROM monitored_targets ORDER BY created_at DESC');
        
        // Escape formula injection requirement from Blueprint
        const safeTargets = targets.map(t => {
            let name = t.name;
            if (name && ['=', '+', '-', '@'].includes(name.charAt(0))) {
                name = "'" + name;
            }
            return { ...t, name };
        });

        const csv = jsonToCsv(safeTargets);
        res.header('Content-Type', 'text/csv');
        res.attachment('targets.csv');
        res.status(200).send(csv);
    } catch (error) {
        next(error);
    }
};

export const exportResultsCSV = async (req, res, next) => {
    try {
        const { targetId, from, to } = req.query;
        let query = 'SELECT * FROM monitoring_results WHERE 1=1';
        const params = [];

        if (targetId) {
            query += ' AND target_id = ?';
            params.push(targetId);
        }
        if (from) {
            query += ' AND checked_at >= ?';
            params.push(from);
        }
        if (to) {
            query += ' AND checked_at <= ?';
            params.push(to);
        }

        query += ' ORDER BY checked_at DESC';

        const [results] = await pool.query(query, params);
        
        const csv = jsonToCsv(results);
        res.header('Content-Type', 'text/csv');
        res.attachment('results.csv');
        res.status(200).send(csv);
    } catch (error) {
        next(error);
    }
};