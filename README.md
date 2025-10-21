# TracKMyAir

## Description
TracKMyAir est une application web qui permet d'explorer des données de graphes liés aux aéroports, aux liaisons aériennes et aux compagnies aériennes. Le projet est divisé en deux parties : un backend construit avec Express.js et une base de données Neo4j, et un frontend développé avec React.


## Installation

### Backend
1. Naviguez dans le dossier `backend` :
   ```bash
   cd backend
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Configurez les variables d'environnement dans un fichier `.env` :
   ```
   NEO4J_URI=your_neo4j_uri
   NEO4J_PASSWORD=your_neo4j_password
   ```
4. Démarrez le serveur :
   ```bash
   npx ts-node src/server.ts
   ```

### Frontend
1. Naviguez dans le dossier `frontend` :
   ```bash
   cd frontend
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Configurez l'URL du backend dans un fichier `.env` :
   ```
   REACT_APP_BACKEND_URL=http://localhost:3000
   ```
4. Démarrez l'application :
   ```bash
   npm start
   ```

## Utilisation
Une fois le backend et le frontend démarrés, ouvrez votre navigateur et accédez à `http://localhost:3000` pour utiliser l'application.

## License
Ce projet est sous licence MIT.