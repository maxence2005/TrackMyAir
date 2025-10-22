import driver from '../config/neo4j';

export class HubService {

  // Identifier les hubs (degré)
  static async getTopDegreeHubs(limit = 20) {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (a:Airport)
        OPTIONAL MATCH (a)--()
        RETURN a.airport_id AS id,
               a.name AS airport,
               a.latitude AS lat,
               a.longitude AS lon,
               COUNT(*) AS degree
        ORDER BY degree DESC
        LIMIT 20
        `,
        { limit: Number(limit) }
      );

      return result.records.map(r => ({
        id: r.get('id'),
        airport: r.get('airport'),
        lat: r.get('lat'),
        lon: r.get('lon'),
        degree: r.get('degree').toNumber ? r.get('degree').toNumber() : r.get('degree')
      }));
    } finally {
      await session.close();
    }
  }
  private static async IfExists(session: any, graphName: string) {
    const existsResult = await session.run(
      `CALL gds.graph.exists($graphName) YIELD exists RETURN exists`,
      { graphName }
    );
    return existsResult.records[0]?.get('exists') ?? false;
  }

  private static async createGraphIfNotExists(session: any, graphName: string) {
    const exists = await this.IfExists(session, graphName);
    if (!exists) {
      await session.run(
        `
        CALL gds.graph.project.cypher(
          $graphName,
          'MATCH (a:Airport) RETURN id(a) AS id',
          'MATCH (a1:Airport)-[:HAS_ROUTE]->(r:Route)<-[:HAS_ROUTE]-(a2:Airport)
          RETURN id(a1) AS source, id(a2) AS target, toFloat(r.distance) AS distance'
        )
        `,
        { graphName }
      )
    };
  }

  // Centralité de proximité (Closeness)
  static async getClosenessCentrality(limit = 20) {
    const session = driver.session();
    const graphName = 'airlineGraphCloseness';
    try {
      await HubService.createGraphIfNotExists(session, graphName);

      const result = await session.run(
        `
        CALL gds.closeness.stream($graphName)
        YIELD nodeId, score
        RETURN gds.util.asNode(nodeId).airport_id AS id,
              gds.util.asNode(nodeId).name AS airport,
              gds.util.asNode(nodeId).latitude AS lat,
              gds.util.asNode(nodeId).longitude AS lon,
              score AS centrality
        ORDER BY centrality DESC
        LIMIT 100
        `,
        { graphName, limit: Number(limit) }
      );

      return result.records.map(r => ({
        id: r.get('id'),
        airport: r.get('airport'),
        lat: r.get('lat'),
        lon: r.get('lon'),
        centrality: r.get('centrality')
      }));
    } finally {
      await session.close();
    }
  }

  // Même logique pour Betweenness
  static async getBetweennessCentrality(limit = 20) {
    const session = driver.session();
    const graphName = 'airlineGraphBetweenness';
    try {
      await HubService.createGraphIfNotExists(session, graphName);

      const result = await session.run(
        `
        CALL gds.betweenness.stream($graphName)
        YIELD nodeId, score
        RETURN gds.util.asNode(nodeId).airport_id AS id,
              gds.util.asNode(nodeId).name AS airport,
              gds.util.asNode(nodeId).latitude AS lat,
              gds.util.asNode(nodeId).longitude AS lon,
              score AS centrality
        ORDER BY centrality DESC
        LIMIT 100
        `,
        { graphName, limit: Number(limit) }
      );

      return result.records.map(r => ({
        id: r.get('id'),
        airport: r.get('airport'),
        lat: r.get('lat'),
        lon: r.get('lon'),
        centrality: r.get('centrality')
      }));
    } finally {
      await session.close();
    }
  }

  // Et Louvain
  static async getLouvainCommunities() {
    const session = driver.session();
    const graphName = 'airlineGraphLouvain';
    try {
      await HubService.createGraphIfNotExists(session, graphName);

      const result = await session.run(
        `
        CALL gds.louvain.stream($graphName)
        YIELD nodeId, communityId
        RETURN gds.util.asNode(nodeId).airport_id AS id,
              gds.util.asNode(nodeId).name AS airport,
              gds.util.asNode(nodeId).latitude AS lat,
              gds.util.asNode(nodeId).longitude AS lon,
              communityId
        ORDER BY communityId
        LIMIT 100
        `,
        { graphName }
      );

      return result.records.map(r => ({
        id: r.get('id'),
        airport: r.get('airport'),
        lat: r.get('lat'),
        lon: r.get('lon'),
        communityId: r.get('communityId').toNumber
          ? r.get('communityId').toNumber()
          : r.get('communityId')
      }));
    } finally {
      await session.close();
    }
  }
}
