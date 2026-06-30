import { Box, Typography } from "@mui/material";
import { useState } from "react";
import type { MarketFormProps, AreaPoint } from "../../models/market";
import CustomInputField from "../../shared/components/CustomInputField";
import CustomButton from "../../shared/components/CustomButton";
import MapAreaModal from "../../shared/components/MapAreaModal";
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
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

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
    typeof values.availableSlots === "number" &&
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

  const handleSaveAreaPoints = (points: AreaPoint[]) => {
    onChange({ ...values, areaPoints: points });
  };

  return (
    <Box className="mb-4 flex h-full min-h-0 flex-col gap-6 overflow-y-auto">
      <Box className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Box className="lg:col-span-12 mt-2">
          <CustomInputField
            type="TEXT"
            label="Όνομα"
            value={values.name}
            onChange={(v) => onChange({ ...values, name: String(v) })}
            disabled={isViewMode}
            validation={{ required: true, minLength: 2 }}
            showValidation={submitAttempted}
            width="100%"
          />
        </Box>
        {/* <Box className="lg:col-span-3">
          <CustomInputField
            type="DROPDOWN"
            label="Τύπος Αγοράς"
            value={String(values.marketType)}
            onChange={(v) => onChange({ ...values, marketType: Number(v) as 1 | 2 })}
            dropdownItems={marketTypeOptions}
            disabled={isViewMode}
            validation={{ required: true }}
            showValidation={submitAttempted}
            width="100%"
          />
        </Box> */}
      </Box>

      <Box className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Box className="lg:col-span-8">
          <CustomInputField
            type="TEXT"
            label="Διεύθυνση"
            value={values.address}
            onChange={(v) => onChange({ ...values, address: String(v) })}
            disabled={isViewMode}
            validation={{ required: true, minLength: 3 }}
            showValidation={submitAttempted}
            width="100%"
          />
        </Box>
        <Box className="lg:col-span-4">
          <CustomInputField
            type="TEXT"
            label="Περιοχή"
            value={values.area}
            onChange={(v) => onChange({ ...values, area: String(v) })}
            disabled={isViewMode}
            validation={{ required: true, minLength: 3 }}
            showValidation={submitAttempted}
            width="100%"
          />
        </Box>
      </Box>

      <Box className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Box className="xl:col-span-5 flex flex-col gap-3 rounded-lg border p-4">
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Περιοχή Αγοράς στον Χάρτη
          </Typography>
          <CustomButton
            title={(values.areaPoints?.length ?? 0) > 0 ? `Επεξεργασία Περιοχής` : "Ορισμός Περιοχής"}
            onClick={() => setIsMapModalOpen(true)}
            disabled={isViewMode}
            width="100%"
          />
          {(values.areaPoints?.length ?? 0) > 0 && (
            <Typography className="text-center" variant="caption" color="text.secondary">
              Έχουν προστεθεί {values.areaPoints.length} σημεία
            </Typography>
          )}
        </Box>

        <MapAreaModal
          open={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          onSave={handleSaveAreaPoints}
          initialPoints={values.areaPoints ?? []}
          title="Επιλογή Περιοχής Αγοράς"
        />

        <Box className="xl:col-span-7 flex flex-col gap-4 rounded-lg border p-4">
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Πρόγραμμα Λειτουργίας
          </Typography>

          <Box className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <Box className="lg:col-span-6">
              <CustomInputField
                type="MULTI_SELECT"
                label="Ημέρες Λειτουργίας"
                value={selectedDayValues}
                onChange={(v) => handleUpdateWorkingDays(Array.isArray(v) ? v.map(String) : [])}
                dropdownItems={dayOptions}
                disabled={isViewMode}
                validation={{ required: true }}
                showValidation={submitAttempted}
                width="100%"
              />
            </Box>

            <Box className="lg:col-span-3">
              <CustomInputField
                type="DROPDOWN"
                label="Έναρξη"
                value={sharedOpenTime}
                onChange={(v) => handleUpdateWorkingTime("openTime", String(v))}
                disabled={isViewMode || values.operatingDays.length === 0}
                dropdownItems={timeOptions}
                validation={{ required: true }}
                showValidation={submitAttempted}
                width="100%"
              />
            </Box>

            <Box className="lg:col-span-3">
              <CustomInputField
                type="DROPDOWN"
                label="Λήξη"
                value={sharedCloseTime}
                onChange={(v) => handleUpdateWorkingTime("closeTime", String(v))}
                disabled={isViewMode || values.operatingDays.length === 0}
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
                width="100%"
              />
            </Box>
          </Box>

          {values.operatingDays.length === 0 ? (
            <p className="text-sm text-gray-500">Δεν έχουν επιλεγεί ημέρες λειτουργίας.</p>
          ) : null}
        </Box>
      </Box>

      <Box className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Box className={isEditMode ? "lg:col-span-2" : "lg:col-span-3"}>
          <CustomInputField
            type="NUMBER"
            label="Σύνολο Θέσεων"
            value={values.availableSlots}
            onChange={(v) => onChange({ ...values, availableSlots: v === "" ? "" : Number(v) })}
            disabled={isViewMode}
            validation={{ required: true, min: 0 }}
            showValidation={submitAttempted}
            width="100%"
          />
        </Box>

        {isEditMode && (
          <Box className="lg:col-span-2">
            <CustomInputField
              type="NUMBER"
              label="Δεσμευμένες Θέσεις"
              value={values.occupiedSpots}
              onChange={(v) => onChange({ ...values, occupiedSpots: v === "" ? "" : Number(v) })}
              disabled={true}
              validation={{ required: true, min: 0 }}
              width="100%"
            />
          </Box>
        )}
      </Box>

       <Box className={isEditMode ? "lg:col-span-8" : "lg:col-span-9"}>
          <CustomInputField
            type="MULTI_SELECT"
            label="Επόπτες/Υπεύθυνοι"
            value={values.supervisors}
            onChange={(v) => onChange({ ...values, supervisors: v as string[] })}
            dropdownItems={usersList}
            disabled={isViewMode}
            width="100%"
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
