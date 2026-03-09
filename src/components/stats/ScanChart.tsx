"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: { date: string; count: number }[];
}

export function ScanChart({ data }: Props) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <h3 className="mb-4 text-sm font-medium">Scans — 30 derniers jours</h3>
      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">Aucun scan pour le moment</p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={(d) => d.slice(5)}
            />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#1A3C6E"
              fill="#1A3C6E"
              fillOpacity={0.1}
              name="Scans"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
