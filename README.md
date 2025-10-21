# airgraph-explorer

## Description
Airgraph Explorer est une application web qui permet d'explorer des données de graphes liés aux aéroports, aux liaisons aériennes et aux compagnies aériennes. Le projet est divisé en deux parties : un backend construit avec Express.js et une base de données Neo4j, et un frontend développé avec React.

## Structure du projet
```
airgraph-explorer
├── backend
│   ├── src
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── frontend
│   ├── src
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── data
│   └── neo4j
│       └── sample-data.cypher
├── docs
│   └── architecture.md
└── README.md
```

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
3. Configurez les variables d'environnement dans le fichier `.env` :
   ```
   NEO4J_URI=your_neo4j_uri
   NEO4J_PASSWORD=your_neo4j_password
   ```
4. Démarrez le serveur :
   ```bash
   npm start
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
3. Configurez l'URL du backend dans le fichier `.env` :
   ```
   REACT_APP_BACKEND_URL=http://localhost:3000
   ```
4. Démarrez l'application :
   ```bash
   npm start
   ```

## Utilisation
Une fois le backend et le frontend démarrés, ouvrez votre navigateur et accédez à `http://localhost:3000` pour utiliser l'application.

## Documentation
Pour plus d'informations sur l'architecture du projet, les endpoints de l'API et les requêtes Neo4j, veuillez consulter le dossier `docs`.

## Contribuer
Les contributions sont les bienvenues ! Veuillez soumettre une demande de tirage pour toute amélioration ou correction.

## License
Ce projet est sous licence MIT.