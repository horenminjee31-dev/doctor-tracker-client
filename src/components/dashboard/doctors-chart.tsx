"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardData } from "@/lib/types";

const shortName = (name: string) => name.replace(/^Dr\.?\s*/i, "");

export function DoctorsChart({ data }: { data: DashboardData["byDoctor"] }) {
  const rows = data.map((row) => ({ ...row, shortName: shortName(row.name) }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 28, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#e8edf2" horizontal={false} />
          <XAxis type="number" allowDecimals={false} hide />
          <YAxis
            type="category"
            dataKey="shortName"
            width={112}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
            tickFormatter={(value: string) =>
              value.length > 15 ? `${value.slice(0, 15)}…` : value
            }
          />
          <Tooltip
            cursor={{ fill: "rgba(15, 133, 116, 0.06)" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              fontSize: 12,
              padding: "10px 12px",
            }}
          />
          <Bar dataKey="count" name="Patients" fill="#0f8574" radius={[0, 6, 6, 0]} barSize={18}>
            <LabelList dataKey="count" position="right" fill="#334155" fontSize={12} fontWeight={600} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
