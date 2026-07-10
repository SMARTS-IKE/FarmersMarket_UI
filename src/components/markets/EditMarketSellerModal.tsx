import { Box, Dialog, DialogContent, DialogTitle } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import CustomButton from "../../shared/components/CustomButton";
import CustomInputField from "../../shared/components/CustomInputField";

export default function EditMarketSellerModal({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (payload: { spotNumber?: number; spotLength?: number; fromDate?: string; notes?: string }) => Promise<void> | void;
  initial?: { spotNumber?: number | string; spotLength?: number | string; fromDate?: string; notes?: string; sellerFullName?: string } | null;
}) {
  const [spotNumber, setSpotNumber] = useState<string>(String(initial?.spotNumber ?? ""));
  const [spotLength, setSpotLength] = useState<string>(String(initial?.spotLength ?? ""));
  const [fromDate, setFromDate] = useState<string>(initial?.fromDate ?? "");
  const [notes, setNotes] = useState<string>(initial?.notes ?? "");

  useEffect(() => {
    if (!open) return;
    setSpotNumber(String(initial?.spotNumber ?? ""));
    setSpotLength(String(initial?.spotLength ?? ""));
    setFromDate(initial?.fromDate ?? "");
    setNotes(initial?.notes ?? "");
  }, [open, initial]);

  const isSaveDisabled = useMemo(() => {
    if (spotNumber.trim() === "" || spotLength.trim() === "") return true;
    if (Number(spotNumber) < 0 || Number(spotLength) < 0) return true;
    return false;
  }, [spotNumber, spotLength]);

  const handleSave = async () => {
    const payload = {
      spotNumber: Number(spotNumber),
      spotLength: Number(spotLength),
      fromDate: fromDate || undefined,
      notes: notes || undefined,
    };

    await onSave(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Επεξεργασία Στοιχείων Πωλητή</DialogTitle>
      <DialogContent>
        <Box className="flex flex-col gap-4 pt-2">
          <CustomInputField
            type="NUMBER"
            label="Αριθμός θέσης"
            value={spotNumber}
            onChange={(v) => setSpotNumber(String(v))}
            width="100%"
            validation={{ required: true, min: 0 }}
          />

          <CustomInputField
            type="NUMBER"
            label="Μήκος θέσης"
            value={spotLength}
            onChange={(v) => setSpotLength(String(v))}
            width="100%"
            validation={{ required: true, min: 0 }}
          />

          <CustomInputField
            type="DATE"
            label="Ημερομηνία Έναρξης"
            value={fromDate}
            onChange={(v) => setFromDate(String(v))}
            width="100%"
          />

          <CustomInputField
            type="TEXTAREA"
            label="Σημειώσεις"
            value={notes}
            onChange={(v) => setNotes(String(v))}
            width="100%"
            bottomOnly={true}
          />

          <Box className="mt-2 flex justify-end gap-3">
            <CustomButton
              title="Ακύρωση"
              backgroundColor="transparent"
              onClick={onClose}
              width={120}
              sx={{
                color: "var(--color-dark)",
                border: "1px solid var(--color-text-muted)",
                "&:hover": {
                  backgroundColor: "transparent",
                  borderColor: "var(--color-text-muted)",
                  filter: "none",
                },
              }}
            />

            <CustomButton
              title="Αποθήκευση"
              backgroundColor="var(--color-text)"
              onClick={handleSave}
              width={140}
              disabled={isSaveDisabled}
            />
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
