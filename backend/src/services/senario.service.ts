import driver from '../config/neo4j';
export class ScenarioService {
  // 22. Simulation d'une fusion de compagnies aériennes
    static async mergeAirlines(airlineId1: number, airlineId2: number, newAirlineName?: string) {
    const session = driver.session();
    try {
        const result = await session.run(
        `
            MATCH (a1:Airline {airline_id: $airlineId1})
            MATCH (a2:Airline {airline_id: $airlineId2})
            WITH a1, a2,
                coalesce($newAirlineName, a1.name + '-' + a2.name) AS mergedName,
                a1.airline_id + a2.airline_id + 10000 AS newId
            CREATE (merged:Airline {airline_id: newId})
            SET merged.name = mergedName
            WITH merged, a1, a2
            MATCH (a1)-[:OPERATES]->(r:Route)
            MERGE (merged)-[:OPERATES]->(r)
            WITH merged, a2
            MATCH (a2)-[:OPERATES]->(r2:Route)
            MERGE (merged)-[:OPERATES]->(r2)
            RETURN merged.name AS merged_airline,
                merged.airline_id AS merged_id;
            `,
            { airlineId1, airlineId2, newAirlineName }
        );

        const record = result.records[0].toObject();
        return {
            success: true,
            message: `Fusion réussie : ${record.merged_airline}`,
            details: record,
        };
    } catch (error) {
        console.error('Erreur lors de la fusion des compagnies :', error);
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
        `
        MATCH (a:Airport)
        OPTIONAL MATCH (a)--()
        WITH COUNT(*) AS degree
        ORDER BY degree DESC
        LIMIT $limit
        DETACH DELETE hub
        RETURN count(hub) AS deleted_hubs
        `,
        { limit }
      );
      return result.records.map(r => r.toObject());
    } finally {
      await session.close();
    }
  }

}
