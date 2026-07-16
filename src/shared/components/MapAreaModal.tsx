import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Button, List, ListItem, ListItemText, IconButton } from "@mui/material";
import { MapContainer, TileLayer, Marker, Polygon, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";

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
const SINGLE_POINT_ZOOM = 16;

interface MapPoint {
  id: string;
  lat: number;
  lng: number;
}

interface MapAreaModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (points: MapPoint[]) => void;
  initialPoints?: MapPoint[];
  title?: string;
  isViewMode?: boolean;
}

function RecenterMap({ points }: { points: MapPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return;
    }

    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], SINGLE_POINT_ZOOM);
      return;
    }

    const bounds = L.latLngBounds(points.map((point) => [point.lat, point.lng] as [number, number]));
    map.fitBounds(bounds, {
      padding: [36, 36],
      maxZoom: 17,
    });
  }, [map, points]);

  return null;
}

function SelectedPointPan({ pointId, points }: { pointId: string | null; points: MapPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (!pointId) return;
    const p = points.find((pt) => pt.id === pointId);
    if (!p) return;
    map.setView([p.lat, p.lng], SINGLE_POINT_ZOOM);
  }, [map, pointId, points]);
  return null;
}

function PointClickHandler({
  onPointAdded,
}: {
  onPointAdded: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPointAdded(
        Math.round(e.latlng.lat * 1e6) / 1e6,
        Math.round(e.latlng.lng * 1e6) / 1e6,
      );
    },
  });
  return null;
}

export default function MapAreaModal({
  open,
  onClose,
  onSave,
  initialPoints = [],
  title = "Επιλογή Περιοχής στον Χάρτη",
  isViewMode = false,
}: MapAreaModalProps) {
  const [points, setPoints] = useState<MapPoint[]>(initialPoints);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  useEffect(() => {
    setPoints(initialPoints);
  }, [initialPoints, open]);

  useEffect(() => {
    if (open) console.debug("MapAreaModal open, isViewMode:", isViewMode);
  }, [open, isViewMode]);

  const handlePointAdded = (lat: number, lng: number) => {
    const newPoint: MapPoint = {
      id: `${Date.now()}-${Math.random()}`,
      lat,
      lng,
    };
    setPoints([...points, newPoint]);
    setSelectedPointId(newPoint.id);
  };

  const handlePointMoved = (id: string, lat: number, lng: number) => {
    setPoints((prev) => prev.map((p) => (p.id === id ? { ...p, lat, lng } : p)));
  };

  const handleRemovePoint = (id: string) => {
    setPoints(points.filter((p) => p.id !== id));
    if (selectedPointId === id) setSelectedPointId(null);
  };

  const handleClearPoints = () => {
    setPoints([]);
    setSelectedPointId(null);
  };

  const handleSave = () => {
    onSave(points);
    onClose();
  };

  const handleCancel = () => {
    setPoints(initialPoints);
    setSelectedPointId(null);
    onClose();
  };

  const center = points.length > 0
    ? [
        points.reduce((sum, p) => sum + p.lat, 0) / points.length,
        points.reduce((sum, p) => sum + p.lng, 0) / points.length,
      ] as [number, number]
    : DEFAULT_CENTER;

  const polygonPoints = points.map((p) => [p.lat, p.lng] as [number, number]);
  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        {title}{isViewMode ? ' — Προβολή' : ''}
      </DialogTitle>
      <DialogContent sx={{ display: "flex", gap: 2, height: 500 }}>
        {/* Map Section */}
        <Box sx={{ flex: 2, borderRadius: "8px", overflow: "hidden", border: "1px solid var(--color-border)" }}>
          <MapContainer
            center={center}
            zoom={points.length > 0 ? 14 : DEFAULT_ZOOM}
            style={{ width: "100%", height: "100%" }}
            zoomControl
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {!isViewMode && <PointClickHandler onPointAdded={handlePointAdded} />}
            <RecenterMap points={points} />
            <SelectedPointPan pointId={selectedPointId} points={points} />

            {points.length > 0 && (
              <>
                {!isViewMode && points.map((point, index) => (
                  <Marker
                    key={point.id}
                    position={[point.lat, point.lng]}
                    draggable={!isViewMode}
                    eventHandlers={
                      !isViewMode
                        ? {
                            dragend: (e) => {
                              const trg = e.target as L.Marker;
                              const ll = trg.getLatLng();
                              handlePointMoved(point.id, Math.round(ll.lat * 1e6) / 1e6, Math.round(ll.lng * 1e6) / 1e6);
                            },
                            click: () => setSelectedPointId(point.id),
                          }
                        : undefined
                    }
                    interactive={!isViewMode}
                    icon={L.divIcon({
                      className: "numbered-map-marker",
                      html: `<div style="width:26px;height:26px;border-radius:9999px;background:${selectedPointId === point.id ? '#ef4444' : '#1d4ed8'};color:#fff;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;box-shadow:0 2px 6px rgba(0,0,0,0.35);">${index + 1}</div>`,
                      iconSize: [26, 26],
                      iconAnchor: [13, 13],
                    })}
                  />
                ))}
                {polygonPoints.length >= 3 && (
                  <Polygon
                    positions={polygonPoints}
                    interactive={!isViewMode}
                    pathOptions={{
                      color: "#3b82f6",
                      fillColor: "#3b82f6",
                      fillOpacity: 0.2,
                    }}
                  />
                )}
              </>
            )}
          </MapContainer>
        </Box>

        {/* Points List Section (hidden in view-only mode) */}
        {!isViewMode && (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, overflow: "auto" }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Σημεία ({points.length})
            </Typography>
            {points.length === 0 ? (
              <Typography variant="caption" color="text.secondary">
                Κάντε κλικ στον χάρτη για να προσθέσετε σημεία
              </Typography>
            ) : null}
          </Box>

          <List sx={{ flex: 1, overflow: "auto" }}>
            {points.map((point, index) => (
              <ListItem
                key={point.id}
                selected={selectedPointId === point.id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => handleRemovePoint(point.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
                sx={{ py: 0.5, cursor: 'pointer' }}
                onClick={() => setSelectedPointId(point.id)}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, pr: 4 }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      backgroundColor: selectedPointId === point.id ? '#ef4444' : '#1d4ed8',
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </Box>
                  <ListItemText
                    primary={<Typography variant="caption">{`Σημείο ${index + 1}`}</Typography>}
                    secondary={<Typography variant="caption" noWrap>{`${point.lat}, ${point.lng}`}</Typography>}
                  />
                </Box>
              </ListItem>
            ))}
          </List>

          {/* {points.length >= 3 && (
            <Box sx={{ pt: 1, borderTop: "1px solid var(--color-border)" }}>
              <Typography variant="caption" color="text.secondary">
                Περιοχή: ~{area.toFixed(4)}° ²
              </Typography>
            </Box>
          )} */}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ gap: 1, '& .MuiButton-root': { textTransform: 'none' } }}>
        {isViewMode ? (
          <Button onClick={onClose} variant="contained">Κλείσιμο</Button>
        ) : (
          <>
            <Button
              onClick={handleClearPoints}
              variant="text"
              color="error"
              disabled={points.length === 0}
            >
              Καθαρισμός όλων των σημείων
            </Button>
            <Button onClick={handleCancel} variant="outlined">
              Ακύρωση
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={points.length === 0}
            >
              Αποθήκευση ({points.length} σημεία)
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
