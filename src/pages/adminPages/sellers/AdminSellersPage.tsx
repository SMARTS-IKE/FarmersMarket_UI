import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import DataTable, { ColumnDef, FilterDef, FilterValues } from "../../../shared/components/DataTable";
import type { Seller, SellerSearchRequest, SellerType } from "../../../models/seller";
import { useSellersQuery } from "../../../queries/sellerQueries";
import { SELLER_TYPE_LABELS } from "../../../components/sellers/sellers.utils";
import RestartAltIcon from "@mui/icons-material/RestartAlt";


const columns: ColumnDef<Seller>[] = [
  { key: "firstName", label: "Όνομα" },
  { key: "lastName", label: "Επώνυμο" },
  { key: "afm", label: "ΑΦΜ" },
  { key: "phone", label: "Τηλέφωνο" },
  {
    key: "sellerType",
    label: "Τύπος Πωλητή",
    filterable: false,
    render: (row) => SELLER_TYPE_LABELS[Number(row.sellerType)] ?? row.sellerType,
  },
];

const tableFilters: FilterDef[] = [
  { title: "name", label: "Όνομα", type: "TEXT" },
  { title: "afm", label: "ΑΦΜ", type: "TEXT" },
  {
    title: "sellerType",
    label: "Τύπος Πωλητή",
    type: "DROPDOWN",
    width: 250,
    dataItems: Object.entries(SELLER_TYPE_LABELS).map(([value, label]) => ({
      label,
      value: Number(value),
    })),
  },
];

export default function AdminSellersPage() {
  const navigate = useNavigate();
  const initialFilters: SellerSearchRequest = {
    name: "",
    afm: "",
    sellerType: "",
    page: 1,
    pageSize: 25,
  };
  const [filters, setFilters] = useState<SellerSearchRequest>({
    ...initialFilters,
  });

  const { data: sellersQueryResults } = useSellersQuery(filters);
  const sellers: Seller[] = sellersQueryResults?.items ?? [];

  const handleSearch = (values: FilterValues) => {
    setFilters((prev) => ({
      ...prev,
      name: String(values["name"] ?? ""),
      afm: String(values["afm"] ?? ""),
      // Preserve numeric 0 value (falsy) — only set empty string when no selection
      sellerType:
        values["sellerType"] === undefined || values["sellerType"] === "" || values["sellerType"] === null
          ? ("" as any)
          : (Number(values["sellerType"]) as SellerType),
      page: 1,
    }));
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
  };

  const handleRowClick = (seller: Seller) => {
    navigate({ to: "/admin/sellers/$sellerId", params: { sellerId: String(seller.id) } });
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
          onClearFilters={handleClearFilters}
          clearFiltersButtonTitle="Καθαρισμός"
          clearFiltersButtonBackgroundColor="var(--color-text-muted)"
          clearFiltersPrefixIcon={<RestartAltIcon />}
          onRowClick={handleRowClick}
        />
    </div>
  );
}