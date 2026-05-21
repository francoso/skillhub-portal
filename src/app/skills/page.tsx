"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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

type SortKey = "score" | "invokes" | "updatedAt";

const sortLabels: Record<SortKey, string> = {
  score: "按评分",
  invokes: "按调用量",
  updatedAt: "按更新时间",
};

export default function SkillsPage() {
  const skills = getSkills();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortKey>("updatedAt");

  const categories = useMemo(
    () => [...new Set(skills.map((s) => s.category))],
    [skills]
  );

  const filtered = useMemo(() => {
    let result = skills.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase()) ||
        s.owner.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "all" || s.status === filterStatus;
      const matchCategory =
        filterCategory === "all" || s.category === filterCategory;
      return matchSearch && matchStatus && matchCategory;
    });

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "score":
          return (b.score || 0) - (a.score || 0);
        case "invokes":
          return b.metrics.invokeCount - a.metrics.invokeCount;
        case "updatedAt":
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
      }
    });

    return result;
  }, [skills, search, filterStatus, filterCategory, sortBy]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Skill目录</h1>
        <p className="text-sm text-gray-500 mt-1">
          共 {skills.length} 个Skill，{skills.filter((s) => s.status === "active").length} 个已上线
        </p>
      </div>

      {/* Search + Status Filter */}
      <div className="flex items-center gap-4 flex-wrap">
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

      {/* Category Filter + Sort */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterCategory("all")}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
              filterCategory === "all"
                ? "bg-purple-100 text-purple-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            全部分类
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                filterCategory === cat
                  ? "bg-purple-100 text-purple-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-1 items-center">
          <span className="text-xs text-gray-400 mr-1">排序:</span>
          {(Object.keys(sortLabels) as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                sortBy === key
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {sortLabels[key]}
            </button>
          ))}
        </div>
      </div>

      {/* Skill Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((skill) => (
          <Link key={skill.id} href={`/skills/${skill.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
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
          </Link>
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
