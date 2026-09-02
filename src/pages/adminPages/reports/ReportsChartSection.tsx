import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Select, MenuItem } from "@mui/material";
import type { StatsMetric } from "./ReportsStatsSection";
import { useState, useEffect } from "react";

interface ReportsChartSectionProps {
  metrics: StatsMetric[];
}

const COLORS = ["#60A5FA", "#7C3AED"];

export default function ReportsChartSection({ metrics }: ReportsChartSectionProps) {
  const [selected, setSelected] = useState<string>(() => "overall");

  const handleChange = (v: string) => setSelected(v);

  // default to first metric if available
  useEffect(() => {
    if (metrics && metrics.length > 0) {
      setSelected(metrics[0].label);
    } else {
      setSelected("overall");
    }
  }, [metrics]);

  const overall = metrics.reduce(
    (acc, m) => ({ producers: acc.producers + (m.producersCount ?? 0), professionals: acc.professionals + (m.professionalsCount ?? 0) }),
    { producers: 0, professionals: 0 }
  );

  const selectedMetric =
    selected === "overall"
      ? overall
      : (() => {
          const m = metrics.find((x) => x.label === selected);
          return { producers: m?.producersCount ?? 0, professionals: m?.professionalsCount ?? 0 };
        })();

  const data = [
    { name: "Παραγωγοί", value: selectedMetric.producers },
    { name: "Επαγγελματίες", value: selectedMetric.professionals },
  ];

  return (
    <div className="rounded-[20px] border border-(--color-border) bg-(--color-surface) p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.1em] text-(--color-text-muted)">Charts</p>
          <p className="mt-1 text-sm text-(--color-text-muted)">Κατανομή ανά τύπο πωλητή για την επιλεγμένη περίοδο.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selected} size="small" onChange={(e) => handleChange(String(e.target.value))}>
        
            {metrics.map((m) => (
              <MenuItem key={m.label} value={m.label}>
                {m.label}
              </MenuItem>
            ))}
          </Select>
          
        </div>
      </div>

      <div className="relative h-[320px] min-w-0 overflow-hidden rounded-[16px] border border-(--color-border) bg-(--color-bg) flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
              <Tooltip />
              <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ right: 12 }} />
            {data[0].value + data[1].value === 0 ? (
              <g>
                <circle cx="50%" cy="50%" r="80" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={6} />
              </g>
            ) : (
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} label>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            )}
          </PieChart>
        </ResponsiveContainer>
        {data[0].value + data[1].value === 0 && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 bg-transparent">
            <div className="flex items-center gap-2">
              <span style={{ width: 12, height: 12, background: COLORS[0], display: "inline-block", borderRadius: 2 }} />
              <span className="text-sm text-(--color-text-muted)">Παραγωγοί</span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ width: 12, height: 12, background: COLORS[1], display: "inline-block", borderRadius: 2 }} />
              <span className="text-sm text-(--color-text-muted)">Επαγγελματίες</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
