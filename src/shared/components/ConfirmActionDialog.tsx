import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

type Action = "accept" | "reject" | null;

interface ConfirmActionDialogProps {
  open: boolean;
  action: Action;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmActionDialog({ open, action, onClose, onConfirm }: ConfirmActionDialogProps) {
  const title = action === "accept" ? "Επιβεβαίωση αποδοχής" : "Επιβεβαίωση απόρριψης";
  const content = action === "accept"
    ? "Είστε βέβαιοι ότι θέλετε να εγκρίνετε αυτή την αίτηση;"
    : "Είστε βέβαιοι ότι θέλετε να απορρίψετε αυτή την αίτηση?";

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{content}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>Ακύρωση</Button>
        <Button onClick={onConfirm} variant="contained" color={action === "accept" ? "success" : "error"} sx={{ textTransform: 'none' }}>
          Επιβεβαίωση
        </Button>
      </DialogActions>
    </Dialog>
  );
}
