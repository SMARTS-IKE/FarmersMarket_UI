import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import DataTable, { ColumnDef, FilterDef, FilterValues } from "../../../shared/components/DataTable";
import type { Seller, SellerSearchRequest, SellerType } from "../../../models/seller";
import { useSellersQuery } from "../../../queries/sellerQueries";
import CustomButton from "../../../shared/components/CustomButton";
import { SELLER_TYPE_LABELS } from "../../../components/sellers/sellers.utils";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

const SELLER_STATUS_CONFIG = {
  active: {
    label: "Ενεργός",
    backgroundColor: "transparent",
    color: "#166534",
  },
  inactive: {
    label: "Ανενεργός",
    backgroundColor: "transparent",
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
    render: (row) => SELLER_TYPE_LABELS[Number(row.sellerType)] ?? row.sellerType,
  },
  {
    key: "status",
    label: "Κατάσταση",
    filterable: false,
    render: (row) => {
      const statusConfig = row.isActive ? SELLER_STATUS_CONFIG.active : SELLER_STATUS_CONFIG.inactive;

      return (
        <span
          style={{
            color: statusConfig.color,
            fontWeight: 700,
          }}
        >
          {statusConfig.label}
        </span>
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
      sellerType: (Number(values["sellerType"]) || "") as SellerType,
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CustomButton
          title="Νέος πωλητής"
          onClick={() => navigate({ to: "/admin/sellers/new" })}
          width="fit-content"
        />
      </div>

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