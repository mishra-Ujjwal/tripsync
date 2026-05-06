import { Router } from 'express';
import {
  deleteTrip,
  generateTrip,
  getTripById,
  getTrips,
  regenerateDay,
  saveGeneratedTrip,
} from '../controllers/tripController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.post('/generate', generateTrip);
router.post('/', saveGeneratedTrip);
router.post('/regenerate-day', regenerateDay);
router.get('/', getTrips);
router.get('/:id', getTripById);
router.delete('/:id', deleteTrip);

export default router;
