// ===========================
// 0. Supprimer tous les nœuds et relations
// ===========================
MATCH (n) DETACH DELETE n;

// ===========================
// 1. Supprimer les anciens index conflictuels
// ===========================
DROP INDEX airport_id_index IF EXISTS;
DROP INDEX airline_id_index IF EXISTS;

// ===========================
// 2. Création des contraintes et index
// ===========================
CREATE CONSTRAINT airport_id_unique IF NOT EXISTS
FOR (a:Airport) REQUIRE a.airport_id IS UNIQUE;

CREATE CONSTRAINT airline_id_unique IF NOT EXISTS
FOR (al:Airline) REQUIRE al.airline_id IS UNIQUE;

CREATE INDEX route_index IF NOT EXISTS
FOR (r:Route) ON (r.source_airport_id, r.destination_airport_id);

// ===========================
// 3. Import des aéroports
// ===========================
CALL {
    LOAD CSV WITH HEADERS FROM 'file:///airports.csv' AS row
    MERGE (a:Airport {airport_id: toInteger(row.airport_id)})
    SET a.name = row.name,
        a.iata = row.iata,
        a.icao = row.icao,
        a.latitude = toFloat(row.latitude),
        a.longitude = toFloat(row.longitude)
} IN TRANSACTIONS OF 1000 ROWS;

// ===========================
// 4. Import des compagnies aériennes
// ===========================
CALL {
    LOAD CSV WITH HEADERS FROM 'file:///airlines.csv' AS row
    MERGE (al:Airline {airline_id: toInteger(row.airline_id)})
    SET al.name = row.name
} IN TRANSACTIONS OF 1000 ROWS;

// ===========================
// 5. Import des routes et création des relations
// ===========================
CALL {
    LOAD CSV WITH HEADERS FROM 'file:///routes.csv' AS row
    MATCH (src:Airport {airport_id: toInteger(row.source_airport_id)})
    MATCH (dst:Airport {airport_id: toInteger(row.destination_airport_id)})
    
    // Calcul de la distance (formule de Haversine)
    WITH row, src, dst,
         6371 AS R,  // Rayon moyen de la Terre en km
         radians(src.latitude) AS lat1,
         radians(src.longitude) AS lon1,
         radians(dst.latitude) AS lat2,
         radians(dst.longitude) AS lon2
    WITH row, src, dst,
         R * 2 * asin(
             sqrt(
                 sin((lat2 - lat1) / 2)^2 +
                 cos(lat1) * cos(lat2) * sin((lon2 - lon1) / 2)^2
             )
         ) AS distance

    MERGE (r:Route {
        source_airport_id: toInteger(row.source_airport_id),
        destination_airport_id: toInteger(row.destination_airport_id)
    })
    SET r.stops = CASE row.stops WHEN '' THEN 0 ELSE toInteger(row.stops) END,
        r.distance = distance

    MERGE (src)-[:HAS_ROUTE]->(r)
    MERGE (dst)-[:HAS_ROUTE]->(r)

    WITH r, row
    MATCH (al:Airline {airline_id: toInteger(row.airline_id)})
    MERGE (al)-[:OPERATES]->(r)
} IN TRANSACTIONS OF 1000 ROWS;
