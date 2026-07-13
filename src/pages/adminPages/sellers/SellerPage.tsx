import { Alert, Box, Snackbar, Tab, Tabs, Checkbox, FormControlLabel } from "@mui/material";
import { useEffect, useMemo, useState, type SyntheticEvent } from "react";
import { flushSync } from "react-dom";
import { useBlocker, useNavigate, useParams } from "@tanstack/react-router";
import type { ConnectedMarket } from "../../../models/market";
import DataTable, { type ColumnDef } from "../../../shared/components/DataTable";
import CustomButton from "../../../shared/components/CustomButton";
import CustomInputField from "../../../shared/components/CustomInputField";
import { useSellerQuery, useSellerMarketsQuery } from "../../../queries/sellerQueries";
import { SELLER_TYPE_LABELS } from "../../../components/sellers/sellers.utils";
import { updateSeller } from "../../../services/sellerService";
import { setAuthNotification } from '../../../lib/authNotifications';
import { updateUser, getUserById } from "../../../services/userService";
import { USER_ROLE_MAPPING } from "../../../shared/mappings/users.mapping";
import { UserRole } from "../../../shared/mappings/GlobalEnums";
import { useGlobalEnums } from "../../../shared/mappings/GlobalEnums";
import { queryClient } from '../../../lib/queryClient';
import { sellerKeys } from '../../../queries/sellerQueries';

const connectedMarketsColumns: ColumnDef<ConnectedMarket>[] = [
  { key: "marketName", label: "Όνομα Αγοράς" },
  { key: "fromDate", label: "Από" },
  { key: "spotLocation", label: "Θέση", render: (row) => row.spotLocation || "-" },
];

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function readString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function getLatestLicense(licenses: unknown[]): { number: string; issuedAt: string; expiresAt: string } | null {
  if (!Array.isArray(licenses) || licenses.length === 0) {
    return null;
  }

  const licenseRecords = licenses
    .map((lic) => asRecord(lic))
    .filter((lic): lic is Record<string, unknown> => lic !== null);

  if (licenseRecords.length === 0) {
    return null;
  }

  // Assume the latest license is the last one or the one with the latest issuedAt date
  const latest = licenseRecords[licenseRecords.length - 1];

  return {
    number: readString(latest, ["number", "licenseNumber"]),
    issuedAt: readString(latest, ["issuedAt", "issued_at", "issuedDate"]),
    expiresAt: readString(latest, ["expiresAt", "expires_at", "expiresDate"]),
  };
}

export default function SellerPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const sellerId = typeof params.sellerId === "string" ? params.sellerId : "";
  const [activeTab, setActiveTab] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [afm, setAfm] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string | number>("");
  const [userStatus, setUserStatus] = useState<number | string>(0);
  const [createdAt, setCreatedAt] = useState("");
  const [sellerType, setSellerType] = useState<string>("0");
  const [isActive, setIsActive] = useState(false);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseIssuedAt, setLicenseIssuedAt] = useState("");
  const [licenseExpiresAt, setLicenseExpiresAt] = useState("");
  const [isSeasonal, setIsSeasonal] = useState(false);
  const [seasonalFromDate, setSeasonalFromDate] = useState("");
  const [seasonalToDate, setSeasonalToDate] = useState("");
  const [initialState, setInitialState] = useState({
    firstName: "",
    lastName: "",
    afm: "",
    phone: "",
    address: "",
    sellerType: "",
    isActive: false,
    licenseNumber: "",
    licenseIssuedAt: "",
    licenseExpiresAt: "",
    isSeasonal: false,
    seasonalFromDate: "",
    seasonalToDate: "",
    userId: null,
    createdAt: "",
    email: "",
    userRole: "",
    userStatus: 0,
  });
  const [navigationNotice, setNavigationNotice] = useState("");
  const [notificationSeverity, setNotificationSeverity] = useState<"success" | "warning">("warning");
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

  const { data: seller, isLoading, isError, error } = useSellerQuery(sellerId);
  const { data: connectedMarketsResults } = useSellerMarketsQuery(sellerId);

  const { UserRoleLabels, UserStatusLabels } = useGlobalEnums();

  const connectedMarkets = connectedMarketsResults?.items ?? [];

  const handleConnectedMarketClick = (market: ConnectedMarket) => {
    navigate({
      to: `/admin/sellers/${sellerId}/market/${market.id}`,
    });
  };

  const currentState = useMemo(
    () => ({
      firstName,
      lastName,
      afm,
      phone,
      address,
      sellerType,
      isActive,
      email,
      userRole,
      userStatus,
      licenseNumber,
      licenseIssuedAt,
      licenseExpiresAt,
      isSeasonal,
      seasonalFromDate,
      seasonalToDate,
      userId,
      createdAt,
    }),
    [firstName, lastName, afm, phone, address, sellerType, isActive, licenseNumber, licenseIssuedAt, licenseExpiresAt, isSeasonal, seasonalFromDate, seasonalToDate, userId, createdAt, email, userRole, userStatus]
  );
  const hasUnsavedChanges = useMemo(() => {
    const normalize = (v: unknown) => {
      if (v === null || v === undefined) return "";
      if (typeof v === "boolean") return v; // keep boolean
      if (typeof v === "number") return String(v);
      if (Array.isArray(v)) return JSON.stringify(v.map((x) => (x === null || x === undefined ? "" : String(x))));
      return String(v).trim();
    };

    const keys = [
      "firstName",
      "lastName",
      "afm",
      "phone",
      "address",
      "sellerType",
      "isActive",
      "email",
      "userRole",
      "userStatus",
      "licenseNumber",
      "licenseIssuedAt",
      "licenseExpiresAt",
      "isSeasonal",
      "seasonalFromDate",
      "seasonalToDate",
      "userId",
      "createdAt",
    ];

    for (const k of keys) {
      const a = normalize((currentState as any)[k]);
      const b = normalize((initialState as any)[k]);
      if (typeof a === "boolean" || typeof b === "boolean") {
        if (a !== b) return true;
      } else if (a !== b) return true;
    }

    return false;
  }, [currentState, initialState]);

  const isSaveDisabled = useMemo(() => {
    if (!String(licenseNumber ?? "").trim()) return true;
    if (isSeasonal) {
      if (!String(seasonalFromDate ?? "").trim()) return true;
      if (!String(seasonalToDate ?? "").trim()) return true;
    } else {
      if (!String(licenseIssuedAt ?? "").trim()) return true;
      if (!String(licenseExpiresAt ?? "").trim()) return true;
    }
    return false;
  }, [licenseNumber, isSeasonal, seasonalFromDate, seasonalToDate, licenseIssuedAt, licenseExpiresAt]);

  useEffect(() => {
    if (!seller) return;

    const cl = (seller as any).currentLicense ?? null;

    const mappedState = {
      firstName: seller.firstName ?? "",
      lastName: seller.lastName ?? "",
      afm: seller.afm ?? "",
      phone: seller.phone ?? "",
      address: seller.address ?? "",
      sellerType: String(seller.sellerType ?? ""),
      isActive: Boolean(seller.isActive),
      licenseNumber: cl?.licenseNumber ?? cl?.license_number ?? "",
      // prefer explicit seasonal fields when present
      licenseIssuedAt: cl?.fromDate ?? cl?.seasonalFromDate ?? "",
      licenseExpiresAt: cl?.licenseExpiry ?? cl?.expiresAt ?? cl?.toDate ?? cl?.seasonalToDate ?? "",
      isSeasonal: Boolean(cl?.isSeasonal ?? cl?.seasonalFromDate ?? cl?.seasonalToDate),
      seasonalFromDate: cl?.seasonalFromDate ?? cl?.fromDate ?? "",
      seasonalToDate: cl?.seasonalToDate ?? cl?.toDate ?? cl?.licenseExpiry ?? "",
      userId: typeof seller.userId === 'number' ? seller.userId : null,
      createdAt: seller.createdAt ?? "",
      email: (seller as any).email ?? "",
      userRole: (seller as any).role ?? "",
      userStatus: typeof (seller as any).status === 'number' ? (seller as any).status : 0,
    };

    setFirstName(mappedState.firstName);
    setLastName(mappedState.lastName);
    setAfm(mappedState.afm);
    setPhone(mappedState.phone);
    setAddress(mappedState.address);
    setSellerType(mappedState.sellerType);
    setIsActive(mappedState.isActive);
    setLicenseNumber(mappedState.licenseNumber);
    setLicenseIssuedAt(mappedState.licenseIssuedAt);
    setLicenseExpiresAt(mappedState.licenseExpiresAt);
    setIsSeasonal(Boolean(mappedState.isSeasonal));
    setSeasonalFromDate(mappedState.seasonalFromDate ?? "");
    setSeasonalToDate(mappedState.seasonalToDate ?? "");
    setUserId(mappedState.userId ?? null);
    setCreatedAt(mappedState.createdAt ?? "");
    setEmail(mappedState.email ?? "");
    setUserRole(mappedState.userRole ?? "");
    setUserStatus(mappedState.userStatus ?? 0);
    setInitialState(mappedState);
    setNavigationNotice("");
    setIsSnackbarOpen(false);
  }, [seller]);

  // When a userId is present, prefer loading user details from /Users/{id}
  useEffect(() => {
    let cancelled = false;
    const loadUser = async () => {
      if (!userId) return;
      try {
        const u = await getUserById(String(userId));
        if (cancelled || !u) return;

        const norm = (s?: string) => (s ?? "").trim().toLowerCase();
        const firstRole = (u.roles && u.roles.length > 0) ? u.roles[0] : '';
        let mappedRole: string | number = '';
        if (norm(firstRole) === norm(USER_ROLE_MAPPING.ADMIN)) mappedRole = UserRole.Admin_Access;
        else if (norm(firstRole) === norm(USER_ROLE_MAPPING.USER)) mappedRole = UserRole.User_Access;
        else if (firstRole.toLowerCase().includes('admin')) mappedRole = UserRole.Admin_Access;
        else mappedRole = UserRole.User_Access;

        // Update component state with authoritative user values
        setEmail(u.email ?? '');
        setUserRole(mappedRole);
        setUserStatus(typeof u.status === 'number' ? u.status : 0);

        // Ensure blocker initial state is consistent with fetched user
        flushSync(() =>
          setInitialState((cur) => ({
            ...cur,
            email: u.email ?? cur.email,
            userRole: mappedRole ?? cur.userRole,
            userStatus: typeof u.status === 'number' ? u.status : cur.userStatus,
          }))
        );
      } catch (e) {
        // ignore — keep seller-provided values
      }
    };

    loadUser();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const showNotification = (message: string, severity: "success" | "warning") => {
    setNavigationNotice(message);
    setNotificationSeverity(severity);
    setIsSnackbarOpen(true);
  };

  useBlocker({
    shouldBlockFn: () => {
      if (!hasUnsavedChanges) return false;
      showNotification("Έχετε μη αποθηκευμένες αλλαγές. Αποθηκεύστε ή ακυρώστε για να συνεχίσετε.", "warning");
      return true;
    },
    enableBeforeUnload: hasUnsavedChanges,
  });

  const handleBackToList = () => {
    if (hasUnsavedChanges) {
      showNotification("Έχετε μη αποθηκευμένες αλλαγές. Αποθηκεύστε ή ακυρώστε για να συνεχίσετε.", "warning");
      return;
    }

    navigate({ to: "/admin/sellers" });
  };

  const handleTabChange = (_event: SyntheticEvent, nextTab: number) => {
    if (hasUnsavedChanges) {
      showNotification("Υπάρχουν μη αποθηκευμένες αλλαγές. Η αλλαγή καρτέλας δεν επιτρέπεται.", "warning");
      return;
    }

    setActiveTab(nextTab);
  };

  const handleCancel = () => {
    setFirstName(initialState.firstName);
    setLastName(initialState.lastName);
    setAfm(initialState.afm);
    setPhone(initialState.phone);
    setAddress(initialState.address);
    setSellerType(initialState.sellerType);
    setIsActive(initialState.isActive);
    setLicenseNumber(initialState.licenseNumber);
    setLicenseIssuedAt(initialState.licenseIssuedAt);
    setLicenseExpiresAt(initialState.licenseExpiresAt);
    setIsSeasonal(Boolean((initialState as any).isSeasonal));
    setSeasonalFromDate((initialState as any).seasonalFromDate ?? "");
    setSeasonalToDate((initialState as any).seasonalToDate ?? "");
    setUserId(initialState.userId ?? null);
    setCreatedAt(initialState.createdAt ?? "");
    setEmail(initialState.email ?? "");
    setUserRole(initialState.userRole ?? "");
    setUserStatus(initialState.userStatus ?? 0);
    setNavigationNotice("");
    setIsSnackbarOpen(false);
  };

  const handleSave = async () => {
    try {
      // If there's an associated user, update the user first
      if (userId) {
        await updateUser(String(userId), {
          firstName: firstName || "",
          lastName: lastName || "",
          status: Number(userStatus) || 0,
        });
      }

      // Then update the seller record (seller + license)
      await updateSeller(sellerId, {
        seller: {
          phone: phone || null,
          address: address || null,
        },
        license: isSeasonal
          ? {
              fromDate: seasonalFromDate || null,
              sellerType: Number(sellerType) || 0,
              isSeasonal: true,
              seasonalFromDate: seasonalFromDate || null,
              seasonalToDate: seasonalToDate || null,
              licenseCategory: 0,
              licenseStatus: 1,
              licenseNumber: licenseNumber,
              licenseExpiry: seasonalToDate || null,
              notes: null,
            }
          : {
              fromDate: licenseIssuedAt || null,
              sellerType: Number(sellerType) || 0,
              isSeasonal: false,
              seasonalFromDate: null,
              seasonalToDate: null,
              licenseCategory: 0,
              licenseStatus: 1,
              licenseNumber: licenseNumber,
              licenseExpiry: licenseExpiresAt || null,
              notes: null,
            },
      });

      // Ensure initialState is updated synchronously so the blocker sees no unsaved changes
      flushSync(() => setInitialState(currentState));

      // Invalidate seller-related queries so UI shows fresh data
      try {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: sellerKeys.detail(sellerId) }),
          queryClient.invalidateQueries({ queryKey: sellerKeys.markets(sellerId) }),
          queryClient.invalidateQueries({ queryKey: sellerKeys.all }),
        ]);
      } catch (e) {
        // ignore invalidation errors
      }

      const successMessage = "Οι αλλαγές αποθηκεύτηκαν.";
      // Persist a short-lived auth notification so the list page can show it after redirect
      setAuthNotification({ type: 'success', message: successMessage });

      showNotification(successMessage, "success");
      navigate({ to: "/admin/sellers" });
    } catch (err: any) {
      const msg = err?.message ?? "Η αποθήκευση απέτυχε.";
      showNotification(msg, "warning");
    }
  };

  const handleSnackbarClose = (_event?: Event | SyntheticEvent, reason?: string) => {
    if (reason === "clickaway") return;
    setIsSnackbarOpen(false);
  };

  if (!sellerId) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 text-(--color-text-heading)">
        <h1 className="text-2xl font-semibold">Στοιχεία πωλητή</h1>
        <p className="text-sm text-(--color-text-muted)">Δεν βρέθηκε έγκυρο αναγνωριστικό πωλητή.</p>
        <CustomButton
          title="Επιστροφή στη λίστα πωλητών"
          onClick={handleBackToList}
          width="fit-content"
          backgroundColor="var(--color-text-muted)"
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 text-(--color-text-heading)">
        <h1 className="text-2xl font-semibold">Στοιχεία πωλητή</h1>
        <p className="text-sm text-(--color-text-muted)">Φόρτωση στοιχείων πωλητή...</p>
      </div>
    );
  }

  if (isError || !seller) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-(--color-danger-border) bg-danger-subtle p-6 text-(--color-text-heading)">
        <h1 className="text-2xl font-semibold">Στοιχεία πωλητή</h1>
        <p className="text-sm text-(--color-danger)">{error?.message ?? "Η φόρτωση των στοιχείων πωλητή απέτυχε."}</p>
        <CustomButton
          title="Επιστροφή στη λίστα πωλητών"
          onClick={handleBackToList}
          width="fit-content"
          backgroundColor="var(--color-text-muted)"
        />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-6 text-left overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold text-(--color-text-heading)">Πωλητής</h2>
          <h3 className="text-lg text-(--color-text-heading)">
            {seller.fullName ? seller.fullName : `${firstName} ${lastName}`}
          </h3>
        </div>
        <CustomButton
          title="Επιστροφή στη λίστα πωλητών"
          backgroundColor="var(--color-text-muted)"
          width="fit-content"
          onClick={handleBackToList}
        />
      </div>

      <Box className="w-full self-start">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          textColor="inherit"
          sx={{ width: "100%" }}
        >
          <Tab label="Στοιχεία πωλητή" />
          <Tab label={`Συμμετοχή σε αγορές (${connectedMarkets.length})`} />
        </Tabs>
      </Box>

      <div className="flex-1 overflow-y-auto pr-2 max-h-[calc(100svh-300px)]">
        <div className="flex flex-col gap-6 pt-2">
        
          {activeTab === 0 ? (
            <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <CustomInputField
                type="TEXT"
                label="Όνομα"
                value={firstName}
                onChange={(value) => setFirstName(String(value))}
                width="100%"
              />
              <CustomInputField
                type="TEXT"
                label="Επώνυμο"
                value={lastName}
                onChange={(value) => setLastName(String(value))}
                width="100%"
              />
              <CustomInputField
                type="DROPDOWN"
                label="Τύπος Πωλητή"
                value={sellerType}
                onChange={(value) => setSellerType(String(value))}
                width="100%"
                dropdownItems={[{ label: '-- Επιλέξτε --', value: '' }, ...Object.entries(SELLER_TYPE_LABELS).map(([k, v]) => ({ label: v, value: String(k) }))]}
              />
              <CustomInputField
                type="TEXT"
                label="ΑΦΜ"
                value={afm}
                onChange={(value) => setAfm(String(value))}
                width="100%"
              />
              <CustomInputField
                type="TEXT"
                label="Email"
                value={email}
                onChange={(value) => setEmail(String(value))}
                disabled={true}
                width="100%"
              />
              <CustomInputField
                type="TEXT"
                label="Τηλέφωνο"
                value={phone}
                onChange={(value) => setPhone(String(value))}
                width="100%"
              />
              <CustomInputField
                type="TEXT"
                label="Διεύθυνση"
                value={address}
                onChange={(value) => setAddress(String(value))}
                width="100%"
              />
              <CustomInputField
                type="DROPDOWN"
                label="Ρόλος χρήστη"
                value={String(userRole)}
                onChange={(value) => setUserRole(value)}
                width="100%"
                dropdownItems={Object.entries(UserRoleLabels).map(([k, v]) => ({ label: v, value: String(k) }))}
              />
              <CustomInputField
                type="DROPDOWN"
                label="Κατάσταση χρήστη"
                value={String(userStatus)}
                onChange={(value) => setUserStatus(value)}
                width="100%"
                dropdownItems={Object.entries(UserStatusLabels).map(([k, v]) => ({ label: v, value: String(k) }))}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-(--color-text-heading)">Άδεια</h3>
                <FormControlLabel
                  className="font-medium"
                  control={<Checkbox checked={isSeasonal} onChange={(e) => setIsSeasonal(Boolean(e.target.checked))} />}
                  label="Περιορισμένης διάρκειας"
                />
              </div>
              <div className="flex flex-row items-start gap-4 justify-center">
                <CustomInputField
                  type="TEXT"
                  label="Αριθμός"
                  value={licenseNumber}
                  onChange={(value) => setLicenseNumber(String(value))}
                  validation={{ required: true }}
                  width="100%"
                />
                <CustomInputField
                  type="DATE"
                    label="Από"
                    value={isSeasonal ? seasonalFromDate : licenseIssuedAt}
                    onChange={(value) => isSeasonal ? setSeasonalFromDate(String(value)) : setLicenseIssuedAt(String(value))}
                    validation={{ required: true }}
                  width="100%"
                />
                <CustomInputField
                  type="DATE"
                    label="Έως"
                    value={isSeasonal ? seasonalToDate : licenseExpiresAt}
                    onChange={(value) => isSeasonal ? setSeasonalToDate(String(value)) : setLicenseExpiresAt(String(value))}
                    validation={{ required: true }}
                  width="100%"
                />
                            {/* <div className="mt-4">
                              <CustomButton
                                title="Νέα άδεια"
                                onClick={handleAddLicense}
                                width="fit-content"
                                sx={{
                                  px: 3,
                                  minHeight: 32,
                                }}
                                disabled={isAddingLicense}
                              />
                            </div> */}
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              {hasUnsavedChanges && (
                <>
                  <CustomButton
                    title="Ακύρωση"
                    backgroundColor="transparent"
                    onClick={handleCancel}
                    width="fit-content"
                    sx={{
                      px: 3,
                      minHeight: 32,
                      color: "var(--color-dark)",
                      border: "1px solid var(--color-text-muted)",
                      "&:hover": {
                        backgroundColor: "transparent",
                        borderColor: "var(--color-text-muted)",
                        filter: "none",
                      },
                    }}
                  />
                  <CustomButton
                    title="Αποθήκευση"
                    onClick={handleSave}
                    width="fit-content"
                    sx={{ px: 4, minHeight: 32 }}
                    disabled={isSaveDisabled}
                  />
                </>
              )}
            </div>
          </div>
        ) : (
          <DataTable<ConnectedMarket>
            rows={connectedMarkets}
            columns={connectedMarketsColumns}
            rowKey="id"
            showFilter={false}
            onRowClick={handleConnectedMarketClick}
          />
        )}
        </div>
      </div>

      <Snackbar
        open={isSnackbarOpen && Boolean(navigationNotice)}
        autoHideDuration={4500}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={notificationSeverity} variant="filled" sx={{ width: "100%" }}>
          {navigationNotice}
        </Alert>
      </Snackbar>
    </div>
  );
}
