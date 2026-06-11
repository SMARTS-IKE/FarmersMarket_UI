import { Alert, Box, Snackbar } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { MarketFormValues } from "../../../models/market";
import MarketForm from "../../../components/markets/MarketForm";
import { useCreateMarketMutation } from "../../../queries/marketQueries";
import { mapFormValuesToCreatePayload } from "../../../components/markets/market.utils";

const EMPTY_FORM_VALUES: MarketFormValues = {
  name: "",
  marketType: 1,
  address: "",
  operatingDays: [],
  availableSlots: 0,
  occupiedSpots: 0,
  supervisors: [],
  area: "",
  latitude: null,
  longitude: null,
  radius: null,
  areaPoints: [],
};

export default function AdminMarketCreatePage() {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState<MarketFormValues>(EMPTY_FORM_VALUES);
  const createMarketMutation = useCreateMarketMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCancel = () => {
    navigate({ to: "/admin/markets" });
  };

  const handleSubmit = async (values: MarketFormValues) => {
    setErrorMessage(null);
    try {
      const payload = mapFormValuesToCreatePayload(values);
      await createMarketMutation.mutateAsync(payload);
      navigate({ to: "/admin/markets" });
    } catch (error) {
      console.error("Failed to create market:", error);
      setErrorMessage("Αποτυχία δημιουργίας αγοράς. Παρακαλώ δοκιμάστε ξανά.");
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-6 text-left">
       {errorMessage && (
        <Alert severity="error" onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      <MarketForm
        mode="create"
        values={formValues}
        onChange={setFormValues}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitLabel="Δημιουργία"
      />

      <Snackbar
        open={createMarketMutation.isPending}
        message="Δημιουργία αγοράς..."
      />
    </div>
  );
}
