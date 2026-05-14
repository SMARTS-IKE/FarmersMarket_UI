import { Checkbox, FormControlLabel } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CustomButton from "../../../shared/components/CustomButton";
import CustomInputField from "../../../shared/components/CustomInputField";
import type { DesignRequestRequiredDocument } from "../../../models/request";

export default function StepRequiredDocuments({
  requiredDocuments,
  onAddRequiredDocument,
  onRemoveRequiredDocument,
  onUpdateRequiredDocumentTitle,
  onUpdateRequiredDocumentRequired,
}: {
  requiredDocuments: DesignRequestRequiredDocument[];
  onAddRequiredDocument: () => void;
  onRemoveRequiredDocument: (id: number) => void;
  onUpdateRequiredDocumentTitle: (id: number, title: string) => void;
  onUpdateRequiredDocumentRequired: (id: number, isRequired: boolean) => void;
}) {
  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex justify-end">
        <CustomButton
          title="Προσθήκη αιτούμενου εγγράφου"
          width="fit-content"
          onClick={onAddRequiredDocument}
        />
      </div>

      {requiredDocuments.map((requiredDocument, index) => (
        <div
          key={requiredDocument.id}
          className="grid grid-cols-1 items-end gap-3 rounded-md border border-(--color-border) p-3 md:grid-cols-[minmax(200px,1fr)_190px_auto]"
        >
          <CustomInputField
            type="TEXT"
            label={`Τίτλος ${index + 1}`}
            value={requiredDocument.title}
            onChange={(value) => onUpdateRequiredDocumentTitle(requiredDocument.id, String(value))}
            width="100%"
          />

          <div className="flex h-full w-full items-center justify-start">
            <FormControlLabel
              label="Είναι απαραίτητο"
              control={
                <Checkbox
                  checked={requiredDocument.isRequired}
                  onChange={(event) => onUpdateRequiredDocumentRequired(requiredDocument.id, event.target.checked)}
                  sx={{
                    color: "var(--color-text-muted)",
                    "&.Mui-checked": { color: "var(--color-dark)" },
                  }}
                />
              }
            />
          </div>

          <div className="flex items-center justify-end">
            <CustomButton
              title=""
              prefixIcon={<DeleteIcon fontSize="small" />}
              backgroundColor="var(--color-danger)"
              width={34}
              onClick={() => onRemoveRequiredDocument(requiredDocument.id)}
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
