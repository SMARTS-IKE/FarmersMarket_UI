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
import { useApproveRequestMutation, useDeleteRequestMutation, useRejectRequestMutation, useSellerRequestsQuery } from "../../queries/requestQueries";
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

  const [menuState, setMenuState] = useState<{ anchorEl: HTMLElement; rowId: number } | null>(null);
  const menuRowRef = useRef<SellerRequest | null>(null);

  const approveMutation = useApproveRequestMutation();
  const rejectMutation = useRejectRequestMutation();
  const deleteMutation = useDeleteRequestMutation();

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
    if (menuRowRef.current) approveMutation.mutate(menuRowRef.current.id);
    handleMenuClose();
  };

  const handleReject = () => {
    if (menuRowRef.current) rejectMutation.mutate(menuRowRef.current.id);
    handleMenuClose();
  };

  const handleDelete = () => {
    if (menuRowRef.current) deleteMutation.mutate(menuRowRef.current.id);
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
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          Διαγραφή Αιτήματος
        </MenuItem>
      </Menu>
    </div>
  );
}
