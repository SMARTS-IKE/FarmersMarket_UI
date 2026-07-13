import { useState, useEffect, useCallback, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import DataTable, { ColumnDef, FilterValues } from "../../shared/components/DataTable";
// market filter removed per request
import { http } from "../../lib/http";
import { useQuery } from "@tanstack/react-query";
// using FilterBar for inputs
import FilterBar from "../../shared/components/FilterBar";
import SellerChargesModal from "./SellerChargesModal";
import { useLayoutSlot } from "../../lib/layoutSlotContext";

interface ChargeSummaryItem {
  sellerId: number;
  sellerFullName: string;
  totalCharges: number;
  totalAmount: number;
  pendingAmount: number;
  confirmedAmount: number;
  hasUnexported: boolean;
}

const columns: ColumnDef<ChargeSummaryItem>[] = [
  { key: "sellerFullName", label: "Πωλητής" },
  { key: "totalCharges", label: "Σύνολο Χρεώσεων" },
  {
    key: "totalAmount",
    label: "Συνολικό Ποσό €",
    render: (r) => `${Number(r.totalAmount ?? 0).toFixed(2)}`,
  },
  {
    key: "pendingAmount",
    label: "Εκκρεμές Ποσό €",
    render: (r) => `${Number(r.pendingAmount ?? 0).toFixed(2)}`,
  },
  {
    key: "confirmedAmount",
    label: "Επιβεβαιωμένο Ποσό €",
    render: (r) => `${Number(r.confirmedAmount ?? 0).toFixed(2)}`,
  }
];

export default function ChargesSummary() {
  const [searchParams, setSearchParams] = useState<{ month?: number; year?: number }>({});
  const [monthValue, setMonthValue] = useState<number | undefined>(undefined);
  const [yearValue, setYearValue] = useState<number | undefined>(undefined);
  const { setFilterSlot } = useLayoutSlot();

  const monthOptions = useMemo(() => [
    'Ιανουάριος','Φεβρουάριος','Μάρτιος','Απρίλιος','Μάιος','Ιούνιος','Ιούλιος','Αύγουστος','Σεπτέμβριος','Οκτώβριος','Νοέμβριος','Δεκέμβριος'
  ].map((name, idx) => ({ label: `${idx + 1} — ${name}`, value: idx + 1 })), []);

  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(() => Array.from({ length: currentYear - 2020 + 1 }, (_, i) => 2020 + i).map((y) => ({ label: String(y), value: y })), [currentYear]);

  const fetchSummary = async () => {
    const qs: string[] = [];
    if (searchParams.month) qs.push(`month=${searchParams.month}`);
    if (searchParams.year) qs.push(`year=${searchParams.year}`);
    const path = `/charges/summary${qs.length ? `?${qs.join("&")}` : ""}`;
    return http.get<ChargeSummaryItem[]>(path);
  };

  const { data } = useQuery<ChargeSummaryItem[], Error>({
    queryKey: ["chargesSummary", searchParams],
    queryFn: fetchSummary,
    // don't fetch automatically until user provides at least one filter
    enabled: true,
  });

  const handleSearch = useCallback((_values: FilterValues) => {
    // no-op: filters removed; searching is done via explicit Apply
  }, []);

  // Modal state and selected seller
  const [selectedSellerId, setSelectedSellerId] = useState<number | null>(null);

  const openSellerCharges = (sellerId: number) => {
    setSelectedSellerId(sellerId);
  };

  const closeSellerCharges = () => {
    setSelectedSellerId(null);
  };

  // apply handled by FilterBar onSearch

  const handleClear = useCallback(() => {
    setSearchParams({});
    setMonthValue(undefined);
    setYearValue(undefined);
  }, []);

  useEffect(() => {
    const fields = [
      { name: 'month', label: 'Μήνας', type: 'select', options: monthOptions, value: monthValue ?? '' },
      { name: 'year', label: 'Έτος', type: 'select', options: yearOptions, value: yearValue ?? '' },
    ];

    const onFilterSearch = (values?: Record<string, any>) => {
      const next: { month?: number; year?: number } = {};
      if (values) {
        if (values.month) next.month = Number(values.month);
        if (values.year) next.year = Number(values.year);
      }
      setSearchParams(next);
    };

    setFilterSlot(
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <FilterBar
          fields={fields as any}
          onSearch={onFilterSearch}
          onClear={handleClear}
          searchLabel="Εφαρμογή"
          clearLabel="Καθαρισμός"
          showClearButton={true}
          showSearchButton={true}
        />
      </Box>
    );

    return () => setFilterSlot(null);
  }, [monthOptions, yearOptions, monthValue, yearValue, setFilterSlot, handleClear]);

  return (
    <Box className="flex flex-col gap-4">
      <Typography variant="h6">Σύνοψη Χρεώσεων ανά Πωλητή</Typography>

      <DataTable<ChargeSummaryItem>
        rows={data ?? []}
        columns={columns}
        rowKey="sellerId"
        showFilter={true}
        showGlobalSearch={false}
        onRowClick={(row) => openSellerCharges((row as any).sellerId)}
        onSearch={handleSearch}
        onClearFilters={handleClear}
        clearFiltersButtonTitle="Καθαρισμός"
        hidePagination={false}
      />

      {/* Seller charges modal moved to separate component */}
      <SellerChargesModal
        open={!!selectedSellerId}
        sellerId={selectedSellerId}
        initialFilters={{ month: searchParams.month, year: searchParams.year }}
        onClose={closeSellerCharges}
      />
    </Box>
  );
}
