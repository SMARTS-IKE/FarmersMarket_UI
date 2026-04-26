import { Alert, Box, Snackbar, Tab, Tabs } from "@mui/material";
import { useEffect, useMemo, useState, type SyntheticEvent } from "react";
import { useBlocker, useNavigate, useParams } from "@tanstack/react-router";
import CustomButton from "../../../shared/components/CustomButton";
import MarketForm from "../../../components/markets/MarketForm";
import type { Market, MarketFormValues } from "../../../models/market";
import { useMarketQuery } from "../../../queries/marketQueries";
import ConnectedSellersTable from "../../../components/markets/ConnectedSellersTable";

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

function mapMarketToFormValues(market: Market): MarketFormValues {
  console.log(market);
  const operatingDays = market.schedules
    .filter((schedule) => !schedule.isCancelled)
    .map((schedule) => ({
      day: DAY_NUMBER_TO_NAME[schedule.day] ?? "",
      openTime: market.openTime?.slice(0, 5) ?? "",
      closeTime: market.closeTime?.slice(0, 5) ?? "",
    }))
    .filter((entry) => entry.day);

  const availableSlots = market.totalSpots ?? 0;
  const occupiedSpots = market.occupiedSpots ?? 0;

  return {
    name: market.name,
    marketType: market.marketType === 2 ? 2 : 1,
    address: market.address,
    operatingDays,
    availableSlots,
    occupiedSpots,
    supervisors: [],
    area: "",
  };
}

export default function AdminMarketDetailPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const marketId = typeof params.marketId === "string" ? params.marketId : "";
  const { data: market, isLoading, isError, error } = useMarketQuery(marketId);
  const [activeTab, setActiveTab] = useState(0);
  const [formValues, setFormValues] = useState<MarketFormValues>(EMPTY_FORM_VALUES);
  const [initialFormValues, setInitialFormValues] = useState<MarketFormValues>(EMPTY_FORM_VALUES);
  const [navigationNotice, setNavigationNotice] = useState("");
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const connectedSellersCount = market?.sellers?.length ?? 0;
  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(formValues) !== JSON.stringify(initialFormValues),
    [formValues, initialFormValues]
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
    // TODO: wire update market mutation once backend endpoint is available
    setInitialFormValues(values);
    setNavigationNotice("");
    setIsSnackbarOpen(false);
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
            <ConnectedSellersTable sellers={market.sellers ?? []} />
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
