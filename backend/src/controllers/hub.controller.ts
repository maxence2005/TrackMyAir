import { Request, Response } from 'express';
import { HubService } from '../services/hub.service';

export class HubController {
  static async getTop10Hubs(_req: Request, res: Response) {
    try {
      const data = await HubService.getTopDegreeHubs();
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la récupération des hubs' });
    }
  }

  static async getClosenessCentrality(_req: Request, res: Response) {
    try {
      const data = await HubService.getClosenessCentrality();
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors du calcul de la centralité de proximité' });
    }
  }

  static async getBetweennessCentrality(_req: Request, res: Response) {
    try {
      const data = await HubService.getBetweennessCentrality();
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors du calcul de la centralité d’intermédiarité' });
    }
  }

  static async detectCommunitiesLouvain(_req: Request, res: Response) {
    try {
      const data = await HubService.getLouvainCommunities();
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la détection des communautés' });
    }
  }
}
