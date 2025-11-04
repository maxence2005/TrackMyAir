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
MATCH p = (start:Airport {airport_id:1})-[:HAS_ROUTE*1..6]-(end:Airport {airport_id:100})
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
MATCH p = (start:Airport {airport_id:1})-[:HAS_ROUTE*1..6]-(end:Airport {airport_id:100})
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
MATCH p = (start:Airport {airport_id:1})-[:HAS_ROUTE*1..6]-(end:Airport {airport_id:100})
WITH p, start, end, reduce(totalDistance = 0, r IN [n IN nodes(p) WHERE n:Route] | totalDistance + r.distance) AS distance
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
MATCH p = (start:Airport {airport_id:1})-[:HAS_ROUTE*1..6]-(end:Airport {airport_id:100})
WITH p, start, end, reduce(totalDistance = 0, r IN [n IN nodes(p) WHERE n:Route] | totalDistance + r.distance) AS distance
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

// 14. la moyenne des distance des routes
MATCH (r:Route)
RETURN avg(r.distance) AS avg_distance

// 14. Identifier les hubs (degré des aéroports)
MATCH (a:Airport)
OPTIONAL MATCH (a)--()
RETURN a.airport_id AS id, a.name AS airport, COUNT(*) AS degree
ORDER BY degree DESC
LIMIT 20;

// 15. Centralité de proximité (closeness)
CALL gds.closeness.stream('airlineGraphCloseness')
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).airport_id AS id,
       gds.util.asNode(nodeId).name AS airport,
       score AS centrality
ORDER BY centrality DESC
LIMIT 20;

// 16. Centralité d’intermédiarité (betweenness)
CALL gds.betweenness.stream('airlineGraphBetweenness')
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).airport_id AS id,
       gds.util.asNode(nodeId).name AS airport,
       score AS centrality
ORDER BY centrality DESC
LIMIT 20;

// 17. Détection des communautés (Louvain)
CALL gds.louvain.stream('airlineGraphLouvain')
YIELD nodeId, communityId
RETURN gds.util.asNode(nodeId).airport_id AS id,
       gds.util.asNode(nodeId).name AS airport,
       communityId
ORDER BY communityId
LIMIT 20;

// 19. Toutes les rotues pour une compagnie
MATCH (al:Airline {airline_id: 24})-[:OPERATES]->(r:Route)
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

// 20. Comparer réseaux de deux compagnies
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

// 21. Routes exclusives à une compagnie
MATCH (al:Airline {airline_id: 24})-[:OPERATES]->(r:Route)
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

// 21. Top 10 compagnies par couverture géographique
MATCH (al:Airline)-[:OPERATES]->(r:Route)
MATCH (a:Airport)-[:HAS_ROUTE]->(r)
RETURN al.name AS airline, count(DISTINCT a) AS airports_covered
ORDER BY airports_covered DESC
LIMIT 10

// 22. Simulation d'une fusion de compagnies aériennes
MATCH (a1:Airline {airline_id: 24})
MATCH (a2:Airline {airline_id: 25})
WITH a1, a2,
     coalesce("yy", a1.name + '-' + a2.name) AS mergedName,
     a1.airline_id + a2.airline_id +10000 AS newId
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

// 23. Ajouter une route hypothétique et mesurer l’effet
MATCH (a1:Airport {airport_id:1}), (a2:Airport {airport_id:2})
CREATE (a1)-[:Route {stops:0, distance:500}]->(a2)
RETURN a1.name AS from, a1.latitude AS fromLatitude, a1.longitude AS fromLongitude,
       a2.name AS to, a2.latitude AS toLatitude, a2.longitude AS toLongitude,
       500 AS distance, 0 AS stops;

// 24. Simulation de panne : désactiver les hubs les plus connectés
MATCH (a:Airport)
OPTIONAL MATCH (a)--()
WITH COUNT(*) AS degree
ORDER BY degree DESC
LIMIT $limit
DETACH DELETE hub
RETURN count(hub) AS deleted_hubs

