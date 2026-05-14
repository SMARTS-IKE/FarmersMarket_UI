import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { Alert } from "@mui/material";
import DataTable from "../../shared/components/DataTable";
import CustomInputField from "../../shared/components/CustomInputField";
import CustomButton from "../../shared/components/CustomButton";
import type { Market, MarketSearchRequest } from "../../models/market";
import { useMarketsQuery } from "../../queries/marketQueries";
import type { Seller, SellerSearchRequest } from "../../models/seller";
import { useSellersQuery } from "../../queries/sellerQueries";
import { columns, DAYS } from "../../components/markets/market.utils";
import { useLayoutSlot } from "../../lib/layoutSlotContext";
import { useAuthStore } from "../../store/authStore";

const EMPTY_FILTERS: MarketSearchRequest = {
  name: "",
  marketType: 1,
  operatingDays: [],
  page: 1,
  pageSize: 25,
};

const ALL_MARKETS_FILTERS: MarketSearchRequest = {
  name: "",
  marketType: "",
  operatingDays: [],
  page: 1,
  pageSize: 5000,
};

const ALL_SELLERS_FILTERS: SellerSearchRequest = {
  name: "",
  afm: "",
  sellerType: "",
  page: 1,
  pageSize: 5000,
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function readNumber(record: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function extractSellerId(entry: unknown): number | null {
  const record = asRecord(entry);
  if (!record) return null;

  const nestedSellerRecord =
    asRecord(record.seller) ??
    asRecord(record.sellerInfo) ??
    asRecord(record.sellerDetails) ??
    asRecord(record.user);

  return readNumber(record, ["sellerId", "id"]) ??
    (nestedSellerRecord ? readNumber(nestedSellerRecord, ["sellerId", "id"]) : null);
}

function getMarketSellers(market: Market): unknown[] {
  const marketRecord = asRecord(market);
  const sellers = marketRecord?.marketSellers ?? marketRecord?.sellers ?? market.marketSellers;
  return Array.isArray(sellers) ? sellers : [];
}

function resolveConnectedSeller(sellers: Seller[], email: string): Seller | null {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return null;

  return sellers.find((seller) => (seller.email ?? "").trim().toLowerCase() === normalizedEmail) ?? null;
}

function applyMarketFilters(markets: Market[], filters: MarketSearchRequest): Market[] {
  return markets.filter((market) => {
    const matchesName = filters.name.trim() === ""
      ? true
      : market.name.toLowerCase().includes(filters.name.trim().toLowerCase());

    const matchesType = filters.marketType === ""
      ? true
      : market.marketType === filters.marketType;

    const matchesDay = filters.operatingDays.length === 0
      ? true
      : market.schedules.some((schedule) => {
        const dayName = DAYS.find((item) => Number(item.value) === schedule.day)?.value;
        return dayName !== undefined && String(dayName) === String(filters.operatingDays[0]);
      });

    return matchesName && matchesType && matchesDay;
  });
}

export default function UserMarketsPage() {
  const navigate = useNavigate({ from: "/users/markets" });
  const { setFilterSlot } = useLayoutSlot();
  const { user, email } = useAuthStore();

  const [draft, setDraft] = useState<MarketSearchRequest>(EMPTY_FILTERS);
  const [filters, setFilters] = useState<MarketSearchRequest>(EMPTY_FILTERS);

  const { data: marketsData, isLoading: isMarketsLoading, isError: isMarketsError, error: marketsError } = useMarketsQuery(ALL_MARKETS_FILTERS);
  const { data: sellersData, isLoading: isSellersLoading } = useSellersQuery(ALL_SELLERS_FILTERS);

  const connectedEmail = user?.email ?? email ?? "";

  const connectedSeller = useMemo(
    () => resolveConnectedSeller(sellersData?.items ?? [], connectedEmail),
    [connectedEmail, sellersData?.items]
  );

  const connectedMarkets = useMemo(() => {
    if (!connectedSeller) return [];

    return (marketsData?.items ?? []).filter((market) =>
      getMarketSellers(market).some((marketSeller) => extractSellerId(marketSeller) === connectedSeller.id)
    );
  }, [connectedSeller, marketsData?.items]);

  const rows = useMemo(() => applyMarketFilters(connectedMarkets, filters), [connectedMarkets, filters]);

  const handleSearch = () => {
    setFilters({ ...draft, page: 1 });
  };

  const handleReset = () => {
    setDraft(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
  };

  const handleRowClick = (market: Market) => {
    navigate({ to: "/users/markets/$marketId", params: { marketId: String(market.id) } });
  };

  useEffect(() => {
    setFilterSlot(
      <div className="flex w-max min-w-full max-w-25 flex-col items-center justify-center gap-8 px-2 overflowY-auto">
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

  if (isMarketsLoading || isSellersLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center text-(--color-text-muted)">
        Φόρτωση αγορών...
      </div>
    );
  }

  if (isMarketsError) {
    return (
      <div className="flex h-full w-full flex-col gap-4 text-left">
        <Alert severity="error">
          {marketsError?.message ?? "Δεν ήταν δυνατή η φόρτωση των αγορών."}
        </Alert>
      </div>
    );
  }

  if (!connectedSeller) {
    return (
      <div className="flex h-full w-full flex-col gap-4 text-left">
        <Alert severity="warning">
          Δεν βρέθηκε συνδεδεμένος πωλητής για το email {connectedEmail || "(χωρίς email)"}.
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-6 text-left">
      <div className="w-full">
        <DataTable<Market>
          rows={rows}
          columns={columns}
          rowKey="id"
          showFilter={false}
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  );
}
