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
  Pencil,
  Plus,
  Save,
  Settings2,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  APP_PRODUCT_WORKFLOW_TAGS,
  BUDGET_WORKFLOW_TAGS,
  CURRENT_SKILL_OWNER,
  getCapabilityCards,
  getSkills,
  PLATFORM_WORKFLOW_TAGS,
  resolveCapabilityStage,
  TRAFFIC_WORKFLOW_TAGS,
} from "@/lib/data";
import type {
  BusinessDomain,
  CapabilityCard,
  CapabilityPriority,
  CapabilityStage,
  Skill,
  WorkflowTag,
  Workstream,
} from "@/lib/types";

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

const domains: BusinessDomain[] = ["APP流量", "平台", "预算", "厂商"];
const priorities: CapabilityPriority[] = ["P0", "P1", "P2"];
type ManageMode = "none" | "associate" | "pm";
type CapabilityModule = "APP运营" | "APP产品" | "厂商" | "平台" | "预算";

const moduleHint: Record<CapabilityModule, string> = {
  APP运营: "APP 开发者运营链路，沿用现有流量运营工作流。",
  APP产品: "APP 产品能力链路，覆盖方案、接入、算力、价值、形态、变现和体验。",
  厂商: "厂商流量运营链路，包含通用能力和厂商专属能力。",
  平台: "平台治理与服务支撑模块，先按 6 个大模块建框架。",
  预算: "预算服务链路，按预算侧 7 个服务环节推进。",
};

const trafficCardModules: Record<string, CapabilityModule[]> = {
  "traffic-market-fundamentals": ["APP运营", "厂商"],
  "traffic-market-expansion-scan": ["APP运营"],
  "traffic-competitive-benchmark": ["APP运营", "厂商"],
  "traffic-lead-contact": ["APP运营", "厂商"],
  "traffic-access-solution": ["APP运营", "厂商"],
  "traffic-access-support": ["APP运营", "厂商"],
  "traffic-ramp-up": ["APP运营", "厂商"],
  "traffic-template-query": ["APP运营"],
  "traffic-template-rule-review": ["APP运营"],
  "traffic-style-capture": ["APP运营"],
  "traffic-template-effect-feedback": ["APP运营"],
  "traffic-data-diagnosis": ["APP运营", "厂商"],
  "traffic-revenue-fluctuation": ["APP运营", "厂商"],
  "traffic-vendor-scene-diagnosis": ["厂商"],
  "traffic-node-ramp-up": ["APP运营", "厂商"],
  "traffic-sdk-performance": ["APP运营"],
  "traffic-material-experience": ["APP运营"],
  "traffic-budget-blocking": ["APP运营", "厂商"],
  "traffic-visit-docs": ["APP运营", "厂商"],
  "traffic-visit-followup": ["APP运营"],
  "traffic-daily-qa": ["APP运营"],
  "traffic-salon-ops": ["APP运营"],
};

function cardBelongsToModule(card: CapabilityCard, module: CapabilityModule) {
  if (module === "预算") return card.workstream === "预算侧";
  if (module === "平台") return card.workstream === "平台";
  if (module === "APP产品") return card.workstream === "APP产品";
  if (card.workstream !== "流量侧") return false;
  const fallbackModules = [card.ownerDomain, ...card.relatedDomains].map((domain) =>
    domain === "APP流量" ? "APP运营" : domain
  );
  return (trafficCardModules[card.id] ?? fallbackModules).includes(module);
}

function moduleOwnerDomain(module: CapabilityModule): BusinessDomain {
  if (module === "APP运营" || module === "APP产品") return "APP流量";
  return module;
}

function deriveStage(card: Pick<CapabilityCard, "stage" | "ownerPm">): CapabilityStage {
  return resolveCapabilityStage(card);
}

function normalizeCard(card: CapabilityCard): CapabilityCard {
  const officialSkillIds = card.officialSkillIds.filter((skillId) => card.skillIds.includes(skillId));
  const nextCard = {
    ...card,
    officialSkillIds,
  };
  return {
    ...nextCard,
    stage: deriveStage(nextCard),
  };
}

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
  if (card.ownerPm?.trim()) return card.ownerPm;
  const owners = card.skillIds
    .map((skillId) => skills.get(skillId)?.owner)
    .filter((owner): owner is string => Boolean(owner));
  return Array.from(new Set(owners)).join(" / ") || "待分配";
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function createCapabilityCard(
  workstream: Workstream,
  workflowTag: WorkflowTag,
  ownerDomain: BusinessDomain
): CapabilityCard {
  return {
    id: `draft-${Date.now()}`,
    workstream,
    workflowTag,
    module: "新能力点",
    title: "未命名能力点",
    description: "",
    ownerDomain,
    relatedDomains: [],
    stage: "缺口",
    priority: "P1",
    skillIds: [],
    officialSkillIds: [],
    ownerPm: "",
    nextAction: "",
    evidenceExamples: [],
    updatedAt: today(),
  };
}

function CapabilityTile({
  card,
  skills,
  manageMode = "none",
  onEdit,
}: {
  card: CapabilityCard;
  skills: Map<string, Skill>;
  manageMode?: ManageMode;
  onEdit?: (cardId: string) => void;
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
            PM认证：{officialSkill?.name ?? card.ownerPm ?? "能力点已认证"}
          </p>
        ) : card.stage === "建设中" ? (
          <p className="text-orange-700">负责人：{builders}</p>
        ) : (
          <p className="text-gray-500">待分配负责人</p>
        )}
        <p className="text-gray-400">
          {card.officialSkillIds.length} 认证证据 / {card.skillIds.length} Skill
        </p>
      </div>
    </>
  );

  if (manageMode !== "none") {
    return (
      <div className={baseClass}>
        {content}
        <button
          onClick={() => onEdit?.(card.id)}
          className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:text-gray-900"
        >
          <Pencil className="h-3 w-3" />
          {manageMode === "pm" ? "编辑" : "关联 Skill"}
        </button>
      </div>
    );
  }

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
  manageMode = "none",
  onEditCard,
}: {
  title: WorkflowTag;
  cards: CapabilityCard[];
  skills: Map<string, Skill>;
  expanded: boolean;
  onToggle: () => void;
  step: number;
  total: number;
  manageMode?: ManageMode;
  onEditCard?: (cardId: string) => void;
}) {
  const counts = countByStage(cards);
  const sortedCards = sortForDisplay(cards);
  const hasCards = sortedCards.length > 0;
  const showCards = expanded || (manageMode !== "none" && hasCards);

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

        {showCards && (
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {sortedCards.map((card) => (
              <CapabilityTile
                key={card.id}
                card={card}
                skills={skills}
                manageMode={manageMode}
                onEdit={onEditCard}
              />
            ))}
          </div>
        )}

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          {hasCards && (
            <button
              onClick={onToggle}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:bg-white hover:text-gray-900"
            >
              {expanded ? "收起能力点" : `展开 ${sortedCards.length} 个能力点`}
              {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
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
  manageMode,
  onEditCard,
}: {
  title: CapabilityModule;
  tags: WorkflowTag[];
  cards: CapabilityCard[];
  skills: Map<string, Skill>;
  expandedWorkflows: Record<string, boolean>;
  onToggleWorkflow: (key: string) => void;
  manageMode?: ManageMode;
  onEditCard?: (cardId: string) => void;
}) {
  const counts = countByStage(cards);

  return (
    <Card className="border-gray-100">
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="mt-1 text-sm text-gray-500">{moduleHint[title]}</p>
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
                  manageMode={manageMode}
                  onEditCard={onEditCard}
                />
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CapabilityManagePanel({
  mode,
  cards,
  skills,
  selectedCard,
  activeModule,
  activeTags,
  onSelectCard,
  onPatchCard,
  onToggleSkill,
  onToggleOfficialSkill,
  onAddCard,
  onDeleteCard,
  onSave,
  saved,
  currentSkillOwner,
}: {
  mode: Exclude<ManageMode, "none">;
  cards: CapabilityCard[];
  skills: Skill[];
  selectedCard?: CapabilityCard;
  activeModule: CapabilityModule;
  activeTags: WorkflowTag[];
  onSelectCard: (cardId: string) => void;
  onPatchCard: (cardId: string, patch: Partial<CapabilityCard>) => void;
  onToggleSkill: (cardId: string, skillId: string) => void;
  onToggleOfficialSkill: (cardId: string, skillId: string) => void;
  onAddCard: (workflowTag: WorkflowTag) => void;
  onDeleteCard: (cardId: string) => void;
  onSave: () => void;
  saved: boolean;
  currentSkillOwner: string;
}) {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const activeCards = cards;
  const isPm = mode === "pm";
  const visibleSkills = isPm ? skills : skills.filter((skill) => skill.owner === currentSkillOwner);
  const panelTitle = isPm ? "PM 管理" : "关联 Skill";
  const panelDesc = isPm
    ? "维护能力点、负责人、工作流和官方认证。仅 PM / 管理员可见。"
    : `只显示 ${currentSkillOwner} 上传的 Skill。`;

  function toggleMenu(tag: WorkflowTag) {
    const key = `${activeModule}-${tag}`;
    setOpenMenus((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  return (
    <Card className="border-blue-100 bg-blue-50/40">
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <Settings2 className="h-4 w-4 text-blue-600" />
              {panelTitle}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{panelDesc}</p>
          </div>
          <button
            onClick={onSave}
            className="flex items-center justify-center gap-1 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
          >
            <Save className="h-4 w-4" />
            保存配置
          </button>
        </div>

        {saved && <p className="rounded-lg bg-white px-3 py-2 text-xs text-blue-700">已更新本页预览。</p>}

        <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
          <div className="rounded-2xl border border-blue-100 bg-white p-3">
            <p className="mb-2 text-xs font-medium text-gray-500">{activeModule}工作流</p>
            <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
              {activeTags.map((tag) => {
                const menuKey = `${activeModule}-${tag}`;
                const expanded = Boolean(openMenus[menuKey]);
                const workflowCards = sortForDisplay(activeCards.filter((card) => card.workflowTag === tag));
                return (
                  <div key={tag} className="rounded-xl border border-gray-100 bg-gray-50">
                    <button
                      onClick={() => toggleMenu(tag)}
                      className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-medium text-gray-700 transition hover:text-gray-900"
                    >
                      <span className="truncate">{tag}</span>
                      <span className="flex shrink-0 items-center gap-1 text-[11px] text-gray-400">
                        {workflowCards.length}
                        {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      </span>
                    </button>
                    {expanded && (
                      <div className="space-y-1 border-t border-gray-100 bg-white p-2">
                        {isPm && (
                          <button
                            onClick={() => onAddCard(tag)}
                            className="mb-1 flex w-full items-center justify-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2 py-1.5 text-xs font-medium text-blue-700 transition hover:border-blue-300 hover:bg-white"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            新增能力点
                          </button>
                        )}
                        {workflowCards.length === 0 ? (
                          <p className="rounded-lg bg-gray-50 px-2 py-2 text-xs text-gray-400">暂无能力点</p>
                        ) : (
                          workflowCards.map((card) => (
                            <div
                              key={card.id}
                              className={`group flex items-center gap-1 rounded-lg transition ${
                                selectedCard?.id === card.id ? "bg-blue-50" : "hover:bg-gray-50"
                              }`}
                            >
                              <button
                                onClick={() => onSelectCard(card.id)}
                                className={`min-w-0 flex-1 px-2 py-2 text-left text-xs ${
                                  selectedCard?.id === card.id ? "text-blue-700" : "text-gray-600"
                                }`}
                              >
                                <span className="block truncate font-medium">{card.title}</span>
                                <span className="mt-0.5 block text-[11px] text-gray-400">{deriveStage(card)}</span>
                              </button>
                              {isPm && (
                                <button
                                  onClick={() => onDeleteCard(card.id)}
                                  className="mr-1 rounded-md p-1 text-gray-300 opacity-100 transition hover:bg-red-50 hover:text-red-500 md:opacity-0 md:group-hover:opacity-100"
                                  aria-label={`删除 ${card.title}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {selectedCard ? (
            <div className="space-y-4 rounded-2xl border border-blue-100 bg-white p-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selectedCard.title}</p>
                  <p className="mt-1 text-xs text-gray-400">{selectedCard.workflowTag}</p>
                </div>
                <Badge variant="outline" className={`w-fit ${stageStyle[deriveStage(selectedCard)]}`}>
                  {deriveStage(selectedCard)}
                </Badge>
              </div>

              {isPm && (
                <>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-xs font-medium text-gray-500">
                      能力点名称
                      <input
                        value={selectedCard.title}
                        onChange={(event) => onPatchCard(selectedCard.id, { title: event.target.value })}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-300"
                      />
                    </label>
                    <label className="text-xs font-medium text-gray-500">
                      所属工作流
                      <select
                        value={selectedCard.workflowTag}
                        onChange={(event) => onPatchCard(selectedCard.id, { workflowTag: event.target.value as WorkflowTag })}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-300"
                      >
                        {activeTags.map((tag) => (
                          <option key={tag} value={tag}>{tag}</option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs font-medium text-gray-500">
                      细分模块
                      <input
                        value={selectedCard.module}
                        onChange={(event) => onPatchCard(selectedCard.id, { module: event.target.value })}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-300"
                      />
                    </label>
                    <label className="text-xs font-medium text-gray-500">
                      Owner PM
                      <input
                        value={selectedCard.ownerPm ?? ""}
                        onChange={(event) => onPatchCard(selectedCard.id, { ownerPm: event.target.value })}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-300"
                      />
                    </label>
                    <label className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-500">
                      <span>
                        PM 已认证
                        <span className="mt-0.5 block text-[11px] font-normal text-gray-400">
                          仅 PM 配置会改变认证阶段
                        </span>
                      </span>
                      <input
                        type="checkbox"
                        checked={selectedCard.stage === "官方认证"}
                        onChange={(event) =>
                          onPatchCard(selectedCard.id, {
                            stage: event.target.checked ? "官方认证" : "建设中",
                          })
                        }
                      />
                    </label>
                    <label className="text-xs font-medium text-gray-500">
                      优先级
                      <select
                        value={selectedCard.priority}
                        onChange={(event) => onPatchCard(selectedCard.id, { priority: event.target.value as CapabilityPriority })}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-300"
                      >
                        {priorities.map((priority) => (
                          <option key={priority} value={priority}>{priority}</option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs font-medium text-gray-500">
                      主责域
                      <select
                        value={selectedCard.ownerDomain}
                        onChange={(event) => onPatchCard(selectedCard.id, { ownerDomain: event.target.value as BusinessDomain })}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-300"
                      >
                        {domains.map((domain) => (
                          <option key={domain} value={domain}>{domain}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="block text-xs font-medium text-gray-500">
                    下一步动作
                    <textarea
                      value={selectedCard.nextAction}
                      onChange={(event) => onPatchCard(selectedCard.id, { nextAction: event.target.value })}
                      rows={2}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-300"
                    />
                  </label>
                </>
              )}

              <div>
                <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-medium text-gray-500">关联 Skill</p>
                  <p className="text-[11px] text-gray-400">
                    {isPm ? "关联只作为证据，不自动改变阶段" : "仅可关联自己的 Skill"}
                  </p>
                </div>
                <div className="max-h-64 space-y-1 overflow-auto rounded-xl border border-gray-100 p-2">
                  {visibleSkills.length === 0 && (
                    <p className="rounded-lg bg-gray-50 px-3 py-3 text-xs text-gray-400">
                      当前账号暂无可关联 Skill
                    </p>
                  )}
                  {visibleSkills.map((skill) => {
                    const linked = selectedCard.skillIds.includes(skill.id);
                    const official = selectedCard.officialSkillIds.includes(skill.id);
                    return (
                      <div key={skill.id} className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-xs hover:bg-gray-50">
                        <label className="flex min-w-0 flex-1 items-center gap-2 text-gray-700">
                          <input
                            type="checkbox"
                            checked={linked}
                            onChange={() => onToggleSkill(selectedCard.id, skill.id)}
                          />
                          <span className="min-w-0">
                            <span className="block truncate font-medium">{skill.name}</span>
                            <span className="block truncate text-[11px] text-gray-400">{skill.owner}</span>
                          </span>
                        </label>
                        {isPm && (
                          <label className={`flex shrink-0 items-center gap-1 ${linked ? "text-gray-500" : "text-gray-300"}`}>
                            <input
                              type="checkbox"
                              checked={official}
                              disabled={!linked}
                              onChange={() => onToggleOfficialSkill(selectedCard.id, skill.id)}
                            />
                            认证证据
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-blue-200 bg-white p-6 text-center text-sm text-gray-500">
              从左侧工作流选择能力点。
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ModuleTabs({
  active,
  moduleCards,
  onChange,
}: {
  active: CapabilityModule;
  moduleCards: Record<CapabilityModule, CapabilityCard[]>;
  onChange: (module: CapabilityModule) => void;
}) {
  const tabs: CapabilityModule[] = ["APP运营", "APP产品", "厂商", "平台", "预算"];

  return (
    <div className="grid gap-2 rounded-2xl bg-gray-100 p-1 md:grid-cols-5">
      {tabs.map((tab) => {
        const cards = moduleCards[tab];
        const counts = countByStage(cards);
        const selected = active === tab;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`flex flex-1 items-center justify-between rounded-xl px-4 py-3 text-left transition ${
              selected ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <span>
              <span className="block text-sm font-semibold">{tab}</span>
              <span className="mt-0.5 block text-xs">
                {cards.length} 个能力点 · {coverageRate(cards)}% 覆盖
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
  moduleCards,
}: {
  cards: CapabilityCard[];
  moduleCards: Record<CapabilityModule, CapabilityCard[]>;
}) {
  const counts = countByStage(cards);
  const streamRows: CapabilityModule[] = ["APP运营", "APP产品", "厂商", "平台", "预算"];

  return (
    <Card className="border-gray-100">
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">总览</h2>
            <p className="mt-1 text-sm text-gray-500">{cards.length} 个能力点 / 官方覆盖 {coverageRate(cards)}%</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 md:w-[560px] lg:grid-cols-5">
            {streamRows.map((module) => (
              <div key={module} className="rounded-xl bg-gray-50 p-3">
                <p className="font-semibold text-gray-900">{module}</p>
                <p className="mt-1">{coverageRate(moduleCards[module])}% 覆盖</p>
                <p>{countByStage(moduleCards[module]).官方认证} 个官方认证</p>
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
  const [cards, setCards] = useState<CapabilityCard[]>(() => getCapabilityCards().map(normalizeCard));
  const skillList = getSkills();
  const skills = new Map(skillList.map((skill) => [skill.id, skill]));
  const moduleCards: Record<CapabilityModule, CapabilityCard[]> = {
    APP运营: cards.filter((card) => cardBelongsToModule(card, "APP运营")),
    APP产品: cards.filter((card) => cardBelongsToModule(card, "APP产品")),
    厂商: cards.filter((card) => cardBelongsToModule(card, "厂商")),
    平台: cards.filter((card) => cardBelongsToModule(card, "平台")),
    预算: cards.filter((card) => cardBelongsToModule(card, "预算")),
  };
  const [activeModule, setActiveModule] = useState<CapabilityModule>("APP运营");
  const [expandedWorkflows, setExpandedWorkflows] = useState<Record<string, boolean>>({});
  const [manageMode, setManageMode] = useState<ManageMode>("none");
  const [selectedCardId, setSelectedCardId] = useState<string>();
  const [saved, setSaved] = useState(false);
  const activeCards = moduleCards[activeModule];
  const activeWorkstream: Workstream =
    activeModule === "预算"
      ? "预算侧"
      : activeModule === "平台"
        ? "平台"
        : activeModule === "APP产品"
          ? "APP产品"
          : "流量侧";
  const activeTags: WorkflowTag[] =
    activeModule === "预算"
      ? BUDGET_WORKFLOW_TAGS
      : activeModule === "平台"
        ? PLATFORM_WORKFLOW_TAGS
        : activeModule === "APP产品"
          ? APP_PRODUCT_WORKFLOW_TAGS
          : activeModule === "厂商"
            ? TRAFFIC_WORKFLOW_TAGS.filter((tag) => tag !== "形态样式")
            : TRAFFIC_WORKFLOW_TAGS;
  const selectedCard = selectedCardId ? cards.find((card) => card.id === selectedCardId) : undefined;

  function toggleWorkflow(key: string) {
    setExpandedWorkflows((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  function patchCard(cardId: string, patch: Partial<CapabilityCard>) {
    setSaved(false);
    setCards((current) =>
      current.map((card) =>
        card.id === cardId
          ? normalizeCard({
              ...card,
              ...patch,
              updatedAt: today(),
            })
          : card
      )
    );
  }

  function addCard(workflowTag: WorkflowTag) {
    const nextCard = createCapabilityCard(activeWorkstream, workflowTag, moduleOwnerDomain(activeModule));
    setSaved(false);
    setCards((current) => [...current, nextCard]);
    setSelectedCardId(nextCard.id);
    setExpandedWorkflows((current) => ({
      ...current,
      [`${activeModule}-${workflowTag}`]: true,
    }));
  }

  function deleteCard(cardId: string) {
    setSaved(false);
    setCards((current) => current.filter((card) => card.id !== cardId));
    setSelectedCardId((current) => (current === cardId ? undefined : current));
  }

  function toggleSkill(cardId: string, skillId: string) {
    setSaved(false);
    setCards((current) =>
      current.map((card) => {
        if (card.id !== cardId) return card;
        const linked = card.skillIds.includes(skillId);
        const skillIds = linked
          ? card.skillIds.filter((id) => id !== skillId)
          : [...card.skillIds, skillId];
        const officialSkillIds = linked
          ? card.officialSkillIds.filter((id) => id !== skillId)
          : card.officialSkillIds;
        return normalizeCard({
          ...card,
          skillIds,
          officialSkillIds,
          updatedAt: today(),
        });
      })
    );
  }

  function toggleOfficialSkill(cardId: string, skillId: string) {
    setSaved(false);
    setCards((current) =>
      current.map((card) => {
        if (card.id !== cardId) return card;
        if (!card.skillIds.includes(skillId)) return card;
        const official = card.officialSkillIds.includes(skillId);
        const officialSkillIds = official
          ? card.officialSkillIds.filter((id) => id !== skillId)
          : [...card.officialSkillIds, skillId];
        return normalizeCard({
          ...card,
          officialSkillIds,
          updatedAt: today(),
        });
      })
    );
  }

  function saveDraft() {
    setSaved(true);
  }

  function changeModule(module: CapabilityModule) {
    setActiveModule(module);
    setSelectedCardId(undefined);
    setSaved(false);
  }

  function toggleManageMode(nextMode: Exclude<ManageMode, "none">) {
    setManageMode((current) => (current === nextMode ? "none" : nextMode));
    setSelectedCardId(undefined);
    setSaved(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
            CAPABILITY MAP
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">能力地图</h1>
          <p className="mt-1 text-sm text-gray-500">按 APP运营、APP产品、厂商、平台、预算查看 Skill 建设进度。</p>
        </div>
        <div className="space-y-1 md:text-right">
          <div className="flex flex-wrap gap-2 md:justify-end">
            <button
              onClick={() => toggleManageMode("associate")}
              className={`flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                manageMode === "associate"
                  ? "bg-blue-600 text-white hover:bg-blue-500"
                  : "bg-white text-gray-700 ring-1 ring-gray-200 hover:text-gray-900"
              }`}
            >
              <Pencil className="h-4 w-4" />
              {manageMode === "associate" ? "退出关联" : "关联 Skill"}
            </button>
            <button
              onClick={() => toggleManageMode("pm")}
              className={`flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                manageMode === "pm"
                  ? "bg-blue-600 text-white hover:bg-blue-500"
                  : "bg-gray-900 text-white hover:bg-gray-700"
              }`}
            >
              <Settings2 className="h-4 w-4" />
              {manageMode === "pm" ? "退出管理" : "PM 管理"}
            </button>
          </div>
          <p className="text-[11px] text-gray-400">
            关联 Skill 仅限本人上传；PM 管理仅对 PM / 管理员开放
          </p>
        </div>
      </div>

      <OverviewCard cards={cards} moduleCards={moduleCards} />

      <ModuleTabs
        active={activeModule}
        moduleCards={moduleCards}
        onChange={changeModule}
      />

      {manageMode !== "none" && (
        <CapabilityManagePanel
          mode={manageMode}
          cards={activeCards}
          skills={skillList}
          selectedCard={selectedCard}
          activeModule={activeModule}
          activeTags={activeTags}
          onSelectCard={setSelectedCardId}
          onPatchCard={patchCard}
          onToggleSkill={toggleSkill}
          onToggleOfficialSkill={toggleOfficialSkill}
          onAddCard={addCard}
          onDeleteCard={deleteCard}
          onSave={saveDraft}
          saved={saved}
          currentSkillOwner={CURRENT_SKILL_OWNER}
        />
      )}

      <WorkstreamPanel
        title={activeModule}
        cards={activeCards}
        tags={activeTags}
        skills={skills}
        expandedWorkflows={expandedWorkflows}
        onToggleWorkflow={toggleWorkflow}
        manageMode={manageMode}
        onEditCard={setSelectedCardId}
      />
    </div>
  );
}
