import { Request, Response } from 'express';
import { RouteService } from '../services/route.service';

export class RouteController {
  static async getRoutesFromAirport(req: Request, res: Response) {
    try {
      const airport_id = Number(req.params.id);
      const routes = await RouteService.getRoutesFromAirport(airport_id);
      res.json(routes);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }

  static async getAverageStops(req: Request, res: Response) {
    try {
      const avg = await RouteService.getAverageStops();
      res.json({ avg_stops: avg });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }

  static async getShortestPathStops(req: Request, res: Response) {
    try {
      const { start, end } = req.params;
      const path = await RouteService.getShortestPathStops(Number(start), Number(end));
      res.json(path);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }

  static async getLongestPathStops(req: Request, res: Response) {
    try {
      const { start, end } = req.params;
      const path = await RouteService.getLongestPathStops(Number(start), Number(end));
      res.json(path);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }

  static async getShortestPathDistance(req: Request, res: Response) {
    try {
      const { start, end } = req.params;
      const path = await RouteService.getShortestPathDistance(Number(start), Number(end));
      res.json(path);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }

  static async getLongestPathDistance(req: Request, res: Response) {
    try {
      const { start, end } = req.params;
      const path = await RouteService.getLongestPathDistance(Number(start), Number(end));
      res.json(path);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }

  static async deleteIsolatedAirports(req: Request, res: Response) {
    try {
      const result = await RouteService.deleteIsolatedAirports();
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }

  static async getAverageDist(req: Request, res: Response) {
    try {
      const avg = await RouteService.getAverageRouteDistance();
      res.json({ avg_dist: avg });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }
}
