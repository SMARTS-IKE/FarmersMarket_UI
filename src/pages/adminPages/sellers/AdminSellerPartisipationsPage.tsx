import { useMemo, useState } from "react";
import { parseISO, isValid, format } from "date-fns";
import DataTable from "../../../shared/components/DataTable";
import type { ColumnDef } from "../../../shared/components/DataTable";
import { useAuthStore } from "../../../store/authStore";
import { useSellersQuery, useSellerQuery, useSellerMarketsQuery } from "../../../queries/sellerQueries";
import { useAttendanceQuery } from "../../../queries/attendanceQueries";

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

export default function AdminSellerPartisipationsPage() {
  const { user, email } = useAuthStore();

  const { data: sellersData } = useSellersQuery(ALL_SELLERS_FILTERS);
  const sellerByUserQuery = useSellerQuery(user?.id ? String(user.id) : "");

  const connectedSeller = useMemo(() => {
    if (sellerByUserQuery.data) return sellerByUserQuery.data;
    const sellers = sellersData?.items ?? [];
    return resolveConnectedSeller(sellers, user?.email ?? email ?? "", user?.id);
  }, [sellersData?.items, sellerByUserQuery.data, user, email]);

  const sellerId = connectedSeller ? Number((connectedSeller as any).id) : "";

  const sellerMarketsQuery = useSellerMarketsQuery(connectedSeller ? String((connectedSeller as any).id) : "");

  // Filters
  const [dateFromFilter, setDateFromFilter] = useState<string>(`${new Date().getFullYear()}-01-01`);
  const [dateToFilter, setDateToFilter] = useState<string>(`${new Date().getFullYear()}-12-31`);

  const attendanceQuery = useAttendanceQuery({
    sellerId: sellerId === "" ? "" : Number(sellerId),
    marketId: "",
    dateFrom: dateFromFilter,
    dateTo: dateToFilter,
    page: 1,
    pageSize: 1000,
  });

  const aggregated = useMemo(() => {
    const items = attendanceQuery.data?.items ?? [];
    const map = new Map<number | string, { marketId: number | string; marketName: string; count: number; first?: string; last?: string }>();

    for (const r of items) {
      const mid = r.marketId ?? "";
      const mname = r.marketName ?? `Αγορά ${mid}`;
      const date = r.attendanceDate ?? "";

      const entry = map.get(mid) ?? { marketId: mid, marketName: mname, count: 0 };
      entry.count += 1;

      if (date) {
        if (!entry.first) entry.first = date;
        if (!entry.last) entry.last = date;
        try {
          const d = parseISO(String(date));
          if (isValid(d)) {
            if (entry.first) {
              const fd = parseISO(String(entry.first));
              if (isValid(fd) && d < fd) entry.first = date;
            }
            if (entry.last) {
              const ld = parseISO(String(entry.last));
              if (isValid(ld) && d > ld) entry.last = date;
            }
          }
        } catch {}
      }

      map.set(mid, entry);
    }

    return Array.from(map.values()).sort((a, b) => (String(a.marketName).localeCompare(String(b.marketName))));
  }, [attendanceQuery.data]);

  const columns: ColumnDef<typeof aggregated[number]>[] = [
    { key: "marketName", label: "Αγορά" },
    { key: "count", label: "Παρουσίες" },
    {
      key: "first",
      label: "Πρώτη παρουσία",
      render: (r) => (r.first ? (isValid(parseISO(String(r.first))) ? format(parseISO(String(r.first)), "dd/MM/yyyy") : "—") : "—"),
    },
    {
      key: "last",
      label: "Τελευταία παρουσία",
      render: (r) => (r.last ? (isValid(parseISO(String(r.last))) ? format(parseISO(String(r.last)), "dd/MM/yyyy") : "—") : "—"),
    },
  ];

  const filters = [
    { title: "DateFrom", label: "Από", type: "DATE" as const },
    { title: "DateTo", label: "Έως", type: "DATE" as const },
  ];

  const handleSearch = (values: Record<string, any>) => {
    setDateFromFilter(values.DateFrom ?? "");
    setDateToFilter(values.DateTo ?? "");
  };

  const rows = aggregated;

  return (
    <div className="flex h-full w-full flex-col gap-6 text-left">
      <div>
        <DataTable
          title="Παρουσίες ανά Αγορά"
          rows={rows}
          columns={columns}
          rowKey="marketId"
          showFilter={true}
          filters={filters}
          onSearch={handleSearch}
          hidePagination={false}
        />
      </div>
    </div>
  );
}
