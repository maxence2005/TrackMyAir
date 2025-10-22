import driver from '../config/neo4j';

export class RouteService {

  //  Routes depuis un aéroport (avec coordonnées)
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

  // Escales moyennes
  static async getAverageStops() {
    const session = driver.session();
    try {
      const result = await session.run(`MATCH (r:Route) RETURN avg(r.stops) AS avg_stops`);
      return result.records[0].get('avg_stops');
    } finally {
      await session.close();
    }
  }

   // Chemin le plus court (escales) → multi-étapes
  static async getShortestPathStops(start_id: number, end_id: number) {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH p = (start:Airport {airport_id: $start_id})-[:HAS_ROUTE*1..4]-(end:Airport {airport_id: $end_id})
        WITH p, start, end, length(p) AS stops
        ORDER BY stops ASC
        LIMIT 1
        RETURN
          start.name AS from,
          start.latitude AS fromLatitude,
          start.longitude AS fromLongitude,
          [n IN nodes(p)[1..-1] | {name: n.name, latitude: n.latitude, longitude: n.longitude}] AS via,
          end.name AS to,
          end.latitude AS toLatitude,
          end.longitude AS toLongitude,
          stops
        `,
        { start_id, end_id }
      );

      return result.records.map(r => ({
        from: r.get('from'),
        fromLatitude: r.get('fromLatitude'),
        fromLongitude: r.get('fromLongitude'),
        via : r.get('via'),
        to: r.get('to'),
        toLatitude: r.get('toLatitude'),
        toLongitude: r.get('toLongitude'),
        stops: r.get('stops')
      }));
    } finally {
      await session.close();
    }
  }

  // Chemin le plus long (escales) → multi-étapes
  static async getLongestPathStops(start_id: number, end_id: number) {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH p = (start:Airport {airport_id: $start_id})-[:HAS_ROUTE*1..4]-(end:Airport {airport_id: $end_id})
        WITH p, start, end, length(p) AS stops
        ORDER BY stops DESC
        LIMIT 1
        RETURN
          start.name AS from,
          start.latitude AS fromLatitude,
          start.longitude AS fromLongitude,
          [n IN nodes(p)[1..-1] | {name: n.name, latitude: n.latitude, longitude: n.longitude}] AS via,
          end.name AS to,
          end.latitude AS toLatitude,
          end.longitude AS toLongitude,
          stops
        `,
        { start_id, end_id }
      );

      return result.records.map(r => ({
        from: r.get('from'),
        fromLatitude: r.get('fromLatitude'),
        fromLongitude: r.get('fromLongitude'),
        via : r.get('via'),
        to: r.get('to'),
        toLatitude: r.get('toLatitude'),
        toLongitude: r.get('toLongitude'),
        stops: r.get('stops')
      }));
    } finally {
      await session.close();
    }
  }

  // Chemin le plus court (distance totale) → multi-étapes
  static async getShortestPathDistance(start_id: number, end_id: number) {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH p = (start:Airport {airport_id: $start_id})-[:HAS_ROUTE*1..4]-(end:Airport {airport_id: $end_id})
        WITH p, start, end, reduce(totalDistance = 0, r IN relationships(p) | totalDistance + r.distance) AS distance
        ORDER BY distance ASC
        LIMIT 1
        RETURN
          start.name AS from,
          start.latitude AS fromLatitude,
          start.longitude AS fromLongitude,
          [n IN nodes(p)[1..-1] | {name: n.name, latitude: n.latitude, longitude: n.longitude}] AS via,
          end.name AS to,
          end.latitude AS toLatitude,
          end.longitude AS toLongitude,
          distance,
          length(p) AS stops
        `,
        { start_id, end_id }
      );

      return result.records.map(r => ({
        from: r.get('from'),
        fromLatitude: r.get('fromLatitude'),
        fromLongitude: r.get('fromLongitude'),
        to: r.get('to'),
        via : r.get('via'),
        toLatitude: r.get('toLatitude'),
        toLongitude: r.get('toLongitude'),
        distance: r.get('distance'),
        stops: r.get('stops')
      }));
    } finally {
      await session.close();
    }
  }

  // Chemin le plus long (distance totale) → multi-étapes
  static async getLongestPathDistance(start_id: number, end_id: number) {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH p = (start:Airport {airport_id: $start_id})-[:HAS_ROUTE*1..4]-(end:Airport {airport_id: $end_id})
        WITH p, start, end, reduce(totalDistance = 0, r IN relationships(p) | totalDistance + r.distance) AS distance
        ORDER BY distance DESC
        LIMIT 1
        RETURN
          start.name AS from,
          start.latitude AS fromLatitude,
          start.longitude AS fromLongitude,
          [n IN nodes(p)[1..-1] | {name: n.name, latitude: n.latitude, longitude: n.longitude}] AS via,
          end.name AS to,
          end.latitude AS toLatitude,
          end.longitude AS toLongitude,
          distance,
          length(p) AS stops
        `,
        { start_id, end_id }
      );

      return result.records.map(r => ({
        from: r.get('from'),
        fromLatitude: r.get('fromLatitude'),
        fromLongitude: r.get('fromLongitude'),
        to: r.get('to'),
        via : r.get('via'),
        toLatitude: r.get('toLatitude'),
        toLongitude: r.get('toLongitude'),
        distance: r.get('distance'),
        stops: r.get('stops')
      }));
    } finally {
      await session.close();
    }
  }


  // Supprimer les aéroports isolés
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
