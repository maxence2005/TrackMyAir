import { Router } from 'express';
import { ScenarioController } from '../controllers/scenario.controller';

const router = Router();

router.post('/airlines/merge', ScenarioController.mergeAirlines);

// 23. Ajouter une route hypothétique
router.post('/routes/hypothetical', ScenarioController.addHypotheticalRoute);

// 24. Désactiver temporairement les hubs les plus connectés
router.put('/hubs/deactivate', ScenarioController.deactivateTopHubs);

export default router;
