"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCapabilityMap, getOfficialSkills } from "@/lib/data";
import type { CapabilityItem, CapabilityStage, SkillDomain } from "@/lib/types";

const domainOptions: Array<SkillDomain | "全部"> = ["全部", "APP流量", "平台", "预算", "厂商"];

const statusConfig: Record<
  CapabilityItem["status"],
  { label: string; dot: string; chip: string }
> = {
  covered: {
    label: "已覆盖",
    dot: "bg-green-500",
    chip: "bg-green-100 text-green-700 border-green-200",
  },
  building: {
    label: "建设中",
    dot: "bg-orange-400",
    chip: "bg-orange-100 text-orange-700 border-orange-200",
  },
  gap: {
    label: "缺口",
    dot: "bg-gray-300",
    chip: "bg-gray-100 text-gray-500 border-gray-200",
  },
};

const domainStyles: Record<SkillDomain, string> = {
  "APP流量": "bg-cyan-100 text-cyan-700 border-cyan-200",
  "平台": "bg-violet-100 text-violet-700 border-violet-200",
  "预算": "bg-amber-100 text-amber-700 border-amber-200",
  "厂商": "bg-emerald-100 text-emerald-700 border-emerald-200",
};

function stageMatchesDomain(stage: CapabilityStage, domain: SkillDomain | "全部") {
  if (domain === "全部") return true;
  return stage.modules.some((module) =>
    module.capabilities.some((capability) => capability.domains.includes(domain))
  );
}

export default function CoveragePage() {
  const [selectedDomain, setSelectedDomain] = useState<SkillDomain | "全部">("全部");
  const stages = getCapabilityMap();
  const officialSkills = getOfficialSkills();
  const officialIds = new Set(officialSkills.map((skill) => skill.id));

  const filteredStages = useMemo(
    () =>
      stages
        .filter((stage) => stageMatchesDomain(stage, selectedDomain))
        .map((stage) => ({
          ...stage,
          modules: stage.modules
            .map((module) => ({
              ...module,
              capabilities: module.capabilities.filter((capability) =>
                selectedDomain === "全部"
                  ? true
                  : capability.domains.includes(selectedDomain)
              ),
            }))
            .filter((module) => module.capabilities.length > 0),
        })),
    [selectedDomain, stages]
  );

  const allCapabilities = filteredStages.flatMap((stage) =>
    stage.modules.flatMap((module) => module.capabilities)
  );
  const coveredCount = allCapabilities.filter((item) => item.status === "covered").length;
  const buildingCount = allCapabilities.filter((item) => item.status === "building").length;
  const gapCount = allCapabilities.filter((item) => item.status === "gap").length;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
          CAPABILITY MAP
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">能力地图</h1>
        <p className="text-sm text-gray-500 mt-1">
          主结构按服务环节展开，四大域作为管理维度筛选，用来看清覆盖现状和缺口。
        </p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-gray-500">当前视图覆盖率</p>
              <p className="text-2xl font-bold text-gray-900">
                {coveredCount}/{allCapabilities.length}
                <span className="text-sm font-normal text-gray-500 ml-2">个能力点已被 Skill 覆盖</span>
              </p>
              <div className="w-72 h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${allCapabilities.length ? (coveredCount / allCapabilities.length) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="flex gap-5 text-sm text-gray-600">
              <span>已覆盖 {coveredCount}</span>
              <span>建设中 {buildingCount}</span>
              <span>缺口 {gapCount}</span>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {domainOptions.map((domain) => (
              <button
                key={domain}
                onClick={() => setSelectedDomain(domain)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedDomain === domain
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {domain}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-5">
        {filteredStages.map((stage) => {
          const stageCapabilities = stage.modules.flatMap((module) => module.capabilities);
          const stageCovered = stageCapabilities.filter((item) => item.status === "covered").length;
          return (
            <Card key={stage.serviceStage} className="border-gray-100">
              <CardContent className="p-5 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{stage.serviceStage}</h2>
                    <p className="text-sm text-gray-500 mt-1">{stage.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm text-gray-400">覆盖情况</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {stageCovered}/{stageCapabilities.length}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {stage.modules.map((module) => (
                    <div key={module.name} className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-gray-800">{module.name}</h3>
                        <span className="text-xs text-gray-400">{module.capabilities.length} 个能力点</span>
                      </div>

                      <div className="space-y-3">
                        {module.capabilities.map((capability) => {
                          const config = statusConfig[capability.status];
                          const hasOfficial = capability.skillIds.some((skillId) => officialIds.has(skillId));

                          return (
                            <div key={capability.id} className="rounded-lg bg-white border border-gray-100 p-3 space-y-2">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{capability.title}</p>
                                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                    {capability.description}
                                  </p>
                                </div>
                                <Badge variant="outline" className={config.chip}>
                                  {config.label}
                                </Badge>
                              </div>

                              <div className="flex flex-wrap gap-1.5">
                                {capability.domains.map((domain) => (
                                  <Badge key={domain} variant="outline" className={domainStyles[domain]}>
                                    {domain}
                                  </Badge>
                                ))}
                                {hasOfficial && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    含官方 Skill
                                  </Badge>
                                )}
                              </div>

                              {capability.skillIds.length > 0 ? (
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {capability.skillIds.map((skillId) => (
                                    <Link key={skillId} href={`/skills/${skillId}`}>
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-900 text-white text-xs hover:opacity-90 transition-opacity">
                                        已有 Skill
                                      </span>
                                    </Link>
                                  ))}
                                </div>
                              ) : (
                                capability.examples?.length ? (
                                  <p className="text-xs text-gray-400 pt-1">
                                    参考案例：{capability.examples.join(" / ")}
                                  </p>
                                ) : null
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
