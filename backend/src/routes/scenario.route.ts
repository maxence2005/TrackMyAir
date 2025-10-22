import { Router } from 'express';
import { ScenarioController } from '../controllers/scenario.controller';

const router = Router();

// 22. Supprimer un hub
router.delete('/hub/:airport_id', ScenarioController.deleteHub);

// 23. Ajouter une route hypothétique
router.post('/routes/hypothetical', ScenarioController.addHypotheticalRoute);

// 24. Désactiver temporairement les hubs les plus connectés
router.put('/hubs/deactivate', ScenarioController.deactivateTopHubs);

// 25. Créer des routes alternatives pour tester la redondance
router.post('/routes/alternative', ScenarioController.createAlternativeRoutes);

export default router;
