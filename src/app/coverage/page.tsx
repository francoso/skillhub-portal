"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  BUDGET_WORKFLOW_TAGS,
  getCapabilityCards,
  TRAFFIC_WORKFLOW_TAGS,
} from "@/lib/data";
import type { CapabilityCard, CapabilityStage, WorkflowTag, Workstream } from "@/lib/types";

type Scope = "全部" | Workstream;

const scopeOptions: Scope[] = ["全部", "流量侧", "预算侧"];

const stageStyle: Record<CapabilityStage, string> = {
  官方认证: "bg-emerald-50 text-emerald-700 border-emerald-200",
  建设中: "bg-orange-50 text-orange-700 border-orange-200",
  缺口: "bg-slate-100 text-slate-600 border-slate-200",
};

const stageIcon: Record<CapabilityStage, typeof CheckCircle2> = {
  官方认证: CheckCircle2,
  建设中: Clock3,
  缺口: AlertTriangle,
};

function countByStage(cards: CapabilityCard[]) {
  return {
    官方认证: cards.filter((card) => card.stage === "官方认证").length,
    建设中: cards.filter((card) => card.stage === "建设中").length,
    缺口: cards.filter((card) => card.stage === "缺口").length,
  };
}

function coverageRate(cards: CapabilityCard[]) {
  if (cards.length === 0) return 0;
  return Math.round((cards.filter((card) => card.stage === "官方认证").length / cards.length) * 100);
}

function sortByNeed(cards: CapabilityCard[]) {
  const priorityOrder = { P0: 0, P1: 1, P2: 2 };
  const stageOrder: Record<CapabilityStage, number> = {
    缺口: 0,
    建设中: 1,
    官方认证: 2,
  };

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

function StatCard({
  label,
  value,
  desc,
}: {
  label: string;
  value: string | number;
  desc: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        <p className="mt-1 text-xs text-gray-400">{desc}</p>
      </CardContent>
    </Card>
  );
}

function CapabilityLine({ card }: { card: CapabilityCard }) {
  const Icon = stageIcon[card.stage];

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={stageStyle[card.stage]}>
              <Icon className="h-3 w-3" />
              {card.stage}
            </Badge>
            <Badge variant="outline" className="bg-gray-50 text-gray-600">
              {card.priority}
            </Badge>
            <span className="text-xs text-gray-400">{card.module}</span>
          </div>
          <p className="mt-2 font-semibold text-gray-900">{card.title}</p>
          <p className="mt-1 text-sm text-gray-500 leading-relaxed">{card.description}</p>
        </div>
        <div className="shrink-0 text-left md:w-48 md:text-right">
          <p className="text-xs text-gray-400">Skill 覆盖</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">
            {card.officialSkillIds.length} 官方 / {card.skillIds.length} 总数
          </p>
          <p className="mt-1 text-xs text-gray-400">{card.ownerPm ?? "待分配 PM"}</p>
        </div>
      </div>
      {card.stage !== "官方认证" && (
        <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
          下一步：{card.nextAction}
        </div>
      )}
    </div>
  );
}

function WorkflowBlock({
  title,
  cards,
}: {
  title: WorkflowTag;
  cards: CapabilityCard[];
}) {
  const counts = countByStage(cards);
  const topCards = sortByNeed(cards).slice(0, 3);

  return (
    <Card className="border-gray-100">
      <CardContent className="p-5 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {cards.length} 个能力点，官方覆盖 {coverageRate(cards)}%
            </p>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
              官方 {counts.官方认证}
            </span>
            <span className="rounded-full bg-orange-50 px-2.5 py-1 text-orange-700">
              建设 {counts.建设中}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
              缺口 {counts.缺口}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {topCards.map((card) => (
            <CapabilityLine key={card.id} card={card} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function WorkstreamSection({
  title,
  tags,
  cards,
}: {
  title: Workstream;
  tags: WorkflowTag[];
  cards: CapabilityCard[];
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
        <span className="hidden text-sm text-gray-400 md:block">
          {tags.length} 个环节 / {cards.length} 个能力点
        </span>
      </div>
      <div className="space-y-4">
        {tags.map((tag) => (
          <WorkflowBlock
            key={tag}
            title={tag}
            cards={cards.filter((card) => card.workflowTag === tag)}
          />
        ))}
      </div>
    </section>
  );
}

function WorkstreamSummary({
  title,
  cards,
  tags,
  onOpen,
}: {
  title: Workstream;
  cards: CapabilityCard[];
  tags: WorkflowTag[];
  onOpen: () => void;
}) {
  const counts = countByStage(cards);

  return (
    <Card className="border-gray-100">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {tags.length} 个环节，{cards.length} 个能力点，官方覆盖 {coverageRate(cards)}%。
            </p>
          </div>
          <button
            onClick={onOpen}
            className="shrink-0 rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white"
          >
            查看
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
            官方 {counts.官方认证}
          </div>
          <div className="rounded-lg bg-orange-50 p-2 text-orange-700">
            建设 {counts.建设中}
          </div>
          <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
            缺口 {counts.缺口}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
              {tag}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function CoveragePage() {
  const [scope, setScope] = useState<Scope>("全部");
  const cards = getCapabilityCards();
  const visibleCards =
    scope === "全部" ? cards : cards.filter((card) => card.workstream === scope);
  const counts = countByStage(visibleCards);
  const p0Needs = sortByNeed(
    visibleCards.filter((card) => card.priority === "P0" && card.stage !== "官方认证")
  ).slice(0, 5);
  const trafficCards = cards.filter((card) => card.workstream === "流量侧");
  const budgetCards = cards.filter((card) => card.workstream === "预算侧");

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
          CAPABILITY MAP
        </p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">能力地图</h1>
        <p className="mt-1 text-sm text-gray-500">按业务环节查看 Skill 建设进度。</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {scopeOptions.map((item) => (
          <button
            key={item}
            onClick={() => setScope(item)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              scope === item
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="官方覆盖率" value={`${coverageRate(visibleCards)}%`} desc="官方认证 / 当前能力点" />
        <StatCard label="官方认证" value={counts.官方认证} desc="已确认可推荐" />
        <StatCard label="建设中" value={counts.建设中} desc="已有候选 Skill" />
        <StatCard label="缺口" value={counts.缺口} desc="暂无可用 Skill" />
      </div>

      <Card className="border-orange-100">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold text-gray-900">重点缺口</h2>
            <span className="text-sm text-gray-400">P0 / 未认证</span>
          </div>
          <div className="space-y-3">
            {p0Needs.map((card) => (
              <CapabilityLine key={card.id} card={card} />
            ))}
          </div>
        </CardContent>
      </Card>

      {scope === "全部" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <WorkstreamSummary
            title="流量侧"
            cards={trafficCards}
            tags={TRAFFIC_WORKFLOW_TAGS}
            onOpen={() => setScope("流量侧")}
          />
          <WorkstreamSummary
            title="预算侧"
            cards={budgetCards}
            tags={BUDGET_WORKFLOW_TAGS}
            onOpen={() => setScope("预算侧")}
          />
        </div>
      )}

      {scope === "流量侧" && (
        <WorkstreamSection title="流量侧" tags={TRAFFIC_WORKFLOW_TAGS} cards={trafficCards} />
      )}

      {scope === "预算侧" && (
        <WorkstreamSection title="预算侧" tags={BUDGET_WORKFLOW_TAGS} cards={budgetCards} />
      )}
    </div>
  );
}
