import React, { useEffect, useState, useMemo } from "react";
import CustomButton from "../../../shared/components/CustomButton";
import { useGlobalEnums } from "../../../shared/mappings/GlobalEnums";
import { http } from "../../../lib/http";
import DataTable, { type ColumnDef } from "../../../shared/components/DataTable";
import { columns as marketColumns } from "../../../components/markets/market.utils";
import { sellerRequestColumns } from "../../../components/requests/request.utils";
import { Tooltip } from "@mui/material";
import { useAuthStore } from "../../../store/authStore";

export interface ReportRow {
  id: number;
  title: string;
  category: string;
  createdAt: string;
  status: string;
}

interface ReportsListSectionProps {
  reports: ReportRow[];
  fromDate?: string; // Added fromDate to props
  toDate?: string;   // Added toDate to props
  period?: string;
}

export default function ReportsListSection({ reports, fromDate, toDate, period }: ReportsListSectionProps) {
  const { LicenseCategoryLabels, LicenseStatusLabels, SellerTypeLabels, RequestStatusLabels, ChargeStatusLabels, UserStatusLabels, UserStatus } = useGlobalEnums();
  const { ExportFormat, ExportFormatLabels } = useGlobalEnums();

  const renderOptions = (labels?: Record<string, string>, fallbackKeys: (string | number)[] = []) => {
    if (labels) {
      return Object.entries(labels).map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ));
    }
    return fallbackKeys.map((k) => (
      <option key={String(k)} value={String(k)}>
        {`Value-${String(k)}`}
      </option>
    ));
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<string>("Πωλητές");
  const [sellerLicenseCategory, setSellerLicenseCategory] = useState<string>("");
  const [sellerLicenseStatus, setSellerLicenseStatus] = useState<string>("");
  const [sellerType, setSellerType] = useState<string>("");
  // Markets filters
  const [marketIsActive, setMarketIsActive] = useState<string>("");
  const [marketArea, setMarketArea] = useState<string>("");
  // Requests filters
  const [requestStatus, setRequestStatus] = useState<string>("");
  // Charges/Fees filters
  const [chargeStatus, setChargeStatus] = useState<string>("");
  const [chargeExportedToFinance, setChargeExportedToFinance] = useState<string>("");

  const deriveMonthYear = () => {
    if (!fromDate || !toDate) return { month: null as string | null, year: null as string | null };
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const monthsDiff = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth()) + 1;
    if (monthsDiff >= 3) {
      return { month: null as string | null, year: String(from.getFullYear()) };
    }
    return { month: String(from.getMonth() + 1), year: String(from.getFullYear()) };
  };

  function openModal() {
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  function createReport() {
    const payload: any = { field: selectedField };
    if (selectedField === "Πωλητές") {
      payload.filters = {
        licenseCategory: sellerLicenseCategory,
        licenseStatus: sellerLicenseStatus,
        sellerType: sellerType,
      };
    }

    if (selectedField === "Αγορές") {
      payload.filters = {
        fromDate: fromDate ?? null,
        toDate: toDate ?? null,
        isActive: marketIsActive,
        area: marketArea,
      };
    }

    if (selectedField === "Αιτήματα") {
      payload.filters = {
        fromDate: fromDate ?? null,
        toDate: toDate ?? null,
        status: requestStatus,
      };
    }
    if (selectedField === "Χρεώσεις") {
      const { month, year } = deriveMonthYear();
      payload.filters = {
        status: chargeStatus,
        exportedToFinance: chargeExportedToFinance,
        ...(month ? { month } : {}),
        year: year ?? null,
      };
    }

    // perform fetch and populate table with page=1,pageSize=10
    setLastPayload(payload);
    fetchResults(1, 10, payload);
    closeModal();
  }

  const [tableItems, setTableItems] = useState<any[]>(reports ?? []);
  const [totalItems, setTotalItems] = useState<number | null>(null);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [loadingResults, setLoadingResults] = useState<boolean>(false);
  const [lastPayload, setLastPayload] = useState<any | undefined>(undefined);
  const [exportFormat, setExportFormat] = useState<string>('xlsx');

  const buildQueryParams = (filters: Record<string, any>, p: number, ps: number) => {
    const params = new URLSearchParams();
    params.set('page', String(p));
    params.set('pageSize', String(ps));
    // attach from/to if present
    if (filters.fromDate) params.set('fromDate', filters.fromDate);
    if (filters.toDate) params.set('toDate', filters.toDate);
    Object.entries(filters).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;
      if (k === 'fromDate' || k === 'toDate') return;
      params.set(k, String(v));
    });
    return params.toString();
  };

  function buildExportPayload(payload?: any) {
    const field = payload?.field ?? selectedField;
    const filters = payload?.filters ?? {};
    // ensure large page size
    return {
      field,
      filters: {
        ...filters,
        page: 1,
        pageSize: 10000,
      },
    };
  }

  async function handleExport() {
    try {
      // Determine resource
      const pl = buildExportPayload(lastPayload ?? { field: selectedField, filters: {} });
      const resource = pl.field === 'Πωλητές' ? 'sellers' : pl.field === 'Αγορές' ? 'markets' : pl.field === 'Αιτήματα' ? 'requests' : 'charges';

      const token = useAuthStore.getState().token;
      const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

      // Build query params same as list call but with large pageSize and format
      const qs = buildQueryParams(pl.filters ?? {}, 1, 10000);
      const formatParam = encodeURIComponent((exportFormat ?? 'xlsx').toLowerCase());
      const sep = qs ? `&` : '';
      const requestUrl = `${BASE_URL}/${resource}?${qs}${sep}format=${formatParam}`;

      const resp = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!resp.ok) {
        const txt = await resp.text().catch(() => 'Export failed');
        throw new Error(txt || 'Export failed');
      }

      const blob = await resp.blob();
      const disposition = resp.headers.get('Content-Disposition') || '';
      let filename = `${resource}.${(exportFormat ?? 'xlsx').toLowerCase()}`;
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
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Export failed', e);
      alert('Η εξαγωγή απέτυχε.');
    }
  }

  async function fetchResults(p: number, ps: number, payload?: any) {
    setLoadingResults(true);
    try {
      const field = payload?.field ?? selectedField;
      const filters = payload?.filters ?? {};
      // choose endpoint and query params per field
      let path = '';
      if (field === 'Πωλητές') {
        path = `/sellers?${buildQueryParams(filters, p, ps)}`;
      } else if (field === 'Αγορές') {
        path = `/markets?${buildQueryParams(filters, p, ps)}`;
      } else if (field === 'Αιτήματα') {
        path = `/requests?${buildQueryParams(filters, p, ps)}`;
      } else if (field === 'Χρεώσεις') {
        path = `/charges?${buildQueryParams(filters, p, ps)}`;
      }

      if (!path) {
        setTableItems([]);
        setTotalItems(null);
        return;
      }

      const res = await http.get<any>(path);
      // normalize response: support { items: [], totalCount } or array
      if (Array.isArray(res)) {
        setTableItems(res);
        setTotalItems(res.length);
      } else if (res?.items) {
        setTableItems(res.items);
        const total = res.totalCount ?? res.totalItems ?? res.total ?? null;
        setTotalItems(total);
      } else {
        // fallback: try to find array props
        const arr = Object.values(res).find((v) => Array.isArray(v)) as any[] | undefined;
        if (arr) {
          setTableItems(arr);
          setTotalItems(arr.length);
        } else {
          setTableItems([]);
          setTotalItems(null);
        }
      }
      setPage(p);
    } catch (e) {
      console.error('Failed to fetch report results', e);
      setTableItems([]);
      setTotalItems(null);
    } finally {
      setLoadingResults(false);
    }
  }

  useEffect(() => {
    // initialize with provided reports prop
    setTableItems(reports ?? []);
    setTotalItems(reports?.length ?? null);
  }, [reports]);

  const sellerColumns: ColumnDef<any>[] = useMemo(() => [
    { key: "firstName", label: "Όνομα" },
    { key: "lastName", label: "Επώνυμο" },
    { key: "afm", label: "ΑΦΜ" },
    { key: "phone", label: "Τηλέφωνο" },
    {
      key: "sellerType",
      label: "Τύπος Πωλητή",
      filterable: false,
      render: (row: any) => SellerTypeLabels?.[String(row.sellerType ?? row.currentLicense?.sellerType ?? row.sellerType)] ?? String(row.sellerType ?? "—"),
    },
    {
      key: 'userStatus',
      label: 'Κατάσταση χρήστη',
      render: (row: any) => {
        const rawStatus = (row as any).status ?? (row.isActive ? UserStatus?.Active : UserStatus?.Inactive);
        const label = UserStatusLabels?.[rawStatus] ?? (rawStatus === UserStatus?.Active ? 'Ενεργός' : 'Ανενεργός');
        return <span style={{ fontWeight: 700 }}>{label}</span>;
      },
    },
  ], [SellerTypeLabels, UserStatusLabels, UserStatus]);

  const chargesColumns: ColumnDef<any>[] = useMemo(() => {
    const formatDate = (iso?: string | null) => {
      if (!iso) return "";
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return "";
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    };

    return [
      { key: 'chargeDate', label: 'Ημερομηνία', render: (r: any) => formatDate(r.chargeDate ?? r.createdAt ?? r.date) },
      {
        key: 'sellerFullName',
        label: 'Πωλητής',
        render: (r: any) => {
          const name = (r?.sellerFullName ?? r?.sellerName ?? r?.fullName ?? `${r?.firstName ?? ''} ${r?.lastName ?? ''}`).trim();
          return name || '—';
        },
      },
      {
        key: 'marketName',
        label: 'Αγορά',
        render: (r: any) => {
          const names: string[] = (r as any).marketNames ?? (r.marketName ? [r.marketName] : []);
          if (!names || names.length === 0) return '—';
          const first = names[0];
          const extra = names.length - 1;
          const tooltipContent = names.join(', ');
          return (
            <Tooltip title={tooltipContent} placement="top" arrow>
              <span style={{ cursor: 'default' }}>
                {first}
                {extra > 0 && <span style={{ marginLeft: 8 }}>+{extra}</span>}
              </span>
            </Tooltip>
          );
        },
      },
      { key: 'amount', label: 'Ποσό €', render: (r: any) => `${Number(r.amount ?? r.total ?? 0).toFixed(2)}` },
    ];
  }, []);

  const columnsByField: Record<string, ColumnDef<any>[]> = {
    'Πωλητές': sellerColumns,
    'Αγορές': marketColumns as ColumnDef<any>[],
    'Αιτήματα': sellerRequestColumns as ColumnDef<any>[],
    'Χρεώσεις': chargesColumns,
  };

  return (
    <div className="rounded-[20px] border border-(--color-border) bg-(--color-surface) p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.1em] text-(--color-text-muted)">Αναφορές</p>
          <p className="mt-1 text-sm text-(--color-text-muted)">Κατάλογος διαθέσιμων αναφορών και εξαγωγών.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)} className="rounded border px-2 py-1 text-sm">
            <option value="xlsx">XLSX</option>
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
          </select>
          <CustomButton title="Export to" backgroundColor="var(--color-surface)" width={120} onClick={handleExport} />
          <CustomButton title="Νέα Αναφορά" backgroundColor="var(--color-primary)" width={140} onClick={openModal} />
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative z-10 w-full max-w-md rounded-lg bg-(--color-surface) p-5" style={{ backgroundColor: 'var(--color-surface)' }}>
            <h3 className="mb-3 text-lg font-semibold text-(--color-text-heading)">Νέα Αναφορά - Επιλογή Πεδίου</h3>
            <label className="mb-2 block text-sm text-(--color-text)">Επιλέξτε πεδίο</label>
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="mb-4 w-full rounded border border-(--color-border) bg-transparent px-3 py-2 text-sm"
            >
              <option value="Πωλητές">Πωλητές</option>
              <option value="Αγορές">Αγορές</option>
              <option value="Αιτήματα">Αιτήματα</option>
              <option value="Χρεώσεις">Χρεώσεις</option>
            </select>

            {selectedField === "Πωλητές" && (
              <div className="space-y-3">
                <label className="block text-sm text-(--color-text)">Κατηγορία Άδειας</label>
                <select
                  value={sellerLicenseCategory}
                  onChange={(e) => setSellerLicenseCategory(e.target.value)}
                  className="w-full rounded border border-(--color-border) bg-transparent px-3 py-2 text-sm"
                >
                  <option value="">Όλοι</option>
                  {renderOptions(LicenseCategoryLabels, [0, 1, 2])}
                </select>

                <label className="block text-sm text-(--color-text)">Κατάσταση Άδειας</label>
                <select
                  value={sellerLicenseStatus}
                  onChange={(e) => setSellerLicenseStatus(e.target.value)}
                  className="w-full rounded border border-(--color-border) bg-transparent px-3 py-2 text-sm"
                >
                  <option value="">Όλοι</option>
                  {renderOptions(LicenseStatusLabels, [0, 1, 2, 3])}
                </select>

                <label className="block text-sm text-(--color-text)">Τύπος Πωλητή</label>
                <select
                  value={sellerType}
                  onChange={(e) => setSellerType(e.target.value)}
                  className="w-full rounded border border-(--color-border) bg-transparent px-3 py-2 text-sm"
                >
                  <option value="">Όλοι</option>
                  {renderOptions(SellerTypeLabels, [0, 1, 2])}
                </select>
              </div>
            )}

            {selectedField === "Αγορές" && (
              <div className="space-y-3">
                <p className="text-sm text-(--color-text-muted)">Η περίοδος χρησιμοποιείται από την επιλογή στην κορυφή της σελίδας.</p>
                <label className="block text-sm text-(--color-text)">Ενεργό</label>
                <select
                  value={marketIsActive}
                  onChange={(e) => setMarketIsActive(e.target.value)}
                  className="w-full rounded border border-(--color-border) bg-transparent px-3 py-2 text-sm"
                >
                  <option value="">Όλοι</option>
                  <option value="true">Ναι</option>
                  <option value="false">Όχι</option>
                </select>

                <label className="block text-sm text-(--color-text)">Περιοχή</label>
                <input
                  type="text"
                  value={marketArea}
                  onChange={(e) => setMarketArea(e.target.value)}
                  className="w-full rounded border border-(--color-border) bg-transparent px-3 py-2 text-sm"
                />
              </div>
            )}

            {selectedField === "Αιτήματα" && (
              <div className="space-y-3">
                <label className="block text-sm text-(--color-text)">Κατάσταση</label>
                <select
                  value={requestStatus}
                  onChange={(e) => setRequestStatus(e.target.value)}
                  className="w-full rounded border border-(--color-border) bg-transparent px-3 py-2 text-sm"
                >
                  <option value="">Όλοι</option>
                    {renderOptions(RequestStatusLabels, [0, 1, 2, 3, 4])}
                </select>

                {/* SellerId and MarketId inputs removed per UX decision */}

                <p className="text-sm text-(--color-text-muted)">Η περίοδος χρησιμοποιείται από την επιλογή στην κορυφή της σελίδας.</p>
              </div>
            )}

            {selectedField === "Χρεώσεις" && (
              <div className="space-y-3">
                {/* SellerId and MarketId inputs removed per UX decision */}

                <label className="block text-sm text-(--color-text)">Κατάσταση</label>
                <select
                  value={chargeStatus}
                  onChange={(e) => setChargeStatus(e.target.value)}
                  className="w-full rounded border border-(--color-border) bg-transparent px-3 py-2 text-sm"
                >
                  <option value="">Όλοι</option>
                  {renderOptions(ChargeStatusLabels, [0, 1, 2, 3, 4, 5])}
                </select>

                <label className="block text-sm text-(--color-text)">Εξαγωγή σε Χρηματοοικονομικά</label>
                <select
                  value={chargeExportedToFinance}
                  onChange={(e) => setChargeExportedToFinance(e.target.value)}
                  className="w-full rounded border border-(--color-border) bg-transparent px-3 py-2 text-sm"
                >
                  <option value="">Όλοι</option>
                  <option value="true">Ναι</option>
                  <option value="false">Όχι</option>
                </select>

                <p className="text-sm text-(--color-text-muted)">Η περίοδος χρησιμοποιείται για τον υπολογισμό Μήνα/Έτους.</p>
              </div>
            )}

            <div className="mt-4 flex justify-end gap-3">
              <CustomButton title="Ακύρωση" backgroundColor="var(--color-surface)" width={120} onClick={closeModal} />
              <CustomButton title="Δημιουργία" backgroundColor="var(--color-primary)" width={120} onClick={createReport} />
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-[14px] border border-(--color-border)">
        <div className="w-full">
          <DataTable<any>
            rows={tableItems}
            columns={columnsByField[selectedField] ?? []}
            rowKey="id"
            showFilter={false}
          />
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-sm text-(--color-text-muted)">{loadingResults ? 'Φόρτωση...' : `${totalItems ?? tableItems.length} εγγραφές`}</div>
          <div className="flex items-center gap-2">
            <button
              className="rounded border px-3 py-1 text-sm"
              onClick={() => lastPayload && fetchResults(Math.max(1, page - 1), pageSize, lastPayload)}
              disabled={loadingResults || page <= 1}
            >Προηγούμενη</button>
            <div className="text-sm">{page}{totalItems ? ` / ${Math.max(1, Math.ceil(totalItems / pageSize))}` : ''}</div>
            <button
              className="rounded border px-3 py-1 text-sm"
              onClick={() => lastPayload && fetchResults(page + 1, pageSize, lastPayload)}
              disabled={loadingResults || (typeof totalItems === 'number' ? page >= Math.ceil(totalItems / pageSize) : tableItems.length < pageSize)}
            >Επόμενη</button>
          </div>
        </div>
      </div>
    </div>
  );
}
