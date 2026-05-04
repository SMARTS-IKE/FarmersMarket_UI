import { useMemo, useState } from "react";
import DataTable from "../../shared/components/DataTable";
import CustomInputField from "../../shared/components/CustomInputField";
import type { RequestStatus, SellerRequest, SellerRequestSearchRequest } from "../../models/request";
import type { SellerSearchRequest } from "../../models/seller";
import { useSellerRequestsQuery } from "../../queries/requestQueries";
import { useSellersQuery } from "../../queries/sellerQueries";
import { sellerRequestColumns } from "./request.utils";

const SELLER_FILTERS: SellerSearchRequest = {
  name: "",
  afm: "",
  sellerType: "",
  page: 1,
  pageSize: 1000,
};

export default function FetchedSellerRequests() {
  const [selectedSellerId, setSelectedSellerId] = useState<number | "">("");
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus | "">("");

  const { data: sellersData } = useSellersQuery(SELLER_FILTERS);
  const allSellers = sellersData?.items ?? [];

  const sellerDropdownItems = useMemo(
    () =>
      allSellers.map((seller) => {
        const fullName = `${seller.firstName} ${seller.lastName}`.trim();
        return { label: fullName, value: seller.id };
      }),
    [allSellers]
  );

  const statusDropdownItems = useMemo(
    () => [
      { label: "Σε Αναμονή", value: 0 },
      { label: "Εγκεκριμένο", value: 1 },
      { label: "Απορριφθέν", value: 2 },
    ],
    []
  );

  const requestFilters = useMemo<SellerRequestSearchRequest>(
    () => ({
      sellerId: selectedSellerId === "" ? undefined : selectedSellerId,
      status: selectedStatus === "" ? undefined : selectedStatus,
    }),
    [selectedSellerId, selectedStatus]
  );

  const { data: sellerRequests = [] } = useSellerRequestsQuery(requestFilters);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex w-full flex-wrap items-center justify-center gap-3">
        <CustomInputField
          type="DROPDOWN"
          label="Πωλητής"
          value={selectedSellerId}
          onChange={(v) => setSelectedSellerId(v === "" ? "" : Number(v))}
          dropdownItems={sellerDropdownItems}
          width={260}
        />
        <CustomInputField
          type="DROPDOWN"
          label="Κατάσταση"
          value={selectedStatus}
          onChange={(v) => setSelectedStatus(v === "" ? "" : Number(v) as RequestStatus)}
          dropdownItems={statusDropdownItems}
          width={260}
        />
      </div>

      <DataTable<SellerRequest>
        rows={sellerRequests}
        columns={sellerRequestColumns}
        rowKey="id"
        showFilter={false}
      />
    </div>
  );
}
