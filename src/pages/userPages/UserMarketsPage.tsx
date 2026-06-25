import { useMemo, useState } from "react";
import { useEffect } from "react";
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useNavigate } from "@tanstack/react-router";
import { Alert } from "@mui/material";
import DataTable, { FilterDef, FilterValues } from "../../shared/components/DataTable";
import type { Market, MarketSearchRequest } from "../../models/market";
import { useMarketsQuery } from "../../queries/marketQueries";
import { useSellerQuery, useSellerMarketsQuery } from "../../queries/sellerQueries";
import { getMarketById } from "../../services/marketService";
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

  const sellerByUserQuery = useSellerQuery(user?.id ? String(user.id) : "");

  const connectedSeller = useMemo(() => {
    if (sellerByUserQuery.data) return sellerByUserQuery.data;
    return resolveConnectedSeller(sellersData?.items ?? [], connectedEmail);
  }, [connectedEmail, sellersData?.items, sellerByUserQuery.data]);

  const sellerMarketsQuery = useSellerMarketsQuery(connectedSeller ? String(connectedSeller.id) : "");

  const [extraMarkets, setExtraMarkets] = useState<Market[]>([]);
  const [extraLoading, setExtraLoading] = useState(false);

  const connectedMarkets = useMemo(() => {
    if (!connectedSeller) return [];

    const connectedIds = sellerMarketsQuery.data?.items?.map((cm) => Number(cm.marketId)).filter(Boolean) ?? [];

    if (connectedIds.length > 0) {
      const available = (marketsData?.items ?? []) as Market[];
      const map = new Map<number, Market>(available.map((m) => [Number(m.id), m]));
      const results: Market[] = [];
      for (const id of connectedIds) {
        const m = map.get(Number(id)) ?? extraMarkets.find((em) => Number(em.id) === Number(id));
        if (m) results.push(m);
      }
      return results;
    }

    return (marketsData?.items ?? []).filter((market) =>
      getMarketSellers(market).some((marketSeller) => extractSellerId(marketSeller) === connectedSeller.id)
    );
  }, [connectedSeller, marketsData?.items, sellerMarketsQuery.data, extraMarkets]);

  useEffect(() => {
    const connectedIds = sellerMarketsQuery.data?.items?.map((cm) => Number(cm.marketId)).filter(Boolean) ?? [];
    if (connectedIds.length === 0) return;
    const availableIds = new Set((marketsData?.items ?? []).map((m) => Number(m.id)));
    const missing = connectedIds.filter((id) => !availableIds.has(Number(id)));
    if (missing.length === 0) return;

    let cancelled = false;
    setExtraLoading(true);
    Promise.all(missing.map((id) => getMarketById(String(id)).catch(() => null)))
      .then((responses) => {
        if (cancelled) return;
        const fetched = responses.filter(Boolean) as Market[];
        setExtraMarkets((prev) => {
          const existing = new Set(prev.map((p) => Number(p.id)));
          const out = [...prev];
          for (const f of fetched) {
            if (!existing.has(Number(f.id))) out.push(f);
          }
          return out;
        });
      })
      .finally(() => { if (!cancelled) setExtraLoading(false); });

    return () => { cancelled = true; };
  }, [sellerMarketsQuery.data, marketsData?.items]);

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

  if (isMarketsLoading || isSellersLoading || sellerMarketsQuery.isLoading || sellerByUserQuery.isLoading || extraLoading) {
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
    console.debug('UserMarketsPage: user, sellerByUserQuery.data, sellersData', user, sellerByUserQuery.data, sellersData?.items?.slice(0,50));
    return (
      <div className="flex h-full w-full flex-col gap-4 text-left">
        <Alert severity="warning">
          Δεν βρέθηκε συνδεδεμένος πωλητής για το email {connectedEmail || "(χωρίς email)"}.
        </Alert>
        <div>
          <Alert severity="info">
            <div style={{ marginBottom: 8 }}>Debug: current auth `user` and seller lookups.</div>
            <div style={{ fontSize: 13, marginBottom: 8 }}>
              <strong>User:</strong>
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{JSON.stringify(user ?? {}, null, 2)}</pre>
            </div>
            <div style={{ fontSize: 13, marginBottom: 8 }}>
              <strong>Seller by userId (`useSellerQuery`):</strong>
              <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 120, overflow: 'auto', margin: 0 }}>{JSON.stringify(sellerByUserQuery.data ?? null, null, 2)}</pre>
            </div>
            <div style={{ fontSize: 13 }}>
              <strong>First sellers from API (`sellersData.items` up to 50):</strong>
              <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 300, overflow: 'auto', margin: 0 }}>{JSON.stringify(sellersData?.items?.slice(0, 50) ?? [], null, 2)}</pre>
            </div>
          </Alert>
        </div>
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
