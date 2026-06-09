"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, FilePlus2, GitPullRequest, UploadCloud } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  BUDGET_WORKFLOW_TAGS,
  BUSINESS_DOMAINS,
  getCapabilityCards,
  getPendingSkillRegistrations,
  TRAFFIC_WORKFLOW_TAGS,
} from "@/lib/data";
import type {
  BusinessDomain,
  CapabilityCard,
  PendingSkillRegistration,
  WorkflowTag,
  Workstream,
} from "@/lib/types";

const KNOT_UPLOAD_URL = "https://knot.woa.com";

type RegisterMode = "existing" | "propose";

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-gray-900";
const labelClass = "text-sm font-medium text-gray-700";

function workflowTagsFor(workstream: Workstream): WorkflowTag[] {
  return workstream === "流量侧" ? TRAFFIC_WORKFLOW_TAGS : BUDGET_WORKFLOW_TAGS;
}

function statusStyle(status: PendingSkillRegistration["status"]) {
  if (status === "已挂靠") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "已驳回") return "bg-slate-100 text-slate-600 border-slate-200";
  if (status === "待PM确认") return "bg-orange-50 text-orange-700 border-orange-200";
  return "bg-blue-50 text-blue-700 border-blue-200";
}

function ExistingCardPreview({ card }: { card?: CapabilityCard }) {
  if (!card) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
        选择工作流标签和能力建设卡后，这里会展示归属信息。
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-900">{card.title}</p>
          <p className="mt-1 text-xs text-gray-500">
            {card.workstream} / {card.workflowTag} / {card.module}
          </p>
        </div>
        <Badge variant="outline" className="bg-gray-900 text-white border-gray-900">
          {card.stage}
        </Badge>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{card.description}</p>
      <div className="flex flex-wrap gap-1.5 text-xs">
        <Badge variant="outline">Owner PM：{card.ownerPm ?? "待分配"}</Badge>
        <Badge variant="outline">关联 Skill {card.skillIds.length}</Badge>
        <Badge variant="outline">官方 Skill {card.officialSkillIds.length}</Badge>
      </div>
      <div className="rounded-lg bg-amber-50 p-3">
        <p className="text-xs font-medium text-amber-700">下一步动作</p>
        <p className="mt-1 text-xs text-amber-900 leading-relaxed">{card.nextAction}</p>
      </div>
    </div>
  );
}

export default function UploadRegistrationPage() {
  const cards = getCapabilityCards();
  const pendingRegistrations = getPendingSkillRegistrations();
  const [mode, setMode] = useState<RegisterMode>("existing");
  const [workstream, setWorkstream] = useState<Workstream>("流量侧");
  const [workflowTag, setWorkflowTag] = useState<WorkflowTag>("市场分析");
  const [capabilityCardId, setCapabilityCardId] = useState("");
  const [uploader, setUploader] = useState("francoso");
  const [knotSkillUrl, setKnotSkillUrl] = useState("");
  const [note, setNote] = useState("");
  const [proposedTitle, setProposedTitle] = useState("");
  const [proposedDescription, setProposedDescription] = useState("");
  const [proposedDomain, setProposedDomain] = useState<BusinessDomain>("APP流量");
  const [proposedReason, setProposedReason] = useState("");
  const [submitted, setSubmitted] = useState<PendingSkillRegistration | null>(null);

  const workflowOptions = workflowTagsFor(workstream);
  const availableCards = useMemo(
    () =>
      cards.filter(
        (card) => card.workstream === workstream && card.workflowTag === workflowTag
      ),
    [cards, workstream, workflowTag]
  );
  const selectedCard = availableCards.find((card) => card.id === capabilityCardId);

  const canSubmitExisting = mode === "existing" && Boolean(capabilityCardId);
  const canSubmitPropose =
    mode === "propose" &&
    proposedTitle.trim().length > 0 &&
    proposedDescription.trim().length > 0 &&
    proposedReason.trim().length > 0;
  const canSubmit = uploader.trim().length > 0 && (canSubmitExisting || canSubmitPropose);

  function handleWorkstreamChange(nextWorkstream: Workstream) {
    setWorkstream(nextWorkstream);
    setWorkflowTag(workflowTagsFor(nextWorkstream)[0]);
    setCapabilityCardId("");
    setSubmitted(null);
  }

  function handleWorkflowChange(nextTag: WorkflowTag) {
    setWorkflowTag(nextTag);
    setCapabilityCardId("");
    setSubmitted(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    const base = {
      id: `reg-local-${Date.now()}`,
      uploader,
      workstream,
      workflowTag,
      knotSkillUrl: knotSkillUrl.trim() || undefined,
      createdAt: "2026-06-09",
    };

    if (mode === "existing") {
      setSubmitted({
        ...base,
        capabilityCardId,
        status: knotSkillUrl.trim() ? "待PM确认" : "待上传",
      });
      return;
    }

    setSubmitted({
      ...base,
      proposedCard: {
        title: proposedTitle,
        description: proposedDescription,
        ownerDomain: proposedDomain,
        reason: proposedReason,
      },
      status: "待PM确认",
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
          SKILL OWNERSHIP REGISTRATION
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">能力归属登记</h1>
        <p className="text-sm text-gray-500 mt-1 max-w-3xl">
          Knot 当前没有上传接口，所以 SkillHub 先做归属登记：上传者必须选择已有能力建设卡，或申请新建能力卡，通过后再进入正式地图统计。
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="space-y-2">
                  <span className={labelClass}>上传者</span>
                  <input
                    value={uploader}
                    onChange={(event) => setUploader(event.target.value)}
                    className={inputClass}
                    placeholder="真实英文名"
                  />
                </label>

                <label className="space-y-2">
                  <span className={labelClass}>业务流</span>
                  <select
                    value={workstream}
                    onChange={(event) => handleWorkstreamChange(event.target.value as Workstream)}
                    className={inputClass}
                  >
                    <option value="流量侧">流量侧</option>
                    <option value="预算侧">预算侧</option>
                  </select>
                </label>

                <label className="space-y-2">
                  <span className={labelClass}>工作流标签</span>
                  <select
                    value={workflowTag}
                    onChange={(event) => handleWorkflowChange(event.target.value as WorkflowTag)}
                    className={inputClass}
                  >
                    {workflowOptions.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("existing");
                      setSubmitted(null);
                    }}
                    className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      mode === "existing"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    选择已有能力卡
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("propose");
                      setCapabilityCardId("");
                      setSubmitted(null);
                    }}
                    className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      mode === "propose"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    申请新建能力卡
                  </button>
                </div>
              </div>

              {mode === "existing" ? (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4">
                  <div className="space-y-4">
                    <label className="space-y-2 block">
                      <span className={labelClass}>能力建设卡</span>
                      <select
                        value={capabilityCardId}
                        onChange={(event) => {
                          setCapabilityCardId(event.target.value);
                          setSubmitted(null);
                        }}
                        className={inputClass}
                      >
                        <option value="">请选择能力建设卡</option>
                        {availableCards.map((card) => (
                          <option key={card.id} value={card.id}>
                            {card.module} / {card.title}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-2 block">
                      <span className={labelClass}>Knot Skill 链接或 ID（可上传后回填）</span>
                      <input
                        value={knotSkillUrl}
                        onChange={(event) => setKnotSkillUrl(event.target.value)}
                        className={inputClass}
                        placeholder="https://knot.woa.com/skills/detail/..."
                      />
                    </label>
                    <label className="space-y-2 block">
                      <span className={labelClass}>说明（可选）</span>
                      <textarea
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        className={`${inputClass} min-h-24 resize-none`}
                        placeholder="补充适用场景、建议认证组、已知风险..."
                      />
                    </label>
                  </div>
                  <ExistingCardPreview card={selectedCard} />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <label className="space-y-2">
                    <span className={labelClass}>新卡片标题</span>
                    <input
                      value={proposedTitle}
                      onChange={(event) => {
                        setProposedTitle(event.target.value);
                        setSubmitted(null);
                      }}
                      className={inputClass}
                      placeholder="例如：沙龙宣讲材料自动生成"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className={labelClass}>适用业务域</span>
                    <select
                      value={proposedDomain}
                      onChange={(event) => setProposedDomain(event.target.value as BusinessDomain)}
                      className={inputClass}
                    >
                      {BUSINESS_DOMAINS.map((domain) => (
                        <option key={domain} value={domain}>
                          {domain}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 lg:col-span-2">
                    <span className={labelClass}>问题描述 / 能力描述</span>
                    <textarea
                      value={proposedDescription}
                      onChange={(event) => {
                        setProposedDescription(event.target.value);
                        setSubmitted(null);
                      }}
                      className={`${inputClass} min-h-24 resize-none`}
                      placeholder="这个能力解决什么问题，输出什么结果，适用于哪个业务环节。"
                    />
                  </label>
                  <label className="space-y-2 lg:col-span-2">
                    <span className={labelClass}>为什么现有卡片放不下</span>
                    <textarea
                      value={proposedReason}
                      onChange={(event) => {
                        setProposedReason(event.target.value);
                        setSubmitted(null);
                      }}
                      className={`${inputClass} min-h-24 resize-none`}
                      placeholder="说明和已有能力卡的差异，便于 PM 判断新建、合并或驳回。"
                    />
                  </label>
                </div>
              )}

              <div className="flex flex-col gap-3 rounded-xl bg-gray-50 p-4 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-gray-600">
                  {mode === "existing"
                    ? "必须选择一个正式能力建设卡，才能继续跳转 Knot 上传。"
                    : "新卡片申请通过前，Skill 进入待归类/待确认队列，不计入正式地图统计。"}
                </div>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    canSubmit
                      ? "bg-gray-900 text-white hover:bg-gray-800"
                      : "cursor-not-allowed bg-gray-200 text-gray-400"
                  }`}
                >
                  完成登记
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-blue-100 bg-blue-50/50">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <UploadCloud className="h-4 w-4 text-blue-600" />
                <h2 className="font-semibold text-gray-900">一期流程</h2>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <p>1. 在 SkillHub 完成能力归属登记。</p>
                <p>2. 跳转 Knot 上传 Skill。</p>
                <p>3. 回填 Knot Skill 链接或 ID。</p>
                <p>4. PM 确认后，Skill 挂到能力卡；认证通过后卡片变为官方认证。</p>
              </div>
            </CardContent>
          </Card>

          {submitted && (
            <Card className="border-emerald-100 bg-emerald-50/50">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <h2 className="font-semibold text-gray-900">登记已生成</h2>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>登记 ID：{submitted.id}</p>
                  <p>状态：{submitted.status}</p>
                  <p>
                    路径：
                    {submitted.proposedCard
                      ? `申请新卡片 / ${submitted.proposedCard.title}`
                      : `挂靠已有卡片 / ${selectedCard?.title ?? submitted.capabilityCardId}`}
                  </p>
                </div>
                <a
                  href={KNOT_UPLOAD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  继续到 Knot 上传
                  <ArrowRight className="h-4 w-4" />
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <GitPullRequest className="h-4 w-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">当前登记队列</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {pendingRegistrations.map((item) => (
              <div key={item.id} className="rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.proposedCard?.title ??
                        cards.find((card) => card.id === item.capabilityCardId)?.title ??
                        item.capabilityCardId}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {item.workstream} / {item.workflowTag} · {item.uploader} · {item.createdAt}
                    </p>
                  </div>
                  <Badge variant="outline" className={statusStyle(item.status)}>
                    {item.status}
                  </Badge>
                </div>
                {item.proposedCard && (
                  <div className="mt-3 rounded-lg bg-orange-50 p-3 text-xs text-orange-900">
                    <div className="mb-1 flex items-center gap-1 font-medium">
                      <FilePlus2 className="h-3.5 w-3.5" />
                      新卡申请
                    </div>
                    {item.proposedCard.reason}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
