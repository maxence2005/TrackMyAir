import driver from '../config/neo4j';

export class AirlineService {

  static async getAllAirlines() {
    const session = driver.session();
    try {
      const result = await session.run(`
        MATCH (a:Airline)
        OPTIONAL MATCH (a)-[:OPERATES]->(r:Route)
        RETURN a.airline_id AS airline_id, 
               a.name AS name, 
               count(r) AS route_count
        ORDER BY route_count DESC
      `);

      return result.records.map(record => ({
        airline_id: record.get('airline_id')?.toNumber?.() ?? record.get('airline_id'),
        name: record.get('name'),
        route_count: record.get('route_count').toNumber(),
      }));
    } finally {
      await session.close();
    }
  }
  static async getRoutesByAirline(airline_id: number) {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (al:Airline {airline_id: $airline_id})-[:OPERATES]->(r:Route)
        MATCH (src:Airport)-[:HAS_ROUTE]->(r)<-[:HAS_ROUTE]-(dst:Airport)
        RETURN 
          al.name AS airline,
          src.name AS from,
          src.latitude AS fromLatitude,
          src.longitude AS fromLongitude,
          dst.name AS to,
          dst.latitude AS toLatitude,
          dst.longitude AS toLongitude,
          r.stops AS stops,
          r.distance AS distance
        ORDER BY from, to
        `,
        { airline_id }
      );

      return result.records.map(r => ({
        airline: r.get('airline'),
        from: r.get('from'),
        fromLatitude: r.get('fromLatitude'),
        fromLongitude: r.get('fromLongitude'),
        to: r.get('to'),
        toLatitude: r.get('toLatitude'),
        toLongitude: r.get('toLongitude'),
        stops: r.get('stops'),
        distance: r.get('distance')
      }));
    } finally {
      await session.close();
    }
  }


  // 16. Comparer les réseaux de deux compagnies (routes communes / distinctes)
    static async compareAirlinesNetworks(airline1_id: number, airline2_id: number) {
        const session = driver.session();
        try {
            const result = await session.run(
            `
            MATCH (a1:Airline {airline_id: $airline1_id})
            OPTIONAL MATCH (a1)-[:OPERATES]->(r1:Route)
            OPTIONAL MATCH (src1:Airport {airport_id: r1.source_airport_id})
            OPTIONAL MATCH (dst1:Airport {airport_id: r1.destination_airport_id})
            WITH a1, collect(DISTINCT src1.name + '→' + dst1.name) AS routes1

            MATCH (a2:Airline {airline_id: $airline2_id})
            OPTIONAL MATCH (a2)-[:OPERATES]->(r2:Route)
            OPTIONAL MATCH (src2:Airport {airport_id: r2.source_airport_id})
            OPTIONAL MATCH (dst2:Airport {airport_id: r2.destination_airport_id})
            WITH a1, routes1, a2, collect(DISTINCT src2.name + '→' + dst2.name) AS routes2

            RETURN 
                a1.name AS airline1,
                a2.name AS airline2,
                [r IN routes1 WHERE r IN routes2] AS shared_routes,
                [r IN routes1 WHERE NOT r IN routes2] AS unique_to_airline1,
                [r IN routes2 WHERE NOT r IN routes1] AS unique_to_airline2
            `,
            { airline1_id, airline2_id }
            );

            const record = result.records[0];
            if (!record) {
            return {
                airline1: null,
                airline2: null,
                shared_routes: [],
                unique_to_airline1: [],
                unique_to_airline2: []
            };
            }

            return {
            airline1: record.get('airline1'),
            airline2: record.get('airline2'),
            shared_routes: record.get('shared_routes'),
            unique_to_airline1: record.get('unique_to_airline1'),
            unique_to_airline2: record.get('unique_to_airline2')
            };
        } finally {
            await session.close();
        }
    }


  // 17. Routes exclusives à une compagnie
  static async getExclusiveRoutes(airline_id: number) {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (al:Airline {airline_id: $airline_id})-[:OPERATES]->(r:Route)
        MATCH (src:Airport {airport_id: r.source_airport_id})
        MATCH (dst:Airport {airport_id: r.destination_airport_id})
        WITH al, r, src, dst
        OPTIONAL MATCH (other:Airline)-[:OPERATES]->(r)
        WITH al, r, src, dst, COUNT(DISTINCT other) AS nb_airlines
        WHERE nb_airlines = 1
        RETURN 
          al.name AS airline, 
          src.name AS from, 
          dst.name AS to,
          src.latitude AS fromLatitude,
          src.longitude AS fromLongitude,
          dst.latitude AS toLatitude,
          dst.longitude AS toLongitude
        ORDER BY from, to;
        `,
        { airline_id }
      );

      return result.records.map(r => ({
        airline: r.get('airline'),
        from: r.get('from'),
        to: r.get('to'),
        fromLatitude: r.get('fromLatitude')?.toNumber?.() ?? r.get('fromLatitude'),
        fromLongitude: r.get('fromLongitude')?.toNumber?.() ?? r.get('fromLongitude'),
        toLatitude: r.get('toLatitude')?.toNumber?.() ?? r.get('toLatitude'),
        toLongitude: r.get('toLongitude')?.toNumber?.() ?? r.get('toLongitude')
      }));
    } finally {
      await session.close();
    }
  }

  // 18. Nombre total de routes opérées par chaque compagnie
  static async getAirlineRouteCounts() {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (al:Airline)-[:OPERATES]->(r:Route)
        RETURN al.name AS airline, count(DISTINCT r) AS total_routes
        ORDER BY total_routes DESC
        `
      );

      return result.records.map(r => ({
        airline: r.get('airline'),
        total_routes: r.get('total_routes').toNumber()
      }));
    } finally {
      await session.close();
    }
  }

  // 19. Top 10 compagnies par couverture géographique (nombre d’aéroports différents)
  static async getTopAirlinesByCoverage() {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (al:Airline)-[:OPERATES]->(r:Route)
        MATCH (a:Airport)-[:HAS_ROUTE]->(r)
        RETURN al.name AS airline, count(DISTINCT a) AS airports_covered
        ORDER BY airports_covered DESC
        LIMIT 10
        `
      );

      return result.records.map(r => ({
        airline: r.get('airline'),
        airports_covered: r.get('airports_covered').toNumber()
      }));
    } finally {
      await session.close();
    }
  }

  // 20. Trouver les compagnies qui desservent un aéroport donné
  static async getAirlinesServingAirport(airport_id: number) {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (al:Airline)-[:OPERATES]->(r:Route)
        MATCH (a:Airport {airport_id: $airport_id})-[:HAS_ROUTE]->(r)
        RETURN DISTINCT al.name AS airline
        ORDER BY airline
        `,
        { airport_id }
      );

      return result.records.map(r => r.get('airline'));
    } finally {
      await session.close();
    }
  }
}
