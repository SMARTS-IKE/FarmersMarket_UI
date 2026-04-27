import { Box, Dialog, DialogContent, DialogTitle } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import CustomButton from "../../shared/components/CustomButton";
import CustomInputField from "../../shared/components/CustomInputField";

export default function AddSellerModal({
  open,
  onClose,
  onSave,
  sellerOptions,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (payload: { sellerId: number; spotNumber: number; spotLength: number }) => void;
  sellerOptions: Array<{ label: string; value: string | number }>;
}) {
  const [selectedSellerId, setSelectedSellerId] = useState("");
  const [sellerSpotNumber, setSellerSpotNumber] = useState("");
  const [sellerSpotLength, setSellerSpotLength] = useState("");

  useEffect(() => {
    if (!open) {
      setSelectedSellerId("");
      setSellerSpotNumber("");
      setSellerSpotLength("");
    }
  }, [open]);

  const isSaveDisabled = useMemo(
    () =>
      !selectedSellerId ||
      sellerSpotNumber.trim() === "" ||
      sellerSpotLength.trim() === "" ||
      Number(sellerSpotNumber) < 0 ||
      Number(sellerSpotLength) < 0,
    [selectedSellerId, sellerSpotLength, sellerSpotNumber]
  );

  const handleSave = () => {
    const sellerId = Number(selectedSellerId);
    const spotNumber = Number(sellerSpotNumber);
    const spotLength = Number(sellerSpotLength);

    if (!Number.isFinite(sellerId)) return;
    if (!Number.isFinite(spotNumber) || spotNumber < 0) return;
    if (!Number.isFinite(spotLength) || spotLength < 0) return;

    onSave({ sellerId, spotNumber, spotLength });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Προσθήκη πωλητή</DialogTitle>
      <DialogContent>
        <Box className="flex flex-col gap-4 pt-2">
          <CustomInputField
            type="DROPDOWN"
            label="Πωλητής"
            value={selectedSellerId}
            onChange={(value) => setSelectedSellerId(String(value))}
            dropdownItems={sellerOptions}
            width="100%"
            validation={{ required: true }}
          />

          <CustomInputField
            type="NUMBER"
            label="Αριθμός θέσης"
            value={sellerSpotNumber}
            onChange={(value) => setSellerSpotNumber(String(value))}
            width="100%"
            validation={{ required: true, min: 0 }}
          />

          <CustomInputField
            type="NUMBER"
            label="Μήκος θέσης"
            value={sellerSpotLength}
            onChange={(value) => setSellerSpotLength(String(value))}
            width="100%"
            validation={{ required: true, min: 0 }}
          />

          <Box className="mt-2 flex justify-end gap-3">
            <CustomButton
              title="Cancel"
              backgroundColor="transparent"
              width="fit-content"
              onClick={onClose}
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
            <CustomButton title="Save" width="fit-content" disabled={isSaveDisabled} onClick={handleSave} />
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
