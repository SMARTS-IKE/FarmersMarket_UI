import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const DEFAULT_CENTER: [number, number] = [38.5, 22.5];
const DEFAULT_ZOOM = 6;
const SELECTED_ZOOM = 14;

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], SELECTED_ZOOM);
  }, [lat, lng, map]);
  return null;
}

function ClickHandler({
  disabled,
  onSelect,
}: {
  disabled: boolean;
  onSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (!disabled) {
        onSelect(
          Math.round(e.latlng.lat * 1e6) / 1e6,
          Math.round(e.latlng.lng * 1e6) / 1e6,
        );
      }
    },
  });
  return null;
}

export interface OpenStreetMapProps {
  /** Current marker latitude, or null if no marker is placed */
  latitude: number | null;
  /** Current marker longitude, or null if no marker is placed */
  longitude: number | null;
  /** Called when user clicks on the map or drags the marker */
  onLocationChange?: (lat: number, lng: number) => void;
  /** When true the map is read-only: no click handling, no draggable marker */
  readOnly?: boolean;
  /** Height of the map container in pixels */
  height?: number;
  /** Width of the map container (CSS value) */
  width?: number | string;
  /** Radius in meters to draw a circle around the marker */
  radius?: number | null;
  /** Fill colour for the radius circle */
  circleColor?: string;
}

export default function OpenStreetMap({
  latitude,
  longitude,
  onLocationChange,
  readOnly = false,
  height = 260,
  width = "100%",
  radius = null,
  circleColor = "#3b82f6",
}: OpenStreetMapProps) {
  const hasPosition = latitude !== null && longitude !== null;

  return (
    <MapContainer
      center={hasPosition ? [latitude, longitude] : DEFAULT_CENTER}
      zoom={hasPosition ? SELECTED_ZOOM : DEFAULT_ZOOM}
      style={{ width, height }}
      zoomControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ClickHandler
        disabled={readOnly}
        onSelect={(lat, lng) => onLocationChange?.(lat, lng)}
      />

      {hasPosition && (
        <>
          <RecenterMap lat={latitude} lng={longitude} />
          <Marker
            position={[latitude, longitude]}
            draggable={!readOnly}
            eventHandlers={{
              dragend(e) {
                if (!readOnly) {
                  const { lat, lng } = (e.target as L.Marker).getLatLng();
                  onLocationChange?.(
                    Math.round(lat * 1e6) / 1e6,
                    Math.round(lng * 1e6) / 1e6,
                  );
                }
              },
            }}
          />
          {radius !== null && radius > 0 && (
            <Circle
              center={[latitude, longitude]}
              radius={radius}
              pathOptions={{ color: circleColor, fillColor: circleColor, fillOpacity: 0.15 }}
            />
          )}
        </>
      )}
    </MapContainer>
  );
}
