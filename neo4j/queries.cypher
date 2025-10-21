// Mapping des endpoints:
// GET  /api/explore    -> Section A (requêtes 1-5 : CRUD & explorations simples)
// GET  /api/routes     -> Section B (requêtes 6-12 : Routes & optimisation)
// GET  /api/centrality -> Section C (requêtes 13-15 : Analyse réseau / centralité)
// GET  /api/airlines   -> Section D (requêtes 16-20 : Analyses par compagnies)
// GET  /api/scenarios  -> Section E (requêtes 21-25 : Scénarios & IA)


// ===========================
// A. CRUD & explorations simples
// ===========================

// 1. Lister tous les aéroports
MATCH (a:Airport) RETURN a LIMIT 100;

// 2. Lister toutes les compagnies
MATCH (al:Airline) RETURN al LIMIT 100;

// 3. Ajouter un nouvel aéroport
CREATE (a:Airport {
  airport_id: 9999, 
  name: 'Test Airport', 
  iata: 'TST', 
  icao: 'TSTA', 
  latitude: 0.0, 
  longitude: 0.0
});

// 4. Mettre à jour le nom d’une compagnie
MATCH (al:Airline {airline_id: 1})
SET al.name = 'Nouvelle Compagnie';

// 5. Supprimer un aéroport par ID
MATCH (a:Airport {airport_id: 9999})
DETACH DELETE a;


// ===========================
// B. Routes & optimisation
// ===========================

// 6. Trouver toutes les routes d’un aéroport
MATCH (a:Airport {airport_id:1})-[:HAS_ROUTE]->(r:Route)<-[:HAS_ROUTE]-(dest:Airport)
OPTIONAL MATCH (al:Airline)-[:OPERATES]->(r)
RETURN a.name AS from, dest.name AS to, r.stops AS stops, r.distance AS distance, collect(DISTINCT al.name) AS airlines;

// 7. Nombre d’escales moyen par route
MATCH (:Airport)-[r:Route]->(:Airport)
RETURN avg(r.stops) AS avg_stops;

// 8. Chemin le plus court (en nombre d’escales) entre A et B
MATCH (start:Airport {airport_id:1}), (end:Airport {airport_id:100})
MATCH p=shortestPath((start)-[:HAS_ROUTE*]-(end))
RETURN p;

// 9. Chemin le plus long (en nombre d’escales) entre A et B
MATCH (start:Airport {airport_id:1}), (end:Airport {airport_id:100})
MATCH p=(start)-[:HAS_ROUTE*]-(end)
RETURN p, length(p) AS nb_escales
ORDER BY nb_escales DESC
LIMIT 1;

// 10. Chemin le plus court (en km, distance totale) entre A et B
MATCH (start:Airport {airport_id:1}), (end:Airport {airport_id:100})
MATCH p=(start)-[r:Route*]-(end)
WITH p, reduce(totalDistance = 0, rel IN r | totalDistance + rel.distance) AS distance
RETURN p, distance
ORDER BY distance ASC
LIMIT 1;

// 11. Chemin le plus long (en km, distance totale) entre A et B
MATCH (start:Airport {airport_id:1}), (end:Airport {airport_id:100})
MATCH p=(start)-[:HAS_ROUTE*]-(end)
WITH p, reduce(totalDistance = 0, r IN relationships(p) | totalDistance + r.distance) AS distance
RETURN p, distance
ORDER BY distance DESC
LIMIT 1;

// 12. Supprimer les aéroports isolés
MATCH (a:Airport)
WHERE NOT (a)--()
DELETE a;


// ===========================
// C. Analyse réseau / centralité
// ===========================

// 13. Identifier les hubs (degré des aéroports)
MATCH (a:Airport)
OPTIONAL MATCH (a)--()
RETURN a.airport_id AS id, a.name AS airport, COUNT(*) AS degree
ORDER BY degree DESC
LIMIT 20;

// 14. Centralité de proximité (closeness)
CALL gds.graph.project('airlineGraphCloseness','Airport',{HAS_ROUTE:{orientation:'UNDIRECTED'}});
CALL gds.closeness.stream('airlineGraphCloseness')
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).airport_id AS id,
       gds.util.asNode(nodeId).name AS airport,
       score AS centrality
ORDER BY centrality DESC
LIMIT 20;

// 15. Centralité d’intermédiarité (betweenness)
CALL gds.graph.project('airlineGraphBetweenness','Airport',{HAS_ROUTE:{orientation:'UNDIRECTED'}});
CALL gds.betweenness.stream('airlineGraphBetweenness')
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).airport_id AS id,
       gds.util.asNode(nodeId).name AS airport,
       score AS centrality
ORDER BY centrality DESC
LIMIT 20;

// 16. Détection des communautés (Louvain)
CALL gds.graph.project('airlineGraphLouvain','Airport',{HAS_ROUTE:{orientation:'UNDIRECTED'}});
CALL gds.louvain.stream('airlineGraphLouvain')
YIELD nodeId, communityId
RETURN gds.util.asNode(nodeId).airport_id AS id,
       gds.util.asNode(nodeId).name AS airport,
       communityId
ORDER BY communityId
LIMIT 20;


// ===========================
// D. Analyses par compagnies
// ===========================

// 17. Routes couvertes pour une compagnie
MATCH (al:Airline {airline_id:1})-[:OPERATES]->(r:Route)
MATCH (src:Airport)-[:HAS_ROUTE]->(r)<-[:HAS_ROUTE]-(dst:Airport)
RETURN al.name AS airline,
       src.name AS from,
       dst.name AS to,
       r.stops AS stops,
       r.distance AS distance
ORDER BY from, to;

// 18. Comparer réseaux de deux compagnies
MATCH (a1:Airline {airline_id:1})
OPTIONAL MATCH (a1)-[:OPERATES]->(r1:Route)
OPTIONAL MATCH (src1:Airport {airport_id: r1.source_airport_id})
OPTIONAL MATCH (dst1:Airport {airport_id: r1.destination_airport_id})
WITH a1, collect(DISTINCT src1.name + '→' + dst1.name) AS routes1
MATCH (a2:Airline {airline_id:2})
OPTIONAL MATCH (a2)-[:OPERATES]->(r2:Route)
OPTIONAL MATCH (src2:Airport {airport_id: r2.source_airport_id})
OPTIONAL MATCH (dst2:Airport {airport_id: r2.destination_airport_id})
WITH a1, routes1, a2, collect(DISTINCT src2.name + '→' + dst2.name) AS routes2
RETURN a1.name AS airline1,
       a2.name AS airline2,
       [r IN routes1 WHERE r IN routes2] AS shared_routes,
       [r IN routes1 WHERE NOT r IN routes2] AS unique_to_airline1,
       [r IN routes2 WHERE NOT r IN routes1] AS unique_to_airline2;

// 19. Routes exclusives à une compagnie
MATCH (al:Airline {airline_id:1})-[:OPERATES]->(r:Route)
MATCH (src:Airport {airport_id: r.source_airport_id})
MATCH (dst:Airport {airport_id: r.destination_airport_id})
OPTIONAL MATCH (other:Airline)-[:OPERATES]->(r)
WITH al, r, src, dst, COUNT(DISTINCT other) AS nb_airlines
WHERE nb_airlines = 1
RETURN al.name AS airline,
       src.name AS from,
       dst.name AS to
ORDER BY from, to;

// 20. Nombre total de routes par compagnie
MATCH (al:Airline)-[:OPERATES]->(r:Route)
RETURN al.name AS airline, count(DISTINCT r) AS total_routes
ORDER BY total_routes DESC;


// ===========================
// E. Scénarios & IA (Conception, robustesse & prédiction)
// ===========================

// 21. Supprimer un hub et mesurer l’impact sur la connectivité
MATCH (hub:Airport {airport_id:1})
DETACH DELETE hub;

// 22. Ajouter une route hypothétique et mesurer l’effet
MATCH (a1:Airport {airport_id:1}), (a2:Airport {airport_id:2})
CREATE (a1)-[:Route {stops:0, distance:500}]->(a2)
RETURN a1.name AS from, a1.latitude AS fromLatitude, a1.longitude AS fromLongitude,
       a2.name AS to, a2.latitude AS toLatitude, a2.longitude AS toLongitude,
       500 AS distance, 0 AS stops;

// 23. Prédire routes plausibles (link prediction)
CALL algo.linkprediction.commonNeighbors.stream('Airport','Route',{direction:'BOTH'})
YIELD node1, node2, score
RETURN algo.getNodeById(node1).name AS airport1,
       algo.getNodeById(node1).latitude AS airport1Latitude,
       algo.getNodeById(node1).longitude AS airport1Longitude,
       algo.getNodeById(node2).name AS airport2,
       algo.getNodeById(node2).latitude AS airport2Latitude,
       algo.getNodeById(node2).longitude AS airport2Longitude,
       score
ORDER BY score DESC
LIMIT 10;

// 24. Simulation de panne partielle : désactiver temporairement les hubs les plus connectés
MATCH (hub:Airport)
WITH hub, size((hub)--()) AS connections
ORDER BY connections DESC
LIMIT 3
SET hub.status = 'inactive'
RETURN hub.name AS hub, hub.status AS status, connections AS nb_connections;

// 25. Création de routes “alternatives” pour tester la redondance du réseau
MATCH (a:Airport), (b:Airport)
WHERE a.airport_id < b.airport_id AND a.status <> 'inactive' AND b.status <> 'inactive'
WITH a, b LIMIT 5
CREATE (a)-[:Route {stops:1, distance: rand() * 1000 + 200}]->(b)
RETURN a.name AS from, a.latitude AS fromLatitude, a.longitude AS fromLongitude,
       b.name AS to, b.latitude AS toLatitude, b.longitude AS toLongitude,
       r.distance AS distance, r.stops AS stops;