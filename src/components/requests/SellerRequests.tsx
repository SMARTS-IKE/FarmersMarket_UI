import { useMemo, useState } from "react";
import DataTable from "../../shared/components/DataTable";
import CustomInputField from "../../shared/components/CustomInputField";
import type { MarketSearchRequest } from "../../models/market";
import type { SellerSearchRequest } from "../../models/seller";
import type { SellerRequest } from "../../models/request";
import { useMarketsQuery } from "../../queries/marketQueries";
import { useSellersQuery } from "../../queries/sellerQueries";
import { sellerRequestColumns } from "./request.utils";

const FETCHED_REQUESTS: SellerRequest[] = [];

const MARKET_FILTERS: MarketSearchRequest = {
  name: "",
  marketType: "",
  operatingDays: [],
  page: 1,
  pageSize: 1000,
};

const SELLER_FILTERS: SellerSearchRequest = {
  name: "",
  afm: "",
  sellerType: "",
  page: 1,
  pageSize: 1000,
};

export default function FetchedSellerRequests() {
  const [selectedMarket, setSelectedMarket] = useState("");
  const [selectedSeller, setSelectedSeller] = useState("");

  const { data: marketsData } = useMarketsQuery(MARKET_FILTERS);
  const { data: sellersData } = useSellersQuery(SELLER_FILTERS);

  const allMarkets = marketsData?.items ?? [];
  const allSellers = sellersData?.items ?? [];

  const marketDropdownItems = useMemo(
    () => allMarkets.map((market) => ({ label: market.name, value: market.name })),
    [allMarkets]
  );

  const sellerDropdownItems = useMemo(
    () =>
      allSellers.map((seller) => {
        const fullName = `${seller.firstName} ${seller.lastName}`.trim();
        return { label: fullName, value: fullName };
      }),
    [allSellers]
  );

  const filteredRequests = useMemo(
    () =>
      FETCHED_REQUESTS.filter((request) => {
        const matchesMarket = !selectedMarket || request.marketName === selectedMarket;
        const matchesSeller = !selectedSeller || request.sellerName === selectedSeller;
        return matchesMarket && matchesSeller;
      }),
    [selectedMarket, selectedSeller]
  );

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex w-full flex-wrap items-center justify-center gap-3">
        <CustomInputField
          type="DROPDOWN"
          label="Αγορά"
          value={selectedMarket}
          onChange={(v) => setSelectedMarket(String(v))}
          dropdownItems={marketDropdownItems}
          width={260}
        />
        <CustomInputField
          type="DROPDOWN"
          label="Πωλητής"
          value={selectedSeller}
          onChange={(v) => setSelectedSeller(String(v))}
          dropdownItems={sellerDropdownItems}
          width={260}
        />
      </div>

      <DataTable<SellerRequest>
        rows={filteredRequests}
        columns={sellerRequestColumns}
        rowKey="id"
        showFilter={false}
      />
    </div>
  );
}
