import { Market } from "@/models/market";
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

export const columns: ColumnDef<Market>[] = [
  { key: "name", label: "Όνομα" },
  { key: "marketType", label: "Τύπος Αγοράς", render: (row) => marketTypeLabel(row.marketType) },
  { key: "address", label: "Διεύθυνση" },
   {
    key: "area", label: "Περιοχή", render: (row) => {
      // Assuming area information is stored in notes or a similar field for now
      // Adjust this logic based on actual data structure
      const areaInfo = row.notes?.match(/Area:\s*(\w+)/);
      return areaInfo ? areaInfo[1] : "Άγνωστη";
    }
  },
  {
    key: "schedules",
    label: "Ημέρες Λειτουργίας",
    render: (row) => row.schedules
      .filter((schedule) => !schedule.isCancelled)
      .map((schedule) => dayNumberToGreekLabel[schedule.day] ?? String(schedule.day))
      .join(", "),
  },
   { key: "totalSpots", label: "Διαθέσιμες Θέσεις" },
];
