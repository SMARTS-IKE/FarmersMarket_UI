import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import DataTable from "../../shared/components/DataTable";
import type { MarketPeriod, MarketPeriodSearchRequest } from "../../models/request";
import { useMarketPeriodsQuery } from "../../queries/requestQueries";
import { marketPeriodColumns } from "./request.utils";

const DEFAULT_FILTERS: MarketPeriodSearchRequest = {
  market: undefined,
  status: undefined,
  page: 1,
  pageSize: 25,
};

export default function NewRequestPeriodsTable() {
  const navigate = useNavigate({ from: "/users/requests" });
  const [filters, setFilters] = useState<MarketPeriodSearchRequest>(DEFAULT_FILTERS);
  const { data } = useMarketPeriodsQuery(filters);

  const rows = useMemo<MarketPeriod[]>(() => data?.items ?? [], [data]);

  const handlePageChange = (nextPage: number) => {
    setFilters((prev) => ({ ...prev, page: nextPage + 1 }));
  };

  const handleRowsPerPageChange = (nextRowsPerPage: number) => {
    setFilters((prev) => ({ ...prev, page: 1, pageSize: nextRowsPerPage }));
  };

  const handleRowClick = (row: MarketPeriod) => {
    navigate({
      to: "/users/requests/periods/$periodId",
      params: { periodId: String(row.id) },
    });
  };

  return (
    <DataTable<MarketPeriod>
      rows={rows}
      columns={marketPeriodColumns}
      rowKey="id"
      onRowClick={handleRowClick}
      showFilter={false}
      page={Math.max((data?.page ?? filters.page) - 1, 0)}
      rowsPerPage={data?.pageSize ?? filters.pageSize}
      totalCount={data?.totalCount ?? 0}
      onPageChange={handlePageChange}
      onRowsPerPageChange={handleRowsPerPageChange}
      rowsPerPageOptions={[10, 25, 50, 100]}
    />
  );
}