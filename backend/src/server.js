import './config/env.js';
import app from './app.js';
import pool from './config/db.js';
import { initScheduler, stopAllJobs } from './scheduler/scheduler.js';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    initScheduler();
});

// Graceful shutdown: stop timers, finish open requests, close the DB pool.
const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down...`);
    stopAllJobs();
    server.close(async () => {
        await pool.end().catch(() => {});
        process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref(); // force exit if something hangs
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
