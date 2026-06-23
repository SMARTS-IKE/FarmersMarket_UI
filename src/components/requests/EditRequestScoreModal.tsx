import { Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import CustomInputField from "../../shared/components/CustomInputField";
import CustomButton from "../../shared/components/CustomButton";
import { useState, useEffect } from "react";

export default function EditRequestScoreModal({
  open,
  onClose,
  onSave,
  initialScore,
  saving = false,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (payload: { score: number | null; note?: string }) => void;
  initialScore?: number | null;
  saving?: boolean;
}) {
  const [score, setScore] = useState<number | null>(initialScore ?? null);
  const [comment, setComment] = useState<string>("");

  useEffect(() => {
    if (open) {
      setScore(initialScore ?? null);
      setComment("");
    }
  }, [open, initialScore]);

  const handleSave = () => {
    onSave({ score, note: comment || undefined });
  };

  const isValid = score !== null && String(comment || '').trim() !== '';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Επεξεργασία Βαθμολογίας Αίτησης</DialogTitle>
      <DialogContent>
        <div className="grid grid-cols-1 gap-4 pt-2">
          <CustomInputField
            type="NUMBER"
            label="Νέα Βαθμολογία *"
            value={score ?? ''}
            onChange={(v) => setScore(v === '' ? null : Number(v))}
            validation={{ required: true }}
            showValidation
            width="100%"
          />

          <TextField
            label="Σχόλια *"
            multiline
            minRows={3}
            fullWidth
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            error={String(comment || "").trim() === ""}
            helperText={String(comment || "").trim() === "" ? "Το πεδίο είναι υποχρεωτικό." : ""}
          />
        </div>
      </DialogContent>

      <DialogActions sx={{ gap: 1 }}>
        <CustomButton
          title="Ακύρωση"
          backgroundColor="var(--color-text-muted)"
          width="fit-content"
          onClick={onClose}
        />
        <CustomButton
          title={saving ? "Αποθήκευση..." : "Αποθήκευση"}
          width="fit-content"
          disabled={!isValid || saving}
          onClick={handleSave}
        />
      </DialogActions>
    </Dialog>
  );
}
