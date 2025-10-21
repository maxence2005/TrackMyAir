import driver from '../config/neo4j';

export class RouteService {

  // 6️⃣ Routes depuis un aéroport (avec coordonnées)
  static async getRoutesFromAirport(airport_id: number) {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (a:Airport {airport_id: $airport_id})-[:HAS_ROUTE]->(r:Route)<-[:HAS_ROUTE]-(dest:Airport)
        OPTIONAL MATCH (al:Airline)-[:OPERATES]->(r)
        RETURN 
          a.name AS from, 
          dest.name AS to, 
          a.latitude AS fromLatitude, 
          a.longitude AS fromLongitude,
          dest.latitude AS toLatitude, 
          dest.longitude AS toLongitude,
          r.stops AS stops, 
          r.distance AS distance, 
          collect(DISTINCT al.name) AS airlines
        ORDER BY distance ASC
        `,
        { airport_id }
      );

      return result.records.map(r => ({
        from: r.get('from'),
        to: r.get('to'),
        fromLatitude: r.get('fromLatitude')?.toNumber?.() ?? r.get('fromLatitude'),
        fromLongitude: r.get('fromLongitude')?.toNumber?.() ?? r.get('fromLongitude'),
        toLatitude: r.get('toLatitude')?.toNumber?.() ?? r.get('toLatitude'),
        toLongitude: r.get('toLongitude')?.toNumber?.() ?? r.get('toLongitude'),
        stops: r.get('stops'),
        distance: r.get('distance'),
        airlines: r.get('airlines')
      }));
    } finally {
      await session.close();
    }
  }

  // 7️⃣ Escales moyennes
  static async getAverageStops() {
    const session = driver.session();
    try {
      const result = await session.run(`MATCH (r:Route) RETURN avg(r.stops) AS avg_stops`);
      return result.records[0].get('avg_stops');
    } finally {
      await session.close();
    }
  }

  // 8️⃣ Chemin le plus court (escales) → format front identique à ton exemple
  static async getShortestPathStops(start_id: number, end_id: number) {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (start:Airport {airport_id: $start_id})-[:HAS_ROUTE]->(r:Route)<-[:HAS_ROUTE]-(end:Airport {airport_id: $end_id})
        RETURN start.name AS from, start.latitude AS fromLatitude, start.longitude AS fromLongitude,
              end.name AS to, end.latitude AS toLatitude, end.longitude AS toLongitude,
              r.distance AS distance, r.stops AS stops
        ORDER BY r.stops ASC
        LIMIT 1
        `,
        { start_id, end_id }
      );

      return result.records.map(r => ({
        from: r.get('from'),
        fromLatitude: r.get('fromLatitude'),
        fromLongitude: r.get('fromLongitude'),
        to: r.get('to'),
        toLatitude: r.get('toLatitude'),
        toLongitude: r.get('toLongitude'),
        distance: r.get('distance'),
        stops: r.get('stops')
      }));
    } finally {
      await session.close();
    }
  }


  // 9️⃣ Chemin le plus long (escales) → format front identique à ton exemple
  static async getLongestPathStops(start_id: number, end_id: number) {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (start:Airport {airport_id: $start_id})-[:HAS_ROUTE]->(r:Route)<-[:HAS_ROUTE]-(end:Airport {airport_id: $end_id})
        RETURN start.name AS from, start.latitude AS fromLatitude, start.longitude AS fromLongitude,
              end.name AS to, end.latitude AS toLatitude, end.longitude AS toLongitude,
              r.distance AS distance, r.stops AS stops
        ORDER BY r.stops DESC
        LIMIT 1
        `,
        { start_id, end_id }
      );

      return result.records.map(r => ({
        from: r.get('from'),
        fromLatitude: r.get('fromLatitude'),
        fromLongitude: r.get('fromLongitude'),
        to: r.get('to'),
        toLatitude: r.get('toLatitude'),
        toLongitude: r.get('toLongitude'),
        distance: r.get('distance'),
        stops: r.get('stops')
      }));
    } finally {
      await session.close();
    }
  }


  // 🔟 Chemin le plus court (distance totale) → coordonnées incluses
  static async getShortestPathDistance(start_id: number, end_id: number) {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (start:Airport {airport_id: $start_id})-[:HAS_ROUTE]->(r:Route)<-[:HAS_ROUTE]-(end:Airport {airport_id: $end_id})
        RETURN start.name AS from, start.latitude AS fromLatitude, start.longitude AS fromLongitude,
              end.name AS to, end.latitude AS toLatitude, end.longitude AS toLongitude,
              r.distance AS distance, r.stops AS stops
        ORDER BY r.distance ASC
        LIMIT 1
        `,
        { start_id, end_id }
      );

      return result.records.map(r => ({
        from: r.get('from'),
        fromLatitude: r.get('fromLatitude'),
        fromLongitude: r.get('fromLongitude'),
        to: r.get('to'),
        toLatitude: r.get('toLatitude'),
        toLongitude: r.get('toLongitude'),
        distance: r.get('distance'),
        stops: r.get('stops')
      }));
    } finally {
      await session.close();
    }
  }

  // 1️⃣1️⃣ Chemin le plus long (distance) → coordonnées incluses
  static async getLongestPathDistance(start_id: number, end_id: number) {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (start:Airport {airport_id: $start_id})-[:HAS_ROUTE]->(r:Route)<-[:HAS_ROUTE]-(end:Airport {airport_id: $end_id})
        RETURN start.name AS from, start.latitude AS fromLatitude, start.longitude AS fromLongitude,
              end.name AS to, end.latitude AS toLatitude, end.longitude AS toLongitude,
              r.distance AS distance, r.stops AS stops
        ORDER BY r.distance DESC
        LIMIT 1
        `,
        { start_id, end_id }
      );

      return result.records.map(r => ({
        from: r.get('from'),
        fromLatitude: r.get('fromLatitude'),
        fromLongitude: r.get('fromLongitude'),
        to: r.get('to'),
        toLatitude: r.get('toLatitude'),
        toLongitude: r.get('toLongitude'),
        distance: r.get('distance'),
        stops: r.get('stops')
      }));
    } finally {
      await session.close();
    }
  }

  // 1️⃣2️⃣ Supprimer les aéroports isolés
  static async deleteIsolatedAirports() {
    const session = driver.session();
    try {
      await session.run(`
        MATCH (a:Airport)
        WHERE NOT (a)--()
        DELETE a
      `);
      return { success: true };
    } finally {
      await session.close();
    }
  }

  // 113 Moyenne des distances
  static async getAverageRouteDistance() {
    const session = driver.session();
    try {
      const result = await session.run(`
        MATCH (r:Route)
        RETURN avg(r.distance) AS avg_distance
      `);
      return result.records[0].get('avg_distance');
    } finally {
      await session.close();
    }
  }
}
