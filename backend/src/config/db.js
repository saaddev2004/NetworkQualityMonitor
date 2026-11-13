
import './env.js';
import mysql from 'mysql2/promise';
import fs from 'node:fs';

const isTiDB = process.env.DB_HOST?.includes('tidbcloud.com');

let sslConfig;

if (isTiDB) {
    const ca = process.env.DB_CA_CERT_BASE64
        ? Buffer.from(process.env.DB_CA_CERT_BASE64, 'base64').toString('utf8')
        : fs.readFileSync(
            process.env.DB_CA_PATH || './certs/ca.pem',
            'utf8'
        );

    sslConfig = {
        ca,
        rejectUnauthorized: true
    };
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: 'Z',
    decimalNumbers: true,

    ...(sslConfig && { ssl: sslConfig })
});

export default pool;
