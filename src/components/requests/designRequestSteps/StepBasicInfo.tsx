import CustomInputField from "../../../shared/components/CustomInputField";



export default function StepBasicInfo({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}: {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
      <CustomInputField
        type="TEXT"
        label="Τίτλος *"
        value={title}
        onChange={(value) => onTitleChange(String(value))}
        width="100%"
      />

      <div className="md:col-span-2">
        <CustomInputField
          type="TEXTAREA"
          label="Περιγραφή"
          value={description}
          onChange={(value) => onDescriptionChange(String(value))}
          width="100%"
        />
      </div>

      {/* <div className="md:col-span-2 rounded-md border border-(--color-border) bg-(--color-surface) p-4">
        <h4 className="text-sm font-semibold text-(--color-dark)">
          Βασικά πεδία που πρέπει υποχρεωτικά να συμπληρώσει ο Πωλητής
        </h4>
        <div className="mt-3 flex flex-wrap gap-2">
          {SELLER_BASIC_FIELDS.map((field) => (
            <Chip
              key={field}
              label={field}
              size="small"
              sx={{
                backgroundColor: "var(--color-border-subtle)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border)",
              }}
            />
          ))}
        </div>
      </div> */}
    </div>
  );
}
