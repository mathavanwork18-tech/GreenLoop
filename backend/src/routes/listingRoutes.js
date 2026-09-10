import express from 'express';
import {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  checkCompatibility,
} from '../controllers/listingController.js';

const router = express.Router();

router.get('/', getListings);
router.post('/', createListing);
router.post('/check-compatibility', checkCompatibility);
router.get('/:id', getListingById);
router.put('/:id', updateListing);
router.delete('/:id', deleteListing);

export default router;
