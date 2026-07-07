"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getSkills, getSkillStage } from "@/lib/data";
import type { Skill, SkillDomain, Workstream } from "@/lib/types";
import { Download, ExternalLink, Search, ShieldCheck } from "lucide-react";

const domainOptions: Array<SkillDomain | "全部"> = ["全部", "APP流量", "平台", "预算", "厂商"];
const workstreamOptions: Array<Workstream | "全部"> = ["全部", "流量侧", "预算侧"];

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

const domainStyles: Record<SkillDomain, string> = {
  "APP流量": "bg-cyan-100 text-cyan-700",
  "平台": "bg-violet-100 text-violet-700",
  "预算": "bg-amber-100 text-amber-700",
  "厂商": "bg-emerald-100 text-emerald-700",
};

const sourceLabels: Record<NonNullable<Skill["source"]>, string> = {
  knot: "Knot",
  adataclaw: "adataclaw",
  manual: "手动登记",
};

const sourceStyles: Record<NonNullable<Skill["source"]>, string> = {
  knot: "bg-blue-50 text-blue-700 border-blue-100",
  adataclaw: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100",
  manual: "bg-gray-50 text-gray-600 border-gray-200",
};

export default function SkillsPage() {
  const skills = getSkills();
  const serviceStages = Array.from(new Set(skills.map((skill) => skill.category)));

  const [keyword, setKeyword] = useState("");
  const [selectedWorkstream, setSelectedWorkstream] = useState<Workstream | "全部">("全部");
  const [selectedDomain, setSelectedDomain] = useState<SkillDomain | "全部">("全部");
  const [selectedStage, setSelectedStage] = useState<string>("全部");
  const [officialOnly, setOfficialOnly] = useState(false);

  const filtered = useMemo(() => {
    return skills
      .filter((skill) => {
        const query = keyword.trim().toLowerCase();
        const matchKeyword =
          !query ||
          skill.name.toLowerCase().includes(query) ||
          skill.description.toLowerCase().includes(query) ||
          skill.owner.toLowerCase().includes(query) ||
          skill.slug.toLowerCase().includes(query);
        const matchDomain =
          selectedDomain === "全部" ||
          (skill.domains ?? []).includes(selectedDomain);
        const matchWorkstream =
          selectedWorkstream === "全部" ||
          (skill.workstreams ?? []).includes(selectedWorkstream);
        const matchStage = selectedStage === "全部" || skill.category === selectedStage;
        const matchOfficial = !officialOnly || skill.official?.status === "official";
        return matchKeyword && matchDomain && matchWorkstream && matchStage && matchOfficial;
      })
      .sort((a, b) => {
        const stageOrder = getSkillStage(a.id) === "certified" ? -1 : 0;
        const compareOrder = getSkillStage(b.id) === "certified" ? -1 : 0;
        if (stageOrder !== compareOrder) return stageOrder - compareOrder;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [keyword, officialOnly, selectedDomain, selectedStage, selectedWorkstream, skills]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
          SKILL MARKET
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">Skill 库</h1>
        <p className="text-sm text-gray-500 mt-1">
          不只是看 Skill 名单，还能直接看到它覆盖哪个服务环节、属于哪个域、是否已经成为官方推荐。
        </p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜索名称、描述、owner、slug..."
              className="pl-9"
            />
          </div>

          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {workstreamOptions.map((workstream) => (
                <button
                  key={workstream}
                  onClick={() => setSelectedWorkstream(workstream)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedWorkstream === workstream
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {workstream}
                </button>
              ))}
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

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedStage("全部")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedStage === "全部"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                全部环节
              </button>
              {serviceStages.map((stage) => (
                <button
                  key={stage}
                  onClick={() => setSelectedStage(stage)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedStage === stage
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {stage}
                </button>
              ))}
              <button
                onClick={() => setOfficialOnly((value) => !value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  officialOnly
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                仅看官方认证
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">当前结果 {filtered.length} 个 Skill</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((skill) => {
          const source = skill.source ?? "manual";
          const isAdataclaw = source === "adataclaw";
          return (
          <Link key={skill.id} href={`/skills/${skill.id}`}>
            <Card className="h-full border-gray-100 hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                    <p className="text-xs text-gray-400 mt-1 font-mono truncate">{skill.slug}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant="secondary" className={statusColors[skill.status]}>
                      {statusLabels[skill.status]}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${sourceStyles[source]}`}>
                      {sourceLabels[source]}
                    </Badge>
                    {skill.official?.status === "official" && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        官方认证
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                  {skill.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline">{skill.category}</Badge>
                  {(skill.workstreams ?? []).map((workstream) => (
                    <Badge key={workstream} variant="outline" className="bg-gray-50 text-gray-600">
                      {workstream}
                    </Badge>
                  ))}
                  {(skill.domains ?? []).map((domain) => (
                    <Badge key={domain} className={domainStyles[domain]} variant="secondary">
                      {domain}
                    </Badge>
                  ))}
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>Owner：{skill.owner}</p>
                  {skill.official && <p>评审归属：{skill.official.reviewerGroup}</p>}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-sm">
                  {isAdataclaw ? (
                    <>
                      <div className="text-gray-500">外部托管</div>
                      <span className="inline-flex items-center gap-1 text-fuchsia-700">
                        <ExternalLink className="w-3.5 h-3.5" />
                        去 adataclaw
                      </span>
                    </>
                  ) : (
                    <div className="text-gray-500">
                      下载量 <span className="font-semibold text-gray-900">{skill.metrics.invokeCount}</span>
                    </div>
                  )}
                  {!isAdataclaw && skill.downloadUrl && (
                    <span className="inline-flex items-center gap-1 text-gray-600">
                      <Download className="w-3.5 h-3.5" />
                      查看详情
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
          );
        })}
      </div>
    </div>
  );
}
