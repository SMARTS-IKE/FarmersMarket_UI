import { CreateMarketRequest, DAY_NAME_TO_NUMBER, Market, MarketFormValues } from "../../models/market";
import { ColumnDef } from "@/shared/components/DataTable";

export const DAYS = [
  { label: "Δευτέρα", value: "Monday" },
  { label: "Τρίτη", value: "Tuesday" },
  { label: "Τετάρτη", value: "Wednesday" },
  { label: "Πέμπτη", value: "Thursday" },
  { label: "Παρασκευή", value: "Friday" },
  { label: "Σάββατο", value: "Saturday" },
  { label: "Κυριακή", value: "Sunday" },
];

export const marketTypeLabel = (type: number) => {
  switch (type) {
    case 1: return "Γενική Αγορά";
    case 2: return "Βιολογικών Προϊόντων";
    default: return "Άγνωστο";
  }
};

const dayNumberToGreekLabel: Record<number, string> = {
  0: "Κυριακή",
  1: "Δευτέρα",
  2: "Τρίτη",
  3: "Τετάρτη",
  4: "Πέμπτη",
  5: "Παρασκευή",
  6: "Σάββατο",
};

export function toTimeWithSeconds(time: string): string {
  if (!time) return "";
  return time.length === 5 ? `${time}:00` : time;
}

export function toIsoDate(dateValue: string | undefined): string {
  if (dateValue && /^\d{4}-\d{2}-\d{2}/.test(dateValue)) {
    return dateValue.slice(0, 10);
  }

  return new Date().toISOString().slice(0, 10);
}

export function mapFormValuesToCreatePayload(values: MarketFormValues): CreateMarketRequest {
  const openTime = values.operatingDays[0]?.openTime ?? "";
  const closeTime = values.operatingDays[0]?.closeTime ?? "";
  const hasPrimaryCoordinates = values.latitude !== null && values.longitude !== null;
  const locations =
    values.areaPoints.length > 0
      ? values.areaPoints.map((point) => ({ latitude: point.lat, longitude: point.lng }))
      : hasPrimaryCoordinates
        ? [{ latitude: values.latitude as number, longitude: values.longitude as number }]
        : [];

  return {
    name: values.name.trim(),
    address: values.address.trim(),
    area: values.area.trim(),
    latitude: values.latitude ?? 0,
    longitude: values.longitude ?? 0,
    marketType: values.marketType,
    fromDate: toIsoDate(undefined),
    capacity: values.availableSlots,
    licenseCategory: 0,
    lotteryEnabled: false,
    dailyFee: 0,
    openTime: toTimeWithSeconds(openTime),
    closeTime: toTimeWithSeconds(closeTime),
    notes: "",
    schedules: values.operatingDays.map((od) => ({
      dayOfWeek: DAY_NAME_TO_NUMBER[od.day] ?? 0,
      openTime: toTimeWithSeconds(od.openTime),
      closeTime: toTimeWithSeconds(od.closeTime),
    })),
    locations,
  };
}

export const columns: ColumnDef<Market>[] = [
  { key: "name", label: "Όνομα" },
  { key: "address", label: "Διεύθυνση" },
  { key: "area", label: "Περιοχή" },
  { key: "totalSpots", label: "Σύνολο Θέσεων" },
  { key: "occupiedSpots", label: "Δεσμευμένες Θέσεις" },
];
