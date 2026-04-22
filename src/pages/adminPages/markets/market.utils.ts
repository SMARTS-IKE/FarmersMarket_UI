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
    case 1: return "Λαϊκή";
    case 2: return "Οργανωμένη";
    default: return "Άγνωστο";
  }
};

export const columns: ColumnDef<Market>[] = [
  { key: "name", label: "Όνομα" },
  { key: "marketType", label: "Τύπος Αγοράς", render: (row) => marketTypeLabel(row.marketType) },
  { key: "address", label: "Διεύθυνση" },
  { key: "openTime", label: "Ώρα Ανοίγματος" },
  { key: "closeTime", label: "Ώρα Κλεισίματος" },
  { key: "operatingDays", label: "Ημέρες Λειτουργίας" },
];