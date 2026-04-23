import { Box, Typography } from "@mui/material";

interface MapLocationPlaceholderProps {
  title?: string;
  message?: string;
  height?: number;
  width?: number | string;
}

export default function MapLocationPlaceholder({
  title = "Τοποθεσία Αγοράς στον Χάρτη",
  message = "Προεπισκόπηση χάρτη θα εμφανιστεί εδώ",
  height = 220,
  width = "100%",
}: MapLocationPlaceholderProps) {
  return (
    <Box className="flex flex-col gap-3 border p-4" sx={{ width }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>

      <Box
        sx={{
          width: "100%",
          height,
          border: "1px dashed var(--color-text-muted)",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, rgba(230,230,230,0.45) 0%, rgba(245,245,245,0.75) 100%)",
        }}
      >
        <Typography
          variant="body2"
          sx={{ color: "var(--color-text-muted)", textAlign: "center", px: 2 }}
        >
          {message}
        </Typography>
      </Box>
    </Box>
  );
}
