import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Snackbar, Alert } from '@mui/material';
import { consumeAuthNotification } from '../../../lib/authNotifications';
import DataTable, { ColumnDef, FilterDef, FilterValues } from "../../../shared/components/DataTable";
import type { Seller, SellerSearchRequest, SellerType } from "../../../models/seller";
import { useSellersQuery } from "../../../queries/sellerQueries";
import { SELLER_TYPE_LABELS } from "../../../components/sellers/sellers.utils";
import { useGlobalEnums } from '../../../shared/mappings/GlobalEnums';
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
    [UserStatus.active ?? 0]: '#166534',
    [UserStatus.inactive ?? 1]: '#991b1b',
    // pending / other statuses
    [UserStatus.pending ?? 2]: '#b45309',
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
        const statusValue = typeof rawStatus === 'number' ? rawStatus : (row.isActive ? 0 : 1);
        const label = UserStatusLabels?.[statusValue] ?? (statusValue === 0 ? 'Ενεργός' : 'Ανενεργός');
        const color = USER_STATUS_COLORS[statusValue] ?? '#374151';
        return <span style={{ color, fontWeight: 700 }}>{label}</span>;
      },
    },
  ];

  return (
    <div className="flex h-full flex-col gap-6 text-left">

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