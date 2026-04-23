import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import CustomButton from "../../../shared/components/CustomButton";
import MarketForm from "./MarketForm";
import type { MarketFormMode, MarketFormValues } from "../../../models/market";
import { useMarketQuery } from "../../../queries/marketQueries";

const EMPTY_FORM_VALUES: MarketFormValues = {
  name: "",
  marketType: 1,
  address: "",
  operatingDays: [],
};

function mapMarketToFormValues(market: {
  name: string;
  marketType: number;
  address: string;
  openTime: string;
  closeTime: string;
  operatingDays: string;
}): MarketFormValues {
  const days = market.operatingDays
    ? market.operatingDays.split(",").map((day) => day.trim()).filter(Boolean)
    : [];

  return {
    name: market.name,
    marketType: market.marketType === 2 ? 2 : 1,
    address: market.address,
    operatingDays: days.map((day) => ({
      day,
      openTime: market.openTime || "",
      closeTime: market.closeTime || "",
    })),
  };
}

export default function AdminMarketDetailPage() {
  const params = useParams({ strict: false });
  const marketId = typeof params.marketId === "string" ? params.marketId : "";
  const { data: market, isLoading, isError, error } = useMarketQuery(marketId);
  const [mode, setMode] = useState<MarketFormMode>("view");
  const [formValues, setFormValues] = useState<MarketFormValues>(EMPTY_FORM_VALUES);

  useEffect(() => {
    if (!market) return;
    setFormValues(mapMarketToFormValues(market));
    setMode("view");
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
        <Link to="/admin/markets" className="text-sm font-medium text-(--color-primary)">
          Επιστροφή στη λίστα αγορών
        </Link>
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
        <Link to="/admin/markets" className="text-sm font-medium text-(--color-primary)">
          Επιστροφή στη λίστα αγορών
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-6 text-left">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/admin/markets" className="text-sm font-medium text-(--color-primary)">
          Επιστροφή στη λίστα αγορών
        </Link>

        <div className="flex items-center gap-3">
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
        </div>
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
