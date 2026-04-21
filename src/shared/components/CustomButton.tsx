import { Button } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";

interface CustomButtonProps {
  title?: string;
  prefixIcon?: React.ReactNode;
  backgroundColor?: string;
  disabled?: boolean;
  width?: number | string;
  onClick?: () => void;
  sx?: SxProps<Theme>;
}

export default function CustomButton({
  title = "Κουμπί",
  prefixIcon,
  backgroundColor = "var(--color-text)",
  disabled = false,
  width = 140,
  onClick,
  sx,
}: CustomButtonProps) {
  return (
    <Button
      variant="contained"
      disabled={disabled}
      startIcon={prefixIcon}
      onClick={onClick}
      sx={{
        height: 30,
        width,
        backgroundColor,
        textTransform: "none",
        "&:hover": {
          backgroundColor,
          filter: "brightness(0.9)",
        },
        ...sx,
      }}
    >
      {title}
    </Button>
  );
}
