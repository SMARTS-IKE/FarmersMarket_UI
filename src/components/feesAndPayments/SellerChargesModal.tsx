import { useState, useEffect } from "react";
import { useSellerQuery } from "../../queries/sellerQueries";
import { Typography } from "@mui/material";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from "@mui/material";
import FilterBar from "../../shared/components/FilterBar";
import DataTable from "../../shared/components/DataTable";
import { useMarketsQuery } from "../../queries/marketQueries";
import { http } from "../../lib/http";
import { useQuery } from "@tanstack/react-query";

interface Props {
  open: boolean;
  sellerId: number | null;
  initialFilters?: { marketId?: string | number; month?: number; year?: number };
  onClose: () => void;
}

export default function SellerChargesModal({ open, sellerId, initialFilters, onClose }: Props) {
  const [filters, setFilters] = useState<{ marketId?: string | number; month?: number; year?: number }>(initialFilters ?? {});
  const [page, setPage] = useState(1);

  useEffect(() => {
    setFilters(initialFilters ?? {});
    setPage(1);
  }, [initialFilters, sellerId, open]);

  const { data: marketsQueryResults } = useMarketsQuery({ name: "", marketType: "" as const, operatingDays: [], page: 1, pageSize: 1000 });
  const markets = marketsQueryResults?.items ?? [];
  const marketOptions = markets.map((m: any) => ({ label: m.name, value: String(m.id) }));

  const monthOptions = [
    'Ιανουάριος','Φεβρουάριος','Μάρτιος','Απρίλιος','Μάιος','Ιούνιος','Ιούλιος','Αύγουστος','Σεπτέμβριος','Οκτώβριος','Νοέμβριος','Δεκέμβριος'
  ].map((name, idx) => ({ label: `${idx + 1} — ${name}`, value: idx + 1 }));

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 2000 + 1 }, (_, i) => 2000 + i).map((y) => ({ label: String(y), value: y }));

  const fetchCharges = async ({ queryKey }: any): Promise<{ items: any[]; totalCount: number; page: number; pageSize: number }> => {
    const [_key, sellerIdQ, filtersQ, pageQ] = queryKey;
    if (!sellerIdQ) return { items: [], totalCount: 0, page: 1, pageSize: 50 };
    const qs: string[] = [];
    qs.push(`SellerId=${encodeURIComponent(String(sellerIdQ))}`);
    if (filtersQ?.marketId) qs.push(`marketId=${encodeURIComponent(String(filtersQ.marketId))}`);
    if (filtersQ?.month) qs.push(`month=${filtersQ.month}`);
    if (filtersQ?.year) qs.push(`year=${filtersQ.year}`);
    qs.push(`page=${pageQ}`);
    const path = `/charges${qs.length ? `?${qs.join("&")}` : ""}`;
    return http.get<{ items: any[]; totalCount: number; page: number; pageSize: number }>(path);
  };

  const { data } = useQuery({
    queryKey: ["sellerCharges", sellerId, filters, page],
    queryFn: fetchCharges,
    enabled: !!sellerId && open,
  });

  const { data: seller } = useSellerQuery(sellerId ? String(sellerId) : "");

  const formatDateToDDMMYYYY = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Αναλυτικές Χρεώσεις Πωλητή</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {seller && (
          <Typography variant="subtitle1" sx={{ mb: 1, color: 'text.secondary' }}>
            {seller.fullName ?? `${seller.firstName ?? ''} ${seller.lastName ?? ''}`}
          </Typography>
        )}
        <Box sx={{ mb: 2, minHeight: 88, display: 'flex', alignItems: 'center' }}>
          <FilterBar
            fields={[
              { name: 'marketId', label: 'Αγορά', type: 'select', options: marketOptions, value: filters.marketId ?? '' },
              { name: 'month', label: 'Μήνας', type: 'select', options: monthOptions, value: filters.month ?? '' },
              { name: 'year', label: 'Έτος', type: 'select', options: yearOptions, value: filters.year ?? '' },
            ] as any}
            onSearch={(vals) => { setFilters({ marketId: vals?.marketId, month: vals?.month ? Number(vals.month) : undefined, year: vals?.year ? Number(vals.year) : undefined }); setPage(1); }}
            onClear={() => { setFilters({}); setPage(1); }}
            searchLabel="Αναζήτηση"
            clearLabel="Καθαρισμός"
          />
        </Box>

        <Box>
          <DataTable
            rows={(data && (data.items ?? [])) || []}
            columns={[
              { key: 'chargeDate', label: 'Ημερομηνία', render: (r:any) => formatDateToDDMMYYYY(r.chargeDate) },
              { key: 'marketName', label: 'Αγορά' },
              { key: 'amount', label: 'Ποσό  €', render: (r:any) => `${Number(r.amount ?? 0).toFixed(2)}` },
              { key: 'feeRuleName', label: 'Κανόνας Χρέωσης' },
              { key: 'status', label: 'Κατάσταση' },
              { key: 'notes', label: 'Σημειώσεις' }
            ] as any}
            rowKey="id"
            hidePagination={false}
            showFilter={false}
            showGlobalSearch={false}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Κλείσιμο</Button>
      </DialogActions>
    </Dialog>
  );
}
