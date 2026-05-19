import { useState, useMemo } from "react";
import { Tab, Tabs, Box } from "@mui/material";
import DataTable, { ColumnDef, FilterDef, FilterValues, DropdownItem } from "../../../shared/components/DataTable";
import type { FeeRule, FeeRuleSearchRequest } from "../../../models/fee";
import { useFeesQuery } from "../../../queries/feesQueries";
import { useMarketsQuery } from "../../../queries/marketQueries";
import { SELLER_TYPE_LABELS } from "../../../lib/feeUtils";
import type { Market } from "../../../models/market";

const columns: ColumnDef<FeeRule>[] = [
  { key: "name", label: "Όνομα" },
  { key: "description", label: "Περιγραφή" },
  {
    key: "marketId",
    label: "Αγορά",
    filterable: false,
    render: (row) => {
      // Market name will be displayed if available from context
      return row.marketId.toString();
    },
  },
  {
    key: "sellerType",
    label: "Τύπος Πωλητή",
    filterable: false,
    render: (row) => SELLER_TYPE_LABELS[row.sellerType] ?? row.sellerType,
  },
  { key: "licenseCategory", label: "Κατηγορία Άδειας" },
  {
    key: "amount",
    label: "Ποσό",
    filterable: false,
    render: (row) => `€${row.amount.toFixed(2)}`,
  },
  { key: "basis", label: "Βάση" },
  { key: "validFrom", label: "Ισχύει από" },
  { key: "validTo", label: "Ισχύει έως" },
  { key: "priority", label: "Προτεραιότητα" },
  { key: "legalReference", label: "Νομική Αναφορά" },
];

export default function AdminFeesPaymentsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState<FeeRuleSearchRequest>({
    marketId: "",
    sellerType: "",
    page: 1,
    pageSize: 25,
  });

  const { data: feesQueryResults } = useFeesQuery(filters);
  const fees: FeeRule[] = feesQueryResults?.items ?? [];

  // Fetch markets for the dropdown
  const marketSearchParams = {
    name: "",
    marketType: "" as const,
    operatingDays: [],
    page: 1,
    pageSize: 1000,
  };
  const { data: marketsQueryResults } = useMarketsQuery(marketSearchParams);
  const markets: Market[] = marketsQueryResults?.items ?? [];

  // Create market dropdown options
  const marketOptions: DropdownItem[] = useMemo(() => {
    return markets.map((market) => ({
      label: market.name,
      value: String(market.id),
    }));
  }, [markets]);

  const sellerTypeOptions: DropdownItem[] = useMemo(() => {
    return Object.entries(SELLER_TYPE_LABELS).map(([value, label]) => ({
      label,
      value,
    }));
  }, []);

  const tableFilters: FilterDef[] = useMemo(() => [
    {
      title: "marketId",
      label: "Αγορά",
      type: "DROPDOWN",
      dataItems: marketOptions,
    },
    {
      title: "sellerType",
      label: "Τύπος Πωλητή",
      type: "DROPDOWN",
      dataItems: sellerTypeOptions,
    },
  ], [marketOptions, sellerTypeOptions]);

  const handleSearch = (values: FilterValues) => {
    setFilters((prev) => ({
      ...prev,
      marketId: values["marketId"] ? Number(values["marketId"]) : "",
      sellerType: String(values["sellerType"] ?? ""),
      page: 1,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      marketId: "",
      sellerType: "",
      page: 1,
      pageSize: 25,
    });
  };

  return (
    <div className="flex h-full w-full flex-col gap-6 text-left">
      <Box>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="fullWidth"
          textColor="inherit"
          sx={{
            width: "100%",
            marginBottom: 3,
            borderBottom: "1px solid var(--color-border)",
            "& .MuiTab-root": {
              flex: 1,
              textTransform: "none",
              fontWeight: 600,
              color: "var(--color-text-muted)",
            },
            "& .MuiTab-root.Mui-selected": {
              color: "var(--color-dark)",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "var(--color-dark)",
            },
          }}
        >
          <Tab label="Λίστα Τελών" />
          <Tab label="Πληρωμές" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <div className="flex flex-col gap-4">
          <DataTable<FeeRule>
            rows={fees}
            columns={columns}
            rowKey="name"
            showFilter={false}
            filters={tableFilters}
            onSearch={handleSearch}
            onClearFilters={handleClearFilters}
            clearFiltersButtonTitle="Καθαρισμός"
          />
        </div>
      )}

      {activeTab === 1 && (
        <div className="flex items-center justify-center h-96 text-gray-500">
          <p>Ενότητα Πληρωμών (Σύντομα)</p>
        </div>
      )}
    </div>
  );
}
    
