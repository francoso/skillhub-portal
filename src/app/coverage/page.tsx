"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  GitPullRequest,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  BUDGET_WORKFLOW_TAGS,
  getCapabilityCards,
  getPendingSkillRegistrations,
  TRAFFIC_WORKFLOW_TAGS,
} from "@/lib/data";
import type {
  BusinessDomain,
  CapabilityCard,
  CapabilityStage,
  WorkflowTag,
  Workstream,
} from "@/lib/types";

type CoverageView = "总览" | Workstream;

const viewOptions: CoverageView[] = ["总览", "流量侧", "预算侧"];
const trafficDomainOptions: Array<BusinessDomain | "全部"> = [
  "全部",
  "APP流量",
  "平台",
  "厂商",
];

const stageConfig: Record<
  CapabilityStage,
  { label: string; chip: string; dot: string; icon: typeof CheckCircle2 }
> = {
  官方认证: {
    label: "官方认证",
    chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    icon: ShieldCheck,
  },
  建设中: {
    label: "建设中",
    chip: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-orange-400",
    icon: Clock3,
  },
  缺口: {
    label: "缺口",
    chip: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-300",
    icon: AlertTriangle,
  },
};

const domainStyles: Record<BusinessDomain, string> = {
  APP流量: "bg-cyan-50 text-cyan-700 border-cyan-200",
  平台: "bg-violet-50 text-violet-700 border-violet-200",
  预算: "bg-amber-50 text-amber-700 border-amber-200",
  厂商: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function getStageCounts(cards: CapabilityCard[]) {
  return {
    官方认证: cards.filter((card) => card.stage === "官方认证").length,
    建设中: cards.filter((card) => card.stage === "建设中").length,
    缺口: cards.filter((card) => card.stage === "缺口").length,
  };
}

function getCoverageRate(cards: CapabilityCard[]) {
  if (cards.length === 0) return 0;
  return Math.round((cards.filter((card) => card.stage === "官方认证").length / cards.length) * 100);
}

function getProgressRate(cards: CapabilityCard[]) {
  if (cards.length === 0) return 0;
  return Math.round(
    (cards.filter((card) => card.stage !== "缺口").length / cards.length) * 100
  );
}

function matchesDomain(card: CapabilityCard, domain: BusinessDomain | "全部") {
  if (domain === "全部") return true;
  return card.ownerDomain === domain || card.relatedDomains.includes(domain);
}

function sortCards(cards: CapabilityCard[]) {
  const stageOrder: Record<CapabilityStage, number> = {
    缺口: 0,
    建设中: 1,
    官方认证: 2,
  };
  const priorityOrder = { P0: 0, P1: 1, P2: 2 };

  return [...cards].sort((a, b) => {
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    if (stageOrder[a.stage] !== stageOrder[b.stage]) {
      return stageOrder[a.stage] - stageOrder[b.stage];
    }
    return a.title.localeCompare(b.title, "zh-CN");
  });
}

function CapabilityCardItem({ card }: { card: CapabilityCard }) {
  const config = stageConfig[card.stage];
  const StageIcon = config.icon;
  const allDomains = [card.ownerDomain, ...card.relatedDomains.filter((item) => item !== card.ownerDomain)];

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${config.dot}`} />
            <p className="text-sm font-semibold text-gray-900 leading-snug">{card.title}</p>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {card.workflowTag} / {card.module}
          </p>
        </div>
        <Badge variant="outline" className={`${config.chip} shrink-0 gap-1`}>
          <StageIcon className="h-3 w-3" />
          {config.label}
        </Badge>
      </div>

      <p className="text-xs text-gray-600 leading-relaxed">{card.description}</p>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-gray-50 p-2">
          <p className="text-[10px] text-gray-400">关联 Skill</p>
          <p className="text-sm font-semibold text-gray-900">{card.skillIds.length}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-2">
          <p className="text-[10px] text-gray-400">官方 Skill</p>
          <p className="text-sm font-semibold text-gray-900">{card.officialSkillIds.length}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {allDomains.map((domain) => (
          <Badge key={domain} variant="outline" className={domainStyles[domain]}>
            {domain}
          </Badge>
        ))}
        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
          {card.priority}
        </Badge>
      </div>

      {card.skillIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {card.skillIds.slice(0, 4).map((skillId) => (
            <Link key={skillId} href={`/skills/${skillId}`}>
              <span className="rounded-full bg-gray-900 px-2 py-1 text-[11px] text-white hover:opacity-90">
                {skillId}
              </span>
            </Link>
          ))}
          {card.skillIds.length > 4 && (
            <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-500">
              +{card.skillIds.length - 4}
            </span>
          )}
        </div>
      )}

      <div className="rounded-lg bg-amber-50/70 p-2">
        <p className="text-[10px] font-medium text-amber-700">下一步动作</p>
        <p className="mt-1 text-xs text-amber-900 leading-relaxed">{card.nextAction}</p>
      </div>

      <div className="space-y-1 text-xs text-gray-500">
        <p>Owner PM：{card.ownerPm ?? "待分配"}</p>
        {card.evidenceExamples.length > 0 && (
          <p className="leading-relaxed">参考材料：{card.evidenceExamples.join(" / ")}</p>
        )}
      </div>
    </div>
  );
}

function SummaryPanel({ cards }: { cards: CapabilityCard[] }) {
  const counts = getStageCounts(cards);
  const trafficCards = cards.filter((card) => card.workstream === "流量侧");
  const budgetCards = cards.filter((card) => card.workstream === "预算侧");
  const p0Gaps = sortCards(cards.filter((card) => card.priority === "P0" && card.stage === "缺口"));
  const pendingRegistrations = getPendingSkillRegistrations();
  const newCardRequests = pendingRegistrations.filter(
    (item) => item.proposedCard && item.status === "待PM确认"
  );
  const pendingCertifications = sortCards(
    cards.filter((card) => card.stage === "建设中" && card.skillIds.length > 0)
  ).slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.keys(stageConfig) as CapabilityStage[]).map((stage) => {
          const config = stageConfig[stage];
          const StageIcon = config.icon;
          return (
            <Card key={stage}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={`${config.chip} gap-1`}>
                    <StageIcon className="h-3.5 w-3.5" />
                    {config.label}
                  </Badge>
                  <span className="text-xs text-gray-400">能力建设卡</span>
                </div>
                <p className="mt-4 text-3xl font-bold text-gray-900">{counts[stage]}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {stage === "官方认证"
                    ? "至少有一个 PM 认证官方 Skill"
                    : stage === "建设中"
                      ? "已有候选 Skill、owner 或建设动作"
                      : "没有可用 Skill，也没有明确进展"}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[
          { label: "流量侧", cards: trafficCards, tags: TRAFFIC_WORKFLOW_TAGS.length },
          { label: "预算侧", cards: budgetCards, tags: BUDGET_WORKFLOW_TAGS.length },
        ].map((item) => {
          const itemCounts = getStageCounts(item.cards);
          return (
            <Card key={item.label} className="overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{item.label}</h2>
                    <p className="text-sm text-gray-500">{item.tags} 个工作流标签 / 服务环节</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">官方覆盖率</p>
                    <p className="text-2xl font-bold text-gray-900">{getCoverageRate(item.cards)}%</p>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${getCoverageRate(item.cards)}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                    官方 {itemCounts.官方认证}
                  </div>
                  <div className="rounded-lg bg-orange-50 p-2 text-orange-700">
                    建设中 {itemCounts.建设中}
                  </div>
                  <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                    缺口 {itemCounts.缺口}
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  有建设进展能力占比 {getProgressRate(item.cards)}%，新卡申请不进入正式统计。
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-1">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-slate-500" />
              <h2 className="font-semibold text-gray-900">P0 缺口</h2>
            </div>
            <div className="space-y-3">
              {p0Gaps.length > 0 ? (
                p0Gaps.map((card) => (
                  <div key={card.id} className="rounded-lg border border-gray-100 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900">{card.title}</p>
                      <Badge variant="outline" className={domainStyles[card.ownerDomain]}>
                        {card.ownerDomain}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{card.workflowTag} / {card.module}</p>
                    <p className="mt-2 text-xs text-gray-600 leading-relaxed">{card.nextAction}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">当前没有 P0 缺口。</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-1">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <GitPullRequest className="h-4 w-4 text-orange-500" />
              <h2 className="font-semibold text-gray-900">待 PM 处理的新卡申请</h2>
            </div>
            <div className="space-y-3">
              {newCardRequests.length > 0 ? (
                newCardRequests.map((item) => (
                  <div key={item.id} className="rounded-lg border border-orange-100 bg-orange-50/50 p-3">
                    <p className="text-sm font-medium text-gray-900">{item.proposedCard?.title}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {item.workstream} / {item.workflowTag} · 申请人 {item.uploader}
                    </p>
                    <p className="mt-2 text-xs text-gray-600 leading-relaxed">{item.proposedCard?.reason}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">暂无新卡片申请。</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-1">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-orange-500" />
              <h2 className="font-semibold text-gray-900">待认证 Skill</h2>
            </div>
            <div className="space-y-3">
              {pendingCertifications.map((card) => (
                <div key={card.id} className="rounded-lg border border-gray-100 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{card.title}</p>
                    <span className="text-xs text-gray-400">{card.skillIds.length} 个候选</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{card.ownerPm ?? "待分配 PM"}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {card.skillIds.map((skillId) => (
                      <Link key={skillId} href={`/skills/${skillId}`}>
                        <span className="rounded-full bg-gray-900 px-2 py-1 text-[11px] text-white">
                          {skillId}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function WorkflowBoard({
  cards,
  workflowTags,
  selectedDomain,
}: {
  cards: CapabilityCard[];
  workflowTags: WorkflowTag[];
  selectedDomain?: BusinessDomain | "全部";
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4 items-start">
      {workflowTags.map((tag) => {
        const tagCards = sortCards(
          cards.filter((card) => {
            const matchTag = card.workflowTag === tag;
            const matchDomain = selectedDomain ? matchesDomain(card, selectedDomain) : true;
            return matchTag && matchDomain;
          })
        );
        const counts = getStageCounts(tagCards);

        return (
          <Card key={tag} className="border-gray-100 bg-gray-50/70">
            <CardContent className="p-4 space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-semibold text-gray-900">{tag}</h2>
                  <Badge variant="outline" className="bg-white text-gray-500">
                    {tagCards.length}
                  </Badge>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-1 text-[11px] text-center">
                  <span className="rounded-md bg-emerald-50 py-1 text-emerald-700">{counts.官方认证}</span>
                  <span className="rounded-md bg-orange-50 py-1 text-orange-700">{counts.建设中}</span>
                  <span className="rounded-md bg-slate-100 py-1 text-slate-600">{counts.缺口}</span>
                </div>
              </div>

              <div className="space-y-3">
                {tagCards.length > 0 ? (
                  tagCards.map((card) => <CapabilityCardItem key={card.id} card={card} />)
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-400">
                    当前筛选下没有能力卡。
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function CoveragePage() {
  const cards = getCapabilityCards();
  const [view, setView] = useState<CoverageView>("总览");
  const [selectedDomain, setSelectedDomain] = useState<BusinessDomain | "全部">("全部");

  const visibleCards = useMemo(() => {
    if (view === "总览") return cards;
    return cards.filter((card) => card.workstream === view);
  }, [cards, view]);
  const counts = getStageCounts(visibleCards);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
            CAPABILITY GOVERNANCE MAP
          </p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">能力建设地图</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-3xl">
            地图里的卡片是“能力建设卡”，不是 Skill 本身。PM 维护卡片，上传者必须选择或申请挂靠卡片；只有正式卡片进入覆盖统计。
          </p>
        </div>
        <Link
          href="/upload"
          className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          去做能力归属登记
        </Link>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {viewOptions.map((item) => (
              <button
                key={item}
                onClick={() => setView(item)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  view === item
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-400">当前视图卡片</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{visibleCards.length}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-xs text-emerald-600">官方认证</p>
              <p className="mt-1 text-2xl font-bold text-emerald-800">{counts.官方认证}</p>
            </div>
            <div className="rounded-xl bg-orange-50 p-4">
              <p className="text-xs text-orange-600">建设中</p>
              <p className="mt-1 text-2xl font-bold text-orange-800">{counts.建设中}</p>
            </div>
            <div className="rounded-xl bg-slate-100 p-4">
              <p className="text-xs text-slate-500">缺口</p>
              <p className="mt-1 text-2xl font-bold text-slate-700">{counts.缺口}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {view === "总览" && <SummaryPanel cards={cards} />}

      {view === "流量侧" && (
        <div className="space-y-5">
          <Card>
            <CardContent className="p-5 space-y-3">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">流量侧筛选</h2>
                <p className="text-sm text-gray-500 mt-1">
                  流量侧按 6 个工作流横向展开，可按 APP流量 / 平台 / 厂商筛选。预算只作为相关域出现，不强行进入流量侧筛选。
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {trafficDomainOptions.map((domain) => (
                  <button
                    key={domain}
                    onClick={() => setSelectedDomain(domain)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
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
          <WorkflowBoard
            cards={cards.filter((card) => card.workstream === "流量侧")}
            workflowTags={TRAFFIC_WORKFLOW_TAGS}
            selectedDomain={selectedDomain}
          />
        </div>
      )}

      {view === "预算侧" && (
        <div className="space-y-5">
          <Card className="border-amber-100 bg-amber-50/40">
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold text-gray-900">预算侧呈现口径</h2>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                预算侧按 7 个服务环节展开，不套四大域矩阵。默认 ownerDomain 为预算，APP流量、平台、厂商只作为相关域标签，用于说明协同方。
              </p>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-7 gap-4 items-start">
            {BUDGET_WORKFLOW_TAGS.map((tag) => {
              const tagCards = sortCards(
                cards.filter((card) => card.workstream === "预算侧" && card.workflowTag === tag)
              );
              const tagCounts = getStageCounts(tagCards);
              return (
                <Card key={tag} className="border-gray-100 bg-gray-50/70">
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-base font-semibold text-gray-900">{tag}</h2>
                        <Badge variant="outline" className="bg-white text-gray-500">
                          {tagCards.length}
                        </Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-1 text-[11px] text-center">
                        <span className="rounded-md bg-emerald-50 py-1 text-emerald-700">
                          {tagCounts.官方认证}
                        </span>
                        <span className="rounded-md bg-orange-50 py-1 text-orange-700">
                          {tagCounts.建设中}
                        </span>
                        <span className="rounded-md bg-slate-100 py-1 text-slate-600">
                          {tagCounts.缺口}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {tagCards.map((card) => (
                        <CapabilityCardItem key={card.id} card={card} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
