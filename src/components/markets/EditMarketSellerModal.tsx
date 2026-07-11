import { Box, Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
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
  initial?: { spotNumber?: number | string; spotLength?: number | string; fromDate?: string; notes?: string; sellerFullName?: string; sellerId?: number | string; firstName?: string; lastName?: string } | null;
}) {
  const [spotNumber, setSpotNumber] = useState<string>(String(initial?.spotNumber ?? ""));
  const [spotLength, setSpotLength] = useState<string>(String(initial?.spotLength ?? ""));
  const normalizeToInputDate = (raw?: unknown) => {
    if (raw === null || raw === undefined) return "";
    const s = String(raw).trim();
    if (!s) return "";
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const [fromDate, setFromDate] = useState<string>(normalizeToInputDate(initial?.fromDate));
  const [notes, setNotes] = useState<string>(initial?.notes ?? "");

  useEffect(() => {
    if (!open) return;
    setSpotNumber(String(initial?.spotNumber ?? ""));
    setSpotLength(String(initial?.spotLength ?? ""));
    setFromDate(normalizeToInputDate(initial?.fromDate));
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

  const navigate = useNavigate();

  const resolvedFullName = useMemo(() => {
    if (initial?.sellerFullName) return String(initial.sellerFullName).trim();
    if (initial?.firstName || initial?.lastName) return `${initial?.firstName ?? ""} ${initial?.lastName ?? ""}`.trim();
    return "";
  }, [initial]);

  const resolvedFromDate = useMemo(() => {
    const raw = initial?.fromDate ?? fromDate ?? "";
    if (!raw) return "";
    try {
      const d = new Date(String(raw));
      if (isNaN(d.getTime())) return String(raw);
      return d.toLocaleDateString("el-GR");
    } catch {
      return String(raw);
    }
  }, [initial?.fromDate]);

  const handleOpenSeller = () => {
    const sellerId = initial?.sellerId ?? (initial ? (initial as any).id : undefined);
    if (!sellerId) return;
    navigate({ to: `/admin/sellers/${String(sellerId)}` });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Επεξεργασία Στοιχείων Πωλητή</DialogTitle>
      <DialogContent>
        <Box className="flex flex-col gap-4 pt-2">
          {resolvedFullName ? (
            <Box className="flex items-center gap-3">
              <div className="flex flex-col">
                <h4 className="text-(--color-text-heading) text-lg font-medium">{resolvedFullName}</h4>
                {resolvedFromDate ? (
                  <span className="text-sm text-(--color-text-muted)">Από: {resolvedFromDate}</span>
                ) : null}
              </div>
              <IconButton
                aria-label="Προβολή πωλητή"
                onClick={handleOpenSeller}
                disabled={!initial?.sellerId}
                size="small"
                sx={{ color: "var(--color-text)" }}
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : null}
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
