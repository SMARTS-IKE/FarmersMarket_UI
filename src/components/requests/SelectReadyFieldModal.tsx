import { Dialog, DialogContent, DialogTitle, CircularProgress } from "@mui/material";
import CustomButton from "../../shared/components/CustomButton";
import CustomInputField from "../../shared/components/CustomInputField";
import { useFormFieldsQuery } from "../../queries/formsQueries";
import { ADD_NEW_FIELD_OPTION_VALUE } from "./request.utils";

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
  dropdownItems?: Array<{ label: string; value: string | number }>;
  onClose: () => void;
  onSelectionChange: (value: string | number | string[]) => void;
  onAdd: () => void;
}) {
  const { data: formFields, isLoading } = useFormFieldsQuery(open);
  const createLabel = (<span style={{ fontWeight: 800 }}>+ Δημιουργία νέου πεδίου</span>);

  const items = Array.isArray(formFields)
    ? [
        { label: createLabel as any, value: ADD_NEW_FIELD_OPTION_VALUE },
        ...formFields.map((f) => ({ label: (f as any).label ?? (f as any).title ?? String((f as any).id), value: (f as any).id })),
      ]
    : [{ label: createLabel as any, value: ADD_NEW_FIELD_OPTION_VALUE }];
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogContent>
        <div className="grid grid-cols-1 gap-4 pt-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-6"><CircularProgress /></div>
          ) : items.length === 0 ? (
            <div className="py-4">
              <div className="text-sm text-(--color-text-muted)">Δεν βρέθηκαν διαθέσιμα πεδία. Βεβαιωθείτε ότι το endpoint /fields επιστρέφει δεδομένα.</div>
              {formFields && (
                <details className="mt-2 p-2 bg-(--color-surface) rounded">
                  <summary className="text-sm">Δείτε τα δεδομένα που επέστρεψε το API (debug)</summary>
                  <pre className="text-xs mt-2 max-h-48 overflow-auto">{JSON.stringify(formFields, null, 2)}</pre>
                </details>
              )}
            </div>
          ) : (
            <CustomInputField
              type="DROPDOWN"
              label="Έτοιμα πεδία"
              value={selectedReadyFieldId}
              onChange={onSelectionChange}
              dropdownItems={items}
              width="100%"
            />
          )}
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
