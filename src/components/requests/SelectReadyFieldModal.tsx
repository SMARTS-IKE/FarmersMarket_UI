import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import CustomButton from "../../shared/components/CustomButton";
import CustomInputField from "../../shared/components/CustomInputField";

export default function SelectReadyFieldModal({
  open,
  selectedReadyFieldId,
  dropdownItems,
  onClose,
  onSelectionChange,
  onAdd,
}: {
  open: boolean;
  selectedReadyFieldId: string;
  dropdownItems: Array<{ label: string; value: string | number }>;
  onClose: () => void;
  onSelectionChange: (value: string | number | string[]) => void;
  onAdd: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Προσθήκη πεδίου</DialogTitle>
      <DialogContent>
        <div className="grid grid-cols-1 gap-4 pt-2">
          <CustomInputField
            type="DROPDOWN"
            label="Έτοιμα πεδία"
            value={selectedReadyFieldId}
            onChange={onSelectionChange}
            dropdownItems={dropdownItems}
            width="100%"
          />
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <CustomButton
            title="Ακύρωση"
            backgroundColor="var(--color-text-muted)"
            width="fit-content"
            onClick={onClose}
          />
          <CustomButton
            title="Προσθήκη"
            width="fit-content"
            disabled={!selectedReadyFieldId}
            onClick={onAdd}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
