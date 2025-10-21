import { Router } from 'express';
import { HubController } from '../controllers/hub.controller';

const router = Router();

router.get('/top', HubController.getTop10Hubs);
router.get('/closeness', HubController.getClosenessCentrality);
router.get('/betweenness', HubController.getBetweennessCentrality);
router.get('/communities', HubController.detectCommunitiesLouvain);

export default router;
