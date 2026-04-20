import { useState } from "react";
import DataTable, { ColumnDef, FilterDef, FilterValues } from "../../../shared/components/DataTable";
import type { Seller, SellerSearchRequest, SellerType } from "../../../models/seller";
import { useSellersQuery } from "../../../queries/sellerQueries";

const SELLER_TYPE_LABELS: Record<number, string> = {
  0: "—",
  1: "Παραγωγός",
  2: "Μεταπωλητής",
};

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
      { label: "Μεταπωλητής", value: 2 },
    ],
  },
];

export default function AdminSellersPage() {
  const [filters, setFilters] = useState<SellerSearchRequest>({
    name: "",
    afm: "",
    sellerType: 0,
    page: 1,
    pageSize: 25,
  });

  const { data } = useSellersQuery(filters);
  const sellers = data?.items ?? [];

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