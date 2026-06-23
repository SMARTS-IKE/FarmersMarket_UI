import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import type { DesignRequestFieldType } from "../../../models/request";
import { Checkbox, FormControlLabel } from "@mui/material";
import CustomButton from "../../../shared/components/CustomButton";
import CustomInputField from "../../../shared/components/CustomInputField";
import type { DesignRequestDynamicField } from "../../../models/request";

export default function StepDynamicFields({
  dynamicFields,
  onOpenAddFieldModal,
  onRemoveDynamicField,
  onUpdateDynamicFieldWeight,
  onUpdateDynamicFieldRequired,
  onEditDynamicField,
}: {
  dynamicFields: DesignRequestDynamicField[];
  onOpenAddFieldModal: () => void;
  onRemoveDynamicField: (id: number) => void;
  onUpdateDynamicFieldWeight: (id: number, weight: number) => void;
  onUpdateDynamicFieldRequired: (id: number, isRequired: boolean) => void;
  onEditDynamicField?: (id: number) => void;
}) {
  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex justify-end">
        <CustomButton title="Προσθήκη πεδίου" width="fit-content" onClick={onOpenAddFieldModal} />
      </div>

      {dynamicFields.length === 0 && (
        <p className="text-sm text-(--color-text-muted)">
          Δεν υπάρχει δυναμικό πεδίο. Προσθέστε πεδίο για να ενεργοποιηθεί το επόμενο βήμα.
        </p>
      )}

      {dynamicFields.map((field, index) => (
        <div
          key={field.id}
          className="grid grid-cols-1 items-center gap-3 rounded-md border border-(--color-border) p-3 sm:grid-cols-[minmax(220px,1fr)_140px_140px_auto]"
        >
          <div className="text-sm text-(--color-text)">
            <span className="font-semibold">{index + 1}. </span>
            {field.title || "Χωρίς τίτλο"}
          </div>

          <CustomInputField
            type="NUMBER"
            label="Βάρος"
            value={field.weight}
            onChange={(value) => {
              const nextWeight = Number(value);
              onUpdateDynamicFieldWeight(field.id, Number.isFinite(nextWeight) ? nextWeight : 0);
            }}
            width="100%"
          />

          <div className="flex items-center justify-center">
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.isRequired}
                  onChange={(e) => onUpdateDynamicFieldRequired(field.id, e.target.checked)}
                  size="small"
                  sx={{
                    color: "var(--color-text)",
                    "&.Mui-checked": {
                      color: "var(--color-text)",
                    },
                  }}
                />
              }
              label="Υποχρεωτικό"
              sx={{ m: 0 }}
            />
          </div>

          <div className="flex items-center justify-end">
            <CustomButton
              title=""
              prefixIcon={<DeleteIcon fontSize="small" />}
              backgroundColor="var(--color-danger)"
              width={34}
              onClick={() => onRemoveDynamicField(field.id)}
              sx={{
                minWidth: 34,
                width: 34,
                px: 0,
              }}
            />
            <div className="ml-2 flex items-center gap-2">
              <div className="text-sm text-(--color-text-muted)">
                {field.type}
              </div>
              <CustomButton
                title=""
                prefixIcon={<EditIcon fontSize="small" />}
                width={34}
                onClick={() => onEditDynamicField?.(field.id)}
                sx={{
                  minWidth: 34,
                  width: 34,
                  px: 0,
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
