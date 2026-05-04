import { Checkbox, Dialog, DialogContent, DialogTitle, FormControlLabel } from "@mui/material";
import CustomButton from "../../shared/components/CustomButton";
import CustomInputField from "../../shared/components/CustomInputField";
import type { DesignRequestFieldType } from "../../models/request";

export default function CreateFieldModal({
  open,
  fieldTypeOptions,
  newFieldDraft,
  canCreateField,
  onClose,
  onCreate,
  onFieldDraftChange,
}: {
  open: boolean;
  fieldTypeOptions: Array<{ label: string; value: DesignRequestFieldType }>;
  newFieldDraft: {
    title: string;
    type: DesignRequestFieldType;
    availableValues: string;
    weight: number;
    isRequired: boolean;
  };
  canCreateField: boolean;
  onClose: () => void;
  onCreate: () => void;
  onFieldDraftChange: (nextDraft: {
    title: string;
    type: DesignRequestFieldType;
    availableValues: string;
    weight: number;
    isRequired: boolean;
  }) => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Προσθήκη νέου πεδίου</DialogTitle>
      <DialogContent>
        <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
          <CustomInputField
            type="TEXT"
            label="Title"
            value={newFieldDraft.title}
            onChange={(value) =>
              onFieldDraftChange({ ...newFieldDraft, title: String(value) })
            }
            width="100%"
          />

          <CustomInputField
            type="DROPDOWN"
            label="Τύπος"
            value={newFieldDraft.type}
            onChange={(value) => {
              const nextType = String(value) as DesignRequestFieldType;
              onFieldDraftChange({
                ...newFieldDraft,
                type: nextType,
                availableValues: nextType === "DROPDOWN" ? newFieldDraft.availableValues : "",
              });
            }}
            dropdownItems={fieldTypeOptions}
            width="100%"
          />

          {newFieldDraft.type === "DROPDOWN" && (
            <div className="md:col-span-2">
              <CustomInputField
                type="TEXT"
                label="Available values"
                value={newFieldDraft.availableValues}
                placeholder="π.χ. Ναι, Όχι, Εκκρεμεί"
                onChange={(value) =>
                  onFieldDraftChange({ ...newFieldDraft, availableValues: String(value) })
                }
                width="100%"
              />
            </div>
          )}

          <CustomInputField
            type="NUMBER"
            label="Weight"
            value={newFieldDraft.weight}
            onChange={(value) =>
              onFieldDraftChange({ ...newFieldDraft, weight: Number(value) })
            }
            width="100%"
          />

          <div className="flex items-center">
            <FormControlLabel
              label="Είναι υποχρεωτικό"
              control={
                <Checkbox
                  checked={newFieldDraft.isRequired}
                  onChange={(event) =>
                    onFieldDraftChange({ ...newFieldDraft, isRequired: event.target.checked })
                  }
                  sx={{
                    color: "var(--color-text-muted)",
                    "&.Mui-checked": { color: "var(--color-dark)" },
                  }}
                />
              }
            />
          </div>
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
            disabled={!canCreateField}
            onClick={onCreate}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
