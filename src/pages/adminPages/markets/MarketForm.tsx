import { Box, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import type { MarketFormProps } from "../../../models/market";
import CustomInputField from "../../../shared/components/CustomInputField";
import CustomButton from "../../../shared/components/CustomButton";
import MapLocationPlaceholder from "../../../shared/components/MapLocationPlaceholder";
import { DAYS } from "./market.utils";

const marketTypeOptions = [
  { label: "Γενική Αγορά", value: "1" },
  { label: "Βιολογικών Προϊόντων", value: "2" },
];

const supervisorOptions = [
  { label: "Γεωργίου Νικόλαος", value: "supervisor-1" },
  { label: "Παπαδόπουλος Ιωάννης", value: "supervisor-2" },
  { label: "Παπανικολάου Κωνσταντίνα", value: "market-manager" },
  { label: "Γεωργκακοπούλου Αικατερίνη", value: "area-manager" },
];

const dayOptions = DAYS;
const dayOrder = dayOptions.reduce<Record<string, number>>((acc, option, idx) => {
  acc[String(option.value)] = idx;
  return acc;
}, {});

const timeOptions = Array.from({ length: 24 }, (_, hour) => {
  const value = `${String(hour).padStart(2, "0")}:00`;
  return { label: value, value };
});

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return -1;
  return hours * 60 + minutes;
};

const getDisabledDayValues = (
  operatingDays: Array<{ day: string }>,
  index: number
) => {
  if (index === 0) return [];

  const previousDay = operatingDays[index - 1]?.day;
  if (!previousDay || dayOrder[previousDay] === undefined) return [];

  const previousIndex = dayOrder[previousDay];
  return dayOptions
    .filter((opt) => dayOrder[String(opt.value)] <= previousIndex)
    .map((opt) => opt.value);
};

export default function MarketForm({
  mode,
  values,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
}: MarketFormProps) {
  const isViewMode = mode === "view";

  const resolvedTitle =
    mode === "create"
      ? "Δημιουργία Αγοράς"
      : mode === "edit"
        ? "Επεξεργασία Αγοράς"
        : "Προβολή Αγοράς";

  const handleAddDay = () => {
    onChange({
      ...values,
      operatingDays: [
        ...values.operatingDays,
        { day: "", openTime: "", closeTime: "" },
      ],
    });
  };

  const handleRemoveDay = (index: number) => {
    onChange({
      ...values,
      operatingDays: values.operatingDays.filter((_, i) => i !== index),
    });
  };

  const handleUpdateDay = (
    index: number,
    field: "day" | "openTime" | "closeTime",
    value: string
  ) => {
    const updated = [...values.operatingDays];
    const currentEntry = { ...updated[index], [field]: value };

    // If opening time changes, clear invalid closing time values.
    if (
      field === "openTime" &&
      currentEntry.closeTime &&
      toMinutes(currentEntry.closeTime) <= toMinutes(value)
    ) {
      currentEntry.closeTime = "";
    }

    updated[index] = currentEntry;

    if (field === "day") {
      for (let i = index + 1; i < updated.length; i += 1) {
        const disabledValues = getDisabledDayValues(updated, i);
        if (disabledValues.includes(updated[i].day)) {
          updated[i] = { ...updated[i], day: "", openTime: "", closeTime: "" };
        }
      }
    }

    onChange({ ...values, operatingDays: updated });
  };

  return (
      <Box className="flex flex-col gap-6 md:max-h-[85vh] overflow-y-auto mb-4">
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {resolvedTitle}
        </Typography>

        <Box className="w-full flex flex-wrap justify-between">
          <CustomInputField
            type="TEXT"
            label="Όνομα"
            value={values.name}
            onChange={(v) => onChange({ ...values, name: String(v) })}
            disabled={isViewMode}
            validation={{ required: true, minLength: 2 }}
            width="75%"
          />
           <CustomInputField
            type="DROPDOWN"
            label="Τύπος Αγοράς"
            value={String(values.marketType)}
            onChange={(v) => onChange({ ...values, marketType: Number(v) as 1 | 2 })}
            dropdownItems={marketTypeOptions}
            disabled={isViewMode}
            validation={{ required: true }}
            width={'20%'}
          />
        </Box>

        <Box className="flex flex-wrap justify-between">
          <CustomInputField
            type="TEXT"
            label="Διεύθυνση"
            value={values.address}
            onChange={(v) => onChange({ ...values, address: String(v) })}
            disabled={isViewMode}
            validation={{ required: true, minLength: 3 }}
            width={'58%'}
          />
          <CustomInputField
            type="TEXT"
            label="Περιοχή"
            value={values.area}
            onChange={(v) => onChange({ ...values, area: String(v) })}
            disabled={isViewMode}
            validation={{ required: true, minLength: 3 }}
            width={'38%'}
          />
        </Box>

        <Box className="mt-4 flex flex-col gap-4 lg:flex-row">
          <Box className="flex-1">
            <MapLocationPlaceholder height={270} />
          </Box>

          {/* Operating Days Section */}
          <Box className="flex flex-1 flex-col gap-4 border p-4">
            <div className="flex items-center gap-4">
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Ημέρες Λειτουργίας
              </Typography>
              {!isViewMode && (
                <CustomButton
                  prefixIcon={<AddIcon />}
                  onClick={handleAddDay}
                  width={10}
                />
              )}
            </div>

            {values.operatingDays.length === 0 ? (
              <p className="text-sm text-gray-500">
                Δεν έχουν προστεθεί ημέρες λειτουργίας.
              </p>
            ) : (
              <Box className="space-y-1">
                {values.operatingDays.map((dayEntry, index) => (
                  <Box
                    key={index}
                    className="flex flex-wrap items-start gap-3 justify-between rounded-lg p-4 h-[120px]"
                  >
                    <CustomInputField
                      type="DROPDOWN"
                      label="Ημέρα"
                      value={dayEntry.day}
                      onChange={(v) =>
                        handleUpdateDay(index, "day", String(v))
                      }
                      dropdownItems={dayOptions}
                      disabledDropdownValues={getDisabledDayValues(values.operatingDays, index)}
                      disabled={isViewMode}
                      validation={{ required: true }}
                      width={200}
                    />

                    <CustomInputField
                      type="DROPDOWN"
                      label="Έναρξη"
                      value={dayEntry.openTime}
                      onChange={(v) =>
                        handleUpdateDay(index, "openTime", String(v))
                      }
                      disabled={isViewMode}
                      dropdownItems={timeOptions}
                      validation={{ required: true }}
                      width={130}
                    />

                    <CustomInputField
                      type="DROPDOWN"
                      label="Λήξη"
                      value={dayEntry.closeTime}
                      onChange={(v) =>
                        handleUpdateDay(index, "closeTime", String(v))
                      }
                      disabled={isViewMode}
                      dropdownItems={timeOptions}
                      disabledDropdownValues={
                        dayEntry.day && dayEntry.openTime
                          ? timeOptions
                              .filter((opt) => toMinutes(String(opt.value)) <= toMinutes(dayEntry.openTime))
                              .map((opt) => opt.value)
                          : []
                      }
                      validation={{ required: true }}
                      width={130}
                    />

                    {!isViewMode && (
                      <CustomButton
                        prefixIcon={<DeleteIcon />}
                        backgroundColor="var(--color-danger)"
                        onClick={() => handleRemoveDay(index)}
                        sx={{ marginTop: "17px" }}
                        width={10}
                      />
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>

        <Box className="flex flex-col gap-4 md:flex-row md:justify-between">
          <CustomInputField
            type="NUMBER"
            label="Αριθμός Διαθέσιμων Θέσεων"
            value={values.availableSlots}
            onChange={(v) => onChange({ ...values, availableSlots: Number(v) })}
            disabled={isViewMode}
            validation={{ required: true, min: 0 }}
            width="22%"
          />

          <CustomInputField
            type="MULTI_SELECT"
            label="Ορισμός Εποπτών/Υπευθύνων"
            value={values.supervisors}
            onChange={(v) => onChange({ ...values, supervisors: v as string[] })}
            dropdownItems={supervisorOptions}
            disabled={isViewMode}
            width="60%"
          />
        </Box>

        <Box className="flex flex-wrap justify-end gap-3">
          {/* {onCancel && (
            <CustomButton
              title={isViewMode ? "Κλείσιμο" : "Ακύρωση"}
              backgroundColor={isViewMode ? "var(--color-text-muted)" : "transparent"}
              onClick={onCancel}
              width={120}
              sx={
                !isViewMode
                  ? {
                      color: "var(--color-dark)",
                      border: "1px solid var(--color-text-muted)",
                      "&:hover": {
                        backgroundColor: "transparent",
                        borderColor: "var(--color-text-muted)",
                        filter: "none",
                      },
                    }
                  : undefined
              }
            />
          )} */}

          {!isViewMode && onSubmit && (
            <CustomButton
              title={submitLabel ?? (mode === "create" ? "Δημιουργία" : "Αποθήκευση")}
              onClick={() => onSubmit(values)}
              width={140}
            />
          )}
        </Box>
      </Box>
  );
}
