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

// 5. Mettre à jour le nom d’un aéroport existant
MATCH (a:Airport {airport_id:1})
SET a.name = 'Aéroport Mis à Jour';

// 6. Supprimer un aéroport par ID
MATCH (a:Airport {airport_id: 9999})
DETACH DELETE a;

// 7. Trouver toutes les routes d’un aéroport
MATCH (a:Airport {airport_id:1})-[:HAS_ROUTE]->(r:Route)<-[:HAS_ROUTE]-(dest:Airport)
OPTIONAL MATCH (al:Airline)-[:OPERATES]->(r)
RETURN a.name AS from, dest.name AS to, r.stops AS stops, r.distance AS distance, collect(DISTINCT al.name) AS airlines;

// 8. Nombre d’escales moyen par route
MATCH (:Airport)-[r:Route]->(:Airport)
RETURN avg(r.stops) AS avg_stops;

// 9. Chemin le plus court (en nombre d’escales) entre A et B
MATCH p = (start:Airport {airport_id:1})-[:HAS_ROUTE*1..4]-(end:Airport {airport_id:100})
WITH p, length(p) AS stops, start, end
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
  stops;

// 10. Chemin le plus long (en nombre d’escales) entre A et B
MATCH p = (start:Airport {airport_id:1})-[:HAS_ROUTE*1..4]-(end:Airport {airport_id:100})
WITH p, length(p) AS stops, start, end
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
  stops;

// 11. Chemin le plus court (en km, distance totale) entre A et B
MATCH p = (start:Airport {airport_id:1})-[:HAS_ROUTE*1..4]-(end:Airport {airport_id:100})
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
  length(p) AS stops;

// 12. Chemin le plus long (en km, distance totale) entre A et B
MATCH p = (start:Airport {airport_id:1})-[:HAS_ROUTE*1..4]-(end:Airport {airport_id:100})
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
  length(p) AS stops;

// 13. Supprimer les aéroports isolés
MATCH (a:Airport)
WHERE NOT (a)--()
DELETE a;

// 14. Identifier les hubs (degré des aéroports)
MATCH (a:Airport)
OPTIONAL MATCH (a)--()
RETURN a.airport_id AS id, a.name AS airport, COUNT(*) AS degree
ORDER BY degree DESC
LIMIT 20;

// 15. Centralité de proximité (closeness)
CALL gds.graph.project('airlineGraphCloseness','Airport',{HAS_ROUTE:{orientation:'UNDIRECTED'}});
CALL gds.closeness.stream('airlineGraphCloseness')
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).airport_id AS id,
       gds.util.asNode(nodeId).name AS airport,
       score AS centrality
ORDER BY centrality DESC
LIMIT 20;

// 16. Centralité d’intermédiarité (betweenness)
CALL gds.graph.project('airlineGraphBetweenness','Airport',{HAS_ROUTE:{orientation:'UNDIRECTED'}});
CALL gds.betweenness.stream('airlineGraphBetweenness')
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).airport_id AS id,
       gds.util.asNode(nodeId).name AS airport,
       score AS centrality
ORDER BY centrality DESC
LIMIT 20;

// 17. Détection des communautés (Louvain)
CALL gds.graph.project('airlineGraphLouvain','Airport',{HAS_ROUTE:{orientation:'UNDIRECTED'}});
CALL gds.louvain.stream('airlineGraphLouvain')
YIELD nodeId, communityId
RETURN gds.util.asNode(nodeId).airport_id AS id,
       gds.util.asNode(nodeId).name AS airport,
       communityId
ORDER BY communityId
LIMIT 20;

// 18. Routes couvertes pour une compagnie
MATCH (al:Airline {airline_id:1})-[:OPERATES]->(r:Route)
MATCH (src:Airport)-[:HAS_ROUTE]->(r)<-[:HAS_ROUTE]-(dst:Airport)
RETURN al.name AS airline,
       src.name AS from,
       dst.name AS to,
       r.stops AS stops,
       r.distance AS distance
ORDER BY from, to;

// 19. Comparer réseaux de deux compagnies
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

// 20. Routes exclusives à une compagnie
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

// 21. Nombre total de routes par compagnie
MATCH (al:Airline)-[:OPERATES]->(r:Route)
RETURN al.name AS airline, count(DISTINCT r) AS total_routes
ORDER BY total_routes DESC;

// 22. Supprimer un hub et mesurer l’impact sur la connectivité
MATCH (hub:Airport {airport_id:1})
DETACH DELETE hub;

// 23. Ajouter une route hypothétique et mesurer l’effet
MATCH (a1:Airport {airport_id:1}), (a2:Airport {airport_id:2})
CREATE (a1)-[:Route {stops:0, distance:500}]->(a2)
RETURN a1.name AS from, a1.latitude AS fromLatitude, a1.longitude AS fromLongitude,
       a2.name AS to, a2.latitude AS toLatitude, a2.longitude AS toLongitude,
       500 AS distance, 0 AS stops;

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
       1 AS stops, rand() * 1000 + 200 AS distance;
