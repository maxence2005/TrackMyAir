import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  markers: Array<{
    position: [number, number];
    label?: string;
    degree?: number;
  }>;
  lines?: Array<{
    positions: [number, number][];
    color?: string;
  }>;
}

const Map: React.FC<MapProps> = ({ markers = [], lines = [] }) => {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: 'calc(100vh - 60px)', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      
      {markers.map((marker, idx) => (
        <CircleMarker
          key={idx}
          center={marker.position}
          radius={marker.degree || 5}
          color="#ff5722"
        >
          {marker.label && <Popup>{marker.label}</Popup>}
        </CircleMarker>
      ))}

      {lines.map((line, idx) => (
        <Polyline
          key={idx}
          positions={line.positions}
          color={line.color || '#2b7cff'}
          weight={2}
          opacity={0.8}
        />
      ))}
    </MapContainer>
  );
};

export default Map;