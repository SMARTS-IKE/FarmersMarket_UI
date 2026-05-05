import DeleteIcon from "@mui/icons-material/Delete";
import CustomButton from "../../../shared/components/CustomButton";
import type { DesignRequestDynamicField } from "../../../models/request";

export default function StepDynamicFields({
  dynamicFields,
  onOpenAddFieldModal,
  onRemoveDynamicField,
}: {
  dynamicFields: DesignRequestDynamicField[];
  onOpenAddFieldModal: () => void;
  onRemoveDynamicField: (id: number) => void;
}) {
  const canRemoveField = dynamicFields.length > 1;

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex justify-end">
        <CustomButton title="Προσθήκη πεδίου" width="fit-content" onClick={onOpenAddFieldModal} />
      </div>

      {!canRemoveField && (
        <p className="text-sm text-(--color-text-muted)">
          Απαιτείται τουλάχιστον ένα δυναμικό πεδίο.
        </p>
      )}

      {dynamicFields.map((field, index) => (
        <div
          key={field.id}
          className="grid grid-cols-1 items-center gap-3 rounded-md border border-(--color-border) p-3 sm:grid-cols-[minmax(220px,1fr)_120px_160px_auto]"
        >
          <div className="text-sm text-(--color-text)">
            <span className="font-semibold">{index + 1}. </span>
            {field.title || "Χωρίς τίτλο"}
          </div>

          <div className="text-sm text-(--color-text-muted)">Βάρος: {field.weight}</div>

          <div className="text-sm text-(--color-text-muted)">
            Υποχρεωτικό: {field.isRequired ? "Ναι" : "Όχι"}
          </div>

          <div className="flex items-center justify-end">
            <CustomButton
              title=""
              prefixIcon={<DeleteIcon fontSize="small" />}
              backgroundColor="var(--color-text-muted)"
              width={34}
              disabled={!canRemoveField}
              onClick={() => onRemoveDynamicField(field.id)}
              sx={{
                minWidth: 34,
                width: 34,
                px: 0,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
