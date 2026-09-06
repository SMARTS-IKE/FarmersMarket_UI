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
        {'Value-' + String(k)}
      </option>
    ));
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const SAVED_REPORTS_KEY = 'fm_saved_reports_v1';
  const [savedReports, setSavedReports] = useState<Array<{ name: string; payload: any }>>([]);
  const [saveName, setSaveName] = useState<string>('');
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

  // localStorage helpers
  const loadSavedReports = () => {
    try {
      const raw = localStorage.getItem(SAVED_REPORTS_KEY);
      if (!raw) return setSavedReports([]);
      const parsed = JSON.parse(raw) as Array<{ name: string; payload: any }>;
      setSavedReports(parsed || []);
    } catch (e) {
      setSavedReports([]);
    }
  };

  const persistSavedReports = (items: Array<{ name: string; payload: any }>) => {
    try {
      localStorage.setItem(SAVED_REPORTS_KEY, JSON.stringify(items));
      setSavedReports(items);
    } catch (e) {
      // ignore
    }
  };

  const handleSavePayload = (payload: any) => {
    if (!saveName || !payload) return alert('Παρακαλώ δώστε όνομα και ρυθμίσεις πριν αποθηκεύσετε.');
    const existing = savedReports.filter((s) => s.name !== saveName);
    const next = [...existing, { name: saveName, payload }];
    persistSavedReports(next);
    setSaveName('');
    closeModal();
  };

  const handleSelectSaved = (name: string) => {
    const found = savedReports.find((s) => s.name === name);
    if (!found) return;
    setLastPayload(found.payload);
    fetchResults(1, 10, found.payload);
  };

  const handleDeleteSaved = (name: string) => {
    const next = savedReports.filter((s) => s.name !== name);
    persistSavedReports(next);
  };

  const buildCurrentPayload = () => {
    if (!selectedField) return { field: selectedField, filters: {} };
    if (selectedField === 'Πωλητές') return { field: selectedField, filters: { licenseCategory: sellerLicenseCategory, licenseStatus: sellerLicenseStatus, sellerType } };
    if (selectedField === 'Αγορές') return { field: selectedField, filters: { fromDate: fromDate ?? null, toDate: toDate ?? null, isActive: marketIsActive, area: marketArea } };
    if (selectedField === 'Αιτήματα') return { field: selectedField, filters: { fromDate: fromDate ?? null, toDate: toDate ?? null, status: requestStatus } };
    if (selectedField === 'Χρεώσεις') { const { month, year } = deriveMonthYear(); return { field: selectedField, filters: { status: chargeStatus, exportedToFinance: chargeExportedToFinance, ...(month ? { month } : {}), year: year ?? null } };
    }
    return { field: selectedField, filters: {} };
  };

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
    loadSavedReports();
    // initialize with provided reports prop only if a report payload was created
    if (lastPayload) {
      setTableItems(reports ?? []);
      setTotalItems(reports?.length ?? null);
    } else {
      setTableItems([]);
      setTotalItems(null);
    }
  }, [reports, lastPayload]);

  // Clear current list when the selected period changes
  useEffect(() => {
    setTableItems([]);
    setTotalItems(null);
    setLastPayload(undefined);
    setPage(1);
  }, [period]);

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

  const hasSelectedField = Boolean(selectedField);
  const effectiveTotal = typeof totalItems === 'number' ? totalItems : tableItems.length;
  const isExportDisabled = loadingResults || !hasSelectedField || effectiveTotal === 0;

  return (
    <div className="rounded-[20px] border border-(--color-border) p-5" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.1em]" style={{ color: 'var(--color-text-muted)' }}>Αναφορές</p>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>Κατάλογος διαθέσιμων αναφορών και εξαγωγών.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)} className="rounded border px-2 py-1 text-sm" style={{ borderColor: 'var(--color-border)' }}>
            <option value="xlsx">XLSX</option>
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
          </select>
          <CustomButton title="Export" backgroundColor="var(--color-surface)" width={120} onClick={handleExport} disabled={isExportDisabled} />
          <CustomButton title="Νέα Αναφορά" backgroundColor="var(--color-primary)" width={140} onClick={openModal} />
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 9990 }}>
          <div className="absolute inset-0" onClick={closeModal} style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 9990 }} />
            <div className="relative w-full max-w-md rounded-lg p-5" style={{ backgroundColor: 'rgba(255,255,255,0.98)', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', zIndex: 9999 }}>
              <h3 className="mb-3 text-lg font-semibold" style={{ color: 'var(--color-text-heading)' }}>Νέα Αναφορά - Επιλογή Πεδίου</h3>

              <label className="mb-2 block text-sm" style={{ color: 'var(--color-text)' }}>Επιλέξτε πεδίο</label>
              <select
                value={selectedField}
                onChange={(e) => {
                  const v = e.target.value;
                  setSelectedField(v);
                  setTableItems([]);
                  setTotalItems(null);
                  setLastPayload(undefined);
                }}
                className="mb-4 w-full rounded border px-3 py-2 text-sm"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(255,255,255,0.98)' }}
              >
                <option value="Πωλητές">Πωλητές</option>
                <option value="Αγορές">Αγορές</option>
                <option value="Αιτήματα">Αιτήματα</option>
                <option value="Χρεώσεις">Χρεώσεις</option>
              </select>

              {/* Field-specific filters */}
              {selectedField === 'Πωλητές' && (
                <div className="space-y-3">
                  <label className="block text-sm" style={{ color: 'var(--color-text)' }}>Κατηγορία Άδειας</label>
                  <select value={sellerLicenseCategory} onChange={(e) => setSellerLicenseCategory(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-border)' }}>
                    <option value="">Όλοι</option>
                    {renderOptions(LicenseCategoryLabels, [0, 1, 2])}
                  </select>

                  <label className="block text-sm" style={{ color: 'var(--color-text)' }}>Κατάσταση Άδειας</label>
                  <select value={sellerLicenseStatus} onChange={(e) => setSellerLicenseStatus(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-border)' }}>
                    <option value="">Όλοι</option>
                    {renderOptions(LicenseStatusLabels, [0, 1, 2, 3])}
                  </select>

                  <label className="block text-sm" style={{ color: 'var(--color-text)' }}>Τύπος Πωλητή</label>
                  <select value={sellerType} onChange={(e) => setSellerType(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-border)' }}>
                    <option value="">Όλοι</option>
                    {renderOptions(SellerTypeLabels, [0, 1, 2])}
                  </select>
                </div>
              )}

              {selectedField === 'Αγορές' && (
                <div className="space-y-3">
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Η περίοδος χρησιμοποιείται από την επιλογή στην κορυφή της σελίδας.</p>
                  <label className="block text-sm" style={{ color: 'var(--color-text)' }}>Ενεργό</label>
                  <select value={marketIsActive} onChange={(e) => setMarketIsActive(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-border)' }}>
                    <option value="">Όλοι</option>
                    <option value="true">Ναι</option>
                    <option value="false">Όχι</option>
                  </select>

                  <label className="block text-sm" style={{ color: 'var(--color-text)' }}>Περιοχή</label>
                  <input type="text" value={marketArea} onChange={(e) => setMarketArea(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-border)' }} />
                </div>
              )}

              {selectedField === 'Αιτήματα' && (
                <div className="space-y-3">
                  <label className="block text-sm" style={{ color: 'var(--color-text)' }}>Κατάσταση</label>
                  <select value={requestStatus} onChange={(e) => setRequestStatus(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-border)' }}>
                    <option value="">Όλοι</option>
                    {renderOptions(RequestStatusLabels, [0, 1, 2, 3, 4])}
                  </select>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Η περίοδος χρησιμοποιείται από την επιλογή στην κορυφή της σελίδας.</p>
                </div>
              )}

              {selectedField === 'Χρεώσεις' && (
                <div className="space-y-3">
                  <label className="block text-sm" style={{ color: 'var(--color-text)' }}>Κατάσταση</label>
                  <select value={chargeStatus} onChange={(e) => setChargeStatus(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-border)' }}>
                    <option value="">Όλοι</option>
                    {renderOptions(ChargeStatusLabels, [0, 1, 2, 3, 4, 5])}
                  </select>

                  <label className="block text-sm" style={{ color: 'var(--color-text)' }}>Εξαγωγή σε Χρηματοοικονομικά</label>
                  <select value={chargeExportedToFinance} onChange={(e) => setChargeExportedToFinance(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-border)' }}>
                    <option value="">Όλοι</option>
                    <option value="true">Ναι</option>
                    <option value="false">Όχι</option>
                  </select>

                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Η περίοδος χρησιμοποιείται για τον υπολογισμό Μήνα/Έτους.</p>
                </div>
              )}

              <div className="mt-4 flex justify-end gap-3">
                <CustomButton title="Ακύρωση" backgroundColor="var(--color-surface)" width={120} onClick={closeModal} />
                <CustomButton title="Δημιουργία" backgroundColor="var(--color-primary)" width={120} onClick={createReport} />
              </div>

              <div className="mt-3 border-t pt-3">
                <label className="block text-sm" style={{ color: 'var(--color-text)' }}>Αποθήκευση ρυθμίσεων ως</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="Τίτλος αναφοράς" className="w-full rounded border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-border)' }} />
                  <CustomButton title="Αποθήκευση" backgroundColor="var(--color-surface)" width={120} onClick={() => handleSavePayload(buildCurrentPayload())} />
                </div>
              </div>
          </div>
        </div>
      )}

        <div className="overflow-hidden rounded-[14px] border border-(--color-border)">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)'}}>
              <div>
                {effectiveTotal > 0 && hasSelectedField && (
                  <div className="text-lg font-semibold" style={{ color: 'var(--color-text-heading)' }}>{selectedField}</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <label style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>Αποθηκευμένες Ρυθμίσεις</label>
                <select value={''} onChange={(e) => handleSelectSaved(e.target.value)} className="rounded border px-2 py-1 text-sm" style={{ borderColor: 'var(--color-border)' }}>
                  <option value="">-- Φορτώστε --</option>
                  {savedReports.map((s) => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </select>
                <select onChange={(e) => handleDeleteSaved(e.target.value)} className="rounded border px-2 py-1 text-sm" style={{ borderColor: 'var(--color-border)' }}>
                  <option value="">-- Διαγραφή --</option>
                  {savedReports.map((s) => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <DataTable<any>
              rows={hasSelectedField ? tableItems : []}
              columns={hasSelectedField ? (columnsByField[selectedField] ?? []) : []}
              rowKey="id"
              showFilter={false}
            />
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-sm text-(--color-text-muted)">{loadingResults ? 'Φόρτωση...' : (hasSelectedField ? String(totalItems ?? tableItems.length) + ' εγγραφές' : '0 εγγραφές')}</div>
          <div className="flex items-center gap-2">
            <button
              className="rounded border px-3 py-1 text-sm"
              onClick={() => lastPayload && fetchResults(Math.max(1, page - 1), pageSize, lastPayload)}
              disabled={loadingResults || page <= 1}
            >Προηγούμενη</button>
            <div className="text-sm">{page}{totalItems ? ' / ' + String(Math.max(1, Math.ceil(totalItems / pageSize))) : ''}</div>
              <button
                className="rounded border px-3 py-1 text-sm"
                onClick={() => lastPayload && fetchResults(page + 1, pageSize, lastPayload)}
                disabled={loadingResults || (typeof totalItems === 'number' ? page >= Math.ceil(totalItems / pageSize) : tableItems.length < pageSize)}
              >Επόμενη</button>
            </div>
          </div>
        </div>
  );
}
