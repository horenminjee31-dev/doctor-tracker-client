"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatNumber } from "@/lib/format";
import type { DashboardData } from "@/lib/types";

const COLORS = ["#0f8574", "#6366f1", "#f59e0b", "#f43f5e", "#0ea5e9", "#8b5cf6"];

export function ConditionsChart({
  data,
  totalPatients,
}: {
  data: DashboardData["byCondition"];
  totalPatients: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 12,
                padding: "10px 12px",
              }}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={2}
              strokeWidth={2}
              stroke="#fff"
            >
              {data.map((entry, index) => (
                <Cell key={entry.label} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
            {formatNumber(totalPatients)}
          </span>
          <span className="text-xs text-slate-400">patients total</span>
        </div>
      </div>

      <ul className="space-y-2.5">
        {data.map((entry, index) => (
          <li key={entry.label} className="flex items-center gap-2.5 text-sm">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="flex-1 truncate text-slate-600">{entry.label}</span>
            <span className="font-medium text-slate-900 tabular-nums">{entry.value}</span>
            <span className="w-10 text-right text-xs text-slate-400 tabular-nums">
              {totalPatients ? Math.round((entry.value / totalPatients) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
