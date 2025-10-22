import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/* =========================================================
   ✈️ Interfaces
========================================================= */
export interface Airport {
  airport_id: number;
  name: string;
  iata: string;
  icao: string;
  latitude: number;
  longitude: number;
}

export interface Airline {
  airline_id: number;
  name: string;
}

export interface Route {
  from: string;
  to: string;
  fromLatitude?: number;
  fromLongitude?: number;
  toLatitude?: number;
  toLongitude?: number;
  distance?: number;
  stops?: number;
  airlines?: string[];
}

export interface RouteWithVia {
  from: string;
  fromLatitude: number;
  fromLongitude: number;
  via: { name: string; latitude: number; longitude: number }[];
  to: string;
  toLatitude: number;
  toLongitude: number;
  stops: number;
  distance?: number;
}

/* =========================================================
   🅰️ SECTION A — Airports & Airlines (ExploreController)
   /api/explore/...
========================================================= */
export const getAirports = () =>
  axios.get<Airport[]>(`${API_URL}/explore/airports`);

export const getAirportById = (airport_id: number) =>
  axios.get<Airport>(`${API_URL}/explore/airports/${airport_id}`);

export const addAirport = (airport: Airport) =>
  axios.post(`${API_URL}/explore/airports`, airport);

export const updateAirline = (airline_id: number, newName: string) =>
  axios.put(`${API_URL}/explore/airlines`, { airline_id, name: newName });

export const deleteAirport = (airport_id: number) =>
  axios.delete(`${API_URL}/explore/airports/${airport_id}`);

/* =========================================================
   🅱️ SECTION B — Routes (RouteController)
   /api/routes/...
========================================================= */
export const getRoutesFromAirport = (airport_id: number) =>
  axios.get<Route[]>(`${API_URL}/routes/airport/${airport_id}`);

export const getAverageStops = () =>
  axios.get<{ avgStops: number }>(`${API_URL}/routes/avg-stops`);

export const getShortestPathStops = (startId: number, endId: number) =>
  axios.get<RouteWithVia[]>(`${API_URL}/routes/shortest-stops/${startId}/${endId}`);

export const getLongestPathStops = (startId: number, endId: number) =>
  axios.get<RouteWithVia[]>(`${API_URL}/routes/longest-stops/${startId}/${endId}`);

export const getShortestPathDistance = (startId: number, endId: number) =>
  axios.get<RouteWithVia[]>(`${API_URL}/routes/shortest-distance/${startId}/${endId}`);

export const getLongestPathDistance = (startId: number, endId: number) =>
  axios.get<RouteWithVia[]>(`${API_URL}/routes/longest-distance/${startId}/${endId}`);

export const deleteIsolatedAirport = () =>
  axios.delete(`${API_URL}/routes/isolated`);

export const getAverageDistance = () =>
  axios.get<{ avgStops: number }>(`${API_URL}/routes/avg-distance`);

/* =========================================================
   🅲 SECTION C — Airlines (AirlineController)
   /api/airlines/...
========================================================= */
export const getAllAirlines = () =>
  axios.get<Airline[]>(`${API_URL}/airlines`);

export const compareAirlinesNetworks = (id1: number, id2: number) =>
  axios.get(`${API_URL}/airlines/compare/${id1}/${id2}`);


export const getTopAirlinesByCoverage = () =>
  axios.get<{ airline: string; coverage: number }[]>(`${API_URL}/airlines/top-coverage`);

export const getAirlinesServingAirport = (airport_id: number) =>
  axios.get<Airline[]>(`${API_URL}/airlines/serving/${airport_id}`);

export const getRoutesByAirline = (airline_id: number) =>
  axios.get<Route[]>(`${API_URL}/airlines/${airline_id}/routes`);

export const getExclusiveRoutes = (airline_id: number) =>
  axios.get<Route[]>(`${API_URL}/airlines/${airline_id}/exclusive`);

/* =========================================================
   🅳 SECTION D — Hubs & Centrality (HubController)
   /api/hubs/...
========================================================= */
export const getTop10Hubs = () =>
  axios.get<{ airport: string; lat: number; lon: number; degree: number }[]>(`${API_URL}/hubs/top`);

export const getClosenessCentrality = () =>
  axios.get<{ airport: string; lat: number; lon: number; centrality: number }[]>(`${API_URL}/hubs/closeness`);

export const getBetweennessCentrality = () =>
  axios.get<{ airport: string; lat: number; lon: number; centrality: number }[]>(`${API_URL}/hubs/betweenness`);

export const getLouvainCommunities = () =>
  axios.get<{ airport: string; lat: number; lon: number; communityId: number }[]>(`${API_URL}/hubs/communities`);
