import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import DataTable, { FilterDef, FilterValues } from "../../shared/components/DataTable";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import type { MarketSearchRequest } from "../../models/market";
import type { MarketPeriod, MarketPeriodSearchRequest, MarketPeriodStatus } from "../../models/request";
import { useMarketsQuery } from "../../queries/marketQueries";
import { useMarketPeriodsQuery } from "../../queries/requestQueries";
import { marketPeriodColumns } from "./request.utils";

const MARKET_FILTERS: MarketSearchRequest = {
  name: "",
  marketType: "",
  operatingDays: [],
  page: 1,
  pageSize: 5000,
};

const DEFAULT_FILTERS: MarketPeriodSearchRequest = {
  market: undefined,
  status: undefined,
  page: 1,
  pageSize: 25,
};

const INITIAL_FILTER_VALUES = {
  market: "",
  status: "",
};

const STATUS_OPTIONS: { label: string; value: MarketPeriodStatus }[] = [
  { label: "Πρόχειρη", value: "draft" },
  { label: "Προγραμματισμένη", value: "scheduled" },
  { label: "Ενεργή", value: "active" },
  { label: "Κλειστή", value: "closed" },
];

export default function MarketPeriods() {
  const navigate = useNavigate({ from: "/admin/requests" });
  const [filters, setFilters] = useState<MarketPeriodSearchRequest>(DEFAULT_FILTERS);

  const { data: marketsData } = useMarketsQuery(MARKET_FILTERS);
  const { data } = useMarketPeriodsQuery(filters);

  const rows = useMemo<MarketPeriod[]>(() => data?.items ?? [], [data]);
  console.log(data?.items);
  const marketOptions = useMemo<Array<{ label: string; value: number }>>(
    () =>
      (marketsData?.items ?? []).map((market) => ({
        label: market.name,
        value: market.id,
      })),
    [marketsData]
  );

  const tableFilters: FilterDef[] = useMemo(() => [
    {
      title: "market",
      label: "Αγορά",
      type: "DROPDOWN",
      dataItems: marketOptions,
    },
    {
      title: "status",
      label: "Κατάσταση",
      type: "DROPDOWN",
      dataItems: STATUS_OPTIONS,
    },
  ], [marketOptions]);

  const handleSearch = (values: FilterValues) => {
    setFilters({
      market: values["market"] === "" || values["market"] === undefined ? undefined : String(values["market"]),
      status: values["status"] === "" || values["status"] === undefined ? undefined : (String(values["status"]) as MarketPeriodStatus),
      page: 1,
      pageSize: filters.pageSize,
    });
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handlePageChange = (nextPage: number) => {
    const pageValue = nextPage + 1;

    setFilters((prev) => ({ ...prev, page: pageValue }));
  };

  const handleRowsPerPageChange = (nextRowsPerPage: number) => {
    setFilters((prev) => ({ ...prev, page: 1, pageSize: nextRowsPerPage }));
  };

  const openEditPage = (row: MarketPeriod) => {
    navigate({
      to: "/admin/requests/periods/$periodId",
      params: { periodId: String(row.id) },
    });
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <DataTable<MarketPeriod>
        rows={rows}
        columns={marketPeriodColumns}
        rowKey="id"
        onRowClick={openEditPage}
        showFilter={false}
        filters={tableFilters}
        initialFilterValues={INITIAL_FILTER_VALUES}
        onSearch={handleSearch}
        onClearFilters={handleReset}
        clearFiltersButtonTitle="Καθαρισμός"
        clearFiltersButtonBackgroundColor="var(--color-text-muted)"
        clearFiltersPrefixIcon={<RestartAltIcon />}
        page={Math.max((data?.page ?? filters.page) - 1, 0)}
        rowsPerPage={data?.pageSize ?? filters.pageSize}
        totalCount={data?.totalCount ?? 0}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
    </div>
  );
}