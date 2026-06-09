"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  BUDGET_WORKFLOW_TAGS,
  getCapabilityCards,
  getPendingSkillRegistrations,
  TRAFFIC_WORKFLOW_TAGS,
} from "@/lib/data";
import type { PendingSkillRegistration, WorkflowTag, Workstream } from "@/lib/types";

const KNOT_UPLOAD_URL = "https://knot.woa.com";
const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-900";

type Mode = "existing" | "new";

function workflowTags(workstream: Workstream): WorkflowTag[] {
  return workstream === "流量侧" ? TRAFFIC_WORKFLOW_TAGS : BUDGET_WORKFLOW_TAGS;
}

function statusClass(status: PendingSkillRegistration["status"]) {
  if (status === "已挂靠") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "待PM确认") return "bg-orange-50 text-orange-700 border-orange-200";
  return "bg-blue-50 text-blue-700 border-blue-200";
}

export default function UploadRegistrationPage() {
  const cards = getCapabilityCards();
  const pending = getPendingSkillRegistrations();
  const [mode, setMode] = useState<Mode>("existing");
  const [uploader, setUploader] = useState("francoso");
  const [workstream, setWorkstream] = useState<Workstream>("流量侧");
  const [workflowTag, setWorkflowTag] = useState<WorkflowTag>("市场分析");
  const [cardId, setCardId] = useState("");
  const [knotUrl, setKnotUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newReason, setNewReason] = useState("");
  const [result, setResult] = useState<PendingSkillRegistration | null>(null);

  const tags = workflowTags(workstream);
  const availableCards = useMemo(
    () =>
      cards.filter(
        (card) => card.workstream === workstream && card.workflowTag === workflowTag
      ),
    [cards, workstream, workflowTag]
  );

  const canSubmit =
    uploader.trim().length > 0 &&
    (mode === "existing"
      ? cardId.length > 0
      : newTitle.trim().length > 0 && newReason.trim().length > 0);

  function changeWorkstream(next: Workstream) {
    setWorkstream(next);
    setWorkflowTag(workflowTags(next)[0]);
    setCardId("");
    setResult(null);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    const base = {
      id: `reg-local-${Date.now()}`,
      uploader,
      workstream,
      workflowTag,
      knotSkillUrl: knotUrl.trim() || undefined,
      createdAt: "2026-06-09",
    };

    if (mode === "existing") {
      setResult({
        ...base,
        capabilityCardId: cardId,
        status: knotUrl.trim() ? "待PM确认" : "待上传",
      });
      return;
    }

    setResult({
      ...base,
      proposedCard: {
        title: newTitle,
        description: newTitle,
        ownerDomain: workstream === "预算侧" ? "预算" : "APP流量",
        reason: newReason,
      },
      status: "待PM确认",
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
          UPLOAD REGISTRATION
        </p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">上传前归属登记</h1>
        <p className="mt-1 max-w-3xl text-sm text-gray-500">
          当前不改 Knot 上传链路，只在 SkillHub 先补一个轻量登记：上传前先选清楚这个 Skill 属于哪个业务环节、哪个能力点。
        </p>
      </div>

      <Card className="border-blue-100 bg-blue-50/50">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">1. 先登记</p>
              <p className="mt-1 text-sm text-gray-600">选已有能力点，或者申请新增能力点。</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">2. 再去 Knot</p>
              <p className="mt-1 text-sm text-gray-600">登记完成后跳转 Knot 上传，不做接口强依赖。</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">3. PM 确认</p>
              <p className="mt-1 text-sm text-gray-600">确认后进入能力地图；认证后标为官方。</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={submit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <label className="space-y-2">
                <span className="text-sm font-medium text-gray-700">上传者</span>
                <input
                  className={inputClass}
                  value={uploader}
                  onChange={(event) => setUploader(event.target.value)}
                  placeholder="真实英文名"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-gray-700">方向</span>
                <select
                  className={inputClass}
                  value={workstream}
                  onChange={(event) => changeWorkstream(event.target.value as Workstream)}
                >
                  <option value="流量侧">流量侧</option>
                  <option value="预算侧">预算侧</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-gray-700">业务环节</span>
                <select
                  className={inputClass}
                  value={workflowTag}
                  onChange={(event) => {
                    setWorkflowTag(event.target.value as WorkflowTag);
                    setCardId("");
                    setResult(null);
                  }}
                >
                  {tags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode("existing");
                  setResult(null);
                }}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  mode === "existing" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                挂到已有能力点
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("new");
                  setCardId("");
                  setResult(null);
                }}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  mode === "new" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                找不到，申请新增
              </button>
            </div>

            {mode === "existing" ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">能力点</span>
                  <select
                    className={inputClass}
                    value={cardId}
                    onChange={(event) => {
                      setCardId(event.target.value);
                      setResult(null);
                    }}
                  >
                    <option value="">请选择能力点</option>
                    {availableCards.map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Knot 链接（可后补）</span>
                  <input
                    className={inputClass}
                    value={knotUrl}
                    onChange={(event) => setKnotUrl(event.target.value)}
                    placeholder="https://knot.woa.com/skills/detail/..."
                  />
                </label>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">新增能力点名称</span>
                  <input
                    className={inputClass}
                    value={newTitle}
                    onChange={(event) => {
                      setNewTitle(event.target.value);
                      setResult(null);
                    }}
                    placeholder="例如：沙龙材料自动生成"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">为什么现有能力点放不下</span>
                  <input
                    className={inputClass}
                    value={newReason}
                    onChange={(event) => {
                      setNewReason(event.target.value);
                      setResult(null);
                    }}
                    placeholder="一句话说明差异"
                  />
                </label>
              </div>
            )}

            <div className="flex flex-col gap-3 rounded-xl bg-gray-50 p-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-gray-600">
                {mode === "existing"
                  ? "必须选择能力点，才能继续跳转 Knot。"
                  : "新增申请先进入 PM 确认，不计入正式地图。"}
              </p>
              <button
                type="submit"
                disabled={!canSubmit}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
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

      {result && (
        <Card className="border-emerald-100 bg-emerald-50/50">
          <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
              <div>
                <p className="font-semibold text-gray-900">登记已生成</p>
                <p className="mt-1 text-sm text-gray-600">
                  状态：{result.status} · {result.proposedCard ? result.proposedCard.title : result.capabilityCardId}
                </p>
              </div>
            </div>
            <a
              href={KNOT_UPLOAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              继续到 Knot
              <ArrowRight className="h-4 w-4" />
            </a>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">PM 待处理</h2>
            <span className="text-sm text-gray-400">{pending.length} 条登记</span>
          </div>
          <div className="mt-4 divide-y divide-gray-100">
            {pending.slice(0, 4).map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {item.proposedCard?.title ??
                      cards.find((card) => card.id === item.capabilityCardId)?.title ??
                      item.capabilityCardId}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {item.workstream} / {item.workflowTag} · {item.uploader}
                  </p>
                </div>
                <Badge variant="outline" className={statusClass(item.status)}>
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
