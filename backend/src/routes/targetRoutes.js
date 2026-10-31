import express from 'express';
import { 
    createTarget, 
    getTargets, 
    runManualCheck,
    getTargetById,      
    updateTarget,       
    deleteTarget,       
    toggleTargetEnabled 
} from '../controllers/targetController.js'; 
import { validateTarget } from '../middleware/validate.js';
import { getTargetHistory, getTargetUptime } from '../controllers/historyController.js';
import { exportTargetsCSV, exportResultsCSV } from '../controllers/reportController.js';

const router = express.Router();

// 1. Specific routes MUST come before /:id routes
router.get('/reports/targets.csv', exportTargetsCSV);
router.get('/reports/results.csv', exportResultsCSV);

// 2. Base routes
router.post('/', validateTarget, createTarget);
router.get('/', getTargets);

// 3. Dynamic /:id routes
router.post('/:id/check', runManualCheck); 
router.get('/:id', getTargetById);
router.patch('/:id', validateTarget, updateTarget);
router.delete('/:id', deleteTarget);
router.patch('/:id/enabled', toggleTargetEnabled);
router.get('/:id/history', getTargetHistory);
router.get('/:id/uptime', getTargetUptime);

export default router;