import { Alert, Box, Snackbar, Tab, Tabs } from "@mui/material";
import { useEffect, useMemo, useState, type SyntheticEvent } from "react";
import { useBlocker, useNavigate, useParams } from "@tanstack/react-router";
import CustomButton from "../../../shared/components/CustomButton";
import AddSellerModal from "../../../components/markets/AddSellerModal";
import MarketForm from "../../../components/markets/MarketForm";
import type { Market, MarketFormValues } from "../../../models/market";
import {
  useAddMarketSellerMutation,
  useAddMarketSupervisorMutation,
  useMarketQuery,
  useRemoveMarketSellerMutation,
} from "../../../queries/marketQueries";
import ConnectedSellersTable from "../../../components/markets/ConnectedSellersTable";
import { useSellersQuery } from "../../../queries/sellerQueries";

const EMPTY_FORM_VALUES: MarketFormValues = {
  name: "",
  marketType: 1,
  address: "",
  operatingDays: [],
  availableSlots: 0,
  occupiedSpots: 0,
  supervisors: [],
  area: "",
};

const DAY_NUMBER_TO_NAME: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

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

function readString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function readBoolean(record: Record<string, unknown>, keys: string[]): boolean | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") {
      return value;
    }
  }

  return null;
}

function resolveOccupiedSpots(market: Market): number {
  const marketRecord = asRecord(market);
  if (marketRecord) {
    const explicitOccupiedSpots = readNumber(marketRecord, [
      "occupiedSpots",
      "occupied_spots",
      "occupiedSlots",
      "occupied_slots",
    ]);

    if (explicitOccupiedSpots !== null) {
      return explicitOccupiedSpots;
    }
  }

  return Array.isArray(market.marketSellers) ? market.marketSellers.length : 0;
}

function hasActiveLicense(seller: unknown): boolean {
  const sellerRecord = asRecord(seller);
  if (!sellerRecord) return false;

  const nestedLicenseRecord =
    asRecord(sellerRecord.license) ??
    asRecord(sellerRecord.sellerLicense) ??
    asRecord(sellerRecord.permit);

  const explicitLicenseStatus =
    readString(sellerRecord, ["licenseStatus", "permitStatus", "permitState"]) ||
    (nestedLicenseRecord
      ? readString(nestedLicenseRecord, ["licenseStatus", "permitStatus", "permitState", "status"])
      : "");

  if (explicitLicenseStatus) {
    const normalizedStatus = explicitLicenseStatus.toLowerCase();
    if (normalizedStatus.includes("active") || normalizedStatus.includes("ενεργ")) {
      return true;
    }

    if (
      normalizedStatus.includes("pending") ||
      normalizedStatus.includes("expired") ||
      normalizedStatus.includes("revoked") ||
      normalizedStatus.includes("inactive") ||
      normalizedStatus.includes("εκκρε") ||
      normalizedStatus.includes("ληξ") ||
      normalizedStatus.includes("ανακλ") ||
      normalizedStatus.includes("ανενεργ")
    ) {
      return false;
    }
  }

  const explicitLicenseFlag =
    readBoolean(sellerRecord, ["isLicenseActive", "licenseIsActive", "hasActiveLicense"]) ??
    (nestedLicenseRecord
      ? readBoolean(nestedLicenseRecord, ["isLicenseActive", "licenseIsActive", "hasActiveLicense"])
      : null);
  if (explicitLicenseFlag !== null) {
    return explicitLicenseFlag;
  }

  // Fallback for payloads that expose only a generic active flag.
  return readBoolean(sellerRecord, ["isActive", "active"]) === true;
}

function extractConnectedSellerId(entry: unknown): number | null {
  const record = asRecord(entry);
  if (!record) return null;

  const nestedSellerRecord =
    asRecord(record.seller) ??
    asRecord(record.sellerInfo) ??
    asRecord(record.sellerDetails) ??
    asRecord(record.user);

  const explicitSellerId =
    readNumber(record, ["sellerId"]) ??
    (nestedSellerRecord ? readNumber(nestedSellerRecord, ["sellerId", "id"]) : null);
  if (explicitSellerId !== null) return explicitSellerId;

  // Fallback to top-level id only when the shape looks like a seller entity.
  const looksLikeSellerEntity =
    typeof record.firstName === "string" ||
    typeof record.lastName === "string" ||
    typeof record.afm === "string" ||
    record.sellerType !== undefined;

  if (!looksLikeSellerEntity) return null;

  return readNumber(record, ["id"]);
}

function mapMarketToFormValues(market: Market): MarketFormValues {
  const supervisors = (market.supervisors ?? [])
    .map((supervisor) => supervisor.userId)
    .filter((userId): userId is string => Boolean(userId));

  const operatingDays = market.schedules
    .filter((schedule) => !schedule.isCancelled)
    .map((schedule) => ({
      day: DAY_NUMBER_TO_NAME[schedule.day] ?? "",
      openTime: market.openTime?.slice(0, 5) ?? "",
      closeTime: market.closeTime?.slice(0, 5) ?? "",
    }))
    .filter((entry) => entry.day);

  const availableSlots = market.totalSpots ?? 0;
  const occupiedSpots = resolveOccupiedSpots(market);

  return {
    name: market.name,
    marketType: market.marketType === 2 ? 2 : 1,
    address: market.address,
    operatingDays,
    availableSlots,
    occupiedSpots,
    supervisors,
    area: "",
  };
}

export default function AdminMarketDetailPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const marketId = typeof params.marketId === "string" ? params.marketId : "";
  const { data: market, isLoading, isError, error } = useMarketQuery(marketId);
  const addMarketSellerMutation = useAddMarketSellerMutation(marketId);
  const removeMarketSellerMutation = useRemoveMarketSellerMutation(marketId);
  const addMarketSupervisorMutation = useAddMarketSupervisorMutation(marketId);
  const { data: sellersQueryResults } = useSellersQuery({
    name: "",
    afm: "",
    sellerType: 1,
    page: 1,
    pageSize: 5000,
  });
  const [activeTab, setActiveTab] = useState(0);
  const [formValues, setFormValues] = useState<MarketFormValues>(EMPTY_FORM_VALUES);
  const [initialFormValues, setInitialFormValues] = useState<MarketFormValues>(EMPTY_FORM_VALUES);
  const [connectedSellers, setConnectedSellers] = useState<unknown[]>([]);
  const [isAddSellerModalOpen, setIsAddSellerModalOpen] = useState(false);
  const [navigationNotice, setNavigationNotice] = useState("");
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const connectedSellersCount = connectedSellers.length;
  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(formValues) !== JSON.stringify(initialFormValues),
    [formValues, initialFormValues]
  );

  const connectedSellerIds = useMemo(
    () =>
      new Set(
        connectedSellers
          .map(extractConnectedSellerId)
          .filter((sellerId): sellerId is number => Number.isFinite(sellerId))
      ),
    [connectedSellers]
  );

  const availableSellerOptions = useMemo(
    () =>
      (sellersQueryResults?.items ?? [])
        .filter((seller) => hasActiveLicense(seller))
        .filter((seller) => !connectedSellerIds.has(seller.id))
        .map((seller) => ({
          label: `${seller.firstName} ${seller.lastName}`.trim() || `Πωλητής #${seller.id}`,
          value: String(seller.id),
        })),
    [connectedSellerIds, sellersQueryResults?.items]
  );


  const showNavigationNotice = (message: string) => {
    setNavigationNotice(message);
    setIsSnackbarOpen(true);
  };

  useBlocker({
    shouldBlockFn: () => {
      if (!hasUnsavedChanges) return false;
      showNavigationNotice("Έχετε μη αποθηκευμένες αλλαγές. Αποθηκεύστε ή ακυρώστε για να συνεχίσετε.");
      return true;
    },
    enableBeforeUnload: hasUnsavedChanges,
  });

  const handleBackToList = () => {
    if (hasUnsavedChanges) {
      showNavigationNotice("Έχετε μη αποθηκευμένες αλλαγές. Αποθηκεύστε ή ακυρώστε για να συνεχίσετε.");
      return;
    }

    navigate({ to: "/admin/markets" });
  };

  const handleTabChange = (_event: SyntheticEvent, nextTab: number) => {
    if (hasUnsavedChanges) {
      showNavigationNotice("Υπάρχουν μη αποθηκευμένες αλλαγές. Η αλλαγή καρτέλας δεν επιτρέπεται.");
      return;
    }

    setActiveTab(nextTab);
  };

  useEffect(() => {
    if (!market) return;
    const mappedValues = mapMarketToFormValues(market);
    setFormValues(mappedValues);
    setInitialFormValues(mappedValues);
    setConnectedSellers(market.marketSellers ?? []);
    setIsAddSellerModalOpen(false);
  }, [market]);

  useEffect(() => {
    if (!hasUnsavedChanges) {
      setNavigationNotice("");
      setIsSnackbarOpen(false);
    }
  }, [hasUnsavedChanges]);

  const handleSnackbarClose = (_event?: Event | SyntheticEvent, reason?: string) => {
    if (reason === "clickaway") return;
    setIsSnackbarOpen(false);
  };

  const handleCancel = () => {
    setFormValues(initialFormValues);
    setNavigationNotice("");
    setIsSnackbarOpen(false);
  };

  const handleSubmit = (values: MarketFormValues) => {
    // Check if supervisors have changed
    const initialSupervisors = new Set(initialFormValues.supervisors || []);
    const newSupervisors = new Set(values.supervisors || []);
    
    // Find newly added supervisors
    const addedSupervisors = Array.from(newSupervisors).filter(
      (supervisor) => !initialSupervisors.has(supervisor)
    );

    // Call mutation for each newly added supervisor
    if (addedSupervisors.length > 0) {
      for (const userId of addedSupervisors) {
        addMarketSupervisorMutation.mutate(userId);
      }
    }

    // TODO: wire update market mutation once backend endpoint is available
    setInitialFormValues(values);
    setNavigationNotice("");
    setIsSnackbarOpen(false);
  };

  const handleCloseAddSellerModal = () => {
    setIsAddSellerModalOpen(false);
  };

  const handleSaveSellerFromModal = ({
    sellerId,
    spotNumber,
    spotLength,
  }: {
    sellerId: number;
    spotNumber: number;
    spotLength: number;
  }) => {
    if (!marketId || addMarketSellerMutation.isPending) return;

    const sellerToAdd = sellersQueryResults?.items.find((seller) => seller.id === sellerId);
    if (!sellerToAdd) return;

    addMarketSellerMutation.mutate(
      { sellerId, spotNumber, spotLength },
      {
        onSuccess: () => {
          setConnectedSellers((currentSellers) => [
            ...currentSellers,
            {
              ...sellerToAdd,
              sellerId: sellerToAdd.id,
              spotNumber,
              spotLength,
            },
          ]);

          handleCloseAddSellerModal();
        },
        onError: (mutationError) => {
          showNavigationNotice(mutationError.message || "Η σύνδεση πωλητή απέτυχε.");
        },
      }
    );
  };

  const handleRemoveSeller = (sellerId: number) => {
    if (!marketId || removeMarketSellerMutation.isPending) return;

    removeMarketSellerMutation.mutate(sellerId, {
      onSuccess: () => {
        setConnectedSellers((currentSellers) =>
          currentSellers.filter((seller) => extractConnectedSellerId(seller) !== sellerId)
        );
      },
      onError: (mutationError) => {
        showNavigationNotice(mutationError.message || "Η διαγραφή πωλητή απέτυχε.");
      },
    });
  };

  if (!marketId) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 text-(--color-text-heading)">
        <h1 className="text-2xl font-semibold">Στοιχεία αγοράς</h1>
        <p className="text-sm text-(--color-text-muted)">Δεν βρέθηκε έγκυρο αναγνωριστικό αγοράς.</p>
        <CustomButton
          title="Επιστροφή στη λίστα αγορών"
          backgroundColor="var(--color-text-muted)"
          width="fit-content"
          onClick={handleBackToList}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 text-(--color-text-heading)">
        <h1 className="text-2xl font-semibold">Στοιχεία αγοράς</h1>
        <p className="text-sm text-(--color-text-muted)">Φόρτωση στοιχείων αγοράς...</p>
      </div>
    );
  }

  if (isError || !market) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-(--color-danger-border) bg-danger-subtle p-6 text-(--color-text-heading)">
        <h6 className="text-sm font-semibold text-(--color-text-heading)">Επεξεργασία Αγοράς</h6>
        <p className="text-sm text-(--color-danger)">{error?.message ?? "Η φόρτωση των στοιχείων αγοράς απέτυχε."}</p>
        <CustomButton
          title="Επιστροφή στη λίστα αγορών"
          backgroundColor="var(--color-text-muted)"
          width="fit-content"
          onClick={handleBackToList}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-6 text-left">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-(--color-text-heading)">Επεξεργασία Αγοράς</h2>
        <CustomButton
          title="Επιστροφή στη λίστα αγορών"
          backgroundColor="var(--color-text-muted)"
          width="fit-content"
          onClick={handleBackToList}
        />
      </div>

      <Box className="">
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
          <Tab label="Στοιχεία αγοράς" />
          <Tab label={`Συμμετέχοντες πωλητές (${connectedSellersCount})`} />
        </Tabs>

        {activeTab === 0 ? (
          <MarketForm
            mode="edit"
            values={formValues}
            onChange={setFormValues}
            onSubmit={hasUnsavedChanges ? handleSubmit : undefined}
            onCancel={hasUnsavedChanges ? handleCancel : undefined}
            submitLabel="Αποθήκευση"
          />
        ) : (
          <div className="flex flex-col gap-4">
            {/* <div className="flex bg-(--color-surface) p-4">
              <CustomButton
                title="Προσθήκη πωλητή"
                prefixIcon={<AddIcon />}
                width="fit-content"
                disabled={availableSellerOptions.length === 0}
                onClick={handleOpenAddSellerModal}
              />
            </div> */}

            <ConnectedSellersTable sellers={connectedSellers} onRemoveSeller={handleRemoveSeller} />

            <AddSellerModal
              open={isAddSellerModalOpen}
              onClose={handleCloseAddSellerModal}
              onSave={handleSaveSellerFromModal}
              sellerOptions={availableSellerOptions}
            />
          </div>
        )}
      </Box>

      <Snackbar
        open={isSnackbarOpen && Boolean(navigationNotice)}
        autoHideDuration={4500}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity="warning" variant="filled" sx={{ width: "100%" }}>
          {navigationNotice}
        </Alert>
      </Snackbar>
    </div>
  );
}
