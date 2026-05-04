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
        label="Τίτλος"
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
    </div>
  );
}
