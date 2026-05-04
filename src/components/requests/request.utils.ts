import type { ColumnDef } from "@/shared/components/DataTable";
import type {
  DesignRequestFieldType,
  SellerRequest as SellerRequest,
  RequestSheet,
} from "../../models/request";

export const STEPS = [
  {
    title: "Βήμα 1: Βασικά Στοιχεία",
    content: "Συμπληρώστε τον τίτλο και την περιγραφή της φόρμας.",
  },
  {
    title: "Βήμα 2: Δυναμικά Πεδία",
    content: "Προσθέστε δυναμικά τα πεδία που θα συμπληρώνει ο χρήστης.",
  },
  {
    title: "Βήμα 3: Λίστα εγγράφων",
    content: "Ορίστε τα απαραίτητα έγγραφα που θα πρέπει να ανεβαίνουν.",
  },
  {
    title: "Βήμα 4: Επιβεβαίωση",
    content: "Δείτε προεπισκόπηση της φόρμας πριν την υποβολή.",
  },
] as const;

export const FIELD_TYPE_OPTIONS: { label: string; value: DesignRequestFieldType }[] = [
  { label: "Κείμενο", value: "TEXT" },
  { label: "Αριθμός", value: "NUMBER" },
  { label: "Ημερομηνία", value: "DATE" },
  { label: "Μεγάλο κείμενο", value: "TEXTAREA" },
  { label: "Dropdown", value: "DROPDOWN" },
  { label: "Ναι/Όχι", value: "BOOLEAN" },
];

export const ADD_NEW_FIELD_OPTION_VALUE = "__add_new__";

export const READY_TO_USE_FIELDS = [
  { id: "fullName", title: "Ονοματεπώνυμο", type: "TEXT", availableValues: "", weight: 1, isRequired: true },
  { id: "afm", title: "ΑΦΜ", type: "NUMBER", availableValues: "", weight: 2, isRequired: true },
  { id: "category", title: "Κατηγορία", type: "DROPDOWN", availableValues: "Παραγωγός, Μεταπωλητής", weight: 2, isRequired: true },
  { id: "startDate", title: "Ημερομηνία Έναρξης", type: "DATE", availableValues: "", weight: 1, isRequired: false },
  { id: "notes", title: "Σχόλια", type: "TEXTAREA", availableValues: "", weight: 1, isRequired: false },
  { id: "termsAccepted", title: "Αποδοχή Όρων", type: "BOOLEAN", availableValues: "", weight: 1, isRequired: true },
] as const;

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export const designRequestColumns: ColumnDef<RequestSheet>[] = [
  { key: "id", label: "#" },
  { key: "title", label: "Τίτλος" },
  { key: "description", label: "Περιγραφή" },
  {
    key: "status",
    label: "Κατάσταση",
    render: (row) => {
      const labels: Record<number, string> = {
        0: "Σε Αναμονή",
        1: "Εγκεκριμένο",
        2: "Απορριφθέν",
      };
      return labels[row.status] ?? "Άγνωστο";
    },
  },
  { key: "createdAt", label: "Ημερομηνία Δημιουργίας" },
];

export const sellerRequestColumns: ColumnDef<SellerRequest>[] = [
  {
    key: "sellerFullName",
    label: "Πωλητής",
    render: (row) => row.sellerFullName || row.sellerName || "-",
  },
  { key: "marketName", label: "Αγορά" },
  {
    key: "requestType",
    label: "Τύπος Αιτήματος",
    render: (row) => {
      const labels: Record<number, string> = {
        1: "Εγγραφή",
        2: "Ακύρωση",
        3: "Αλλαγή Θέσης",
      };
      return labels[row.requestType] ?? "Άγνωστο";
    },
  },
  {
    key: "status",
    label: "Κατάσταση",
    render: (row) => {
      const labels: Record<number, string> = {
        0: "Σε Αναμονή",
        1: "Εγκεκριμένο",
        2: "Απορριφθέν",
      };
      return labels[row.status] ?? "Άγνωστο";
    },
  },
  {
    key: "submittedAt",
    label: "Ημερομηνία Υποβολής",
    render: (row) => formatDateTime(row.submittedAt),
  },
];
