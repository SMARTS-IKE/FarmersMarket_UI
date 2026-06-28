import { Alert, Box, Snackbar, Tab, Tabs } from "@mui/material";
import { useEffect, useMemo, useState, type SyntheticEvent } from "react";
import { useBlocker, useNavigate, useParams } from "@tanstack/react-router";
import type { ConnectedMarket } from "../../../models/market";
import DataTable, { type ColumnDef } from "../../../shared/components/DataTable";
import CustomButton from "../../../shared/components/CustomButton";
import CustomInputField from "../../../shared/components/CustomInputField";
import { useSellerQuery, useSellerMarketsQuery } from "../../../queries/sellerQueries";
import { SELLER_TYPE_LABELS } from "../../../components/sellers/sellers.utils";

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
  const [userId, setUserId] = useState<number | null>(null);
  const [createdAt, setCreatedAt] = useState("");
  const [sellerType, setSellerType] = useState<string>("0");
  const [isActive, setIsActive] = useState(false);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseIssuedAt, setLicenseIssuedAt] = useState("");
  const [licenseExpiresAt, setLicenseExpiresAt] = useState("");
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
    userId: null,
    createdAt: "",
  });
  const [navigationNotice, setNavigationNotice] = useState("");
  const [notificationSeverity, setNotificationSeverity] = useState<"success" | "warning">("warning");
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

  const { data: seller, isLoading, isError, error } = useSellerQuery(sellerId);
  const { data: connectedMarketsResults } = useSellerMarketsQuery(sellerId);

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
      licenseNumber,
      licenseIssuedAt,
      licenseExpiresAt,
      userId,
      createdAt,
    }),
    [firstName, lastName, afm, phone, address, sellerType, isActive, licenseNumber, licenseIssuedAt, licenseExpiresAt, userId, createdAt]
  );
  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(currentState) !== JSON.stringify(initialState),
    [currentState, initialState]
  );

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
      licenseIssuedAt: cl?.fromDate ?? cl?.seasonalFromDate ?? "",
      licenseExpiresAt: cl?.licenseExpiry ?? cl?.expiresAt ?? cl?.toDate ?? cl?.seasonalToDate ?? "",
      userId: typeof seller.userId === 'number' ? seller.userId : null,
      createdAt: seller.createdAt ?? "",
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
    setUserId(mappedState.userId ?? null);
    setCreatedAt(mappedState.createdAt ?? "");
    setInitialState(mappedState);
    setNavigationNotice("");
    setIsSnackbarOpen(false);
  }, [seller]);

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
    setUserId(initialState.userId ?? null);
    setCreatedAt(initialState.createdAt ?? "");
    setNavigationNotice("");
    setIsSnackbarOpen(false);
  };

  const handleSave = () => {
    // TODO: wire update seller mutation when backend endpoint is available.
    setInitialState(currentState);
    showNotification("Οι αλλαγές αποθηκεύτηκαν.", "success");
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
      <div className="flex flex-wrap items-center justify-between gap-3">
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
            <div className="flex flex-col gap-6">
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
            </div>

            <div className="pt-6">
              <h3 className="mb-4 text-lg font-semibold text-(--color-text-heading)">Άδεια</h3>
              <div className="flex flex-row items-start gap-4 justify-center">
                <CustomInputField
                  type="TEXT"
                  label="Αριθμός"
                  value={licenseNumber}
                  onChange={(value) => setLicenseNumber(String(value))}
                  width="100%"
                />
                <CustomInputField
                  type="DATE"
                  label="Ημερομηνία Έκδοσης"
                  value={licenseIssuedAt}
                  onChange={(value) => setLicenseIssuedAt(String(value))}
                  width="100%"
                />
                <CustomInputField
                  type="DATE"
                  label="Ημερομηνία Λήξης"
                  value={licenseExpiresAt}
                  onChange={(value) => setLicenseExpiresAt(String(value))}
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
