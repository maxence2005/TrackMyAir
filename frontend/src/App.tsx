import React, { useState } from 'react';
import Header from './components/Header';
import Map from './components/Map';
import {
  getAirports,
  getAirportById,
  addAirport,
  updateAirline,
  deleteAirport,
  getRoutesFromAirport,
  getAverageStops,
  getShortestPathStops,
  getLongestPathStops,
  getShortestPathDistance,
  getLongestPathDistance,
  deleteIsolatedAirport,
  getAllAirlines,
  getAverageDistance,
  getExclusiveRoutes,
  getTopAirlinesByCoverage,
  getAirlinesServingAirport,
  getTop10Hubs,
  getClosenessCentrality,
  getBetweennessCentrality,
  getLouvainCommunities,
  Airport,
  RouteWithVia,
  Airline,
  Route,
  compareAirlinesNetworks,
  getRoutesByAirline
} from './api';
import './styles.css';
import { get } from 'http';

interface Operation {
  title: string;
  section: string;
  index: number;
}

const operations: Operation[] = [
  // Section A - Airports
  { title: "Lister tous les aéroports", section: "A", index: 0 },
  { title: "Lister un aéroport", section: "A", index: 1 },
  { title: "Ajouter un nouvel aéroport", section: "A", index: 2 },
  { title: "Mettre à jour une compagnie", section: "A", index: 3 },
  { title: "Supprimer un aéroport par ID", section: "A", index: 4 },

  // Section B - Routes
  { title: "Routes d'un aéroport", section: "B", index: 0 },
  { title: "Nombre d'escales moyen", section: "B", index: 1 },
  { title: "Chemin le plus court (escales) entre deux aéroports", section: "B", index: 2 },
  { title: "Chemin le plus long (escales) entre deux aéroports", section: "B", index: 3 },
  { title: "Chemin le plus court (distance) entre deux aéroports", section: "B", index: 4 },
  { title: "Chemin le plus long (distance) entre deux aéroports", section: "B", index: 5 },
  { title: "Supprimer les aéroports isolés", section: "B", index: 6 },
  { title: "Moyenne des distances des routes", section: "B", index: 7 },

  // Section C - Airlines
  { title: "Lister toutes les compagnies", section: "C", index: 0 },
  { title: "Routes exclusives d'une compagnie", section: "C", index: 1 },
  { title: "Comparer deux compagnies", section: "C", index: 2 },
  { title: "Top compagnies par couverture", section: "C", index: 3 },
  { title: "Compagnies desservant un aéroport", section: "C", index: 5 },
  { title: "Toutes les routes d'une compagnie", section: "C", index: 6 },

  // Section D - Hubs
  { title: "Top hubs (degré)", section: "D", index: 0 },
  { title: "Centralité de proximité", section: "D", index: 1 },
  { title: "Centralité d'intermédiarité", section: "D", index: 2 },
  { title: "Détection des communautés (Louvain)", section: "D", index: 3 },
];

const App: React.FC = () => {
  const [markers, setMarkers] = useState<Array<{ position: [number, number]; label?: string; degree?: number}>>([]);
  const [lines, setLines] = useState<Array<{ positions: [number, number][]; color?: string }>>([]);
  const [rawOutput, setRawOutput] = useState<string>('');

  // Section A
  const [airportId, setAirportId] = useState<number>(0);
  const [newAirport, setNewAirport] = useState({ airport_id: 0, name: '', iata: '', icao: '', latitude: 0, longitude: 0 });
  const [updateData, setUpdateData] = useState({ airline_id: 0, newName: '' });
  const [deleteId, setDeleteId] = useState<number>(0);

  // Section B
  const [startAirportId, setStartAirportId] = useState<number>(0);
  const [endAirportId, setEndAirportId] = useState<number>(0);

  // Section C
  const [airlineId, setAirlineId] = useState<number>(0);
  const [airportQueryId, setAirportQueryId] = useState<number>(0);

  const handleOperationClick = async (operation: Operation) => {
    try {
      if (operation.section === 'A') {
        let res;
        switch (operation.index) {
          case 0:
            res = await getAirports();
            setRawOutput(JSON.stringify(res.data, null, 2));
            setMarkers(res.data.map((a: Airport) => ({
              position: [a.latitude, a.longitude],
              label: `${a.name} (${a.iata})`
            })));
            setLines([]);
            return;

          case 1:
            if (!airportId) {
              alert("Veuillez entrer un ID d'aéroport avant de lancer la recherche.");
              return;
            }
            res = await getAirportById(airportId);
            setRawOutput(JSON.stringify(res.data, null, 2));
            if (res.data) {
              const airport = res.data;
              setMarkers([{
                position: [airport.latitude, airport.longitude],
                label: `${airport.name} (${airport.iata})`
              }]);
              setLines([]);
            } else {
              setMarkers([]);
              setLines([]);
            }
            return;

          case 2:
            res = await addAirport(newAirport);
            alert('Aéroport ajouté !');
            setRawOutput(JSON.stringify(res.data, null, 2));
            return;

          case 3:
            res = await updateAirline(updateData.airline_id, updateData.newName);
            alert('Compagnie mise à jour !');
            setRawOutput(JSON.stringify(res.data, null, 2));
            return;

          case 4:
            res = await deleteAirport(deleteId);
            alert(`Aéroport ${deleteId} supprimé !`);
            setRawOutput(JSON.stringify(res.data, null, 2));
            return;
        }
      }

    if (operation.section === 'B') {
      let res;
      let newMarkers: typeof markers = [];
      let newLines: typeof lines = [];

      switch (operation.index) {
        case 0: // Routes d'un aéroport
          res = await getRoutesFromAirport(startAirportId);
          setRawOutput(JSON.stringify(res.data, null, 2));
          res.data.forEach((r: Route) => {
            if (r.fromLatitude && r.fromLongitude && r.toLatitude && r.toLongitude) {
              newMarkers.push({ position: [r.fromLatitude, r.fromLongitude], label: r.from });
              newMarkers.push({ position: [r.toLatitude, r.toLongitude], label: r.to });
              newLines.push({
                positions: [
                  [r.fromLatitude, r.fromLongitude],
                  [r.toLatitude, r.toLongitude]
                ],
                color: '#2196f3'
              });
            }
          });
          setMarkers(newMarkers);
          setLines(newLines);
          return;

        case 1: // Nombre d'escales moyen
          res = await getAverageStops();
          setRawOutput(JSON.stringify(res.data, null, 2));
          setMarkers([]);
          setLines([]);
          return;

        case 2: // Chemin le plus court (escales)
          res = await getShortestPathStops(startAirportId, endAirportId);
          setRawOutput(JSON.stringify(res.data, null, 2));
          drawPathOnMapLigne(res.data);
          return;

        case 3: // Chemin le plus long (escales)
          res = await getLongestPathStops(startAirportId, endAirportId);
          setRawOutput(JSON.stringify(res.data, null, 2));
          drawPathOnMapLigne(res.data);
          return;

        case 4: // Chemin le plus court (distance)
          res = await getShortestPathDistance(startAirportId, endAirportId);
          setRawOutput(JSON.stringify(res.data, null, 2));
          drawPathOnMapLigne(res.data);
          return;

        case 5: // Chemin le plus long (distance)
          res = await getLongestPathDistance(startAirportId, endAirportId);
          setRawOutput(JSON.stringify(res.data, null, 2));
          drawPathOnMapLigne(res.data);
          return;

        case 6: // Supprimer un aéroport isolé
          res = await deleteIsolatedAirport();
          alert('Aéroports isolés supprimés');
          setRawOutput(JSON.stringify(res, null, 2));
          setMarkers([]);
          setLines([]);
          return;

        case 7: // Distance moyenne de toutes les routes
          res = await getAverageDistance();
          setRawOutput(JSON.stringify(res.data, null, 2));
          setMarkers([]);
          setLines([]);
          return;
      }
    }

  if (operation.section === 'C') {
    let res;
    let newMarkers: typeof markers = [];
    let newLines: typeof lines = [];

    switch (operation.index) {
      case 0: // Lister toutes les compagnies
        res = await getAllAirlines();
        setRawOutput(JSON.stringify(res.data, null, 2));
        setMarkers([]);
        setLines([]);
        return;

      case 1: // Routes exclusives d'une compagnie
        res = await getExclusiveRoutes(airlineId);
        setRawOutput(JSON.stringify(res.data, null, 2));
        drawPathOnMap(res.data);
        return;

      case 2: // Comparer deux compagnies
        if (!airlineId || !airportQueryId) {
          alert("Veuillez entrer les ID des deux compagnies à comparer.");
          return;
        }
        res = await compareAirlinesNetworks(airlineId, airportQueryId);
        setRawOutput(JSON.stringify(res.data, null, 2));
        setMarkers([]);
        setLines([]);
        return;

      case 3: // Top compagnies par couverture
        res = await getTopAirlinesByCoverage();
        setRawOutput(JSON.stringify(res.data, null, 2));
        setMarkers([]);
        setLines([]);
        return;

      case 5: // Compagnies desservant un aéroport
        res = await getAirlinesServingAirport(airportQueryId);
        setRawOutput(JSON.stringify(res.data, null, 2));
        setMarkers([]);
        setLines([]);
        return;

      case 6: // Toutes les routes d'une compagnie
        res = await getRoutesByAirline(airlineId);
        setRawOutput(JSON.stringify(res.data, null, 2));
        drawPathOnMap(res.data);
        return;
    }
  }


      if (operation.section === 'D') {
        let res;
        let newMarkers: typeof markers = [];
        let newLines: typeof lines = [];

        switch (operation.index) {
          case 0: // Top hubs par degré
            res = await getTop10Hubs();
            setRawOutput(JSON.stringify(res.data, null, 2));
            res.data.forEach((h: any) => newMarkers.push({ position: [h.lat, h.lon], label: h.airport, degree: (h.degree/40) }));
            setMarkers(newMarkers);
            setLines([]);
            return;

          case 1: // Closeness
            res = await getClosenessCentrality();
            setRawOutput(JSON.stringify(res.data, null, 2));
            res.data.forEach((h: any) => newMarkers.push({ position: [h.lat, h.lon], label: `${h.airport} (${h.centrality.toFixed(3)})` }));
            setMarkers(newMarkers);
            setLines([]);
            return;

          case 2: // Betweenness
            res = await getBetweennessCentrality();
            setRawOutput(JSON.stringify(res.data, null, 2));
            res.data.forEach((h: any) => newMarkers.push({ position: [h.lat, h.lon], label: `${h.airport} (${h.centrality.toFixed(3)})` }));
            setMarkers(newMarkers);
            setLines([]);
            return;

          case 3: // Louvain
            res = await getLouvainCommunities();
            setRawOutput(JSON.stringify(res.data, null, 2));
            res.data.forEach((h: any) => newMarkers.push({ position: [h.lat, h.lon], label: `${h.airport} (Community ${h.communityId})` }));
            setMarkers(newMarkers);
            setLines([]);
            return;
        }
      }

    } catch (err) {
      console.error(err);
      setRawOutput(err instanceof Error ? err.message : 'Une erreur est survenue');
      setMarkers([]);
      setLines([]);
    }
  };

  // Modifie également drawPathOnMap pour utiliser data[] directement
  const drawPathOnMap = (data: Route[]) => {
    const newMarkers: typeof markers = [];
    const newLines: typeof lines = [];

    data.forEach((step: Route) => {
      if (step.fromLatitude && step.fromLongitude && step.toLatitude && step.toLongitude) {
        newMarkers.push({ position: [step.fromLatitude, step.fromLongitude], label: step.from });
        newMarkers.push({ position: [step.toLatitude, step.toLongitude], label: step.to });
        newLines.push({ positions: [[step.fromLatitude, step.fromLongitude], [step.toLatitude, step.toLongitude]], color: '#ff5722' });
      }
    });

    setMarkers(newMarkers);
    setLines(newLines);
  };

  const drawPathOnMapLigne = (data: RouteWithVia[]) => {
    const newMarkers: typeof markers = [];
    const newLines: typeof lines = [];

    data.forEach((step: RouteWithVia) => {
      const pathNodes = [
        { name: step.from, latitude: step.fromLatitude, longitude: step.fromLongitude },
        ...(step.via || []), // via peut être undefined
        { name: step.to, latitude: step.toLatitude, longitude: step.toLongitude },
      ].filter(n => n.name && n.latitude != null && n.longitude != null);

      // Ajouter les markers pour tous les nœuds
      pathNodes.forEach(node => {
        newMarkers.push({ position: [node.latitude, node.longitude], label: node.name });
      });

      // Ajouter les segments entre les nœuds
      for (let i = 0; i < pathNodes.length - 1; i++) {
        newLines.push({
          positions: [
            [pathNodes[i].latitude, pathNodes[i].longitude],
            [pathNodes[i + 1].latitude, pathNodes[i + 1].longitude],
          ],
          color: '#ff5722',
        });
      }
    });

    setMarkers(newMarkers);
    setLines(newLines);
  };


  return (
    <div>
      <Header />
      <div className="app-container">
        <div className="map-container">
          <Map markers={markers} lines={lines} />
        </div>
        <aside className="sidebar">
          <h2>Opérations</h2>
          {['A', 'B', 'C', 'D'].map(section => (
            <details key={section} className="operation-section">
              <summary>Section {section}</summary>

              {operations.filter(op => op.section === section).map(op => (
                <div key={`${op.section}-${op.index}`} className="operation" onClick={() => handleOperationClick(op)}>
                  {op.title}
                </div>
              ))}

              {section === 'A' && (
                <div style={{ marginTop: '1rem' }}>
                  <h4>Liste d'un aéroport</h4>
                  <input type="number" placeholder="ID aéroport" onChange={e => setAirportId(Number(e.target.value))} />

                  <h4>Ajouter un aéroport</h4>
                  <input type="number" placeholder="ID" onChange={e => setNewAirport({ ...newAirport, airport_id: Number(e.target.value) })} />
                  <input placeholder="Nom" onChange={e => setNewAirport({ ...newAirport, name: e.target.value })} />
                  <input placeholder="IATA" onChange={e => setNewAirport({ ...newAirport, iata: e.target.value })} />
                  <input placeholder="ICAO" onChange={e => setNewAirport({ ...newAirport, icao: e.target.value })} />
                  <input type="number" placeholder="Latitude" onChange={e => setNewAirport({ ...newAirport, latitude: Number(e.target.value) })} />
                  <input type="number" placeholder="Longitude" onChange={e => setNewAirport({ ...newAirport, longitude: Number(e.target.value) })} />

                  <h4>Mettre à jour une compagnie</h4>
                  <input type="number" placeholder="ID compagnie" onChange={e => setUpdateData({ ...updateData, airline_id: Number(e.target.value) })} />
                  <input placeholder="Nouveau nom" onChange={e => setUpdateData({ ...updateData, newName: e.target.value })} />

                  <h4>Supprimer un aéroport</h4>
                  <input type="number" placeholder="ID à supprimer" onChange={e => setDeleteId(Number(e.target.value))} />
                </div>
              )}

              {section === 'B' && (
                <div style={{ marginTop: '1rem' }}>
                  <h4>Opérations routes</h4>
                  <input type="number" placeholder="ID aéroport de départ" onChange={e => setStartAirportId(Number(e.target.value))} />
                  <input type="number" placeholder="ID aéroport d'arrivée" onChange={e => setEndAirportId(Number(e.target.value))} />
                </div>
              )}

              {section === 'C' && (
                <div style={{ marginTop: '1rem' }}>
                  <h4>Airline operations</h4>
                  <input type="number" placeholder="ID compagnie" onChange={e => setAirlineId(Number(e.target.value))} />
                  <input type="number" placeholder="ID aéroport / ID compagnie(2)" onChange={e => setAirportQueryId(Number(e.target.value))} />
                </div>
              )}

            </details>
          ))}
          {rawOutput && <pre className="raw-output">{rawOutput}</pre>}
        </aside>
      </div>
    </div>
  );
};

export default App;
