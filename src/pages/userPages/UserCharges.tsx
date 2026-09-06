import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { getSellers } from '../../services/sellerService';
import { useMarketsQuery } from '../../queries/marketQueries';
import DataTable from '../../shared/components/DataTable';
import FilterBar from '../../shared/components/FilterBar';
import { useQuery } from '@tanstack/react-query';
import { http } from '../../lib/http';
import { useGlobalEnums } from '../../shared/mappings/GlobalEnums';

export default function UserCharges() {
  const currentUser = useAuthStore((s) => s.user);
  const [sellerId, setSellerId] = useState<number | null>(null);
  const [filters, setFilters] = useState<{ marketId?: string | number; month?: number; year?: number }>({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    async function findSeller() {
      if (!currentUser) return;
      try {
        const resp = await getSellers({ name: '', afm: '', sellerType: '', page: 1, pageSize: 1000 });
        const all = resp?.items ?? [];
        const matchByUserId = all.find((s: any) => s.userId != null && String(s.userId) === String(currentUser.id));
        const matchByAfm = all.find((s: any) => s.afm && (currentUser as any)?.afm && String(s.afm) === String((currentUser as any).afm));
        const authName = ((currentUser as any)?.name ?? `${(currentUser as any)?.firstName ?? ''} ${(currentUser as any)?.lastName ?? ''}`).trim();
        const matchByName = all.find((s: any) => {
          const sName = `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim();
          return sName && authName && sName === authName;
        });

        const matched = matchByUserId || matchByAfm || matchByName || null;
        if (mounted && matched && matched.id) {
          setSellerId(Number(matched.id));
        }
      } catch (e) {
        // ignore
      }
    }
    findSeller();
    return () => { mounted = false; };
  }, [currentUser]);

  const { data: marketsQueryResults } = useMarketsQuery({ name: '', marketType: '' as const, operatingDays: [], page: 1, pageSize: 1000 });
  const markets = marketsQueryResults?.items ?? [];
  const marketOptions = markets.map((m: any) => ({ label: m.name, value: String(m.id) }));

  const monthOptions = [
    'Ιανουάριος','Φεβρουάριος','Μάρτιος','Απρίλιος','Μάιος','Ιούνιος','Ιούλιος','Αύγουστος','Σεπτέμβριος','Οκτώβριος','Νοέμβριος','Δεκέμβριος'
  ].map((name, idx) => ({ label: `${idx + 1} — ${name}`, value: idx + 1 }));

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 2000 + 1 }, (_, i) => 2000 + i).map((y) => ({ label: String(y), value: y }));

  const fetchCharges = async ({ queryKey }: any) => {
    const [_k, sellerIdQ, filtersQ, pageQ] = queryKey;
    if (!sellerIdQ) return { items: [], totalCount: 0, page: 1, pageSize: 50 };
    const qs: string[] = [];
    qs.push(`SellerId=${encodeURIComponent(String(sellerIdQ))}`);
    if (filtersQ?.marketId) qs.push(`marketId=${encodeURIComponent(String(filtersQ.marketId))}`);
    if (filtersQ?.month) qs.push(`month=${filtersQ.month}`);
    if (filtersQ?.year) qs.push(`year=${filtersQ.year}`);
    qs.push(`page=${pageQ}`);
    const path = `/charges${qs.length ? `?${qs.join('&')}` : ''}`;
    return http.get(path);
  };

  const { data } = useQuery({ queryKey: ['sellerChargesList', sellerId, filters, page], queryFn: fetchCharges, enabled: !!sellerId });

  const formatDateToDDMMYYYY = (iso?: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const columns = useMemo(() => {
    const { ChargeStatusLabels } = useGlobalEnums();
    return [
      { key: 'chargeDate', label: 'Ημερομηνία', render: (r:any) => formatDateToDDMMYYYY(r.chargeDate) },
      { key: 'marketName', label: 'Αγορά' },
      { key: 'amount', label: 'Ποσό  €', render: (r:any) => `${Number(r.amount ?? 0).toFixed(2)}` },
      { key: 'feeRuleName', label: 'Κανόνας Χρέωσης' },
      { key: 'status', label: 'Κατάσταση', render: (r:any) => {
        const statusId = r.status ?? r.statusId ?? r.chargeStatus ?? r.chargeStatusId ?? null;
        if (statusId == null || statusId === '') return '—';
        const idNum = Number(statusId);
        return ChargeStatusLabels && ChargeStatusLabels[idNum] ? ChargeStatusLabels[idNum] : String(statusId);
      } },
      { key: 'notes', label: 'Σημειώσεις' }
    ];
  }, []);

  if (!currentUser) return <div>Πρέπει να είστε συνδεδεμένος για να δείτε τις χρεώσεις.</div>;

  return (
    <div className="flex flex-col gap-4">
      <div style={{ display: 'flex', alignItems: 'center' }}>
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
      </div>

      <DataTable
        rows={(data && (data.items ?? [])) || []}
        columns={columns as any}
        rowKey="id"
        hidePagination={false}
        showFilter={false}
        showGlobalSearch={false}
      />
    </div>
  );
}
