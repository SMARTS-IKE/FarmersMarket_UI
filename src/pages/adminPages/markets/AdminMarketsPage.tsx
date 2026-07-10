import { useMemo, useState, useEffect } from "react";
import { Snackbar, Alert } from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import DataTable, { FilterDef, FilterValues } from "../../../shared/components/DataTable";
import CustomButton from "../../../shared/components/CustomButton";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import type { Market, MarketSearchRequest } from "../../../models/market";
import { useMarketsQuery } from "../../../queries/marketQueries";
import { columns, DAYS } from "../../../components/markets/market.utils";

const EMPTY_FILTERS: MarketSearchRequest = {
  name: "",
  marketType: 1,
  operatingDays: [],
  page: 1,
  pageSize: 25,
};

const INITIAL_FILTER_VALUES = {
  name: "",
  marketType: 1,
  operatingDays: "",
};

export default function AdminMarketsPage() {
  const navigate = useNavigate({ from: "/admin/markets" });
  const [filters, setFilters] = useState<MarketSearchRequest>(EMPTY_FILTERS);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      let notice = params.get("notice");

      if (!notice) {
        // fallback to sessionStorage (used when navigate couldn't include query)
        try {
          notice = sessionStorage.getItem('admin.markets.notice') ?? undefined;
          if (notice) sessionStorage.removeItem('admin.markets.notice');
        } catch (e) {
          // ignore
        }
      }

      if (notice) {
        const msg = notice === "created" ? "Η αγορά δημιουργήθηκε επιτυχώς." : notice === "updated" ? "Η αγορά ενημερώθηκε επιτυχώς." : notice;
        setNoticeMessage(msg);
        setIsNoticeOpen(true);

        // remove the notice param from the URL without reloading
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete("notice");
          window.history.replaceState(null, "", url.toString());
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const { data } = useMarketsQuery(filters);
  const markets: Market[] = data?.items ?? [];

  const tableFilters: FilterDef[] = useMemo(() => [
    { title: "name", label: "Όνομα", type: "TEXT" }
  ], []);

  const handleSearch = (values: FilterValues) => {
    setFilters({
      name: String(values["name"] ?? ""),
      marketType: values["marketType"] === "" || values["marketType"] === undefined
        ? ""
        : (Number(values["marketType"]) as Market["marketType"]),
      operatingDays: values["operatingDays"] ? [String(values["operatingDays"])] : [],
      page: 1,
      pageSize: 25,
    });
  };

  const handleReset = () => {
    setFilters(EMPTY_FILTERS);
  };

  const openCreateForm = () => {
    navigate({ to: "./new" });
  };

  const handleRowClick = (market: Market) => {
    navigate({ to: "./$marketId", params: { marketId: String(market.id) } });
  };

  return (
    <div className="flex h-full w-full flex-col gap-6 text-left">
      <div className="flex justify-end">
        <CustomButton
          title="Δημιουργία νέας Αγοράς"
          width={'fit-content'}
          onClick={openCreateForm}
        />
      </div>

      {/* Table */}
      <div className="w-full">
        <DataTable<Market>
          rows={markets}
          columns={columns}
          rowKey="id"
          showFilter={false}
          filters={tableFilters}
          initialFilterValues={INITIAL_FILTER_VALUES}
          onSearch={handleSearch}
          onClearFilters={handleReset}
          clearFiltersButtonTitle="Καθαρισμός"
          clearFiltersButtonBackgroundColor="var(--color-text-muted)"
          clearFiltersPrefixIcon={<RestartAltIcon />}
          onRowClick={handleRowClick}
        />
      </div>

      <Snackbar open={isNoticeOpen} autoHideDuration={4000} onClose={() => setIsNoticeOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setIsNoticeOpen(false)} severity="success" variant="filled" sx={{ width: '100%' }}>
          {noticeMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}