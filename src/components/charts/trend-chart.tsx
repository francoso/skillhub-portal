"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DailyMetric } from "@/lib/types";

export function TrendChart({ data }: { data: DailyMetric[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        />
        <Line
          type="monotone"
          dataKey="invokes"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          name="调用量"
        />
        <Line
          type="monotone"
          dataKey="activeSkills"
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
          name="活跃Skill数"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
