import { Router } from 'express';
import { RouteController } from '../controllers/route.controller';

const router = Router();

// 6. Routes d'un aéroport
router.get('/airport/:id', RouteController.getRoutesFromAirport);

// 7. Nombre d'escales moyen
router.get('/avg-stops', RouteController.getAverageStops);

// 8. Chemin le plus court (escales)
router.get('/shortest-stops/:start/:end', RouteController.getShortestPathStops);

// 9. Chemin le plus long (escales)
router.get('/longest-stops/:start/:end', RouteController.getLongestPathStops);

// 10. Chemin le plus court (distance)
router.get('/shortest-distance/:start/:end', RouteController.getShortestPathDistance);

// 11. Chemin le plus long (distance)
router.get('/longest-distance/:start/:end', RouteController.getLongestPathDistance);

// 12. Supprimer les aéroports isolé
router.delete('/isolated', RouteController.deleteIsolatedAirports);

router.get('/avg-distance', RouteController.getAverageDist);

export default router;
