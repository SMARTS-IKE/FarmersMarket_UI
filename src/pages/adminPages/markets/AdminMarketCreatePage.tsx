import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { MarketFormValues } from "../../../models/market";
import MarketForm from "./MarketForm";

const EMPTY_FORM_VALUES: MarketFormValues = {
  name: "",
  marketType: 1,
  address: "",
  operatingDays: [],
};

export default function AdminMarketCreatePage() {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState<MarketFormValues>(EMPTY_FORM_VALUES);

  const handleCancel = () => {
    navigate({ to: "/admin/markets" });
  };

  const handleSubmit = (values: MarketFormValues) => {
    // TODO: wire create market mutation once backend endpoint is available
    console.log("Create market submit", values);
    navigate({ to: "/admin/markets" });
  };

  return (
    <div className="flex h-full w-full flex-col gap-6 text-left">
      <MarketForm
        mode="create"
        values={formValues}
        onChange={setFormValues}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitLabel="Δημιουργία"
      />
    </div>
  );
}
