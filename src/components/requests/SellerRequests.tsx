import { useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import DataTable, { FilterDef, FilterValues } from "../../shared/components/DataTable";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import type { RequestStatus, SellerRequest, SellerRequestSearchRequest } from "../../models/request";
import type { SellerSearchRequest } from "../../models/seller";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useDeleteRequestMutation, useSellerRequestsQuery, useSetRequestStatusMutation } from "../../queries/requestQueries";
import { useAuthStore } from "../../store/authStore";
import { useSellersQuery } from "../../queries/sellerQueries";
import { sellerRequestColumns } from "./request.utils";
import { useGlobalEnums } from "../../shared/components/GlobalEnums";

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
    status: 0,
  });

  const [menuState, setMenuState] = useState<{ anchorEl: HTMLElement; rowId: number } | null>(null);
  const menuRowRef = useRef<SellerRequest | null>(null);

  const setStatusMutation = useSetRequestStatusMutation();
  const currentUser = useAuthStore((s) => s.user);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, row: SellerRequest) => {
    event.stopPropagation();
    menuRowRef.current = row;
    setMenuState({ anchorEl: event.currentTarget, rowId: row.id });
  };

  const handleMenuClose = () => {
    setMenuState(null);
    menuRowRef.current = null;
  };

  const handleApprove = () => {
    if (menuRowRef.current) {
      setStatusMutation.mutate({ id: menuRowRef.current.id, payload: { reason: '', processedByUserId: String(currentUser?.id ?? ''), status: 3 } });
    }
    handleMenuClose();
  };

  const handleReject = () => {
    if (menuRowRef.current) {
      setStatusMutation.mutate({ id: menuRowRef.current.id, payload: { reason: '', processedByUserId: String(currentUser?.id ?? ''), status: 4 } });
    }
    handleMenuClose();
  };

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

  const { RequestStatusLabels, RequestStatus } = useGlobalEnums();

  const statusDropdownItems = useMemo(
    () => Object.entries(RequestStatusLabels).map(([k, v]) => ({ label: v, value: Number(k) })),
    [RequestStatusLabels]
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

  const visibleRequests = useMemo(() => {
    // If a status filter is applied, show results as returned by the query.
    if (filters.status !== undefined && filters.status !== null) return sellerRequests;

    // By default, hide processed requests (Approved or Rejected)
    return sellerRequests;
  }, [sellerRequests, filters.status, RequestStatus]);

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
        rows={visibleRequests}
        columns={[
          ...sellerRequestColumns,
          {
            key: "actions" as keyof SellerRequest,
            label: "",
            filterable: false,
            render: (row) => (
              <IconButton
                size="small"
                onClick={(e) => handleMenuOpen(e, row)}
                aria-label="actions"
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            ),
          },
        ]}
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
      <Menu
        anchorEl={menuState?.anchorEl}
        open={Boolean(menuState)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleApprove}>Έγκριση Αιτήματος</MenuItem>
        <MenuItem onClick={handleReject}>Απόρριψη Αιτήματος</MenuItem>

      </Menu>
    </div>
  );
}
