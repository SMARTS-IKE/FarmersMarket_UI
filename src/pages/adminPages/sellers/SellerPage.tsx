import { Alert, Box, Snackbar, Tab, Tabs } from "@mui/material";
import { useEffect, useMemo, useState, type SyntheticEvent } from "react";
import { useBlocker, useNavigate, useParams } from "@tanstack/react-router";
import type { Market, MarketSearchRequest } from "../../../models/market";
import DataTable, { type ColumnDef } from "../../../shared/components/DataTable";
import CustomButton from "../../../shared/components/CustomButton";
import CustomInputField from "../../../shared/components/CustomInputField";
import { useMarketsQuery } from "../../../queries/marketQueries";
import { useSellerQuery } from "../../../queries/sellerQueries";
import { SELLER_TYPE_LABELS } from "../../../components/sellers/sellers.utils";
import { marketTypeLabel } from "../../../components/markets/market.utils";

const ALL_MARKETS_FILTERS: MarketSearchRequest = {
  name: "",
  marketType: "",
  operatingDays: [],
  page: 1,
  pageSize: 5000,
};

const connectedMarketsColumns: ColumnDef<Market>[] = [
  { key: "name", label: "Όνομα Αγοράς" },
  { key: "marketType", label: "Τύπος Αγοράς", render: (row) => marketTypeLabel(row.marketType) },
  { key: "address", label: "Διεύθυνση" },
  { key: "totalSpots", label: "Σύνολο Θέσεων" },
  { key: "occupiedSpots", label: "Δεσμευμένες Θέσεις" },
];

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

export default function SellerPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const sellerId = typeof params.sellerId === "string" ? params.sellerId : "";
  const [activeTab, setActiveTab] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [afm, setAfm] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [sellerType, setSellerType] = useState<string>("0");
  const [isActive, setIsActive] = useState(false);
  const [initialState, setInitialState] = useState({
    firstName: "",
    lastName: "",
    afm: "",
    email: "",
    phone: "",
    address: "",
    sellerType: "",
    isActive: false,
  });
  const [navigationNotice, setNavigationNotice] = useState("");
  const [notificationSeverity, setNotificationSeverity] = useState<"success" | "warning">("warning");
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

  const { data: seller, isLoading, isError, error } = useSellerQuery(sellerId);
  const { data: marketsQueryResults } = useMarketsQuery(ALL_MARKETS_FILTERS);

  const connectedMarkets = useMemo(() => {
    if (!seller) return [];

    return (marketsQueryResults?.items ?? []).filter((market) =>
      getMarketSellers(market).some((marketSeller) => extractSellerId(marketSeller) === seller.id)
    );
  }, [marketsQueryResults?.items, seller]);

  const currentState = useMemo(
    () => ({ firstName, lastName, afm, email, phone, address, sellerType, isActive }),
    [firstName, lastName, afm, email, phone, address, sellerType, isActive]
  );
  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(currentState) !== JSON.stringify(initialState),
    [currentState, initialState]
  );

  useEffect(() => {
    if (!seller) return;

    const mappedState = {
      firstName: seller.firstName ?? "",
      lastName: seller.lastName ?? "",
      afm: seller.afm ?? "",
      email: seller.email ?? "",
      phone: seller.phone ?? "",
      address: seller.address ?? "",
      sellerType: String(seller.sellerType),
      isActive: Boolean(seller.isActive),
    };

    setFirstName(mappedState.firstName);
    setLastName(mappedState.lastName);
    setAfm(mappedState.afm);
    setEmail(mappedState.email);
    setPhone(mappedState.phone);
    setAddress(mappedState.address);
    setSellerType(mappedState.sellerType);
    setIsActive(mappedState.isActive);
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
    setEmail(initialState.email);
    setPhone(initialState.phone);
    setAddress(initialState.address);
    setSellerType(initialState.sellerType);
    setIsActive(initialState.isActive);
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
    <div className="flex h-full w-full flex-col gap-6 text-left">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-(--color-text-heading)">Επεξεργασία Πωλητή</h2>
        <CustomButton
          title="Επιστροφή στη λίστα πωλητών"
          backgroundColor="var(--color-text-muted)"
          width="fit-content"
          onClick={handleBackToList}
        />
      </div>

      <Box>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            marginBottom: 3,
            borderBottom: "1px solid var(--color-border)",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              color: "var(--color-text-muted)",
            },
            "& .MuiTab-root.Mui-selected": {
              color: "var(--color-dark)",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "var(--color-dark)",
            },
          }}
        >
          <Tab label="Στοιχεία πωλητή" />
          <Tab label={`Συνδεδεμένες αγορές (${connectedMarkets.length})`} />
        </Tabs>

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
                dropdownItems={[
                  { label: SELLER_TYPE_LABELS[0] ?? "Παραγωγός", value: "0" },
                  { label: SELLER_TYPE_LABELS[1] ?? "Επαγγελματίας", value: "1" },
                ]}
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
                label="Email"
                value={email}
                onChange={(value) => setEmail(String(value))}
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

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <CustomButton
                  title="Ενεργός"
                  onClick={() => setIsActive(true)}
                  width="100%"
                  backgroundColor={isActive ? "var(--color-dark)" : "rgba(255,255,255,0.85)"}
                  sx={{
                    minHeight: 44,
                    borderRadius: "0.75rem",
                    border: isActive ? "1px solid transparent" : "1px solid var(--color-text-muted)",
                    color: isActive ? "#ffffff" : "var(--color-text-muted)",
                    boxShadow: isActive ? "0 6px 16px rgba(74,63,53,0.18)" : "0 1px 2px rgba(60,40,10,0.08)",
                    "&:hover": {
                      backgroundColor: isActive ? "var(--color-dark)" : "rgba(255,255,255,0.85)",
                      filter: "none",
                    },
                  }}
                />
                <CustomButton
                  title="Ανενεργός"
                  onClick={() => setIsActive(false)}
                  width="100%"
                  backgroundColor={!isActive ? "var(--color-dark)" : "rgba(255,255,255,0.85)"}
                  sx={{
                    minHeight: 44,
                    borderRadius: "0.75rem",
                    border: !isActive ? "1px solid transparent" : "1px solid var(--color-text-muted)",
                    color: !isActive ? "#ffffff" : "var(--color-text-muted)",
                    boxShadow: !isActive ? "0 6px 16px rgba(74,63,53,0.18)" : "0 1px 2px rgba(60,40,10,0.08)",
                    "&:hover": {
                      backgroundColor: !isActive ? "var(--color-dark)" : "rgba(255,255,255,0.85)",
                      filter: "none",
                    },
                  }}
                />
              </div>
              <div className="border-t-3 border-(--color-dark) pt-2 text-center text-sm font-medium text-(--color-text-heading)">
                Κατάσταση
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              {hasUnsavedChanges && (
                <>
                  <CustomButton
                    title="Ακύρωση"
                    backgroundColor="transparent"
                    onClick={handleCancel}
                    width={120}
                    sx={{
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
                    width={140}
                  />
                </>
              )}
            </div>
          </div>
        ) : (
          <DataTable<Market>
            rows={connectedMarkets}
            columns={connectedMarketsColumns}
            rowKey="id"
            showFilter={false}
          />
        )}
      </Box>

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
