import express from 'express';
import { getUserProfile, getImpactStats } from '../controllers/userController.js';

const router = express.Router();

router.get('/stats/impact', getImpactStats);
router.get('/:id', getUserProfile);

export default router;
