import driver from '../config/neo4j';

export class HubService {

  // 1️⃣ Identifier les hubs (degré)
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

  // Fonction utilitaire pour supprimer un graphe si existant (sans conflit de variable)
  private static async dropGraphIfExists(session: any, graphName: string) {
    const existsResult = await session.run(
      `CALL gds.graph.exists($graphName) YIELD exists RETURN exists`,
      { graphName }
    );
    const exists = existsResult.records[0].get('exists');

    if (exists) {
      await session.run(
        `
        CALL apoc.do.when(
          true,
          'CALL gds.graph.drop($g) YIELD graphName RETURN graphName',
          '',
          { g: $graphName }
        ) YIELD value
        RETURN value
        `,
        { graphName }
      );
    }
  }

  // 2️⃣ Centralité de proximité (closeness)
  static async getClosenessCentrality(limit = 20) {
    const session = driver.session();
    const graphName = 'airlineGraphCloseness';
    try {
      await HubService.dropGraphIfExists(session, graphName);

      await session.run(
        `
        CALL gds.graph.project(
          $graphName,
          'Airport',
          { HAS_ROUTE: { orientation: 'UNDIRECTED' } }
        )
        `,
        { graphName }
      );

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
        LIMIT 20
        `,
        { graphName, limit: Number(limit) }
      );

      await HubService.dropGraphIfExists(session, graphName);

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

  // 3️⃣ Centralité d'intermédiarité (betweenness)
  static async getBetweennessCentrality(limit = 20) {
    const session = driver.session();
    const graphName = 'airlineGraphBetweenness';
    try {
      await HubService.dropGraphIfExists(session, graphName);

      await session.run(
        `
        CALL gds.graph.project(
          $graphName,
          'Airport',
          { HAS_ROUTE: { orientation: 'UNDIRECTED' } }
        )
        `,
        { graphName }
      );

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
        LIMIT 20
        `,
        { graphName, limit: Number(limit) }
      );

      await HubService.dropGraphIfExists(session, graphName);

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

  // 4️⃣ Détection des communautés (Louvain)
  static async getLouvainCommunities(limit = 20) {
    const session = driver.session();
    const graphName = 'airlineGraphLouvain';
    try {
      await HubService.dropGraphIfExists(session, graphName);

      await session.run(
        `
        CALL gds.graph.project(
          $graphName,
          'Airport',
          { HAS_ROUTE: { orientation: 'UNDIRECTED' } }
        )
        `,
        { graphName }
      );

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
        LIMIT 20
        `,
        { graphName, limit: Number(limit) }
      );

      await HubService.dropGraphIfExists(session, graphName);

      return result.records.map(r => ({
        id: r.get('id'),
        airport: r.get('airport'),
        lat: r.get('lat'),
        lon: r.get('lon'),
        communityId: r.get('communityId').toNumber ? r.get('communityId').toNumber() : r.get('communityId')
      }));
    } finally {
      await session.close();
    }
  }
}
