import { useEffect, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import CustomButton from "../../../shared/components/CustomButton";
import MarketForm from "./MarketForm";
import type { Market, MarketFormMode, MarketFormValues } from "../../../models/market";
import { useMarketQuery } from "../../../queries/marketQueries";

const EMPTY_FORM_VALUES: MarketFormValues = {
  name: "",
  marketType: 1,
  address: "",
  operatingDays: [],
  availableSlots: 0,
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
  const operatingDays = market.schedules
    .filter((schedule) => !schedule.isCancelled)
    .map((schedule) => ({
      day: DAY_NUMBER_TO_NAME[schedule.day] ?? "",
      openTime: market.openTime?.slice(0, 5) ?? "",
      closeTime: market.closeTime?.slice(0, 5) ?? "",
    }))
    .filter((entry) => entry.day);

  const availableSlots = Math.max((market.totalSpots ?? 0) - (market.occupiedSpots ?? 0), 0);

  return {
    name: market.name,
    marketType: market.marketType === 2 ? 2 : 1,
    address: market.address,
    operatingDays,
    availableSlots,
    supervisors: [],
    area: "",
  };
}

export default function AdminMarketDetailPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const marketId = typeof params.marketId === "string" ? params.marketId : "";
  const { data: market, isLoading, isError, error } = useMarketQuery(marketId);
  const [mode, setMode] = useState<MarketFormMode>("edit");
  const [formValues, setFormValues] = useState<MarketFormValues>(EMPTY_FORM_VALUES);

  const handleBackToList = () => {
    navigate({ to: "/admin/markets" });
  };

  useEffect(() => {
    if (!market) return;
    setFormValues(mapMarketToFormValues(market));
    setMode("edit");
  }, [market]);

  const handleCancel = () => {
    if (mode === "edit" && market) {
      setFormValues(mapMarketToFormValues(market));
      setMode("view");
      return;
    }
  };

  const handleSubmit = (values: MarketFormValues) => {
    // TODO: wire update market mutation once backend endpoint is available
    console.log("Update market submit", { marketId, values });
    setMode("view");
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
        <h1 className="text-2xl font-semibold">Στοιχεία αγοράς</h1>
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
        <CustomButton
          title="Επιστροφή στη λίστα αγορών"
          backgroundColor="var(--color-text-muted)"
          width="fit-content"
          onClick={handleBackToList}
        />

        {/* <div className="flex items-center gap-3">
          {mode === "view" ? (
            <CustomButton title="Επεξεργασία" onClick={() => setMode("edit")} width={140} />
          ) : (
            <CustomButton
              title="Προβολή"
              onClick={() => {
                setFormValues(mapMarketToFormValues(market));
                setMode("view");
              }}
              backgroundColor="var(--color-text-muted)"
              width={120}
            />
          )}
        </div> */}
      </div>

      <MarketForm
        mode={mode}
        values={formValues}
        onChange={setFormValues}
        onSubmit={mode === "edit" ? handleSubmit : undefined}
        onCancel={mode === "edit" ? handleCancel : undefined}
        submitLabel="Αποθήκευση"
      />
    </div>
  );
}
