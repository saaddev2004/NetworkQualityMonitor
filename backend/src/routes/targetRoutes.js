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

const router = express.Router();

router.post('/', validateTarget, createTarget);
router.get('/', getTargets);
router.post('/:id/check', runManualCheck); 

// Naye routes add karein:
router.get('/:id', getTargetById);
router.patch('/:id', validateTarget, updateTarget);
router.delete('/:id', deleteTarget);
router.patch('/:id/enabled', toggleTargetEnabled);

export default router;