import { useEffect, useState } from "react";
import CustomButton from "../../../shared/components/CustomButton";
import CustomInputField from "../../../shared/components/CustomInputField";
import ReportsChart from "../../../shared/components/ReportsChart";

type Category = "ALL" | "SELLERS" | "MARKETS" | "REQUESTS" | "FEES";

export default function ReportsDashboardPage() {
  useEffect(() => {
    console.debug("[Reports] ReportsDashboardPage mounted");
    return () => console.debug("[Reports] ReportsDashboardPage unmounted");
  }, []);
  const [category, setCategory] = useState<Category>("ALL");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  useEffect(() => {
    console.debug("[Reports] criteria changed", { category, fromDate, toDate });
  }, [category, fromDate, toDate]);

  function generateSampleData(category: Category) {
    const points = 12;
    const result: { label: string; value: number }[] = [];
    for (let i = 0; i < points; i++) {
      const label = `P${i + 1}`;
      console.log(label);
      const base =
        category === "SELLERS"
          ? 40
          : category === "MARKETS"
          ? 30
          : category === "REQUESTS"
          ? 20
          : category === "FEES"
          ? 10
          : 25;
      const variance = Math.round(base + Math.sin(i / 2) * 10 + Math.random() * 15);
      result.push({ label, value: Math.max(0, variance) });
    }
    return result;
  }

  const buttons: { key: Category; label: string }[] = [
    { key: "ALL", label: "Ολα" },
    { key: "SELLERS", label: "Πωλητές" },
    { key: "MARKETS", label: "Αγορές" },
    { key: "REQUESTS", label: "Αιτήσεις" },
    { key: "FEES", label: "Τέλη" },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0 text-left">
      <div className="flex-none px-2 py-2">
        <div>
          <p className="text-sm font-semibold uppercase text-(--color-text-muted)">Διαχείρηση Αναφορών</p>
        </div>

        <div className="flex gap-3 items-center mt-3">
          {buttons.map((b) => (
            <CustomButton
              key={b.key}
              title={b.label}
              onClick={() => setCategory(b.key)}
              backgroundColor={category === b.key ? "#1F2937" : "var(--color-text)"}
              width={110}
            />
          ))}

          <div className="ml-6 flex items-center gap-3">
            <CustomInputField
              type="DATE"
              label="From"
              value={fromDate}
              onChange={(v) => setFromDate(String(v))}
              width={160}
            />
            <CustomInputField
              type="DATE"
              label="To"
              value={toDate}
              onChange={(v) => setToDate(String(v))}
              width={160}
            />
          </div>
        </div>
      </div>

      <div className="flex-none h-72 min-w-0">
        <ReportsChart
          data={generateSampleData(category)}
          title={buttons.find((b) => b.key === category)?.label ?? category}
          className="w-full h-full rounded-lg border border-(--color-border) overflow-hidden"
        />
      </div>
    </div>
  );
}
