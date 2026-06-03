import { Box, Typography } from "@mui/material";
import { useState } from "react";
import type { MarketFormProps } from "../../models/market";
import CustomInputField from "../../shared/components/CustomInputField";
import CustomButton from "../../shared/components/CustomButton";
import MarketMapPicker from "../../shared/components/MarketMapPicker";
import { DAYS } from "./market.utils";
import { useUsersQuery } from "../../queries/userQueries";
import { USER_ROLE_MAPPING } from "../../shared/mappings/users.mapping";

const marketTypeOptions = [
  { label: "Γενική Αγορά", value: "1" },
  { label: "Βιολογικών Προϊόντων", value: "2" },
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

function sortDays(days: string[]): string[] {
  return [...days].sort((left, right) => (dayOrder[left] ?? Number.MAX_SAFE_INTEGER) - (dayOrder[right] ?? Number.MAX_SAFE_INTEGER));
}

export default function MarketForm({
  mode,
  values,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
}: MarketFormProps) {
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const sharedOpenTime = values.operatingDays[0]?.openTime ?? "";
  const sharedCloseTime = values.operatingDays[0]?.closeTime ?? "";

  const { data: usersData } = useUsersQuery({
    name: "",
    email: "",
    role: "",
    page: 1,
    pageSize: 5000,
  });

  const usersArray = (Array.isArray(usersData) ? usersData : (usersData?.items ?? [])).filter(
    (u) => u.roles.includes(USER_ROLE_MAPPING.ADMIN)
  );

  const usersList = usersArray.map((u) => ({
    label: `${u.firstName} ${u.lastName}`,
    value: u.id,
  }));

  const [submitAttempted, setSubmitAttempted] = useState(false);

  const hasValidOperatingDays = (days: typeof values.operatingDays): boolean =>
    days.length > 0 &&
    days.every(
      (entry) =>
        Boolean(entry.day) &&
        Boolean(entry.openTime) &&
        Boolean(entry.closeTime) &&
        toMinutes(entry.openTime) >= 0 &&
        toMinutes(entry.closeTime) > toMinutes(entry.openTime)
    );

  const isFormValid = (): boolean =>
    values.name.trim().length >= 2 &&
    values.address.trim().length >= 3 &&
    values.area.trim().length >= 3 &&
    values.availableSlots >= 0 &&
    hasValidOperatingDays(values.operatingDays);

  const selectedDayValues = values.operatingDays.map((entry) => entry.day).filter(Boolean);

  const handleUpdateWorkingDays = (selectedValues: string[]) => {
    const nextDays = sortDays(selectedValues);
    const nextOperatingDays = nextDays.map((day) => {
      const existingEntry = values.operatingDays.find((entry) => entry.day === day);
      return {
        day,
        openTime: existingEntry?.openTime ?? sharedOpenTime,
        closeTime: existingEntry?.closeTime ?? sharedCloseTime,
      };
    });

    onChange({ ...values, operatingDays: nextOperatingDays });
  };

  const handleUpdateWorkingTime = (field: "openTime" | "closeTime", value: string) => {
    const updated = values.operatingDays.map((entry) => ({
      ...entry,
      [field]: value,
    }));

    if (field === "openTime") {
      const nextOpenMinutes = toMinutes(value);
      for (let i = 0; i < updated.length; i += 1) {
        if (updated[i].closeTime && toMinutes(updated[i].closeTime) <= nextOpenMinutes) {
          updated[i] = { ...updated[i], closeTime: "" };
        }
      }
    }

    onChange({ ...values, operatingDays: updated });
  };

  const handleFormSubmit = () => {
    setSubmitAttempted(true);
    if (!isFormValid()) return;
    onSubmit?.(values);
  };

  return (
    <Box className="mb-4 flex h-full min-h-0 flex-col gap-6 overflow-y-auto">
      <Box className="flex w-full flex-wrap justify-between">
        <CustomInputField
          type="TEXT"
          label="Όνομα"
          value={values.name}
          onChange={(v) => onChange({ ...values, name: String(v) })}
          disabled={isViewMode}
          validation={{ required: true, minLength: 2 }}
          showValidation={submitAttempted}
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
          showValidation={submitAttempted}
          width="20%"
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
          showValidation={submitAttempted}
          width="58%"
        />
        <CustomInputField
          type="TEXT"
          label="Περιοχή"
          value={values.area}
          onChange={(v) => onChange({ ...values, area: String(v) })}
          disabled={isViewMode}
          validation={{ required: true, minLength: 3 }}
          showValidation={submitAttempted}
          width="38%"
        />
      </Box>

      <Box className="mt-4 flex flex-col gap-4 lg:flex-row">
        <MarketMapPicker
          latitude={values.latitude ?? null}
          longitude={values.longitude ?? null}
          radius={values.radius ?? null}
          disabled={isViewMode}
          height={200}
          onChange={(lat, lng) => onChange({ ...values, latitude: lat, longitude: lng })}
          onRadiusChange={(r) => onChange({ ...values, radius: r })}
        />

        <Box className="flex flex-1 flex-col gap-4 border p-4">
          {values.operatingDays.length > 0 && (
            <>
              <div className="flex justify-center w-full">
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Ώρες Λειτουργίας
                </Typography>
              </div>
              <Box className="flex flex-wrap items-start justify-center gap-3 rounded-lg p-2">
                <CustomInputField
                  type="DROPDOWN"
                  label="Έναρξη"
                  value={sharedOpenTime}
                  onChange={(v) => handleUpdateWorkingTime("openTime", String(v))}
                  disabled={isViewMode}
                  dropdownItems={timeOptions}
                  validation={{ required: true }}
                  showValidation={submitAttempted}
                  width={130}
                />

                <CustomInputField
                  type="DROPDOWN"
                  label="Λήξη"
                  value={sharedCloseTime}
                  onChange={(v) => handleUpdateWorkingTime("closeTime", String(v))}
                  disabled={isViewMode}
                  dropdownItems={timeOptions}
                  disabledDropdownValues={
                    sharedOpenTime
                      ? timeOptions
                          .filter((opt) => toMinutes(String(opt.value)) <= toMinutes(sharedOpenTime))
                          .map((opt) => opt.value)
                      : []
                  }
                  validation={{ required: true }}
                  showValidation={submitAttempted}
                  width={130}
                />
              </Box>

            </>
          )}

          <div className="flex justify-center w-full mt-10">
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Ημέρες Λειτουργίας
            </Typography>
          </div>

          <CustomInputField
            type="MULTI_SELECT"
            label=""
            value={selectedDayValues}
            onChange={(v) => handleUpdateWorkingDays(Array.isArray(v) ? v.map(String) : [])}
            dropdownItems={dayOptions}
            disabled={isViewMode}
            validation={{ required: true }}
            showValidation={submitAttempted}
            width="100%"
          />

          {values.operatingDays.length === 0 ? (
            <p className="text-sm text-gray-500">Δεν έχουν επιλεγεί ημέρες λειτουργίας.</p>
          ) : null}
        </Box>
      </Box>

      <Box className="flex flex-col gap-4 mt-6 md:flex-row md:justify-between">
        <CustomInputField
          type="NUMBER"
          label="Σύνολο Θέσεων"
          value={values.availableSlots}
          onChange={(v) => onChange({ ...values, availableSlots: Number(v) })}
          disabled={isViewMode}
          validation={{ required: true, min: 0 }}
          showValidation={submitAttempted}
          width="15%"
        />

        {isEditMode && (
          <CustomInputField
            type="NUMBER"
            label="Δεσμευμένες Θέσεις"
            value={values.occupiedSpots ?? 0}
            onChange={(v) => onChange({ ...values, occupiedSpots: Number(v) })}
            disabled={true}
            validation={{ required: true, min: 0 }}
            width="15%"
          />
        )}

        <CustomInputField
          type="MULTI_SELECT"
          label="Ορισμός Εποπτών/Υπευθύνων"
          value={values.supervisors}
          onChange={(v) => onChange({ ...values, supervisors: v as string[] })}
          dropdownItems={usersList}
          disabled={isViewMode}
          width="60%"
        />
      </Box>

      <Box className="flex flex-wrap justify-end gap-3">
        {onCancel && (
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
        )}

        {!isViewMode && onSubmit && (
          <CustomButton
            title={submitLabel ?? (mode === "create" ? "Δημιουργία" : "Αποθήκευση")}
            onClick={handleFormSubmit}
            width={140}
          />
        )}
      </Box>
    </Box>
  );
}
