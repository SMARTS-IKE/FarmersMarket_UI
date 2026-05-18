import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useEffect, useMemo, useState } from "react";
import type { AttendanceRecord, AttendanceSearchRequest } from "../../models/attendance";
import type { SellerSearchRequest } from "../../models/seller";
import { useAttendanceQuery } from "../../queries/attendanceQueries";
import { useSellersQuery } from "../../queries/sellerQueries";
import CustomButton from "../../shared/components/CustomButton";
import CustomInputField from "../../shared/components/CustomInputField";
import DataTable, { type ColumnDef } from "../../shared/components/DataTable";

interface AttendanceTableProps {
  marketId: number;
};

type AttendanceFilters = Omit<AttendanceSearchRequest, "pageSize">;

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

function formatRecordedBy(row: AttendanceRecord): string {
  if (row.recordedByName) return row.recordedByName;
  if (row.recordedByUserId !== null && row.recordedByUserId !== undefined) {
    return `Χρήστης #${row.recordedByUserId}`;
  }
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
    render: (row) => formatRecordedBy(row),
  },
  {
    key: "notes",
    label: "Σχόλια",
    render: (row) => row.notes || "-",
  },
];

export default function AttendanceTable({ marketId }: AttendanceTableProps) {
  const [draft, setDraft] = useState<AttendanceFilters>(() => buildInitialFilters(marketId));
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
  const { data: attendanceData, isLoading, isError, error } = useAttendanceQuery(attendanceQueryParams);

  useEffect(() => {
    const next = buildInitialFilters(marketId);
    setDraft(next);
    setFilters(next);
    setPageSize(10);
  }, [marketId]);

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

  const rows = attendanceData?.items ?? [];
  const totalCount = attendanceData?.totalCount ?? 0;

  const handleSearch = () => {
    setFilters({ ...draft, page: 1 });
  };

  const handleReset = () => {
    const next = buildInitialFilters(marketId);
    setDraft(next);
    setFilters(next);
    setPageSize(10);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-center gap-3">
        <CustomInputField
          type="DROPDOWN"
          label="Πωλητής"
          value={draft.sellerId === "" ? "" : String(draft.sellerId)}
          onChange={(value) =>
            setDraft((prev) => ({
              ...prev,
              sellerId: value === "" ? "" : Number(value),
            }))
          }
          dropdownItems={sellerOptions}
          width={220}
        />

        <CustomInputField
          type="DATE"
          label="Από"
          value={draft.dateFrom}
          onChange={(value) => setDraft((prev) => ({ ...prev, dateFrom: String(value) }))}
          width={180}
        />

        <CustomInputField
          type="DATE"
          label="Έως"
          value={draft.dateTo}
          onChange={(value) => setDraft((prev) => ({ ...prev, dateTo: String(value) }))}
          width={180}
        />

        <CustomButton
          title="Αναζήτηση"
          prefixIcon={<SearchIcon />}
          width={130}
          onClick={handleSearch}
        />
        <CustomButton
          title="Καθαρισμός"
          prefixIcon={<RestartAltIcon />}
          backgroundColor="var(--color-text-muted)"
          width={130}
          onClick={handleReset}
        />
      </div>

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