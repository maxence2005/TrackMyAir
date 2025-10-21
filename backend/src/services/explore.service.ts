import driver from '../config/neo4j';

export class ExploreService {
  // 1. Lister tous les aéroports
  static async getAllAirports() {
    const session = driver.session();
    try {
      const result = await session.run(`MATCH (a:Airport) RETURN a LIMIT 100`);
      return result.records.map(r => r.get('a').properties);
    } finally {
      await session.close();
    }
  }

  // 2. Get by ID
    static async getAirportById(airport_id: number) {
        const session = driver.session();
        try {
            const result = await session.run(
            `MATCH (a:Airport {airport_id: $airport_id})
            RETURN a LIMIT 1`,
            { airport_id }
            );
            if (result.records.length === 0) return null;
            return result.records[0].get('a').properties;
        } finally {
            await session.close();
        }
    }


  // 3. Ajouter un nouvel aéroport
  static async addAirport(data: {
    airport_id: number;
    name: string;
    iata: string;
    icao: string;
    latitude: number;
    longitude: number;
  }) {
    const session = driver.session();
    try {
      const result = await session.run(
        `CREATE (a:Airport {
          airport_id: $airport_id,
          name: $name,
          iata: $iata,
          icao: $icao,
          latitude: $latitude,
          longitude: $longitude
        }) RETURN a`,
        data
      );
      return result.records[0].get('a').properties;
    } finally {
      await session.close();
    }
  }

  // 4. Mettre à jour une compagnie
  static async updateAirlineName(airline_id: number, newName: string) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (al:Airline {airline_id: $airline_id})
         SET al.name = $newName
         RETURN al`,
        { airline_id, newName }
      );
      return result.records[0]?.get('al')?.properties || null;
    } finally {
      await session.close();
    }
  }

  // 5. Supprimer un aéroport par ID
  static async deleteAirportById(airport_id: number) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (a:Airport {airport_id: $airport_id})
         DETACH DELETE a
         RETURN $airport_id AS deletedId`,
        { airport_id }
      );
      const record = result.records[0];
      if (!record) return { deleted: false, airport_id };
      return { deleted: true, airport_id };
    } finally {
      await session.close();
    }
  }
}
