import { useState } from "react";
import DataTable, { ColumnDef, FilterDef, FilterValues } from "../../../shared/components/DataTable";
import type { Seller, SellerSearchRequest, SellerType } from "../../../models/seller";
import { useSellersQuery } from "../../../queries/sellerQueries";
import CustomButton from "../../../shared/components/CustomButton";
import { SELLER_TYPE_LABELS } from "../../../components/sellers/sellers.utils";

const SELLER_STATUS_CONFIG = {
  active: {
    label: "Ενεργός",
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  inactive: {
    label: "Ανενεργός",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
} as const;

const columns: ColumnDef<Seller>[] = [
  { key: "firstName", label: "Όνομα" },
  { key: "lastName", label: "Επώνυμο" },
  { key: "afm", label: "ΑΦΜ" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Τηλέφωνο" },
  {
    key: "sellerType",
    label: "Τύπος Πωλητή",
    filterable: false,
    render: (row) => SELLER_TYPE_LABELS[row.sellerType] ?? row.sellerType,
  },
  {
    key: "status",
    label: "Κατάσταση",
    filterable: false,
    render: (row) => {
      const statusConfig = row.isActive ? SELLER_STATUS_CONFIG.active : SELLER_STATUS_CONFIG.inactive;

      return (
        <CustomButton
          title={statusConfig.label}
          backgroundColor={statusConfig.backgroundColor}
          width={120}
          sx={{
            color: statusConfig.color,
            fontWeight: 700,
            boxShadow: "none",
            borderRadius: 100,
            pointerEvents: "none",
          }}
        />
      );
    },
  },
];

const tableFilters: FilterDef[] = [
  { title: "name", label: "Όνομα", type: "TEXT" },
  { title: "afm", label: "ΑΦΜ", type: "TEXT" },
  {
    title: "sellerType",
    label: "Τύπος Πωλητή",
    type: "DROPDOWN",
    dataItems: [
      { label: "Παραγωγός", value: 1 },
      { label: "Επαγγελματίας", value: 2 },
    ],
  },
];

export default function AdminSellersPage() {
  const [filters, setFilters] = useState<SellerSearchRequest>({
    name: "",
    afm: "",
    sellerType: 1,
    page: 1,
    pageSize: 25,
  });

  const { data: sellersQueryResults } = useSellersQuery(filters);
  const sellers: Seller[] = sellersQueryResults?.items ?? [];

  const handleSearch = (values: FilterValues) => {
    setFilters((prev) => ({
      ...prev,
      name: String(values["name"] ?? ""),
      afm: String(values["afm"] ?? ""),
      sellerType: (Number(values["sellerType"]) || 0) as SellerType,
      page: 1,
    }));
  };

  return (
    <div className="flex h-full flex-col gap-6 text-left">

      <DataTable<Seller>
          rows={sellers}
          columns={columns}
          rowKey="id"
          showFilter={false}
          filters={tableFilters}
          onSearch={handleSearch}
        />
    </div>
  );
}