import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from "@mui/material";

type Action = "accept" | "reject" | null;

interface ConfirmActionDialogProps {
  open: boolean;
  action: Action;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
}

export default function ConfirmActionDialog({ open, action, onClose, onConfirm }: ConfirmActionDialogProps) {
  const [reason, setReason] = useState("");

  const title = action === "accept" ? "Επιβεβαίωση αποδοχής" : "Επιβεβαίωση απόρριψης";

  const isReject = action === 'reject';
  const isConfirmDisabled = isReject && reason.trim() === '';

  const handleConfirm = () => {
    if (isReject && reason.trim() === '') return;
    if (action === 'reject') {
      onConfirm(reason.trim());
      setReason('');
    } else {
      onConfirm();
    }
  };

  return (
    <Dialog open={open} onClose={() => { setReason(''); onClose(); }} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {action === 'accept' ? (
          <Typography>Είστε βέβαιοι ότι θέλετε να εγκρίνετε αυτή την αίτηση;</Typography>
        ) : (
          <>
            <Typography>Παρακαλώ εισάγετε τον λόγο της απόρριψης (προαιρετικό):</Typography>
            <TextField
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              multiline
              minRows={3}
              fullWidth
              margin="normal"
              variant="outlined"
              placeholder="Λόγος απόρριψης"
              error={isReject && reason.trim() === ''}
              helperText={isReject && reason.trim() === '' ? 'Απαιτείται λόγος απόρριψης' : ''}
            />
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ '& .MuiButton-root': { textTransform: 'none' } }}>
        <Button onClick={() => { setReason(''); onClose(); }} sx={{ textTransform: 'none' }}>Ακύρωση</Button>
        <Button onClick={handleConfirm} disabled={isConfirmDisabled} variant="contained" color={action === "accept" ? "success" : "error"} sx={{ textTransform: 'none' }}>
          Επιβεβαίωση
        </Button>
      </DialogActions>
    </Dialog>
  );
}
