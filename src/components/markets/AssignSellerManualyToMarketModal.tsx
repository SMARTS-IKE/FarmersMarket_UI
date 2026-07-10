import { Box, Dialog, DialogContent, DialogTitle } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import CustomButton from "../../shared/components/CustomButton";
import CustomInputField from "../../shared/components/CustomInputField";
import type { SellerListResponse, Seller } from "../../models/seller";

export default function AssignSellerManualyToMarketModal({
  open,
  onClose,
  onSave,
  sellerOptions,
  sellersData,
  assignedSellerIds,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (payload: { sellerId: number; spotNumber: number; spotLength: number; fromDate?: string; notes?: string }) => void;
  sellerOptions?: Array<{ label: string; value: string | number }>;
  sellersData?: SellerListResponse | null;
  assignedSellerIds?: Array<number | string>;
}) {
  const [selectedSellerId, setSelectedSellerId] = useState("");
  const [sellerSpotNumber, setSellerSpotNumber] = useState("");
  const [sellerSpotLength, setSellerSpotLength] = useState("");
  const [fromDate, setFromDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  useEffect(() => {
    if (!open) {
      setSelectedSellerId("");
      setSellerSpotNumber("");
      setSellerSpotLength("");
      setFromDate("");
      setNotes("");
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

    onSave({ sellerId, spotNumber, spotLength, fromDate: fromDate || undefined, notes: notes || undefined });
  };

  const filteredSellerOptions = useMemo(() => {
    // Build base options from `sellerOptions` prop (preferred) or `sellersData`.
    const assignedSet = new Set((assignedSellerIds ?? []).map((id) => String(id)));

    if (Array.isArray(sellerOptions) && sellerOptions.length > 0) {
      const filtered = sellerOptions.filter((opt) => !assignedSet.has(String(opt.value)));
      console.log('AssignSellerManualyToMarketModal using sellerOptions prop (filtered)', { originalCount: sellerOptions.length, filteredCount: filtered.length, sample: filtered.slice(0, 5) });
      return filtered;
    }

    const dataItems = sellersData?.items ?? [];
    const baseOptions: Array<{ label: string; value: string | number }> = Array.isArray(dataItems)
      ? dataItems.map((seller: Seller) => ({
          label: `${seller.firstName} ${seller.lastName}`.trim() || `Πωλητής #${seller.id}`,
          value: String(seller.id),
        }))
      : [];

    const filteredFromData = baseOptions.filter((opt) => !assignedSet.has(String(opt.value)));
    console.log('AssignSellerManualyToMarketModal using sellersData (filtered)', { originalCount: baseOptions.length, filteredCount: filteredFromData.length, sample: filteredFromData.slice(0, 5) });
    return filteredFromData;
  }, [sellerOptions, sellersData, assignedSellerIds]);

  useEffect(() => {
    console.log('AssignSellerManualyToMarketModal props changed', {
      open,
      sellersDataCount: sellersData?.items?.length ?? 0,
      sellerOptionsCount: sellerOptions?.length ?? 0,
      assignedSellerIdsCount: assignedSellerIds?.length ?? 0,
    });
  }, [open, sellersData, sellerOptions, assignedSellerIds]);

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
            dropdownItems={filteredSellerOptions}
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
