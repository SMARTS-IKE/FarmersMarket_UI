import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Alert } from "@mui/material";
import DataTable, { FilterDef, FilterValues } from "../../shared/components/DataTable";
import type { Market, MarketSearchRequest } from "../../models/market";
import { useMarketsQuery } from "../../queries/marketQueries";
import type { Seller, SellerSearchRequest } from "../../models/seller";
import { useSellersQuery } from "../../queries/sellerQueries";
import { columns, DAYS } from "../../components/markets/market.utils";
import { useAuthStore } from "../../store/authStore";

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
  const { user, email } = useAuthStore();

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

  const tableFilters: FilterDef[] = useMemo(() => [
    { title: "name", label: "Όνομα", type: "TEXT" },
    {
      title: "marketType",
      label: "Τύπος Αγοράς",
      type: "DROPDOWN",
      dataItems: [
        { label: "Λαϊκή", value: 1 },
        { label: "Οργανωμένη", value: 2 },
      ],
    },
    {
      title: "operatingDays",
      label: "Ημέρα Λειτουργίας",
      type: "DROPDOWN",
      dataItems: DAYS,
    },
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

  const handleRowClick = (market: Market) => {
    navigate({ to: "/users/markets/$marketId", params: { marketId: String(market.id) } });
  };

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
    </div>
  );
}
