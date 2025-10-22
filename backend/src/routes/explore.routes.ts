import { Router } from 'express';
import { ExploreController } from '../controllers/explore.controller';

const router = Router();

// /api/explore
router.get('/airports', ExploreController.getAirports);
router.get('/airports/:id', ExploreController.getAirportById);
router.post('/airports', ExploreController.addAirport);
router.put('/airlines', ExploreController.updateAirline);
router.put('/airports/update', ExploreController.updateAirport);
router.delete('/airports/:id', ExploreController.deleteAirport);

export default router;
