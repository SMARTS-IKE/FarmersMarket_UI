import { useMemo, useState } from "react";
import { parseISO, isValid, format } from "date-fns";
import DataTable from "../../shared/components/DataTable";
import type { ColumnDef } from "../../shared/components/DataTable";
import { useAuthStore } from "../../store/authStore";
import { useUsersQuery } from "../../queries/userQueries";
import type { AppUser, UserListResult } from "../../models/user";
import { useSellersQuery, useSellerQuery, useSellerMarketsQuery } from "../../queries/sellerQueries";
import { UserRole, useGlobalEnums } from "../../shared/mappings/GlobalEnums";
import { useAttendanceQuery } from "../../queries/attendanceQueries";
import type { AttendanceRecord } from "../../models/attendance";

const ALL_SELLERS_FILTERS = { name: "", afm: "", sellerType: "", page: 1, pageSize: 5000 };

function resolveConnectedSeller(sellers: any[], email: string, userId: any) {
  const normalizedEmail = (email ?? "").trim().toLowerCase();
  if (!normalizedEmail && !userId) return null;

  const exactMatch = sellers.find((s) => (s as any).userId === userId);
  if (exactMatch) return exactMatch;

  const stringMatch = sellers.find((s) => String((s as any).userId) === String(userId));
  if (stringMatch) return stringMatch;

  return sellers.find((s) => ((s.email ?? "") as string).trim().toLowerCase() === normalizedEmail) ?? null;
}

export default function UserAttendancesPage() {
  const { user, email } = useAuthStore();
  const { CheckInMethodLabels } = useGlobalEnums();

  const { data: sellersData } = useSellersQuery(ALL_SELLERS_FILTERS);
  const sellerByUserQuery = useSellerQuery(user?.id ? String(user.id) : "");

  const connectedSeller = useMemo(() => {
    if (sellerByUserQuery.data) return sellerByUserQuery.data;
    const sellers = sellersData?.items ?? [];
    return resolveConnectedSeller(sellers, user?.email ?? email ?? "", user?.id);
  }, [sellersData?.items, sellerByUserQuery.data, user, email]);

  const sellerId = connectedSeller ? Number((connectedSeller as any).id) : "";

  const sellerMarketsQuery = useSellerMarketsQuery(connectedSeller ? String((connectedSeller as any).id) : "");

  const { data: usersData } = useUsersQuery({ name: '', email: '', role: UserRole[UserRole.Admin_Access], page: 1, pageSize: 5000 });

  // Table pagination/filter state (DataTable expects zero-based page)
  const [pageIndex, setPageIndex] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [marketFilter, setMarketFilter] = useState<string | number | "">("");
  const [dateFromFilter, setDateFromFilter] = useState<string>("");
  const [dateToFilter, setDateToFilter] = useState<string>("");

  const attendanceQuery = useAttendanceQuery({
    sellerId: sellerId === "" ? "" : Number(sellerId),
    marketId: marketFilter === "" ? "" : Number(marketFilter as any),
    dateFrom: dateFromFilter,
    dateTo: dateToFilter,
    page: pageIndex + 1,
    pageSize: rowsPerPage,
  });

  const columns: ColumnDef<AttendanceRecord>[] = [
    {
      key: "attendanceDate",
      label: "Ημερομηνία",
      render: (r) => {
        const raw = r.attendanceDate;
        if (!raw) return "—";
        try {
          const dt = parseISO(String(raw));
          return isValid(dt) ? format(dt, "dd/MM/yyyy") : "—";
        } catch {
          return "—";
        }
      },
    },
    { key: "marketName", label: "Αγορά" },
    {
      key: "recordedByName",
      label: "Καταχωρηθηκε από",
      render: (r) => {
        if (r.recordedByUserId !== null && r.recordedByUserId !== undefined) {
          const list: AppUser[] = Array.isArray(usersData) ? usersData : (usersData?.items ?? []);
          const found = list.find((u) => String(u.id) === String(r.recordedByUserId));
          if (found) return `${found.firstName} ${found.lastName}`.trim() || `Χρήστης #${r.recordedByUserId}`;
        }

        // Hide placeholder like 'Επόπτης: #32' and show empty dash instead when no resolved user
        if (typeof r.recordedByName === 'string' && r.recordedByName.startsWith('Επόπτης')) return "—";

        return r.recordedByName || "—";
      },
    },
    {
      key: "method",
      label: "Μέθοδος",
      render: (r) => {
        let m = r.method as number | null | undefined;
        if (m === 0) m = 1; // treat legacy/zero value as Manual
        if (m === null || m === undefined) return "—";
        const label = CheckInMethodLabels[Number(m)];
        return label ?? String(m);
      },
    },
    { key: "notes", label: "Σημειώσεις" },
  ];

  const rows = attendanceQuery.data?.items ?? [];

  const marketOptions = (sellerMarketsQuery.data?.items ?? []).map((m: any) => ({ label: m.marketName ?? m.name ?? String(m.id), value: Number(m.marketId ?? m.id) }));

  const filters = [
    { title: "MarketId", label: "Αγορά", type: "DROPDOWN" as const, dataItems: marketOptions },
    { title: "DateFrom", label: "Από", type: "DATE" as const },
    { title: "DateTo", label: "Έως", type: "DATE" as const },
  ];

  const handleSearch = (values: Record<string, any>) => {
    setMarketFilter(values.MarketId ?? "");
    setDateFromFilter(values.DateFrom ?? "");
    setDateToFilter(values.DateTo ?? "");
    setPageIndex(0);
  };

  return (
    <div className="flex h-full w-full flex-col gap-6 text-left">
      <div>
        <DataTable<AttendanceRecord>
          title="Παρουσίες"
          rows={rows}
          columns={columns}
          rowKey="id"
          showFilter={false}
          filters={filters}
          onSearch={handleSearch}
          page={pageIndex}
          rowsPerPage={rowsPerPage}
          totalCount={attendanceQuery.data?.totalCount ?? 0}
          onPageChange={(p) => setPageIndex(p)}
          onRowsPerPageChange={(r) => { setRowsPerPage(r); setPageIndex(0); }}
          hidePagination={false}
        />
      </div>
    </div>
  );
}
