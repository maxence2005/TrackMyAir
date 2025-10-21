import { Router } from 'express';
import { AirlineController } from '../controllers/airline.controller';

const router = Router();

// --- SECTION C : Airlines ---

// ✅ Obtenir toutes les compagnies
router.get('/', AirlineController.getAllAirlines);

// ✅ Comparer deux compagnies
router.get('/compare/:id1/:id2', AirlineController.compareAirlinesNetworks);

// ✅ Top compagnies par couverture
router.get('/top-coverage', AirlineController.getTopAirlinesByCoverage);

// ✅ Obtenir les compagnies desservant un aéroport donné
router.get('/serving/:id', AirlineController.getAirlinesServingAirport);

// --- Routes paramétrées par compagnie ---

// ✅ Obtenir toutes les routes d’une compagnie donnée
router.get('/:id/routes', AirlineController.getRoutesByAirline);

// ✅ Obtenir les routes exclusives d’une compagnie donnée
router.get('/:id/exclusive', AirlineController.getExclusiveRoutes);


export default router;
