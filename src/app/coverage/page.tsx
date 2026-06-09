"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  BUDGET_WORKFLOW_TAGS,
  getCapabilityCards,
  getSkills,
  TRAFFIC_WORKFLOW_TAGS,
} from "@/lib/data";
import type { CapabilityCard, CapabilityStage, Skill, WorkflowTag, Workstream } from "@/lib/types";

const stageStyle: Record<CapabilityStage, string> = {
  官方认证: "bg-emerald-600 text-white border-emerald-600",
  建设中: "bg-orange-50 text-orange-700 border-orange-200",
  缺口: "bg-slate-100 text-slate-600 border-slate-200",
};

const stageIcon: Record<CapabilityStage, typeof CheckCircle2> = {
  官方认证: CheckCircle2,
  建设中: Clock3,
  缺口: AlertTriangle,
};

const workstreamHint: Record<Workstream, string> = {
  流量侧: "按开发者运营链路从市场判断到客户服务推进。",
  预算侧: "按预算服务链路从日常沉淀到 case 诊断推进。",
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

function sortForDisplay(cards: CapabilityCard[]) {
  const priorityOrder = { P0: 0, P1: 1, P2: 2 };
  const stageOrder: Record<CapabilityStage, number> = {
    官方认证: 0,
    建设中: 1,
    缺口: 2,
  };

  return [...cards].sort((a, b) => {
    if (stageOrder[a.stage] !== stageOrder[b.stage]) {
      return stageOrder[a.stage] - stageOrder[b.stage];
    }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return a.title.localeCompare(b.title, "zh-CN");
  });
}

function getPrimarySkill(card: CapabilityCard, skills: Map<string, Skill>) {
  const skillId = card.officialSkillIds[0] ?? card.skillIds[0];
  return skillId ? skills.get(skillId) : undefined;
}

function getBuilders(card: CapabilityCard, skills: Map<string, Skill>) {
  const owners = card.skillIds
    .map((skillId) => skills.get(skillId)?.owner)
    .filter((owner): owner is string => Boolean(owner));
  return Array.from(new Set(owners)).join(" / ") || card.ownerPm || "待分配";
}

function CapabilityTile({
  card,
  skills,
}: {
  card: CapabilityCard;
  skills: Map<string, Skill>;
}) {
  const Icon = stageIcon[card.stage];
  const skill = getPrimarySkill(card, skills);
  const builders = getBuilders(card, skills);
  const officialSkill = card.officialSkillIds[0]
    ? skills.get(card.officialSkillIds[0])
    : undefined;
  const isOfficial = card.stage === "官方认证";
  const baseClass = `group block min-h-[86px] rounded-xl border p-2.5 transition ${
    isOfficial
      ? "border-emerald-200 bg-emerald-50 shadow-sm hover:border-emerald-300"
      : skill
        ? "border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm"
        : "border-dashed border-gray-200 bg-gray-50"
  }`;

  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className={`h-5 gap-1 px-1.5 text-[11px] ${stageStyle[card.stage]}`}>
            <Icon className="h-3 w-3" />
            {card.stage}
          </Badge>
          <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[11px] text-gray-500">
            {card.priority}
          </span>
        </div>
        {skill && (
          <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-300 transition group-hover:text-gray-500" />
        )}
      </div>

      <p className="mt-1.5 text-sm font-semibold leading-5 text-gray-900">{card.title}</p>
      <p className="mt-1 truncate text-[11px] text-gray-400">{card.module}</p>

      <div className="mt-2 space-y-1 text-xs">
        {isOfficial ? (
          <p className="font-medium text-emerald-700">
            已认证：{officialSkill?.name ?? `${card.officialSkillIds.length} 个官方 Skill`}
          </p>
        ) : card.stage === "建设中" ? (
          <p className="text-orange-700">建设人：{builders}</p>
        ) : (
          <p className="text-gray-500">待补 Skill</p>
        )}
        <p className="text-gray-400">
          {card.officialSkillIds.length} 官方 / {card.skillIds.length} Skill
        </p>
      </div>
    </>
  );

  if (!skill) return <div className={baseClass}>{content}</div>;

  return (
    <Link href={`/skills/${skill.id}`} className={baseClass}>
      {content}
    </Link>
  );
}

function StageCount({
  counts,
  compact = false,
}: {
  counts: ReturnType<typeof countByStage>;
  compact?: boolean;
}) {
  return (
    <div className={`grid grid-cols-3 gap-2 text-center ${compact ? "text-[11px]" : "text-xs"}`}>
      <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
        <p className={compact ? "font-bold" : "text-lg font-bold"}>{counts.官方认证}</p>
        <p>官方认证</p>
      </div>
      <div className="rounded-xl bg-orange-50 p-2 text-orange-700">
        <p className={compact ? "font-bold" : "text-lg font-bold"}>{counts.建设中}</p>
        <p>建设中</p>
      </div>
      <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
        <p className={compact ? "font-bold" : "text-lg font-bold"}>{counts.缺口}</p>
        <p>缺口</p>
      </div>
    </div>
  );
}

function WorkflowBlock({
  title,
  cards,
  skills,
  expanded,
  onToggle,
  step,
  total,
}: {
  title: WorkflowTag;
  cards: CapabilityCard[];
  skills: Map<string, Skill>;
  expanded: boolean;
  onToggle: () => void;
  step: number;
  total: number;
}) {
  const counts = countByStage(cards);
  const sortedCards = sortForDisplay(cards);
  const hasCards = sortedCards.length > 0;

  return (
    <div className="relative flex gap-3">
      <div className="flex w-9 shrink-0 flex-col items-center">
        <div className="z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gray-900 text-sm font-bold text-white shadow-sm">
          {step}
        </div>
        {step < total && <div className="mt-1 h-full min-h-10 w-px bg-gray-200" />}
      </div>
      <div className="min-w-0 flex-1 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500">
                第 {step}/{total} 步
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              {cards.length} 个能力点 · 官方覆盖 {coverageRate(cards)}%
            </p>
          </div>
          <div className="flex flex-wrap gap-1 text-[11px]">
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">
              认证 {counts.官方认证}
            </span>
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-orange-700">
              建设 {counts.建设中}
            </span>
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-slate-600">
              缺口 {counts.缺口}
            </span>
          </div>
        </div>

        {expanded && (
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {sortedCards.map((card) => (
              <CapabilityTile key={card.id} card={card} skills={skills} />
            ))}
          </div>
        )}

        {hasCards && (
          <button
            onClick={onToggle}
            className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:bg-white hover:text-gray-900"
          >
            {expanded ? "收起能力点" : `展开 ${sortedCards.length} 个能力点`}
            {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}

function WorkstreamPanel({
  title,
  tags,
  cards,
  skills,
  expandedWorkflows,
  onToggleWorkflow,
}: {
  title: Workstream;
  tags: WorkflowTag[];
  cards: CapabilityCard[];
  skills: Map<string, Skill>;
  expandedWorkflows: Record<string, boolean>;
  onToggleWorkflow: (key: string) => void;
}) {
  const counts = countByStage(cards);

  return (
    <Card className="border-gray-100">
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="mt-1 text-sm text-gray-500">{workstreamHint[title]}</p>
            <p className="mt-1 text-xs text-gray-400">{tags.length} 个步骤 / {cards.length} 个能力点</p>
          </div>
          <div className="flex items-center gap-4 md:text-right">
            <div>
              <p className="text-3xl font-bold text-gray-900">{coverageRate(cards)}%</p>
              <p className="text-xs text-gray-400">官方覆盖率</p>
            </div>
          </div>
        </div>

        <StageCount counts={counts} />

        <div className="rounded-2xl bg-gray-50 p-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500">工作流顺序</p>
            <p className="text-xs text-gray-400">从上到下推进</p>
          </div>
          <div className="space-y-3">
            {tags.map((tag, index) => {
              const workflowKey = `${title}-${tag}`;
              return (
                <WorkflowBlock
                  key={tag}
                  title={tag}
                  cards={cards.filter((card) => card.workflowTag === tag)}
                  skills={skills}
                  expanded={Boolean(expandedWorkflows[workflowKey])}
                  onToggle={() => onToggleWorkflow(workflowKey)}
                  step={index + 1}
                  total={tags.length}
                />
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WorkstreamTabs({
  active,
  trafficCards,
  budgetCards,
  onChange,
}: {
  active: Workstream;
  trafficCards: CapabilityCard[];
  budgetCards: CapabilityCard[];
  onChange: (workstream: Workstream) => void;
}) {
  const tabs: { title: Workstream; cards: CapabilityCard[] }[] = [
    { title: "流量侧", cards: trafficCards },
    { title: "预算侧", cards: budgetCards },
  ];

  return (
    <div className="flex gap-2 rounded-2xl bg-gray-100 p-1">
      {tabs.map((tab) => {
        const counts = countByStage(tab.cards);
        const selected = active === tab.title;
        return (
          <button
            key={tab.title}
            onClick={() => onChange(tab.title)}
            className={`flex flex-1 items-center justify-between rounded-xl px-4 py-3 text-left transition ${
              selected ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <span>
              <span className="block text-sm font-semibold">{tab.title}</span>
              <span className="mt-0.5 block text-xs">
                {tab.cards.length} 个能力点 · {coverageRate(tab.cards)}% 覆盖
              </span>
            </span>
            <span className="text-xs">
              官方 {counts.官方认证}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function OverviewCard({
  cards,
  trafficCards,
  budgetCards,
}: {
  cards: CapabilityCard[];
  trafficCards: CapabilityCard[];
  budgetCards: CapabilityCard[];
}) {
  const counts = countByStage(cards);
  const streamRows = [
    { title: "流量侧", cards: trafficCards },
    { title: "预算侧", cards: budgetCards },
  ];

  return (
    <Card className="border-gray-100">
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">总览</h2>
            <p className="mt-1 text-sm text-gray-500">{cards.length} 个能力点 / 官方覆盖 {coverageRate(cards)}%</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 md:w-72">
            {streamRows.map((row) => (
              <div key={row.title} className="rounded-xl bg-gray-50 p-3">
                <p className="font-semibold text-gray-900">{row.title}</p>
                <p className="mt-1">{coverageRate(row.cards)}% 覆盖</p>
                <p>{countByStage(row.cards).官方认证} 个官方认证</p>
              </div>
            ))}
          </div>
        </div>
        <StageCount counts={counts} compact />
      </CardContent>
    </Card>
  );
}

export default function CoveragePage() {
  const cards = getCapabilityCards();
  const skills = new Map(getSkills().map((skill) => [skill.id, skill]));
  const trafficCards = cards.filter((card) => card.workstream === "流量侧");
  const budgetCards = cards.filter((card) => card.workstream === "预算侧");
  const [activeWorkstream, setActiveWorkstream] = useState<Workstream>("流量侧");
  const [expandedWorkflows, setExpandedWorkflows] = useState<Record<string, boolean>>({});
  const activeCards = activeWorkstream === "流量侧" ? trafficCards : budgetCards;
  const activeTags = activeWorkstream === "流量侧" ? TRAFFIC_WORKFLOW_TAGS : BUDGET_WORKFLOW_TAGS;

  function toggleWorkflow(key: string) {
    setExpandedWorkflows((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
          CAPABILITY MAP
        </p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">能力地图</h1>
        <p className="mt-1 text-sm text-gray-500">流量侧与预算侧 Skill 建设进度。</p>
      </div>

      <OverviewCard cards={cards} trafficCards={trafficCards} budgetCards={budgetCards} />

      <WorkstreamTabs
        active={activeWorkstream}
        trafficCards={trafficCards}
        budgetCards={budgetCards}
        onChange={setActiveWorkstream}
      />

      <WorkstreamPanel
        title={activeWorkstream}
        cards={activeCards}
        tags={activeTags}
        skills={skills}
        expandedWorkflows={expandedWorkflows}
        onToggleWorkflow={toggleWorkflow}
      />
    </div>
  );
}
