import { Alert } from "@mui/material";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useMemo } from "react";
import CustomButton from "../../../shared/components/CustomButton";
import CustomInputField from "../../../shared/components/CustomInputField";
import type { LicenseCategoryType } from "../../../models/request";
import { useRequestFormsQuery } from "../../../queries/formsQueries";
import { useMarketPeriodDetailQuery } from "../../../queries/requestQueries";

const LICENSE_CATEGORY_OPTIONS: Array<{ label: string; value: LicenseCategoryType }> = [
  { label: "Όλες", value: 0 },
  { label: "Παραγωγοί", value: 1 },
  { label: "Μεταπωλητές", value: 2 },
];

const LOTTERY_OPTIONS = [
  { label: "Ναι", value: "true" },
  { label: "Όχι", value: "false" },
];

function toDateOnly(value: string): string {
  if (!value) return "";

  const dateOnlyMatch = value.match(/^(\d{4}-\d{2}-\d{2})/);
  if (dateOnlyMatch) {
    return dateOnlyMatch[1];
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function UserMarketPeriodDetailsPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const periodId = typeof params.periodId === "string" ? params.periodId : "";
  const marketPeriodDetailQuery = useMarketPeriodDetailQuery(periodId);
  const { data: formsData } = useRequestFormsQuery();

  const formOptions = useMemo(
    () =>
      (formsData?.items ?? []).map((form) => ({
        label: form.title,
        value: form.id,
      })),
    [formsData]
  );

  const handleBack = () => {
    navigate({ to: "/users/requests" });
  };

  if (marketPeriodDetailQuery.isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center text-(--color-text-muted)">
        Φόρτωση στοιχείων περιόδου...
      </div>
    );
  }

  if (marketPeriodDetailQuery.isError || !marketPeriodDetailQuery.data) {
    return (
      <div className="flex h-full w-full flex-col gap-4 text-left">
        <Alert severity="error">
          {marketPeriodDetailQuery.error?.message ?? "Δεν ήταν δυνατή η φόρτωση της περιόδου."}
        </Alert>
        <div>
          <CustomButton
            title="Επιστροφή"
            backgroundColor="var(--color-text-muted)"
            width="fit-content"
            onClick={handleBack}
          />
        </div>
      </div>
    );
  }

  const period = marketPeriodDetailQuery.data;

  return (
    <div className="flex h-full w-full flex-col gap-6 text-left">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Στοιχεία Περιόδου Αιτήσεων</h2>
        <CustomButton
          title="Επιστροφή"
          backgroundColor="var(--color-text-muted)"
          width="fit-content"
          onClick={handleBack}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <CustomInputField
          type="TEXT"
          label="Αγορά"
          value={period.marketName ?? (period.marketId > 0 ? `#${period.marketId}` : "")}
          width="100%"
          disabled
        />

        <CustomInputField
          type="DROPDOWN"
          label="Κατηγορία Άδειας"
          value={period.licenseCategory}
          dropdownItems={LICENSE_CATEGORY_OPTIONS}
          width="100%"
          disabled
        />

        <CustomInputField
          type="TEXT"
          label="Τίτλος"
          value={period.title}
          width="100%"
          disabled
        />

        <CustomInputField
          type="NUMBER"
          label="Διαθέσιμες Θέσεις"
          value={period.availableSpots}
          width="100%"
          disabled
        />

        <div className="md:col-span-2">
          <CustomInputField
            type="TEXTAREA"
            label="Περιγραφή"
            value={period.description}
            width="100%"
            disabled
          />
        </div>

        <CustomInputField
          type="DATE"
          label="Έναρξη Υποβολών"
          value={toDateOnly(period.submissionStart)}
          width="100%"
          disabled
        />

        <CustomInputField
          type="DATE"
          label="Λήξη Υποβολών"
          value={toDateOnly(period.submissionEnd)}
          width="100%"
          disabled
        />

        <CustomInputField
          type="DATE"
          label="Έναρξη Λειτουργίας"
          value={toDateOnly(period.operationStart)}
          width="100%"
          disabled
        />

        <CustomInputField
          type="DATE"
          label="Λήξη Λειτουργίας"
          value={toDateOnly(period.operationEnd)}
          width="100%"
          disabled
        />

        <CustomInputField
          type="DROPDOWN"
          label="Κλήρωση"
          value={String(period.lotteryEnabled)}
          dropdownItems={LOTTERY_OPTIONS}
          width="100%"
          disabled
        />

        <CustomInputField
          type="DATE"
          label="Ημερομηνία Κλήρωσης"
          value={toDateOnly(period.lotteryDate)}
          width="100%"
          disabled
        />

        <CustomInputField
          type="DROPDOWN"
          label="Φόρμα Αίτησης"
          value={period.formId ?? ""}
          dropdownItems={[{ label: "Χωρίς Φόρμα", value: "" }, ...formOptions]}
          width="100%"
          disabled
        />
      </div>
    </div>
  );
}