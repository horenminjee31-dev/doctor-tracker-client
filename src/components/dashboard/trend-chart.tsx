"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardData } from "@/lib/types";

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  boxShadow: "0 12px 32px -12px rgba(11,31,42,0.25)",
  fontSize: 12,
  padding: "10px 12px",
};

export function TrendChart({ data }: { data: DashboardData["trend"] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id="patientsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f8574" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#0f8574" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="#e8edf2" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            dy={8}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            width={48}
          />
          <Tooltip contentStyle={tooltipStyle} labelStyle={{ fontWeight: 600, color: "#0f172a" }} />
          <Area
            type="monotone"
            dataKey="patients"
            name="Patients"
            stroke="#0f8574"
            strokeWidth={2.5}
            fill="url(#patientsFill)"
            activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
          />
          <Line
            type="monotone"
            dataKey="doctors"
            name="New doctors"
            stroke="#6366f1"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
