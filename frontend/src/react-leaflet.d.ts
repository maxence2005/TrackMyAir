declare module 'react-leaflet' {
    import { FC } from 'react';
    import { LatLngTuple, LatLngExpression } from 'leaflet';

    interface MapContainerProps {
        center: LatLngTuple;
        zoom: number;
        style?: React.CSSProperties;
        children?: React.ReactNode;
    }

    interface TileLayerProps {
        url: string;
        attribution?: string;
    }

    interface CircleMarkerProps {
        center: LatLngExpression;
        radius?: number;
        color?: string;
        children?: React.ReactNode;
    }

    interface PolylineProps {
        positions: LatLngExpression[];
        color?: string;
        weight?: number;
        opacity?: number;
    }

    interface PopupProps {
        children?: React.ReactNode;
    }

    export const MapContainer: FC<MapContainerProps>;
    export const TileLayer: FC<TileLayerProps>;
    export const CircleMarker: FC<CircleMarkerProps>;
    export const Polyline: FC<PolylineProps>;
    export const Popup: FC<PopupProps>;
}