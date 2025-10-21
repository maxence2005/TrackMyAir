import { Request, Response } from 'express';
import { ExploreService } from '../services/explore.service';

export class ExploreController {
  static async getAirports(req: Request, res: Response) {
    try {
      const data = await ExploreService.getAllAirports();
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la récupération des aéroports' });
    }
  }

    static async getAirportById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const airport = await ExploreService.getAirportById(Number(id));
            res.json(airport);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }


  static async addAirport(req: Request, res: Response) {
    try {
      const newAirport = await ExploreService.addAirport(req.body);
      res.status(201).json(newAirport);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la création de l’aéroport' });
    }
  }

  static async updateAirline(req: Request, res: Response) {
    try {
      const { airline_id, name } = req.body;
      const updated = await ExploreService.updateAirlineName(airline_id, name);
      if (!updated) return res.status(404).json({ message: 'Compagnie non trouvée' });
      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la mise à jour de la compagnie' });
    }
  }

  static async deleteAirport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await ExploreService.deleteAirportById(Number(id));
      if (!result.deleted)
        return res.status(404).json({ message: `Aéroport ${id} introuvable` });
      res.json({ message: `Aéroport ${id} supprimé` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la suppression de l’aéroport' });
    }
  }
}
