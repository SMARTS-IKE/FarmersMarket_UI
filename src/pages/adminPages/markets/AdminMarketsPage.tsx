import { useMemo, useState, useEffect } from "react";
import { Snackbar, Alert } from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import DataTable, { FilterDef, FilterValues } from "../../../shared/components/DataTable";
import CustomButton from "../../../shared/components/CustomButton";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import type { Market, MarketSearchRequest } from "../../../models/market";
import { useMarketsQuery } from "../../../queries/marketQueries";
import { columns, DAYS } from "../../../components/markets/market.utils";
import { useGlobalEnums } from '../../../shared/mappings/GlobalEnums';
import ExportSelector from '../../../shared/components/ExportSelector';
import { useAuthStore } from '../../../store/authStore';

const EMPTY_FILTERS: MarketSearchRequest = {
  name: "",
  marketType: 1,
  operatingDays: [],
  page: 1,
  pageSize: 25,
};

const INITIAL_FILTER_VALUES = {
  name: "",
  marketType: 1,
  operatingDays: "",
};

export default function AdminMarketsPage() {
  const { ExportFormatLabels } = useGlobalEnums();
  const navigate = useNavigate({ from: "/admin/markets" });
  const [filters, setFilters] = useState<MarketSearchRequest>(EMPTY_FILTERS);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      let notice = params.get("notice");

      if (!notice) {
        // fallback to sessionStorage (used when navigate couldn't include query)
        try {
          notice = sessionStorage.getItem('admin.markets.notice') ?? undefined;
          if (notice) sessionStorage.removeItem('admin.markets.notice');
        } catch (e) {
          // ignore
        }
      }

      if (notice) {
        const msg = notice === "created" ? "Η αγορά δημιουργήθηκε επιτυχώς." : notice === "updated" ? "Η αγορά ενημερώθηκε επιτυχώς." : notice;
        setNoticeMessage(msg);
        setIsNoticeOpen(true);

        // remove the notice param from the URL without reloading
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete("notice");
          window.history.replaceState(null, "", url.toString());
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const { data } = useMarketsQuery(filters);
  const markets: Market[] = data?.items ?? [];
  
  const tableFilters: FilterDef[] = useMemo(() => [
    { title: "name", label: "Όνομα", type: "TEXT" }
  ], []);

  const handleSearch = (values: FilterValues) => {
    setFilters({
      name: String(values["name"] ?? ""),
      marketType: values["marketType"] === "" || values["marketType"] === undefined
        ? ""
        : (Number(values["marketType"]) as Market["marketType"]),
      operatingDays: values["operatingDays"] ? [String(values["operatingDays"])] : [],
      page: 1,
      pageSize: 25,
    });
  };

  const handleReset = () => {
    setFilters(EMPTY_FILTERS);
  };

  const openCreateForm = () => {
    navigate({ to: "./new" });
  };

  const handleRowClick = (market: Market) => {
    navigate({ to: "./$marketId", params: { marketId: String(market.id) } });
  };

  return (
    <div className="flex h-full w-full flex-col gap-6 text-left">
      <div className="flex items-center justify-between">
        <ExportSelector onExport={async (format) => {
          try {
            const authToken = useAuthStore.getState().token;
            const qs = new URLSearchParams();
            if (filters.name) qs.set('name', String(filters.name));
            qs.set('page', '1'); qs.set('pageSize', '10000');
            const formatEnc = encodeURIComponent((format||'xlsx').toLowerCase());
            const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
            const url = `${BASE_URL}/markets?${qs.toString()}&format=${formatEnc}`;
            const resp = await fetch(url, { method: 'GET', headers: { ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) } });
            if (!resp.ok) { const t = await resp.text().catch(()=> 'Export failed'); throw new Error(t); }
            const blob = await resp.blob();
            const disposition = resp.headers.get('Content-Disposition') || '';
            let filename = `markets.${format}`;
            const match = disposition.match(/filename\*=UTF-8''(.+)|filename="?([^";]+)"?/);
            if (match) filename = decodeURIComponent(match[1] || match[2]);
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = downloadUrl; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(downloadUrl);
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Export failed', e);
            alert('Η εξαγωγή απέτυχε.');
          }
        }} />
        <div>
          <CustomButton
            title="Δημιουργία νέας Αγοράς"
            width={'fit-content'}
            onClick={openCreateForm}
          />
        </div>
      </div>

      {/* Table */}
      <div className="w-full">
        <DataTable<Market>
          rows={markets}
          columns={columns}
          rowKey="id"
          showFilter={false}
          filters={tableFilters}
          initialFilterValues={INITIAL_FILTER_VALUES}
          onSearch={handleSearch}
          onClearFilters={handleReset}
          clearFiltersButtonTitle="Καθαρισμός"
          clearFiltersButtonBackgroundColor="var(--color-text-muted)"
          clearFiltersPrefixIcon={<RestartAltIcon />}
          onRowClick={handleRowClick}
        />
      </div>

      <Snackbar open={isNoticeOpen} autoHideDuration={4000} onClose={() => setIsNoticeOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setIsNoticeOpen(false)} severity="success" variant="filled" sx={{ width: '100%' }}>
          {noticeMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}