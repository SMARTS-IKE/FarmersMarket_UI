import { useMemo, useState } from "react";
import { RestartAlt } from "@mui/icons-material";
import type { AttendanceRecord, AttendanceSearchRequest } from "../../models/attendance";
import type { SellerSearchRequest } from "../../models/seller";
import type { AppUser, UserListResult } from "../../models/user";
import { useAttendanceQuery } from "../../queries/attendanceQueries";
import { useSellersQuery } from "../../queries/sellerQueries";
import { useUsersQuery } from "../../queries/userQueries";
import DataTable, { type ColumnDef, FilterDef, FilterValues } from "../../shared/components/DataTable";

interface AttendanceTableProps {
  marketId: number;
};

type AttendanceFilters = Omit<AttendanceSearchRequest, "pageSize">;

const INITIAL_FILTER_VALUES = {
  sellerId: "",
  dateFrom: "",
  dateTo: "",
};

const DEFAULT_SELLER_FILTERS: SellerSearchRequest = {
  name: "",
  afm: "",
  sellerType: "",
  page: 1,
  pageSize: 5000,
};

function formatIsoDate(value: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("el-GR");
}

function formatRecordedBy(row: AttendanceRecord, usersData?: UserListResult): string {
  // If we have a recordedByUserId, prefer resolving it to a fullname from usersData
  if (row.recordedByUserId !== null && row.recordedByUserId !== undefined) {
    const list: AppUser[] = Array.isArray(usersData) ? usersData : (usersData?.items ?? []);
    const found = list.find((u) => String(u.id) === String(row.recordedByUserId));
    if (found) return `${found.firstName} ${found.lastName}`.trim() || `Χρήστης #${row.recordedByUserId}`;
  }

  // Fallback to any recordedByName provided by the API (may be a placeholder like 'Επόπτης: #7')
  if (row.recordedByName) return row.recordedByName;

  return "-";
}

function buildInitialFilters(marketId: number): AttendanceFilters {
  return {
    sellerId: "",
    marketId,
    dateFrom: "",
    dateTo: "",
    page: 1,
  };
}

// attendanceColumns moved inside component to access usersData

export default function AttendanceTable({ marketId }: AttendanceTableProps) {
  const [filters, setFilters] = useState<AttendanceFilters>(() => buildInitialFilters(marketId));
  const [pageSize, setPageSize] = useState(10);

  const attendanceQueryParams = useMemo<AttendanceSearchRequest>(
    () => ({
      ...filters,
      pageSize,
    }),
    [filters, pageSize]
  );

  const { data: sellersData } = useSellersQuery(DEFAULT_SELLER_FILTERS);
  const { data: usersData } = useUsersQuery({ name: '', email: '', role: '', page: 1, pageSize: 5000 });
  const { data: attendanceData, isLoading, isError, error } = useAttendanceQuery(attendanceQueryParams);
  const sellerOptions = useMemo(
    () => [
      { label: "Όλοι", value: "" },
      ...(sellersData?.items ?? []).map((seller) => ({
        label: `${seller.firstName} ${seller.lastName}`.trim() || `Πωλητής #${seller.id}`,
        value: String(seller.id),
      })),
    ],
    [sellersData?.items]
  );

  const attendanceColumns: ColumnDef<AttendanceRecord>[] = [
    {
      key: "sellerName",
      label: "Πωλητής",
    },
    {
      key: "attendanceDate",
      label: "Ημερομηνία",
      render: (row) => formatIsoDate(row.attendanceDate),
    },
    {
      key: "recordedByName",
      label: "Καταγραφή από",
      render: (row) => formatRecordedBy(row, usersData),
    },
    {
      key: "notes",
      label: "Σχόλια",
      render: (row) => row.notes || "-",
    },
  ];

  const rows = attendanceData?.items ?? [];
  const totalCount = attendanceData?.totalCount ?? 0;

  const tableFilters: FilterDef[] = useMemo(() => [
    {
      title: "sellerId",
      label: "Πωλητής",
      type: "DROPDOWN",
      dataItems: sellerOptions,
    },
    {
      title: "dateFrom",
      label: "Από",
      type: "DATE",
    },
    {
      title: "dateTo",
      label: "Έως",
      type: "DATE",
    },
  ], [sellerOptions]);

  const handleSearch = (values: FilterValues) => {
    setFilters({
      sellerId: values["sellerId"] === "" || values["sellerId"] === undefined ? "" : Number(values["sellerId"]),
      marketId,
      dateFrom: String(values["dateFrom"] ?? ""),
      dateTo: String(values["dateTo"] ?? ""),
      page: 1,
    });
  };

  const handleReset = () => {
    const next = buildInitialFilters(marketId);
    setFilters(next);
    setPageSize(10);
  };

  return (
    <div className="flex flex-col gap-4">
      {isError ? (
        <div className="rounded-lg border border-(--color-danger-border) bg-danger-subtle p-3 text-sm text-(--color-danger)">
          {error?.message ?? "Η φόρτωση παρουσιών απέτυχε."}
        </div>
      ) : (
        <DataTable<AttendanceRecord>
          rows={rows}
          columns={attendanceColumns}
          rowKey="id"
          showFilter={false}
          filters={tableFilters}
          initialFilterValues={INITIAL_FILTER_VALUES}
          onSearch={handleSearch}
          onClearFilters={handleReset}
          clearFiltersButtonTitle="Καθαρισμός"
          clearFiltersButtonBackgroundColor="var(--color-text-muted)"
          clearFiltersPrefixIcon={<RestartAlt />}
          paginationPrefix={`Συνολικές Παρουσίες: ${totalCount}`}
          page={Math.max((attendanceData?.page ?? filters.page) - 1, 0)}
          rowsPerPage={attendanceData?.pageSize ?? pageSize}
          totalCount={totalCount}
          onPageChange={(nextPage) => setFilters((prev) => ({ ...prev, page: nextPage + 1 }))}
          onRowsPerPageChange={(nextPageSize) => {
            setPageSize(nextPageSize);
            setFilters((prev) => ({ ...prev, page: 1 }));
          }}
        />
      )}

      {isLoading && <p className="text-sm text-(--color-text-muted)">Φόρτωση παρουσιών...</p>}
    </div>
  );
}