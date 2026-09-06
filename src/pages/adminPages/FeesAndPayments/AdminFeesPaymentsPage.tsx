import { useState, useMemo } from "react";
import { Tab, Tabs, Box, Tooltip } from "@mui/material";
import CustomButton from "../../../shared/components/CustomButton";
import { useNavigate } from '@tanstack/react-router';
import DataTable, { ColumnDef, FilterDef, FilterValues, DropdownItem } from "../../../shared/components/DataTable";
import { useGlobalEnums } from '../../../shared/mappings/GlobalEnums';
import type { FeeRule, FeeRuleSearchRequest } from "../../../models/fee";
import { useFeesQuery } from "../../../queries/feesQueries";
import { useMarketsQuery } from "../../../queries/marketQueries";
import { SELLER_TYPE_LABELS } from "../../../lib/feeUtils";
import LayoutTabsSlot from "../../../shared/components/LayoutTabsSlot";
import type { Market } from "../../../models/market";
import ChargesSummary from '../../../components/feesAndPayments/ChargesSummary';

// Columns are defined inside the component so we can use `useGlobalEnums`.
const baseColumns: ColumnDef<FeeRule>[] = [
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
  const { ChargeStatusLabels } = useGlobalEnums();
  const [filters, setFilters] = useState<FeeRuleSearchRequest>({
    marketId: "",
    sellerType: "",
    page: 1,
    pageSize: 25,
  });
  const { ExportFormat, ExportFormatLabels } = useGlobalEnums();

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

  // Create final columns with access to enums
  const columns: ColumnDef<FeeRule>[] = useMemo(() => {
    const cols = [...baseColumns];
    cols.push({
      key: 'status',
      label: 'Κατάσταση',
      filterable: false,
      render: (row) => {
        const r: any = row as any;
        const statusId = r.status ?? r.statusId ?? r.chargeStatus ?? r.chargeStatusId ?? null;
        if (statusId == null || statusId === '') return '—';
        const idNum = Number(statusId);
        return ChargeStatusLabels && ChargeStatusLabels[idNum] ? ChargeStatusLabels[idNum] : String(statusId);
      }
    });
    return cols;
  }, [ChargeStatusLabels]);

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
  const [exportType, setExportType] = useState<number>(ExportFormat?.CSV ?? 0);

  const handleExport = () => {
    try {
      // Build query like list but with large pageSize
      const params = new URLSearchParams();
      if (filters.marketId) params.set('MarketId', String(filters.marketId));
      if (filters.sellerType) params.set('SellerType', String(filters.sellerType));
      params.set('Page', '1');
      params.set('PageSize', '10000');

      const formatLabel = ExportFormatLabels ? (ExportFormatLabels as any)[String(exportType)] : undefined;
      const formatParam = (formatLabel ?? 'xlsx').toLowerCase();

      const token = ((window as any).__fm_token__ ?? null) || (function(){ try { const raw = localStorage.getItem('auth'); if(!raw) return null; const parsed = JSON.parse(raw || '{}'); return parsed.token || null; } catch { return null } })();
      const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
      const qs = params.toString();
      const sep = qs ? '&' : '';
      const requestUrl = `${BASE_URL}/fee-rules?${qs}${sep}format=${encodeURIComponent(formatParam)}`;

      fetch(requestUrl, {
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }).then(async (resp) => {
        if (!resp.ok) {
          const txt = await resp.text().catch(() => 'Export failed');
          throw new Error(txt || 'Export failed');
        }
        const blob = await resp.blob();
        const disposition = resp.headers.get('Content-Disposition') || '';
        let filename = `fee-rules.${formatParam}`;
        const match = disposition.match(/filename\*=UTF-8''(.+)|filename="?([^";]+)"?/);
        if (match) filename = decodeURIComponent(match[1] || match[2]);
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
      }).catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Export failed', err);
        alert('Η εξαγωγή απέτυχε.');
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Export failed', e);
      alert('Η εξαγωγή απέτυχε.');
    }
  };

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
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <CustomButton title="Νέο Τέλος" onClick={() => navigate({ to: '/admin/fees-payments/new' } as any)} />
              </div>
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
