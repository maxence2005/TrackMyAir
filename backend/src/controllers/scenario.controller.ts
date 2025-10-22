import { Request, Response } from 'express';
import { ScenarioService } from '../services/senario.service';

export class ScenarioController {
  // 22. Supprimer un hub
  static async deleteHub(req: Request, res: Response) {
    try {
      const { airport_id } = req.params;
      const result = await ScenarioService .deleteHub(Number(airport_id));
      res.json({ message: `Hub ${airport_id} supprimé`, ...result });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la suppression du hub' });
    }
  }

  // 23. Ajouter une route hypothétique
  static async addHypotheticalRoute(req: Request, res: Response) {
    try {
      const { fromId, toId, distance, stops } = req.body;
      const route = await ScenarioService .createHypotheticalRoute(
        Number(fromId),
        Number(toId),
        Number(distance) || 500,
        Number(stops) || 0
      );
      res.status(201).json(route);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la création de la route hypothétique' });
    }
  }

  // 24. Désactiver temporairement les hubs les plus connectés
  static async deactivateTopHubs(req: Request, res: Response) {
    try {
      const { limit } = req.query;
      const hubs = await ScenarioService .deactivateTopHubs(Number(limit) || 3);
      res.json(hubs);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la désactivation des hubs' });
    }
  }

  // 25. Créer des routes alternatives pour tester la redondance
  static async createAlternativeRoutes(req: Request, res: Response) {
    try {
      const { limit } = req.query;
      const routes = await ScenarioService .createAlternativeRoutes(Number(limit) || 5);
      res.status(201).json(routes);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la création des routes alternatives' });
    }
  }
}
