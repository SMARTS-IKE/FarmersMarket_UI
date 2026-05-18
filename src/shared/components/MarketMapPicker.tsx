import { Box, TextField, Typography } from "@mui/material";
import OpenStreetMap from "./OpenStreetMap";

interface MarketMapPickerProps {
  latitude: number | null;
  longitude: number | null;
  radius: number | null;
  onChange?: (lat: number, lng: number) => void;
  onRadiusChange?: (radius: number | null) => void;
  disabled?: boolean;
  height?: number;
}

export default function MarketMapPicker({
  latitude,
  longitude,
  radius,
  onChange,
  onRadiusChange,
  disabled = false,
  height = 200,
}: MarketMapPickerProps) {
  const hasPosition = latitude !== null && longitude !== null;

  return (
    <Box className="flex flex-col gap-3 border p-4" sx={{ flex: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Τοποθεσία Αγοράς στον Χάρτη
      </Typography>

      <Box
        sx={{
          width: "100%",
          height,
          borderRadius: "8px",
          overflow: "hidden",
          border: "1px solid var(--color-text-muted)",
          cursor: disabled ? "default" : "crosshair",
        }}
      >
        <OpenStreetMap
          latitude={latitude}
          longitude={longitude}
          onLocationChange={onChange}
          readOnly={disabled}
          height={height}
          width="100%"
          radius={radius}
        />
      </Box>

      <Box className="flex flex-wrap items-center gap-4">
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1, minWidth: 160 }}>
          {hasPosition
            ? `Συντεταγμένες: ${latitude}, ${longitude}`
            : disabled
              ? "—"
              : "Κάντε κλικ στον χάρτη για να επιλέξετε τοποθεσία"}
        </Typography>

        <TextField
          label="Ακτίνα (m)"
          type="number"
          size="small"
          disabled={disabled}
          value={radius ?? ""}
          onChange={(e) => {
            const raw = e.target.value;
            onRadiusChange?.(raw === "" ? null : Math.max(0, Number(raw)));
          }}
          slotProps={{ htmlInput: { min: 0, step: 50 } }}
          sx={{ width: 140 }}
        />
      </Box>
    </Box>
  );
}
