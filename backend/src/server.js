import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.js';
import targetRoutes from './routes/targetRoutes.js';
import { initScheduler } from './scheduler/scheduler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check API
app.get('/api/v1/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.status(200).json({
            status: 'ok',
            message: 'Application and Database are healthy',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(503).json({
            error: {
                code: 'DB_UNAVAILABLE',
                message: 'Database is unavailable'
            }
        });
    }
});
app.use('/api/v1/targets', targetRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected internal error occurred'
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    initScheduler();
});