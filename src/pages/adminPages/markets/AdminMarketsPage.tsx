import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import DataTable from "../../../shared/components/DataTable";
import CustomInputField from "../../../shared/components/CustomInputField";
import CustomButton from "../../../shared/components/CustomButton";
import type { Market, MarketSearchRequest } from "../../../models/market";
import { useMarketsQuery } from "../../../queries/marketQueries";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AddIcon from "@mui/icons-material/Add";
import { columns, DAYS } from "./market.utils";
import { useLayoutSlot } from "../../../lib/layoutSlotContext";



const EMPTY_FILTERS: MarketSearchRequest = {
  name: "",
  marketType: 1,
  operatingDays: [],
  page: 1,
  pageSize: 25,
};

export default function AdminMarketsPage() {
  const navigate = useNavigate({ from: "/admin/markets" });
  const [draft, setDraft] = useState<MarketSearchRequest>(EMPTY_FILTERS);
  const [filters, setFilters] = useState<MarketSearchRequest>(EMPTY_FILTERS);
  const { setFilterSlot } = useLayoutSlot();

  const { data } = useMarketsQuery(filters);
  const markets: Market[] = data?.items ?? [];

  const handleSearch = () => {
    setFilters({ ...draft, page: 1 });
  };

  const handleReset = () => {
    setDraft(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
  };

  const openCreateForm = () => {
    navigate({ to: "./new" });
  };

  const handleRowClick = (market: Market) => {
    navigate({ to: "./$marketId", params: { marketId: String(market.id) } });
  };

  useEffect(() => {
    setFilterSlot(
      <div className="flex w-max min-w-full flex-col items-center justify-center gap-8 px-2 max-w-[100px] overflowY-auto">
        <div className="flex flex-nowrap items-end justify-center gap-3">
          <CustomInputField
            type="TEXT"
            label="Όνομα"
            value={draft.name}
            onChange={(v) => setDraft((p) => ({ ...p, name: v as string }))}
            width={200}
          />

          <CustomInputField
            type="DROPDOWN"
            label="Τύπος Αγοράς"
            value={String(draft.marketType)}
            onChange={(v) =>
              setDraft((p) => ({
                ...p,
                marketType: v !== "" ? (Number(v) as Market["marketType"]) : "",
              }))
            }
            dropdownItems={[
              { label: "Λαϊκή", value: "1" },
              { label: "Οργανωμένη", value: "2" },
            ]}
            width={200}
          />


        </div>

        <div className="flex flex-nowrap items-end justify-center gap-3">
          <CustomInputField
            type="DROPDOWN"
            label="Ημέρα Λειτουργίας"
            value={draft.operatingDays[0] ?? ""}
            onChange={(v) =>
              setDraft((p) => ({
                ...p,
                operatingDays: v ? [String(v)] : [],
              }))
            }
            dropdownItems={DAYS}
            width={360}
          />

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
  }, [draft, setFilterSlot]);

  return (
    <div className="flex h-full w-full flex-col gap-6 text-left">
      <div className="flex justify-end">
        <CustomButton
          title="Νέα Αγορά"
          prefixIcon={<AddIcon />}
          width={150}
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
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  );
}