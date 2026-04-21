import { useState } from "react";
import DataTable, { ColumnDef, FilterDef, FilterValues } from "../../../shared/components/DataTable";
import type { Seller, SellerListResponse, SellerSearchRequest, SellerType } from "../../../models/seller";
import { useSellersQuery } from "../../../queries/sellerQueries";
import CustomButton from "../../../shared/components/CustomButton";

const SELLER_TYPE_LABELS: Record<number, string> = {
  0: "—",
  1: "Παραγωγός",
  2: "Επαγγελματίας",
};

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

const mockSellerResponse: SellerListResponse = {
  items: [
    {
      id: 101,
      firstName: "Γιώργος",
      lastName: "Παπαδόπουλος",
      afm: "123456789",
      email: "g.papadopoulos@example.com",
      phone: "6900000001",
      address: "Λάρισα",
      sellerType: 1,
      isActive: true,
    },
    {
      id: 102,
      firstName: "Ελένη",
      lastName: "Κωνσταντίνου",
      afm: "987654321",
      email: "e.konstantinou@example.com",
      phone: "6900000002",
      address: "Θεσσαλονίκη",
      sellerType: 2,
      isActive: true,
    },
    {
      id: 103,
      firstName: "Νικόλαος",
      lastName: "Ιωάννου",
      afm: "456123789",
      email: "n.ioannou@example.com",
      phone: "6900000003",
      address: "Πάτρα",
      sellerType: 1,
      isActive: false,
    },
  ],
  totalCount: 3,
  page: 1,
  pageSize: 25,
};

export default function AdminSellersPage() {
  const [filters, setFilters] = useState<SellerSearchRequest>({
    name: "",
    afm: "",
    sellerType: 0,
    page: 1,
    pageSize: 25,
  });

  useSellersQuery(filters);
  const sellers = mockSellerResponse.items;

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