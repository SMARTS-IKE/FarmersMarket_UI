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
  title = "",
  prefixIcon,
  backgroundColor = "var(--color-text)",
  disabled = false,
  width = 140,
  onClick,
  sx,
}: CustomButtonProps) {
  const hasTitle = title.trim() !== "";

  return (
    <Button
      variant="contained"
      disabled={disabled}
      startIcon={prefixIcon}
      onClick={onClick}
      sx={{
        height: 30,
        width,
        minWidth: 0,
        backgroundColor,
        textTransform: "none",
        ...(!hasTitle && {
          "& .MuiButton-startIcon": {
            marginLeft: 0,
            marginRight: 0,
          },
        }),
        "&:hover": {
          backgroundColor,
          filter: "brightness(0.9)",
        },
        ...sx,
      }}
    >
      {hasTitle ? title : null}
    </Button>
  );
}
