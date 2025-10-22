import driver from '../config/neo4j';
export class ScenarioService {
  // 22. Supprimer un hub
  static async deleteHub(airport_id: number) {
    const session = driver.session();
    try {
      await session.run(
        `MATCH (hub:Airport {airport_id: $airport_id})
         DETACH DELETE hub`,
        { airport_id }
      );
      return { success: true };
    } finally {
      await session.close();
    }
  }

  // 23. Ajouter une route hypothétique
  static async createHypotheticalRoute(fromId: number, toId: number, distance = 500, stops = 0) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (a1:Airport {airport_id: $fromId}), (a2:Airport {airport_id: $toId})
         CREATE (a1)-[:Route {stops: $stops, distance: $distance}]->(a2)
         RETURN a1.name AS from, a1.latitude AS fromLatitude, a1.longitude AS fromLongitude,
                a2.name AS to, a2.latitude AS toLatitude, a2.longitude AS toLongitude,
                $distance AS distance, $stops AS stops`,
        { fromId, toId, distance, stops }
      );
      return result.records.map(r => r.toObject());
    } finally {
      await session.close();
    }
  }

  // 24. Simulation de panne partielle : désactiver les hubs les plus connectés
  static async deactivateTopHubs(limit = 3) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (hub:Airport)
         WITH hub, size((hub)--()) AS connections
         ORDER BY connections DESC
         LIMIT $limit
         SET hub.status = 'inactive'
         RETURN hub.name AS hub, hub.status AS status, connections AS nb_connections`,
        { limit }
      );
      return result.records.map(r => r.toObject());
    } finally {
      await session.close();
    }
  }

  // 25. Création de routes alternatives pour tester la redondance
  static async createAlternativeRoutes(limit = 5) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (a:Airport), (b:Airport)
         WHERE a.airport_id < b.airport_id AND a.status <> 'inactive' AND b.status <> 'inactive'
         WITH a, b LIMIT $limit
         CREATE (a)-[:Route {stops:1, distance: rand() * 1000 + 200}]->(b)
         RETURN a.name AS from, a.latitude AS fromLatitude, a.longitude AS fromLongitude,
                b.name AS to, b.latitude AS toLatitude, b.longitude AS toLongitude,
                1 AS stops, rand() * 1000 + 200 AS distance`,
        { limit }
      );
      return result.records.map(r => r.toObject());
    } finally {
      await session.close();
    }
  }
}
