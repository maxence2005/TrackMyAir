import { Request, Response } from 'express';
import { ScenarioService } from '../services/senario.service';

export class ScenarioController {
  static async mergeAirlines(req: Request, res: Response) {
    try {
      const { airlineId1, airlineId2, newAirlineName } = req.body;

      if (!airlineId1 || !airlineId2) {
        return res.status(400).json({ error: 'Les identifiants des deux compagnies sont requis.' });
      }

      const result = await ScenarioService.mergeAirlines(
        Number(airlineId1),
        Number(airlineId2),
        newAirlineName
      );

      res.status(201).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la fusion des compagnies.' });
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

}
