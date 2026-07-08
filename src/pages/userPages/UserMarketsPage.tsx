import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Alert } from "@mui/material";
import DataTable from "../../shared/components/DataTable";
import type { ConnectedMarket } from "../../models/market";
import type { ColumnDef } from "../../shared/components/DataTable";
import { useSellerQuery, useSellerMarketsQuery } from "../../queries/sellerQueries";
import type { Seller, SellerSearchRequest } from "../../models/seller";
import { useSellersQuery } from "../../queries/sellerQueries";
// no longer using Markets fallback
import { useAuthStore } from "../../store/authStore";

const ALL_SELLERS_FILTERS: SellerSearchRequest = {
  name: "",
  afm: "",
  sellerType: "",
  page: 1,
  pageSize: 5000,
};

// helper functions for market seller extraction removed — using seller-specific endpoint instead

function resolveConnectedSeller(sellers: Seller[], email: string): Seller | null {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return null;

  return sellers.find((seller) => (seller.email ?? "").trim().toLowerCase() === normalizedEmail) ?? null;
}

// No client-side filters required for user markets

export default function UserMarketsPage() {
  const navigate = useNavigate({ from: "/users/markets" });
  const { user, email } = useAuthStore();

  const { data: sellersData, isLoading: isSellersLoading } = useSellersQuery(ALL_SELLERS_FILTERS);

  const connectedEmail = user?.email ?? email ?? "";

  const sellerByUserQuery = useSellerQuery(user?.id ? String(user.id) : "");

  const connectedSeller = useMemo(() => {
    if (sellerByUserQuery.data) return sellerByUserQuery.data;

    const sellers = sellersData?.items ?? [];

    // Prefer seller where seller.userId strictly equals connected user id
    const exactMatch = sellers.find((s) => (s as any).userId === user?.id);
    if (exactMatch) return exactMatch;

    // Fallback: compare stringified ids (handles numeric/string id mismatches)
    const stringMatch = sellers.find((s) => String((s as any).userId) === String(user?.id));
    if (stringMatch) return stringMatch;

    // Final fallback: resolve by email
    return resolveConnectedSeller(sellers, connectedEmail);
  }, [connectedEmail, sellersData?.items, sellerByUserQuery.data]);

  const sellerMarketsQuery = useSellerMarketsQuery(connectedSeller ? String(connectedSeller.id) : "");

    const sellerMarketColumns: ColumnDef<ConnectedMarket>[] = [
      { key: 'marketName', label: 'Όνομα Αγοράς' },
      { key: 'fromDate', label: 'Από' , render: (r) => (r.fromDate ? String(r.fromDate).slice(0,10) : '—')},
      { key: 'spotLocation', label: 'Θέση' },
      { key: 'spotLength', label: 'Μήκος Θέσης(μ)' },
    ];

  // No extra market fetching — table shows seller-specific connected markets directly

  const rows = useMemo(() => sellerMarketsQuery.data?.items ?? [], [sellerMarketsQuery.data]);

  // No filters or search handlers for user markets

  const handleRowClick = (row: any) => {
    const marketId = row?.marketId ?? row?.id;
    if (!marketId) return;
    navigate({ to: "/users/markets/$marketId", params: { marketId: String(marketId) } });
  };

  if (isSellersLoading || sellerMarketsQuery.isLoading || sellerByUserQuery.isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center text-(--color-text-muted)">
        Φόρτωση αγορών...
      </div>
    );
  }

  // Errors from seller markets or sellers will be shown via empty states or alerts below

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
        <DataTable<ConnectedMarket>
          rows={rows}
          columns={sellerMarketColumns}
          rowKey="id"
          showFilter={false}
        />
      </div>
    </div>
  );
}
