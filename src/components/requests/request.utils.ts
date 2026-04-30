import type { ColumnDef } from "@/shared/components/DataTable";
import type { SellerRequest as SellerRequest, RequestSheet } from "../../models/request";

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
  { key: "id", label: "#" },
  { key: "sellerName", label: "Πωλητής" },
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
  { key: "submittedAt", label: "Ημερομηνία Υποβολής" },
];
