import { Box, Typography } from "@mui/material";
import DataTable, { type ColumnDef, type FilterDef } from "../../../shared/components/DataTable";
import { useMemo, useState } from "react";
import type { ConnectedMarket } from "../../../models/market";
import { useMarketSellersQuery } from "../../../queries/marketQueries";
import { useSellersQuery } from "../../../queries/sellerQueries";

interface Props {
  marketId: number;
}

const DEFAULT_SELLER_FILTERS = {
  name: "",
  afm: "",
  sellerType: "",
  page: 1,
  pageSize: 5000,
};

export default function AdminMarketSellerParticipations({ marketId }: Props) {
  const [filters, setFilters] = useState<Record<string, unknown>>({ sellerId: "", dateFrom: "", dateTo: "", page: 1 });

  const { data: sellersData } = useSellersQuery(DEFAULT_SELLER_FILTERS as any);
  const { data: marketSellersData, isLoading, isError, error } = useMarketSellersQuery(String(marketId));

  const sellerOptions = useMemo(() => [
    { label: "Όλοι", value: "" },
    ...(sellersData?.items ?? []).map((s) => ({ label: `${s.firstName} ${s.lastName}`.trim() || `Πωλητής #${s.id}`, value: String(s.id) })),
  ], [sellersData?.items]);


  const rows: ConnectedMarket[] = marketSellersData?.items ?? [];

  const columns: ColumnDef<ConnectedMarket>[] = [
    { key: "sellerFullName", label: "Πωλητής" },
    { key: "fromDate", label: "Από" , render: (r) => (r.fromDate ? new Date(r.fromDate).toLocaleDateString('el-GR') : '-') },
    { key: "toDate", label: "Έως", render: (r) => (r.toDate ? new Date(r.toDate).toLocaleDateString('el-GR') : '-') },
    { key: "spotLocation", label: "Θέση" },
    { key: "licenseCategory", label: "Κατηγ. Άδειας" },
    { key: "notes", label: "Σημειώσεις", render: (r) => r.notes ?? '-' },
  ];

  const tableFilters: FilterDef[] = useMemo(() => [
    { title: "sellerId", label: "Πωλητής", type: "DROPDOWN", dataItems: sellerOptions },
    { title: "dateFrom", label: "Ημερομηνία από", type: "DATE" },
    { title: "dateTo", label: "Ημερομηνία έως", type: "DATE" },
  ], [sellerOptions]);

  const handleSearch = (values: Record<string, unknown>) => {
    setFilters((prev) => ({ ...prev, ...values, page: 1 }));
  };

  const handleClear = () => {
    setFilters({ sellerId: "", dateFrom: "", dateTo: "", page: 1 });
  };

  // Client-side filter application
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (filters["sellerId"] && String(filters["sellerId"]) !== "") {
        if (String(r.sellerId) !== String(filters["sellerId"])) return false;
      }

      

      if (filters["dateFrom"] && String(filters["dateFrom"])) {
        const from = new Date(String(filters["dateFrom"]));
        const rowDate = r.fromDate ? new Date(r.fromDate) : null;
        if (!rowDate || rowDate < from) return false;
      }

      if (filters["dateTo"] && String(filters["dateTo"])) {
        const to = new Date(String(filters["dateTo"]));
        const rowDate = r.toDate ? new Date(r.toDate) : null;
        if (!rowDate || rowDate > to) return false;
      }

      return true;
    });
  }, [rows, filters]);

  return (
    <div className="flex flex-col gap-4">
      <Typography variant="h6" sx={{ fontWeight: 600 }}>Συμμετοχές Πωλητών</Typography>

      <DataTable<ConnectedMarket>
        rows={filteredRows}
        columns={columns}
        rowKey="id"
        filters={tableFilters}
        initialFilterValues={{ sellerId: "", sellerType: "", dateFrom: "", dateTo: "" }}
        onSearch={handleSearch}
        onClearFilters={handleClear}
      />
    </div>
  );
}
