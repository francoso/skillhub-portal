"use client";

import { useState } from "react";
import { getSkills } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { Skill } from "@/lib/types";

const statusLabels: Record<Skill["status"], string> = {
  developing: "开发中",
  active: "已上线",
  deprecated: "已废弃",
};

const statusColors: Record<Skill["status"], string> = {
  developing: "bg-yellow-100 text-yellow-800",
  active: "bg-green-100 text-green-800",
  deprecated: "bg-gray-100 text-gray-600",
};

export default function SkillsPage() {
  const skills = getSkills();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered = skills.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.owner.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const categories = [...new Set(skills.map((s) => s.category))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Skill目录</h1>
        <p className="text-sm text-gray-500 mt-1">
          共 {skills.length} 个Skill，{skills.filter((s) => s.status === "active").length} 个已上线
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜索skill名称、描述、owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {["all", "active", "developing", "deprecated"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                filterStatus === status
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {status === "all"
                ? "全部"
                : statusLabels[status as Skill["status"]]}
            </button>
          ))}
        </div>
      </div>

      {/* Skill Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((skill) => (
          <Card key={skill.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    by {skill.owner}
                  </p>
                </div>
                <Badge
                  className={`text-xs ${statusColors[skill.status]}`}
                  variant="secondary"
                >
                  {statusLabels[skill.status]}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {skill.description}
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {skill.category}
                </Badge>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  {skill.metrics.invokeCount > 0 && (
                    <span>{skill.metrics.invokeCount} 次调用</span>
                  )}
                  {skill.score && <span>评分 {skill.score}</span>}
                </div>
              </div>
              {skill.metrics._source !== "manual" && (
                <p className="text-[10px] text-gray-300 mt-2">
                  数据源: {skill.metrics._source}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          没有匹配的Skill
        </div>
      )}
    </div>
  );
}
