import express from 'express';
import { createTarget, getTargets } from '../controllers/targetController.js';
import { validateTarget } from '../middleware/validate.js';

const router = express.Router();

router.post('/', validateTarget, createTarget);
router.get('/', getTargets);

export default router;