import './env.js';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // All timestamps are stored with UTC_TIMESTAMP(); read them back as UTC
    // so the API returns correct ISO strings on any server timezone.
    timezone: 'Z',
    // Return DECIMAL columns (response_time_ms) as numbers, not strings.
    decimalNumbers: true
});

export default pool;
