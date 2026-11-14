
import './config/env.js';
import express from 'express';
import cors from 'cors';
import pool from './config/db.js';
import targetRoutes from './routes/targetRoutes.js';
import monitoringRoutes from './routes/monitoringRoutes.js';
import { getDashboardSummary } from './controllers/dashboardController.js';
import { getEvents } from './controllers/eventController.js';
import { getSchedulerStatus } from './scheduler/scheduler.js';

// The Express app, without app.listen(), so tests can import it.
const app = express();

app.use(cors());
app.use(express.json());

// Health & Engine Telemetry Check API
app.get('/api/v1/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        const scheduler = getSchedulerStatus();

        res.status(200).json({
            status: 'ok',
            message: 'Application and Database are healthy',
            timestamp: new Date().toISOString(),
            database: {
                status: 'connected',
                name: process.env.DB_NAME || 'network_monitor_db'
            },
            engine: {
                status: scheduler.status,
                isRunning: scheduler.isRunning,
                activeJobsCount: scheduler.activeJobsCount,
                scheduledTargetIds: scheduler.scheduledTargetIds,
                retentionJob: scheduler.retentionJobActive ? 'active' : 'inactive',
                retentionDays: Number(process.env.RESULT_RETENTION_DAYS) || 30,
                uptimeSeconds: Math.floor(process.uptime())
            },
            system: {
                nodeVersion: process.version,
                platform: process.platform,
                environment: process.env.NODE_ENV || 'development'
            }
        });
    } catch (error) {
        console.error('Database connection error:', error.message);

        res.status(503).json({
            error: {
                code: 'DB_UNAVAILABLE',
                message: 'Database is unavailable'
            }
        });
    }
});

app.get('/api/v1/dashboard/summary', getDashboardSummary);
app.get('/api/v1/events', getEvents);
app.use('/api/v1/targets', targetRoutes);
app.use('/api/v1/monitoring', monitoringRoutes);

// Unknown API route -> JSON 404 (instead of Express's default HTML page)
app.use('/api', (req, res) => {
    res.status(404).json({
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.method} ${req.originalUrl} not found`
        }
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            error: {
                code: 'INVALID_JSON',
                message: 'Request body is not valid JSON'
            }
        });
    }

    console.error(err.stack);

    res.status(500).json({
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected internal error occurred'
        }
    });
});

export default app;
