import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import DataTable from "../../shared/components/DataTable";
import CustomButton from "../../shared/components/CustomButton";
import CustomInputField from "../../shared/components/CustomInputField";
import { useLayoutSlot } from "../../lib/layoutSlotContext";
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

const STATUS_OPTIONS: { label: string; value: MarketPeriodStatus }[] = [
  { label: "Πρόχειρη", value: "draft" },
  { label: "Προγραμματισμένη", value: "scheduled" },
  { label: "Ενεργή", value: "active" },
  { label: "Κλειστή", value: "closed" },
];

export default function MarketPeriods() {
  const navigate = useNavigate({ from: "/admin/requests" });
  const { setFilterSlot } = useLayoutSlot();
  const [draft, setDraft] = useState<MarketPeriodSearchRequest>(DEFAULT_FILTERS);
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

  const handleSearch = () => {
    setFilters({
      market: draft.market || undefined,
      status: draft.status,
      page: 1,
      pageSize: Number(draft.pageSize) || DEFAULT_FILTERS.pageSize,
    });
    setDraft((prev) => ({
      ...prev,
      page: 1,
      pageSize: Number(prev.pageSize) || DEFAULT_FILTERS.pageSize,
    }));
  };

  const handleReset = () => {
    setDraft(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
  };

  const handlePageChange = (nextPage: number) => {
    const pageValue = nextPage + 1;

    setDraft((prev) => ({ ...prev, page: pageValue }));
    setFilters((prev) => ({ ...prev, page: pageValue }));
  };

  const handleRowsPerPageChange = (nextRowsPerPage: number) => {
    setDraft((prev) => ({ ...prev, page: 1, pageSize: nextRowsPerPage }));
    setFilters((prev) => ({ ...prev, page: 1, pageSize: nextRowsPerPage }));
  };

  const openCreatePage = () => {
    navigate({ to: "/admin/requests/periods/new" });
  };

  const openEditPage = (row: MarketPeriod) => {
    navigate({
      to: "/admin/requests/periods/$periodId",
      params: { periodId: String(row.id) },
    });
  };

  useEffect(() => {
    setFilterSlot(
      <div className="flex w-max min-w-full max-w-25 flex-col items-center justify-center gap-8 px-2 overflowY-auto">
        <div className="flex flex-nowrap items-end justify-center gap-3">
          <CustomInputField
            type="DROPDOWN"
            label="Αγορά"
            value={draft.market ?? ""}
            onChange={(value) => {
              const selected = value ? Number(value) : undefined;
              const selectedMarket = (marketsData?.items ?? []).find((market) => market.id === selected);

              setDraft((prev) => ({ ...prev, market: selectedMarket?.name }));
            }}
            dropdownItems={marketOptions}
            width={240}
          />

          <CustomInputField
            type="DROPDOWN"
            label="Κατάσταση"
            value={draft.status ?? ""}
            onChange={(value) =>
              setDraft((prev) => ({
                ...prev,
                status: value ? (String(value) as MarketPeriodStatus) : undefined,
              }))
            }
            dropdownItems={STATUS_OPTIONS}
            width={220}
          />
        </div>

        <div className="flex flex-nowrap items-end justify-center gap-3">

          <CustomButton
            title="Αναζήτηση"
            prefixIcon={<SearchIcon />}
            onClick={handleSearch}
            width={130}
          />
          <CustomButton
            title="Καθαρισμός"
            prefixIcon={<RestartAltIcon />}
            backgroundColor="var(--color-text-muted)"
            onClick={handleReset}
            width={130}
          />
        </div>
      </div>
    );

    return () => setFilterSlot(null);
  }, [draft, marketOptions, setFilterSlot]);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex w-full justify-end">
        <CustomButton
          title="Δημιουργία Περιόδου Αιτήσεων"
          width="fit-content"
          onClick={openCreatePage}
        />
      </div>

      <DataTable<MarketPeriod>
        rows={rows}
        columns={marketPeriodColumns}
        rowKey="id"
        onRowClick={openEditPage}
        showFilter={false}
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