import { Alert } from "@mui/material";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import CustomButton from "../../../shared/components/CustomButton";
import CustomInputField from "../../../shared/components/CustomInputField";
import type { MarketSearchRequest } from "../../../models/market";
import type { CreateMarketPeriodDraft, LicenseCategoryType } from "../../../models/request";
import { useRequestFormsQuery } from "../../../queries/formsQueries";
import { useMarketsQuery } from "../../../queries/marketQueries";
import {
  useCreateMarketPeriodMutation,
  useMarketPeriodDetailQuery,
  useUpdateMarketPeriodMutation,
} from "../../../queries/requestQueries";

const MARKET_FILTERS: MarketSearchRequest = {
  name: "",
  marketType: "",
  operatingDays: [],
  page: 1,
  pageSize: 5000,
};

const INITIAL_DRAFT: CreateMarketPeriodDraft = {
  marketId: 0,
  title: "",
  description: "",
  licenseCategory: 0,
  submissionStart: "",
  submissionEnd: "",
  operationStart: "",
  operationEnd: "",
  availableSpots: 0,
  lotteryEnabled: false,
  lotteryDate: "",
  formId: "",
};

const LICENSE_CATEGORY_OPTIONS: Array<{ label: string; value: LicenseCategoryType }> = [
  { label: "Όλες", value: 0 },
  { label: "Παραγωγοί", value: 1 },
  { label: "Μεταπωλητές", value: 2 },
];

const LOTTERY_OPTIONS = [
  { label: "Ναι", value: "true" },
  { label: "Όχι", value: "false" },
];

const ATHENS_TIMEZONE = "Europe/Athens";

export default function CreateMarketPeriodPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const periodId = typeof params.periodId === "string" ? params.periodId : "";
  const isEditMode = periodId !== "";
  const [draft, setDraft] = useState<CreateMarketPeriodDraft>(INITIAL_DRAFT);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const hydratedPeriodIdRef = useRef<string>("");

  const { data: marketsData } = useMarketsQuery(MARKET_FILTERS);
  const { data: formsData } = useRequestFormsQuery();
  const marketPeriodDetailQuery = useMarketPeriodDetailQuery(periodId);
  const createMarketPeriodMutation = useCreateMarketPeriodMutation();
  const updateMarketPeriodMutation = useUpdateMarketPeriodMutation(periodId);

  const marketOptions = useMemo<Array<{ label: string; value: number }>>(
    () =>
      (marketsData?.items ?? []).map((market) => ({
        label: market.name,
        value: market.id,
      })),
    [marketsData]
  );

  const formOptions = useMemo(
    () =>
      (formsData?.items ?? []).map((form) => ({
        label: form.title,
        value: form.id,
      })),
    [formsData]
  );

  const resolveMarketId = (periodMarketId: number, periodMarketName?: string) => {
    if (periodMarketId > 0) return periodMarketId;

    const matchedMarket = (marketsData?.items ?? []).find((market) => {
      if (!periodMarketName) return false;
      return market.name.trim().toLowerCase() === periodMarketName.trim().toLowerCase();
    });

    return matchedMarket?.id ?? 0;
  };

  const canSubmit =
    draft.marketId > 0 &&
    draft.submissionStart.trim() !== "" &&
    draft.submissionEnd.trim() !== "" &&
    draft.availableSpots > 0 &&
    (!draft.lotteryEnabled || draft.lotteryDate.trim() !== "");

  const activeMutation = isEditMode ? updateMarketPeriodMutation : createMarketPeriodMutation;

  const toDateOnly = (value: string): string => {
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
  };

  useEffect(() => {
    if (!isEditMode || !marketPeriodDetailQuery.data) return;
    if (hydratedPeriodIdRef.current === periodId) return;

    const period = marketPeriodDetailQuery.data;
    const resolvedMarketId = period.marketId > 0 ? period.marketId : resolveMarketId(period.marketId, period.marketName);

    if (resolvedMarketId <= 0 && period.marketId <= 0) {
      return;
    }

    setDraft({
      marketId: resolvedMarketId,
      title: period.title,
      description: period.description,
      licenseCategory: period.licenseCategory,
      submissionStart: toDateOnly(period.submissionStart),
      submissionEnd: toDateOnly(period.submissionEnd),
      operationStart: toDateOnly(period.operationStart),
      operationEnd: toDateOnly(period.operationEnd),
      availableSpots: period.availableSpots,
      lotteryEnabled: period.lotteryEnabled,
      lotteryDate: toDateOnly(period.lotteryDate),
      formId: period.formId ?? "",
    });
    hydratedPeriodIdRef.current = periodId;
    setErrorMessage(undefined);
  }, [isEditMode, marketPeriodDetailQuery.data, marketsData]);

  useEffect(() => {
    hydratedPeriodIdRef.current = "";
    setDraft(INITIAL_DRAFT);
    setErrorMessage(undefined);
  }, [periodId]);

  const getAthensOffsetMinutesAtUtc = (utcMs: number): number | null => {
    const probeDate = new Date(utcMs);
    if (Number.isNaN(probeDate.getTime())) return null;

    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: ATHENS_TIMEZONE,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).formatToParts(probeDate);

    const getPart = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((part) => part.type === type)?.value;

    const year = Number(getPart("year"));
    const month = Number(getPart("month"));
    const day = Number(getPart("day"));
    const hour = Number(getPart("hour"));
    const minute = Number(getPart("minute"));
    const second = Number(getPart("second"));

    if ([year, month, day, hour, minute, second].some((value) => Number.isNaN(value))) {
      return null;
    }

    const athensAsUtcMs = Date.UTC(year, month - 1, day, hour, minute, second);
    return Math.round((athensAsUtcMs - utcMs) / 60000);
  };

  const formatOffset = (offsetMinutes: number): string => {
    const sign = offsetMinutes < 0 ? "-" : "+";
    const abs = Math.abs(offsetMinutes);
    const hours = String(Math.floor(abs / 60)).padStart(2, "0");
    const minutes = String(abs % 60).padStart(2, "0");
    return `${sign}${hours}:${minutes}`;
  };

  const toGreekDateTime = (dateValue: string, endOfDay = false): string | null => {
    if (!dateValue) return null;

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hour = endOfDay ? 23 : 0;
    const minute = endOfDay ? 59 : 0;
    const second = endOfDay ? 59 : 0;

    // Resolve Athens offset for this local date-time with one correction pass for DST boundaries.
    let assumedOffsetMinutes = 120;
    let utcMs = Date.UTC(year, month - 1, day, hour, minute, second) - assumedOffsetMinutes * 60_000;
    const resolvedOffset = getAthensOffsetMinutesAtUtc(utcMs);
    if (resolvedOffset === null) return null;

    if (resolvedOffset !== assumedOffsetMinutes) {
      assumedOffsetMinutes = resolvedOffset;
      utcMs = Date.UTC(year, month - 1, day, hour, minute, second) - assumedOffsetMinutes * 60_000;
    }

    const finalOffset = getAthensOffsetMinutesAtUtc(utcMs);
    if (finalOffset === null) return null;

    const timePortion = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
    return `${dateValue}T${timePortion}${formatOffset(finalOffset)}`;
  };

  const handleBack = () => {
    if (activeMutation.isPending) return;
    navigate({ to: "/admin/requests" });
  };

  const handleSubmit = async () => {
    setErrorMessage(undefined);

    const submissionStart = toGreekDateTime(draft.submissionStart);
    const submissionEnd = toGreekDateTime(draft.submissionEnd, true);
    const operationStart = toGreekDateTime(draft.operationStart);
    const operationEnd = toGreekDateTime(draft.operationEnd, true);
    const lotteryDate = toGreekDateTime(draft.lotteryDate);

    if (!submissionStart || !submissionEnd) {
      setErrorMessage("Συμπλήρωσε έγκυρες ημερομηνίες υποβολής.");
      return;
    }

    if (draft.lotteryEnabled && !lotteryDate) {
      setErrorMessage("Συμπλήρωσε έγκυρη ημερομηνία κλήρωσης.");
      return;
    }

    try {
      await activeMutation.mutateAsync({
        marketId: draft.marketId,
        title: draft.title.trim() || undefined,
        description: draft.description.trim() || undefined,
        licenseCategory: draft.licenseCategory,
        submissionStart,
        submissionEnd,
        operationStart,
        operationEnd,
        availableSpots: draft.availableSpots,
        lotteryEnabled: draft.lotteryEnabled,
        lotteryDate: draft.lotteryEnabled ? lotteryDate : null,
        formId: draft.formId === "" ? null : draft.formId,
      });

      navigate({ to: "/admin/requests" });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : isEditMode
            ? "Αποτυχία ενημέρωσης περιόδου."
            : "Αποτυχία δημιουργίας περιόδου."
      );
    }
  };

  if (isEditMode && marketPeriodDetailQuery.isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center text-(--color-text-muted)">
        Φόρτωση στοιχείων περιόδου...
      </div>
    );
  }

  if (isEditMode && (marketPeriodDetailQuery.isError || !marketPeriodDetailQuery.data)) {
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

  return (
    <div className="flex h-full w-full flex-col gap-6 text-left">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {isEditMode ? "Επεξεργασία Περιόδου Αιτήσεων" : "Δημιουργία Περιόδου Αιτήσεων"}
        </h2>
        <CustomButton
          title="Επιστροφή"
          backgroundColor="var(--color-text-muted)"
          width="fit-content"
          onClick={handleBack}
          disabled={activeMutation.isPending}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <CustomInputField
          type="DROPDOWN"
          label="Αγορά"
          value={draft.marketId || ""}
          onChange={(value) => setDraft((prev) => ({ ...prev, marketId: Number(value) || 0 }))}
          dropdownItems={marketOptions}
          width="100%"
        />

        <CustomInputField
          type="DROPDOWN"
          label="Κατηγορία Άδειας"
          value={draft.licenseCategory}
          onChange={(value) =>
            setDraft((prev) => ({
              ...prev,
              licenseCategory: (Number(value) || 0) as LicenseCategoryType,
            }))
          }
          dropdownItems={LICENSE_CATEGORY_OPTIONS}
          width="100%"
        />

        <CustomInputField
          type="TEXT"
          label="Τίτλος"
          value={draft.title}
          onChange={(value) => setDraft((prev) => ({ ...prev, title: String(value) }))}
          width="100%"
        />

        <CustomInputField
          type="NUMBER"
          label="Διαθέσιμες Θέσεις"
          value={draft.availableSpots}
          onChange={(value) =>
            setDraft((prev) => ({ ...prev, availableSpots: Math.max(0, Number(value) || 0) }))
          }
          width="100%"
        />

        <div className="md:col-span-2">
          <CustomInputField
            type="TEXTAREA"
            label="Περιγραφή"
            value={draft.description}
            onChange={(value) => setDraft((prev) => ({ ...prev, description: String(value) }))}
            width="100%"
          />
        </div>

        <CustomInputField
          type="DATE"
          label="Έναρξη Υποβολών"
          value={draft.submissionStart}
          onChange={(value) => setDraft((prev) => ({ ...prev, submissionStart: String(value) }))}
          width="100%"
        />

        <CustomInputField
          type="DATE"
          label="Λήξη Υποβολών"
          value={draft.submissionEnd}
          onChange={(value) => setDraft((prev) => ({ ...prev, submissionEnd: String(value) }))}
          width="100%"
        />

        <CustomInputField
          type="DATE"
          label="Έναρξη Λειτουργίας"
          value={draft.operationStart}
          onChange={(value) => setDraft((prev) => ({ ...prev, operationStart: String(value) }))}
          width="100%"
        />

        <CustomInputField
          type="DATE"
          label="Λήξη Λειτουργίας"
          value={draft.operationEnd}
          onChange={(value) => setDraft((prev) => ({ ...prev, operationEnd: String(value) }))}
          width="100%"
        />

        <CustomInputField
          type="DROPDOWN"
          label="Κλήρωση"
          value={String(draft.lotteryEnabled)}
          onChange={(value) => setDraft((prev) => ({ ...prev, lotteryEnabled: String(value) === "true" }))}
          dropdownItems={LOTTERY_OPTIONS}
          width="100%"
        />

        <CustomInputField
          type="DATE"
          label="Ημερομηνία Κλήρωσης"
          value={draft.lotteryDate}
          onChange={(value) => setDraft((prev) => ({ ...prev, lotteryDate: String(value) }))}
          width="100%"
          disabled={!draft.lotteryEnabled}
        />

        <CustomInputField
          type="DROPDOWN"
          label="Φόρμα Αίτησης"
          value={draft.formId}
          onChange={(value) => setDraft((prev) => ({ ...prev, formId: value === "" ? "" : Number(value) }))}
          dropdownItems={[{ label: "Χωρίς Φόρμα", value: "" }, ...formOptions]}
          width="100%"
        />
      </div>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      <div className="flex justify-end gap-3">
        <CustomButton
          title="Ακύρωση"
          backgroundColor="var(--color-text-muted)"
          width="fit-content"
          onClick={handleBack}
          disabled={activeMutation.isPending}
        />
        <CustomButton
          title={activeMutation.isPending ? "Αποθήκευση..." : (isEditMode ? "Ενημέρωση" : "Αποθήκευση")}
          width="fit-content"
          onClick={handleSubmit}
          disabled={!canSubmit || activeMutation.isPending}
        />
      </div>
    </div>
  );
}
