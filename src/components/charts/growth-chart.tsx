"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface GrowthDataPoint {
  week: string;
  totalSkills: number;
  certified: number;
}

export function GrowthChart({ data }: { data: GrowthDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="colorCertified" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="#9ca3af" />
        <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="totalSkills"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#colorTotal)"
          name="Skill 总量"
        />
        <Area
          type="monotone"
          dataKey="certified"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#colorCertified)"
          name="认证通过"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
