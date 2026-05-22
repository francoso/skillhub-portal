"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { getSkills, getSkillStage } from "@/lib/data";
import type { SkillStage } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ShieldCheck, Clock } from "lucide-react";
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

// 团队颜色映射
const teamColors: Record<string, string> = {
  联盟产品: "bg-blue-100 text-blue-700",
  联盟运营: "bg-orange-100 text-orange-700",
  联盟商务: "bg-emerald-100 text-emerald-700",
  联盟研发: "bg-purple-100 text-purple-700",
};

function getTeamColor(team: string): string {
  return teamColors[team] || "bg-gray-100 text-gray-600";
}

type SortKey = "score" | "invokes" | "updatedAt";

const sortLabels: Record<SortKey, string> = {
  score: "按评分",
  invokes: "按调用量",
  updatedAt: "按更新时间",
};

const stageOrder: Record<SkillStage, number> = {
  certified: 0,
  reviewing: 1,
  personal: 2,
};

function StageBadge({ stage }: { stage: SkillStage }) {
  if (stage === "certified") {
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs gap-1" variant="outline">
        <ShieldCheck className="w-3 h-3" />
        联盟认证
      </Badge>
    );
  }
  if (stage === "reviewing") {
    return (
      <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs gap-1" variant="outline">
        <Clock className="w-3 h-3" />
        评审中
      </Badge>
    );
  }
  return null;
}

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

  // 计算每个分类的数量
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    skills.forEach((s) => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return counts;
  }, [skills]);

  const filtered = useMemo(() => {
    let result = skills.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase()) ||
        s.owner.toLowerCase().includes(search.toLowerCase()) ||
        s.slug.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "all" || s.status === filterStatus;
      const matchCategory =
        filterCategory === "all" || s.category === filterCategory;
      return matchSearch && matchStatus && matchCategory;
    });

    // 先按阶段排序（认证 > 评审中 > 个人），再按选定排序维度
    result = [...result].sort((a, b) => {
      const stageA = stageOrder[getSkillStage(a.id)];
      const stageB = stageOrder[getSkillStage(b.id)];
      if (stageA !== stageB) return stageA - stageB;

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
    <div className="space-y-8">
      {/* Page Title — ADesign Style */}
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
          SKILL LIBRARY
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">Skill 库</h1>
        <p className="text-sm text-gray-500 mt-1">
          联盟 AI Skill 生态的核心资产，共 {skills.length} 个 Skill
        </p>
      </div>

      {/* Search + Status Filter */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜索名称、slug、描述、owner..."
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

      {/* Category Filter with Counts + Sort */}
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
            全部 {skills.length}
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
              {cat} {categoryCounts[cat]}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((skill) => {
          const stage = getSkillStage(skill.id);
          return (
            <Link key={skill.id} href={`/skills/${skill.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-gray-100">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base">
                        {skill.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5 font-mono truncate">
                        {skill.slug}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-2 shrink-0">
                      <Badge
                        className={`text-xs ${statusColors[skill.status]}`}
                        variant="secondary"
                      >
                        {statusLabels[skill.status]}
                      </Badge>
                      <StageBadge stage={stage} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                    {skill.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`text-xs ${getTeamColor(skill.team)}`}
                        variant="secondary"
                      >
                        {skill.owner}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {skill.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {skill.metrics.invokeCount > 0 && (
                        <span>{skill.metrics.invokeCount} 次</span>
                      )}
                      {skill.score && (
                        <span className="font-medium text-gray-600">
                          {skill.score}分
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          没有匹配的Skill
        </div>
      )}
    </div>
  );
}
