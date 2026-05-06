import { Router } from 'express';
import { getDestinationAutocomplete, getPlacesByCity } from '../controllers/tripController.js';

const router = Router();

router.get('/autocomplete', getDestinationAutocomplete);
router.get('/:city', getPlacesByCity);

export default router;
