
import express from 'express';
import { runScheduledMonitoring } from '../controllers/monitoringController.js';
import verifyCronSecret from '../middleware/verifyCronSecret.js';

const router = express.Router();

router.post('/run', verifyCronSecret, runScheduledMonitoring);

export default router;
