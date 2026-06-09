import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import DataTable, { FilterDef, FilterValues } from "../../shared/components/DataTable";
import type { RequestStatus, SellerRequest, SellerRequestSearchRequest } from "../../models/request";
import type { SellerSearchRequest } from "../../models/seller";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
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
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SellerRequestSearchRequest>({
    sellerId: undefined,
    status: undefined,
  });

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

  const tableFilters: FilterDef[] = useMemo(
    () => [
      {
        title: "sellerId",
        label: "Πωλητής",
        type: "DROPDOWN",
        dataItems: sellerDropdownItems,
      },
      {
        title: "status",
        label: "Κατάσταση",
        type: "DROPDOWN",
        dataItems: statusDropdownItems,
      },
    ],
    [sellerDropdownItems, statusDropdownItems]
  );

  const { data: sellerRequests = [] } = useSellerRequestsQuery(filters);

  const handleSearch = (values: FilterValues) => {
    setFilters({
      sellerId: values["sellerId"] === "" || values["sellerId"] === undefined
        ? undefined
        : Number(values["sellerId"]),
      status: values["status"] === "" || values["status"] === undefined
        ? undefined
        : (Number(values["status"]) as RequestStatus),
    });
  };

  const handleClearFilters = () => {
    setFilters({
      sellerId: undefined,
      status: undefined,
    });
  };

  const handleRowClick = (row: SellerRequest) => {
    navigate({
      to: "/admin/requests/$id",
      params: { id: String(row.id) },
    } as any);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <DataTable<SellerRequest>
        rows={sellerRequests}
        columns={sellerRequestColumns}
        rowKey="id"
        showFilter={false}
        filters={tableFilters}
        onSearch={handleSearch}
        onClearFilters={handleClearFilters}
        onRowClick={handleRowClick}
        clearFiltersButtonTitle="Καθαρισμός"
        clearFiltersPrefixIcon={<RestartAltIcon />}
        clearFiltersButtonBackgroundColor="var(--color-text-muted)"
      />
    </div>
  );
}
