export type StatsTone = "positive" | "warning" | "info" | "neutral";

export interface StatsMetric {
  label: string;
  value: string;
  delta: string;
  tone: StatsTone;
  producersCount?: number;
  professionalsCount?: number;
}

interface ReportsStatsSectionProps {
  metrics: StatsMetric[];
}

export default function ReportsStatsSection({ metrics }: ReportsStatsSectionProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-[18px] border border-(--color-border) bg-(--color-bg) p-4 shadow-[var(--shadow-sm)]"
        >
          <div>
            <p className="text-sm font-bold text-(--color-text-dark)">{metric.label}</p>
          </div>
          {/* <p className="mt-4 text-3xl font-bold text-(--color-text-heading)">{metric.value}</p> */}
              <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-(--color-text-muted)">
                <div className="flex flex-row justify-between">
                  <span>Παραγωγοί</span>
                  <span className="font-semibold text-(--color-text-heading)">{metric.producersCount ?? "—"}</span>
                </div>
                <div className="flex flex-row justify-between">
                  <span>Επαγγελματίες Πωλητές</span>
                  <span className="font-semibold text-(--color-text-heading)">{metric.professionalsCount ?? "—"}</span>
                </div>
              </div>
        </div>
      ))}
    </div>
  );
}
