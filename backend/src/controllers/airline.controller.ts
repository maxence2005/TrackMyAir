import { Request, Response } from 'express';
import { AirlineService } from '../services/airline.service';

export class AirlineController {

  static async getAllAirlines(req: Request, res: Response) {
    try {
      const airlines = await AirlineService.getAllAirlines();
      res.json(airlines);
    } catch (error) {
      console.error('Erreur dans getAllAirlines:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des compagnies aériennes' });
    }
  }
  static async getRoutesByAirline(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'airline_id manquant' });
      const data = await AirlineService.getRoutesByAirline(Number(id));
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la récupération des routes' });
    }
  }

  static async compareAirlinesNetworks(req: Request, res: Response) {
    try {
      const airline1_id = Number(req.params.id1);
      const airline2_id = Number(req.params.id2);
      if (!airline1_id || !airline2_id)
        return res.status(400).json({ error: 'airline1_id et airline2_id sont requis' });
      const data = await AirlineService.compareAirlinesNetworks(airline1_id, airline2_id);
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la comparaison des réseaux' });
    }
  }

  static async getExclusiveRoutes(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'airline_id manquant' });
      const data = await AirlineService.getExclusiveRoutes(Number(id));
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la récupération des routes exclusives' });
    }
  }

  static async getAirlineRouteCounts(_req: Request, res: Response) {
    try {
      const data = await AirlineService.getAirlineRouteCounts();
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la récupération des comptes de routes' });
    }
  }

  static async getTopAirlinesByCoverage(req: Request, res: Response) {
    try {
      const data = await AirlineService.getTopAirlinesByCoverage();
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la récupération du top des compagnies' });
    }
  }

  static async getAirlinesServingAirport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'airport_id manquant' });
      const data = await AirlineService.getAirlinesServingAirport(Number(id));
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur lors de la récupération des compagnies desservant l'aéroport" });
    }
  }
}
