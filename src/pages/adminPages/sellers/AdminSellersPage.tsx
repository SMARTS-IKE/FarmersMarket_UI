import { useEffect, useState } from "react";
import CustomButton from "../../../shared/components/CustomButton";
import ExportSelector from '../../../shared/components/ExportSelector';
import { useNavigate } from "@tanstack/react-router";
import { Snackbar, Alert } from '@mui/material';
import { consumeAuthNotification } from '../../../lib/authNotifications';
import DataTable, { ColumnDef, FilterDef, FilterValues } from "../../../shared/components/DataTable";
import type { Seller, SellerSearchRequest, SellerType } from "../../../models/seller";
import { useSellersQuery } from "../../../queries/sellerQueries";
import { SELLER_TYPE_LABELS } from "../../../components/sellers/sellers.utils";
import { useGlobalEnums } from '../../../shared/mappings/GlobalEnums';
import { useAuthStore } from '../../../store/authStore';
import RestartAltIcon from "@mui/icons-material/RestartAlt";


const columnsBase: ColumnDef<Seller>[] = [
  { key: "firstName", label: "Όνομα" },
  { key: "lastName", label: "Επώνυμο" },
  { key: "afm", label: "ΑΦΜ" },
  { key: "phone", label: "Τηλέφωνο" },
  {
    key: "sellerType",
    label: "Τύπος Πωλητή",
    filterable: false,
    render: (row) => SELLER_TYPE_LABELS[Number(row.sellerType)] ?? row.sellerType,
  },
];

const tableFilters: FilterDef[] = [
  { title: "name", label: "Όνομα", type: "TEXT" },
  { title: "afm", label: "ΑΦΜ", type: "TEXT" },
  {
    title: "sellerType",
    label: "Τύπος Πωλητή",
    type: "DROPDOWN",
    width: 250,
    dataItems: Object.entries(SELLER_TYPE_LABELS).map(([value, label]) => ({
      label,
      value: Number(value),
    })),
  },
];

export default function AdminSellersPage() {
  const { ExportFormatLabels } = useGlobalEnums();
  const [exportFormat, setExportFormat] = useState<string>('xlsx');
  const navigate = useNavigate();
  const { UserStatusLabels, UserStatus } = useGlobalEnums();
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationSeverity, setNotificationSeverity] = useState<'success' | 'error'>('success');
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

  useEffect(() => {
    const nextNotification = consumeAuthNotification();
    if (!nextNotification) return;

    setNotificationMessage(nextNotification.message);
    setNotificationSeverity(nextNotification.type);
    setIsSnackbarOpen(true);
  }, []);
  const initialFilters: SellerSearchRequest = {
    name: "",
    afm: "",
    sellerType: "",
    page: 1,
    pageSize: 25,
  };
  const [filters, setFilters] = useState<SellerSearchRequest>({
    ...initialFilters,
  });

  const { data: sellersQueryResults } = useSellersQuery(filters);
  const sellers: Seller[] = sellersQueryResults?.items ?? [];

  const USER_STATUS_COLORS: Record<number, string> = {
    [UserStatus.Active ?? 1]: '#166534',
    [UserStatus.Inactive ?? 0]: '#991b1b',
    // pending / other statuses
    [UserStatus.Pending ?? 2]: '#b45309',
  };

  const handleSearch = (values: FilterValues) => {
    setFilters((prev) => ({
      ...prev,
      name: String(values["name"] ?? ""),
      afm: String(values["afm"] ?? ""),
      // Preserve numeric 0 value (falsy) — only set empty string when no selection
      sellerType:
        values["sellerType"] === undefined || values["sellerType"] === "" || values["sellerType"] === null
          ? ("" as any)
          : (Number(values["sellerType"]) as SellerType),
      page: 1,
    }));
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
  };

  const handleRowClick = (seller: Seller) => {
    navigate({ to: "/admin/sellers/$sellerId", params: { sellerId: String(seller.id) } });
  };

  const columns: ColumnDef<Seller>[] = [
    ...columnsBase,
    {
      key: 'userStatus',
      label: 'Κατάσταση χρήστη',
      render: (row) => {
        const rawStatus = (row as any).status;
        const statusValue = typeof rawStatus === 'number' ? rawStatus : (row.isActive ? UserStatus.Active : UserStatus.Inactive);
        const label = UserStatusLabels?.[statusValue] ?? (statusValue === UserStatus.Active ? 'Ενεργός' : 'Ανενεργός');
        const color = USER_STATUS_COLORS[statusValue] ?? '#374151';
        return <span style={{ color, fontWeight: 700 }}>{label}</span>;
      },
    },
  ];

  

  const openCreateUser = () => navigate({ to: "/admin/sellers/new" });

  return (
    <div className="flex h-full flex-col gap-6 text-left">
      <div className="flex items-center justify-between">
        <ExportSelector onExport={async (format) => {
          try {
            const authToken = useAuthStore.getState().token;
            const qs = new URLSearchParams();
            if (filters.name) qs.set('name', String(filters.name));
            if (filters.afm) qs.set('afm', String(filters.afm));
            if (filters.sellerType !== undefined && filters.sellerType !== '') qs.set('sellerType', String(filters.sellerType));
            qs.set('page', '1'); qs.set('pageSize', '10000');
            const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
            const url = `${BASE_URL}/sellers?${qs.toString()}&format=${encodeURIComponent((format||'xlsx').toLowerCase())}`;
            const resp = await fetch(url, { method: 'GET', headers: { ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) } });
            if (!resp.ok) { const t = await resp.text().catch(()=> 'Export failed'); throw new Error(t); }
            const blob = await resp.blob();
            const disposition = resp.headers.get('Content-Disposition') || '';
            let filename = `sellers.${format}`;
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
          <CustomButton title="Νέος Χρήστης" onClick={openCreateUser} />
        </div>
      </div>

      <DataTable<Seller>
          rows={sellers}
          columns={columns}
          rowKey="id"
          showFilter={false}
          filters={tableFilters}
          onSearch={handleSearch}
          onClearFilters={handleClearFilters}
          clearFiltersButtonTitle="Καθαρισμός"
          clearFiltersButtonBackgroundColor="var(--color-text-muted)"
          clearFiltersPrefixIcon={<RestartAltIcon />}
          onRowClick={handleRowClick}
        />
        <Snackbar
          open={isSnackbarOpen && Boolean(notificationMessage)}
          autoHideDuration={4500}
          onClose={() => setIsSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setIsSnackbarOpen(false)} severity={notificationSeverity} variant="filled" sx={{ width: '100%' }}>
            {notificationMessage}
          </Alert>
        </Snackbar>
    </div>
  );
}