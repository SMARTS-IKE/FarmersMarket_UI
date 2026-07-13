import { useState, useMemo } from "react";
import { Tab, Tabs, Box, Tooltip } from "@mui/material";
import CustomButton from "../../../shared/components/CustomButton";
import { useNavigate } from '@tanstack/react-router';
import DataTable, { ColumnDef, FilterDef, FilterValues, DropdownItem } from "../../../shared/components/DataTable";
import type { FeeRule, FeeRuleSearchRequest } from "../../../models/fee";
import { useFeesQuery } from "../../../queries/feesQueries";
import { useMarketsQuery } from "../../../queries/marketQueries";
import { SELLER_TYPE_LABELS } from "../../../lib/feeUtils";
import LayoutTabsSlot from "../../../shared/components/LayoutTabsSlot";
import type { Market } from "../../../models/market";
import ChargesSummary from '../../../components/feesAndPayments/ChargesSummary';

const columns: ColumnDef<FeeRule>[] = [
  {
    key: "marketName",
    label: "Αγορά",
    render: (row) => {
      const names: string[] = (row as any).marketNames ?? [];
      if (!names || names.length === 0) return "—";
      const first = names[0];
      const extra = names.length - 1;
      const tooltipContent = names.join(', ');
      return (
        <Tooltip title={tooltipContent} placement="top" arrow>
          <span style={{ cursor: 'default' }}>
            {first}
            {extra > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', backgroundColor: 'var(--color-dark)', color: 'var(--color-surface)', fontSize: 12, marginLeft: 8 }}>
                +{extra}
              </span>
            )}
          </span>
        </Tooltip>
      );
    },
  },
  {
    key: "sellerType",
    label: "Τύπος Πωλητή",
    filterable: false,
    render: (row) => {
      const val = (row as any).sellerType;
      // If the value directly matches our labels (e.g. numeric string "1"), use it
      if (val != null && SELLER_TYPE_LABELS[String(val)]) return SELLER_TYPE_LABELS[String(val)];

      // Map common English values to enum codes
      const mapEngToCode: Record<string, string> = {
        producer: '0',
        professional_seller: '1',
      };

      if (typeof val === 'string') {
        const normalized = val.trim().toLowerCase();
        if (mapEngToCode[normalized]) return SELLER_TYPE_LABELS[mapEngToCode[normalized]];
      }

      // Fallback to original value
      return String(val ?? '—');
    },
  },
  {
    key: "amount",
    label: "Βασικό Ποσό €",
    filterable: false,
    render: (row) => `${Number(row.amount ?? 0).toFixed(2)}`,
  },
  { key: "validFrom", label: "Ισχύει από" },
  { key: "validTo", label: "Ισχύει έως" }
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

  // Map API response shape to the `FeeRule` table shape expected by the DataTable.
  // - Use the first market id (or null) as `marketId` and join `marketNames` for display
  // - Display `basis` in the `amount` column per request
  // - Use `createdAt` / `updatedAt` as `validFrom` / `validTo`
  const formatDate = (iso?: string) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return "";
      return d.toISOString().slice(0, 10);
    } catch {
      return "";
    }
  };

  const fees: FeeRule[] = (feesQueryResults?.items ?? []).map((f: any) => ({
    id: f.id,
    name: f.name,
    description: f.description,
    marketId: f.marketIds && f.marketIds.length > 0 ? f.marketIds[0] : null,
    marketIds: f.marketIds,
    // keep the original names array for the renderer
    // @ts-ignore
    marketNames: Array.isArray(f.marketNames) ? f.marketNames : (f.marketNames ?? []),
    sellerType: f.sellerType,
    licenseCategory: f.licenseCategory,
    // Per request, show basis as the main displayed amount
    amount: f.basis ?? f.amount ?? 0,
    basis: f.basis ?? 0,
    validFrom: formatDate(f.createdAt),
    validTo: formatDate(f.updatedAt),
    priority: 0,
    legalReference: "",
  }));

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
  // Debug: log markets response to help diagnose visibility issues
  // Remove in production after debugging
  // eslint-disable-next-line no-console
  console.debug('AdminFeesPaymentsPage markets:', marketsQueryResults);

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

  const navigate = useNavigate();

  return (
    <div className="flex h-full w-full flex-col gap-6 text-left overflow-hidden">
      <LayoutTabsSlot>
        <Box sx={{height: '100%', display: 'flex', alignItems: 'center', gap: 2}}>
          <Box sx={{ flex: 1 }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="fullWidth"
              textColor="inherit"
              sx={{
                width: "100%",
              }}
            >
              <Tab label="Λίστα Τελών" />
              <Tab label="Πληρωμές" />
            </Tabs>
          </Box>
        </Box>
      </LayoutTabsSlot>

      <div className="flex-1 overflow-y-auto pr-2 max-h-[calc(100svh-300px)]">
        {activeTab === 0 && (
          <div className="flex flex-col gap-4">
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <CustomButton title="Νέο Τέλος" onClick={() => navigate({ to: '/admin/fees-payments/new' } as any)} />
            </Box>

            <DataTable<FeeRule>
              rows={fees}
              columns={columns}
              rowKey="id"
              onRowClick={(r) => navigate({ to: `/admin/fees-payments/${(r as any).id}` } as any)}
              showFilter={true}
              showGlobalSearch={false}
              filters={tableFilters}
              onSearch={handleSearch}
              onClearFilters={handleClearFilters}
              clearFiltersButtonTitle="Καθαρισμός"
            />
          </div>
        )}

        {activeTab === 1 && (
          <div className="flex flex-col gap-4">
            <ChargesSummary />
          </div>
        )}
      </div>
    </div>
  );
}
    
