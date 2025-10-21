# Changements de nettoyage

But : produire des CSV très simples et adaptés à une application de recherche du meilleur chemin.

airports.csv :
- Gardés : airport_id, name, latitude, longitude
- Retirés : city, country, autres métadonnées jugées non nécessaires pour le graphe
- Suppression des lignes sans airport_id ou sans coordonnées

airlines.csv :
- Gardés : airline_id, name
- Retirés : alias, iata/icao, country, active (pas utiles pour le calcul de chemin)

routes.csv :
- Gardés : airline_id, source_airport_id, destination_airport_id, stops
- Suppression des lignes sans source/destination
- Les routes sont dédupliquées

Raisons :
- Minimiser la taille des fichiers et ne garder que les informations essentielles au calcul des plus courts chemins (noeuds = aéroports, arêtes = routes).

Puis mes cela dans le import de la base pour destock neo4j