import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export interface ChartPoint {
  label: string;
  value: number;
}

interface ReportsChartProps {
  data: ChartPoint[];
  title?: string;
  className?: string;
}

export default function ReportsChart({ data, title = "", className }: ReportsChartProps) {
  // Transform data to recharts-friendly keys
  const chartData = data.map((d) => ({ name: d.label, value: d.value }));

  return (
    <div className={className ?? "w-full h-full"} style={{ width: "100%", height: "100%", padding: 8 }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>{title}</div>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#7C3AED" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
