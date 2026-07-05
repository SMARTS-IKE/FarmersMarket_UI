import { useMemo, useRef, useState, useEffect } from "react";
import { Alert } from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import DataTable, { FilterDef, FilterValues } from "../../shared/components/DataTable";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RequestActionConfirmDialog from "./RequestActionConfirmDialog";
import type { RequestStatus, SellerRequest, SellerRequestSearchRequest } from "../../models/request";
import type { SellerSearchRequest } from "../../models/seller";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useSellerRequestsQuery, useSetRequestStatusMutation } from "../../queries/requestQueries";
import { useAuthStore } from "../../store/authStore";
import { useSellersQuery } from "../../queries/sellerQueries";
import { useRequestFormsQuery } from "../../queries/formsQueries";
import { sellerRequestColumns } from "./request.utils";
import { useGlobalEnums } from "../../shared/components/GlobalEnums";

const SELLER_FILTERS: SellerSearchRequest = {
  name: "",
  afm: "",
  sellerType: "",
  page: 1,
  pageSize: 1000,
};

export default function FetchedSellerRequests({ userMode }: { userMode?: boolean } = {}) {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SellerRequestSearchRequest>({
    formId: undefined,
    sellerId: undefined,
    status: undefined,
  });

  type Action = "accept" | "reject" | null;

  const [menuState, setMenuState] = useState<{ anchorEl: HTMLElement; rowId: number } | null>(null);
  const menuRowRef = useRef<SellerRequest | null>(null);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<Action>(null);

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

  const handleApprove = (reason?: string) => {
    if (menuRowRef.current) {
      setStatusMutation.mutate({ id: menuRowRef.current.id, payload: { reason: reason ?? '', processedByUserId: String(currentUser?.id ?? ''), status: RequestStatus.Approved } });
    }
    menuRowRef.current = null;
  };

  const handleReject = (reason?: string) => {
    if (menuRowRef.current) {
      setStatusMutation.mutate({ id: menuRowRef.current.id, payload: { reason: reason ?? '', processedByUserId: String(currentUser?.id ?? ''), status: RequestStatus.Rejected } });
    }
    menuRowRef.current = null;
  };

  const handleApproveClick = () => {
    setConfirmAction('accept');
    setConfirmDialogOpen(true);
    handleMenuClose();
  };

  const handleRejectClick = () => {
    setConfirmAction('reject');
    setConfirmDialogOpen(true);
    handleMenuClose();
  };

  const handleConfirm = (reason?: string) => {
    if (confirmAction === 'reject') {
      handleReject(reason);
    } else if (confirmAction === 'accept') {
      handleApprove(reason);
    }
    setConfirmAction(null);
    setConfirmDialogOpen(false);
  };

  const { data: sellersData } = useSellersQuery(SELLER_FILTERS);
  const allSellers = sellersData?.items ?? [];

  const matchedSeller = (() => {
    if (!currentUser) return null;
    // prefer explicit match by userId
    const byUserId = allSellers.find((s) => (s as any).userId != null && String((s as any).userId) === String(currentUser.id));
    if (byUserId) return byUserId as any;

    // fallback match by AFM
    const byAfm = allSellers.find((s) => (s as any).afm && (currentUser as any)?.afm && String((s as any).afm) === String((currentUser as any).afm));
    if (byAfm) return byAfm as any;

    // fallback match by name
    const authName = ((currentUser as any)?.name ?? `${(currentUser as any)?.firstName ?? ''} ${(currentUser as any)?.lastName ?? ''}`).trim();
    const byName = allSellers.find((s) => {
      const sAny = s as any;
      const sName = `${sAny.firstName ?? ''} ${sAny.lastName ?? ''}`.trim();
      return sName && authName && sName === authName;
    });
    if (byName) return byName as any;

    return null;
  })();

  useEffect(() => {
    if (userMode && currentUser && matchedSeller) {
      const sellerIdNum = (matchedSeller as any)?.id ? Number((matchedSeller as any).id) : undefined;
      setFilters((prev) => {
        if (prev.sellerId === sellerIdNum) return prev;
        return { ...prev, sellerId: sellerIdNum } as SellerRequestSearchRequest;
      });
    }
  }, [userMode, currentUser, matchedSeller]);

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

  const { data: requestFormsData } = useRequestFormsQuery();
  const formTitleById = useMemo(() => {
    const map = new Map<number, string>();
    if (!requestFormsData || !Array.isArray((requestFormsData as any).items)) return map;
    for (const f of (requestFormsData as any).items) {
      if (f && typeof f === 'object' && f.id != null) map.set(Number(f.id), String(f.title ?? ''));
    }
    return map;
  }, [requestFormsData]);

  const formDropdownItems = useMemo(() => {
    if (!requestFormsData || !Array.isArray((requestFormsData as any).items)) return [];
    return (requestFormsData as any).items.map((f: any) => ({ label: String(f.title ?? ''), value: Number(f.id) }));
  }, [requestFormsData]);

  const tableFilters: FilterDef[] = useMemo(() => {
    const defs: FilterDef[] = [];
    if (!userMode) {
      defs.push({
        title: "sellerId",
        label: "Πωλητής",
        type: "DROPDOWN",
        dataItems: sellerDropdownItems,
      });
    }
    // form filter
    defs.push({
      title: "formId",
      label: "Τίτλος Αίτησης",
      type: "DROPDOWN",
      dataItems: formDropdownItems,
    });
    defs.push({
      title: "status",
      label: "Κατάσταση",
      type: "DROPDOWN",
      dataItems: statusDropdownItems,
    });
    return defs;
  }, [sellerDropdownItems, statusDropdownItems, userMode]);

  const effectiveFilters = useMemo(() => {
    if (userMode && currentUser) {
      const sellerIdNum = (matchedSeller as any)?.id ? Number((matchedSeller as any).id) : undefined;
      return { ...filters, sellerId: sellerIdNum } as SellerRequestSearchRequest;
    }
    return filters;
  }, [userMode, currentUser, filters]);

  const { data: sellerRequests = [] } = useSellerRequestsQuery(effectiveFilters);

  const visibleRequests = useMemo(() => {
    // If in userMode but we couldn't resolve a connected seller, show no requests
    if (userMode && currentUser && !matchedSeller) return [];
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
      formId: values["formId"] === "" || values["formId"] === undefined
        ? undefined
        : Number(values["formId"]),
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
    if (userMode) {
      navigate({ to: "/users/requests/{$id}", params: { id: String(row.id) } } as any);
    } else {
      navigate({ to: "/admin/requests/$id", params: { id: String(row.id) } } as any);
    }
  };

  return (
    <div className="flex w-full flex-col gap-4">
      {userMode && currentUser && !matchedSeller && (
        <Alert severity="info">Δεν βρέθηκε συνδεδεμένος πωλητής για τον λογαριασμό σας.</Alert>
      )}
      <DataTable<SellerRequest>
        rows={visibleRequests}
        columns={
          userMode
            ? sellerRequestColumns.map((col, idx) => {
                if (idx !== 0) return col;
                return {
                  ...col,
                  label: 'Τίτλος Αίτησης',
                  render: (row: SellerRequest) => {
                    const title = row.formId ? formTitleById.get(Number(row.formId)) : undefined;
                    return title && title.length > 0 ? title : (row.sellerFullName || row.sellerName || '-');
                  },
                };
              })
            : [
                {
                  key: "formId" as keyof SellerRequest,
                  label: "Τίτλος Αίτησης",
                  render: (row: SellerRequest) => {
                    const title = row.formId ? formTitleById.get(Number(row.formId)) : undefined;
                    return title && title.length > 0 ? title : "-";
                  },
                },
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
                        disabled={row.status === RequestStatus.Approved || row.status === RequestStatus.Rejected}
                      >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  ),
                },
              ]
        }
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
        {menuRowRef.current?.status !== RequestStatus.Pending ? (
          <MenuItem disabled>
            {/* {menuRowRef.current?.rejectionReason && menuRowRef.current.rejectionReason.length > 0
              ?  `${'Λόγος Απόρριψης: ' + menuRowRef.current.rejectionReason}`
              : 'Χωρίς λόγο απόρριψης'} */}
          </MenuItem>
        ) : (
          <>
            <MenuItem onClick={handleApproveClick}>Έγκριση Αιτήματος</MenuItem>
            <MenuItem onClick={handleRejectClick}>Απόρριψη Αιτήματος</MenuItem>
          </>
        )}

      </Menu>

      <RequestActionConfirmDialog
        open={confirmDialogOpen}
        action={confirmAction}
        onClose={() => { setConfirmDialogOpen(false); setConfirmAction(null); }}
        onConfirm={(reason?: string) => handleConfirm(reason)}
      />
    </div>
  );
}
