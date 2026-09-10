import express from 'express';
import {
  createRecyclingRequest,
  getRecyclingRequests,
  getRecyclingCenters,
} from '../controllers/recyclingController.js';

const router = express.Router();

router.post('/request', createRecyclingRequest);
router.get('/requests', getRecyclingRequests);
router.get('/centers', getRecyclingCenters);

export default router;
