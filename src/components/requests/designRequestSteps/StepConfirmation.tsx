import CustomButton from "../../../shared/components/CustomButton";
import type { DesignRequestDraft, DesignRequestFieldType } from "../../../models/request";

export default function StepConfirmation({
  draft,
  fieldTypeOptions,
  onEdit,
  onSubmit,
  isSubmitting = false,
}: {
  draft: DesignRequestDraft;
  fieldTypeOptions: Array<{ label: string; value: DesignRequestFieldType }>;
  onEdit: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}) {
  return (
    <div className="mt-4 flex flex-col gap-5">
      <div className="rounded-md border border-(--color-border) bg-(--color-surface) p-4">
        <h4 className="text-base font-semibold text-(--color-dark)">Βασικά Στοιχεία</h4>
        <p className="mt-2 text-sm text-(--color-text-muted)">
          <strong>Τίτλος:</strong> {draft.title || "-"}
        </p>
        <p className="mt-1 text-sm text-(--color-text-muted)">
          <strong>Περιγραφή:</strong> {draft.description || "-"}
        </p>
      </div>

      <div className="rounded-md border border-(--color-border) bg-(--color-surface) p-4">
        <h4 className="text-base font-semibold text-(--color-dark)">Δυναμικά Πεδία</h4>
        {draft.dynamicFields.length === 0 ? (
          <p className="mt-2 text-sm text-(--color-text-muted)">Δεν έχουν οριστεί πεδία.</p>
        ) : (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-(--color-text-muted)">
            {draft.dynamicFields.map((field) => (
              <li key={field.id}>
                {field.title || "Χωρίς όνομα"}
                {" - Τύπος πεδίου:  "}
                {fieldTypeOptions.find((option) => option.value === field.type)?.label ?? field.type}
                {", Βαρύτητα: "}
                {field.weight}
                {", Υποχρεωτική συμπλήρωση: "}
                {field.isRequired ? "Ναι" : "Όχι"}
                {field.type === "DROPDOWN" &&
                  `, Τιμές: ${field.availableValues.join(", ") || "-"}`}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-md border border-(--color-border) bg-(--color-surface) p-4">
        <h4 className="text-base font-semibold text-(--color-dark)">Λίστα Εγγράφων</h4>
        {draft.requiredDocuments.length === 0 ? (
          <p className="mt-2 text-sm text-(--color-text-muted)">Δεν έχουν οριστεί έγγραφα.</p>
        ) : (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-(--color-text-muted)">
            {draft.requiredDocuments.map((document) => (
              <li key={document.id}>
                {document.title || "Χωρίς τίτλο"}
                {", Απαραίτητο: "}
                {document.isRequired ? "Ναι" : "Όχι"}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        {/* <CustomButton
          title="Κάνε Αλλαγές"
          backgroundColor="var(--color-text-muted)"
          width="fit-content"
          onClick={onEdit}
        /> */}
        <CustomButton title="Υποβολή" width="fit-content" onClick={onSubmit} disabled={isSubmitting} />
      </div>
    </div>
  );
}
