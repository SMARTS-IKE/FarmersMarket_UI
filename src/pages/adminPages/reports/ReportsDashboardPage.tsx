import { useEffect, useMemo, useState } from "react";
import CustomButton from "../../../shared/components/CustomButton";
import CustomInputField from "../../../shared/components/CustomInputField";
import ReportsChartSection from "./ReportsChartSection";
import ReportsListSection, { type ReportRow } from "./ReportsListSection";
import ReportsStatsSection, { type StatsMetric } from "./ReportsStatsSection";
import { useAllSellersQuery } from "../../../queries/sellerQueries";
import { useSellerRequestsQuery } from "../../../queries/requestQueries";

const periodOptions = [
  { label: "Ημερήσια", value: "daily" },
  { label: "Εβδομαδιαία", value: "weekly" },
  { label: "Μηνιαία", value: "monthly" },
  { label: "3 Μήνες", value: "threeMonths" },
  { label: "Ετήσια", value: "annual" },
  { label: "Περίοδος", value: "custom" },
];

type Period = "daily" | "weekly" | "monthly" | "threeMonths" | "annual" | "custom";

function toDateInputValue(date: Date) {
  return date.toISOString().split("T")[0];
}

function getDefaultStartDate(period: Period) {
  const today = new Date();
  const normalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  switch (period) {
    case "daily":
      normalized.setDate(normalized.getDate() - 1);
      return toDateInputValue(normalized);
    case "weekly":
      normalized.setDate(normalized.getDate() - 7);
      return toDateInputValue(normalized);
    case "monthly":
      normalized.setMonth(normalized.getMonth() - 1);
      return toDateInputValue(normalized);
    case "threeMonths":
      normalized.setMonth(normalized.getMonth() - 3);
      return toDateInputValue(normalized);
    case "annual":
      normalized.setFullYear(normalized.getFullYear() - 1);
      return toDateInputValue(normalized);
    default:
      return toDateInputValue(normalized);
  }
}

function getDefaultEndDate(period: Period) {
  void period;
  const today = new Date();
  const normalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return toDateInputValue(normalized);
}

function formatDisplayDate(value: string | null | undefined) {
  if (!value) return "—";
  const match = value.match(/^\d{4}-\d{2}-\d{2}$/);
  if (!match) return value;
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}



export default function ReportsDashboardPage() {
  // simplified stable implementation
  const [period, setPeriod] = useState<Period>("daily");
  const [fromDate, setFromDate] = useState<string>(() => getDefaultStartDate("daily"));
  const [toDate, setToDate] = useState<string>(() => toDateInputValue(new Date()));

  const isCustom = period === "custom";

  useEffect(() => {
    const p = period === "custom" ? "monthly" : period;
    setFromDate(getDefaultStartDate(p as Period));
    setToDate(getDefaultEndDate(p as Period));
  }, [period]);

  const { data: sellersResp } = useAllSellersQuery({ pageSize: 1000 });
  const { data: requestsResp } = useSellerRequestsQuery({} as any);

  const sellers = sellersResp?.items ?? [];
  const requests = requestsResp ?? [];
  const reportRows: ReportRow[] = [
    { id: 1, title: "Αναφορά πωλητών", category: "Πωλητές", createdAt: "2026-08-12", status: "Ετοιμο" },
    { id: 2, title: "Αναφορά αγορών", category: "Αγορές", createdAt: "2026-08-10", status: "Εκτυπώθηκε" },
    { id: 3, title: "Αναφορά αιτήσεων", category: "Αιτήσεις", createdAt: "2026-08-08", status: "Ετοιμο" },
    { id: 4, title: "Αναφορά τελών", category: "Τέλη", createdAt: "2026-08-04", status: "Ανέβηκε" },
  ];

  const selectedPeriodLabel = periodOptions.find((p) => p.value === period)?.label ?? period;

  const metrics = useMemo<StatsMetric[]>(() => {
    const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const to = toDate ? new Date(`${toDate}T23:59:59`) : null;

    const inRange = (d?: string) => {
      if (!d || !from || !to) return false;
      const dt = new Date(d);
      return !Number.isNaN(dt.getTime()) && dt >= from && dt <= to;
    };

    const newSellers = sellers.filter((s) => inRange(s.createdAt)).length;

    const requestsInRange = requests.filter((r: any) => inRange(r.submittedAt));
    const approvedInRange = requests.filter((r: any) => inRange(r.processedAt));

    const countByType = (list: any[]) => {
      const p = list.reduce((acc, item) => {
        const seller = sellers.find((s) => Number(s.id) === Number(item.sellerId));
        const t = Number(seller?.sellerType ?? seller?.currentLicense?.sellerType ?? 0);
        if (t === 1) acc.producers += 1;
        if (t === 2) acc.professionals += 1;
        return acc;
      }, { producers: 0, professionals: 0 });
      return p;
    };

    const newSellersTypes = countByType(sellers.filter((s) => inRange(s.createdAt) ? { sellerId: s.id } : null).filter(Boolean) as any[]);
    const requestsTypes = countByType(requestsInRange as any[]);
    const approvedTypes = countByType(approvedInRange as any[]);

    return [
      { label: "Νέοι Πωλητές", value: String(newSellers), delta: "+0.0%", tone: "positive", producersCount: newSellersTypes.producers, professionalsCount: newSellersTypes.professionals },
      { label: "Νέες Αιτήσεις", value: String(requestsInRange.length), delta: "+0.0%", tone: "info", producersCount: requestsTypes.producers, professionalsCount: requestsTypes.professionals },
      { label: "Νέες άδειες", value: String(approvedInRange.length), delta: "+0.0%", tone: "positive", producersCount: approvedTypes.producers, professionalsCount: approvedTypes.professionals },
      { label: "Συμμετοχή στις αγορές", value: "—", delta: "+0.0%", tone: "positive", producersCount: newSellersTypes.producers + requestsTypes.producers, professionalsCount: newSellersTypes.professionals + requestsTypes.professionals },
    ];
  }, [sellersResp, requestsResp, fromDate, toDate]);

  return (
    <div className="flex w-full flex-1 flex-col gap-5 p-5 text-left">
      <div className="rounded-[20px] border border-(--color-border) bg-(--color-surface) p-5 shadow-[var(--shadow)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--color-text-muted)">Διαχείρηση Αναφορών</p>
            <h2 className="mt-2 text-2xl font-semibold text-(--color-text-heading)">Στατιστικά και εξαγωγή αναφορών</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {periodOptions.map((opt) => (
              <CustomButton
                key={opt.value}
                title={opt.label}
                onClick={() => setPeriod(opt.value as Period)}
                width={110}
                selected={period === (opt.value as Period)}
              />
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <CustomInputField type="DATE" label="Από" value={fromDate} onChange={(v) => setFromDate(String(v))} width="100%" />
          <CustomInputField type="DATE" label="Έως" value={toDate} onChange={(v) => setToDate(String(v))} disabled={!isCustom} width="100%" />
          <div className="flex items-end">
            <div className="w-full rounded-[12px] border border-dashed border-(--color-border) bg-(--color-bg) px-4 py-3 text-sm text-(--color-text-muted)">Επιλεγμένη περίοδος: <span className="font-semibold text-(--color-text-heading)">{selectedPeriodLabel}</span></div>
          </div>
          <div className="flex items-end">
            <div className="w-full rounded-[12px] border border-dashed border-(--color-border) bg-(--color-bg) px-4 py-3 text-sm text-(--color-text-muted)">Εύρος: <span className="font-semibold text-(--color-text-heading)">{`${formatDisplayDate(fromDate)} - ${formatDisplayDate(toDate)}`}</span></div>
          </div>
        </div>
      </div>

      <div style={{ maxHeight: "calc(95vh - 300px)" }} className="flex-1 overflow-y-auto flex flex-col gap-5 px-2">
        <ReportsStatsSection metrics={metrics} />
        <ReportsChartSection metrics={metrics} />
        <ReportsListSection reports={reportRows} fromDate={fromDate} toDate={toDate} period={period} />
      </div>
    </div>
  );
}

