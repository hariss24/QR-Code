"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#1A3C6E", "#4A90D9", "#00B4D8", "#64748B"];

interface Props {
  data: { name: string; value: number }[];
}

export function DeviceChart({ data }: Props) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <h3 className="mb-4 text-sm font-medium">Appareils</h3>
      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">Aucune donnée</p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
