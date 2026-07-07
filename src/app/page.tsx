"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { Upload, Puzzle, Shield, Presentation, Check, Download, ArrowRight, ArrowLeft, Loader2, Code2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { SkillRadarChart } from "@/components/charts/radar-chart";
import { ADATACLAW_SKILL_URL, getStats, getSkills, getDemos, getCurrentReviewRound, CURRENT_USER } from "@/lib/data";
import { analyzeSkillFiles, isAcceptedFile } from "@/lib/skill-analyzer";
import type { SkillAssessment } from "@/lib/types";

const stats = getStats();
const skills = getSkills();
const demos = getDemos();
const reviewRound = getCurrentReviewRound();
const pendingReviewCount =
  reviewRound && reviewRound.publicReviewers.includes(CURRENT_USER)
    ? reviewRound.skills.length
    : 0;

// 生态动态
const recentActivities = [
  ...skills
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 3)
    .map((s) => ({
      type: "skill" as const,
      title: `${s.name} ${s.status === "developing" ? "开发中" : "已上线"}`,
      date: s.updatedAt,
      actor: s.owner,
    })),
  ...demos.slice(0, 2).map((d) => ({
    type: "demo" as const,
    title: d.title,
    date: d.date,
    actor: d.skills[0]?.presenter || "",
  })),
]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 5);

const GRADE_MAP: Record<
  SkillAssessment["grade"],
  { label: string; color: string }
> = {
  excellent: { label: "优秀", color: "bg-green-100 text-green-700" },
  good: { label: "良好", color: "bg-blue-100 text-blue-700" },
  needsWork: { label: "待改进", color: "bg-orange-100 text-orange-700" },
};

const DIMENSION_LABELS: Record<string, string> = {
  normative: "规范性",
  usability: "可用性",
  applicability: "适用范围",
  unionFeature: "联盟特色",
  dataSafety: "数据安全性",
};

const DIMENSION_TIPS: Record<string, string> = {
  normative: "是否符合标准 Skill 的编写规范",
  usability: "能否有效解决业务问题，使用方式是否清晰简单",
  applicability: "针对联盟全员通用，还是仅限部分人群/赛道",
  unionFeature: "是否针对联盟广告场景，还是通用能力",
  dataSafety: "数据来源是否合理，产出是否准确，无泄露风险",
};

interface ActivityItem {
  type: "skill" | "demo";
  title: string;
  date: string;
  actor: string;
}

function ActivityTicker({ activities }: { activities: ActivityItem[] }) {
  const [offset, setOffset] = useState(0);
  const itemHeight = 40;
  const visibleCount = 3;
  const totalItems = activities.length;

  useEffect(() => {
    if (totalItems <= visibleCount) return;
    const interval = setInterval(() => {
      setOffset((prev) => prev + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, [totalItems]);

  const doubled = [...activities, ...activities];
  const displayOffset = offset % totalItems;

  return (
    <div
      className="overflow-hidden"
      style={{ height: `${itemHeight * visibleCount}px` }}
    >
      <div
        className="transition-transform duration-700 ease-in-out"
        style={{ transform: `translateY(-${displayOffset * itemHeight}px)` }}
      >
        {doubled.map((activity, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between border-b border-gray-50 last:border-0"
            style={{ height: `${itemHeight}px` }}
          >
            <div className="flex items-center gap-3">
              <Badge
                variant={activity.type === "skill" ? "default" : "secondary"}
                className="text-xs"
              >
                {activity.type === "skill" ? "Skill" : "Demo"}
              </Badge>
              <span className="text-sm text-gray-700">
                {activity.actor && (
                  <span className="text-gray-500">{activity.actor}</span>
                )}
                {activity.actor && " · "}
                {activity.title}
              </span>
            </div>
            <span className="text-xs text-gray-400 shrink-0">
              {activity.date}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Upload wizard steps
type UploadStep = "upload" | "scoring" | "result" | "beacon" | "confirm";
type UploadMode = "package" | "adataclaw";

const UPLOAD_STEPS: { key: UploadStep; label: string }[] = [
  { key: "upload", label: "上传" },
  { key: "scoring", label: "AI 评分" },
  { key: "result", label: "评测结果" },
  { key: "beacon", label: "埋点注入" },
  { key: "confirm", label: "确认上传" },
];

const ADATACLAW_UPLOAD_STEPS: { key: UploadStep; label: string }[] = [
  { key: "upload", label: "登记" },
  { key: "confirm", label: "确认上传" },
];

// Mock beacon instrumentation data
const MOCK_BEACON_POINTS = [
  { event: "skill_invoke_start", desc: "Skill 被调用时触发", location: "入口函数" },
  { event: "skill_invoke_end", desc: "Skill 执行完成时触发", location: "返回语句" },
  { event: "skill_error", desc: "执行异常时触发", location: "catch 块" },
  { event: "skill_input_size", desc: "输入数据量上报", location: "参数解析" },
  { event: "skill_output_quality", desc: "输出质量采样", location: "结果序列化" },
];

function UploadWizard() {
  const [step, setStep] = useState<UploadStep>("upload");
  const [uploadMode, setUploadMode] = useState<UploadMode>("package");
  const [assessment, setAssessment] = useState<SkillAssessment | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [beaconInjecting, setBeaconInjecting] = useState(false);
  const [beaconDone, setBeaconDone] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [adataclawName, setAdataclawName] = useState("");
  const [adataclawDescription, setAdataclawDescription] = useState("");
  const [registeredAdataclawSkill, setRegisteredAdataclawSkill] = useState<{
    name: string;
    description: string;
    owner: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => isAcceptedFile(f.name));
    if (fileArray.length === 0) return;

    setUploadedFileName(fileArray[0].name);
    setStep("scoring");
    setAnalyzing(true);
    try {
      const result = await analyzeSkillFiles(fileArray);
      setAssessment(result);
      setStep("result");
    } catch (e) {
      console.error("Analysis failed:", e);
      setStep("upload");
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleContinueToBeacon = useCallback(() => {
    setStep("beacon");
    setBeaconInjecting(true);
    setTimeout(() => {
      setBeaconInjecting(false);
      setBeaconDone(true);
    }, 2000);
  }, []);

  const handleConfirmUpload = useCallback(() => {
    setStep("confirm");
  }, []);

  const handleAdataclawUpload = useCallback(() => {
    const name = adataclawName.trim();
    const description = adataclawDescription.trim();
    if (!name || !description) return;
    setUploadedFileName(name);
    setAssessment(null);
    setBeaconDone(false);
    setBeaconInjecting(false);
    setRegisteredAdataclawSkill({
      name,
      description,
      owner: CURRENT_USER,
    });
    setStep("confirm");
  }, [adataclawDescription, adataclawName]);

  const handleReset = useCallback(() => {
    setStep("upload");
    setAssessment(null);
    setAnalyzing(false);
    setBeaconInjecting(false);
    setBeaconDone(false);
    setUploadedFileName("");
    setAdataclawName("");
    setAdataclawDescription("");
    setRegisteredAdataclawSkill(null);
  }, []);

  const switchUploadMode = useCallback((mode: UploadMode) => {
    setUploadMode(mode);
    setStep("upload");
    setAssessment(null);
    setAnalyzing(false);
    setBeaconInjecting(false);
    setBeaconDone(false);
    setUploadedFileName("");
    setRegisteredAdataclawSkill(null);
  }, []);

  const isAdataclawMode = uploadMode === "adataclaw";
  const activeUploadSteps = isAdataclawMode ? ADATACLAW_UPLOAD_STEPS : UPLOAD_STEPS;
  const stepExists = activeUploadSteps.some((s) => s.key === step);
  const visibleStep: UploadStep = stepExists ? step : "upload";
  const currentStepIndex = activeUploadSteps.findIndex((s) => s.key === visibleStep);

  const radarData = assessment
    ? Object.entries(assessment.scores).map(([key, value]) => ({
        dimension: DIMENSION_LABELS[key] || key,
        value,
        fullMark: 100,
      }))
    : [];

  return (
    <Card className="overflow-hidden">
      {/* Step Indicator */}
      <div className="px-6 pt-5 pb-3">
        <div className="flex items-center justify-between mb-1">
          {activeUploadSteps.map((s, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={s.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                      isCompleted
                        ? "bg-green-100 text-green-700"
                        : isCurrent
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[10px] mt-1 ${
                      isCurrent ? "text-blue-600 font-medium" : "text-gray-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < activeUploadSteps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-1 -mt-4 ${
                      idx < currentStepIndex ? "bg-green-300" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <CardContent className="p-6 pt-2">
        {/* Step 1: Upload */}
        {visibleStep === "upload" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 rounded-lg bg-gray-100 p-1 text-sm font-medium">
              <button
                type="button"
                onClick={() => switchUploadMode("package")}
                className={`rounded-md px-3 py-2 transition ${
                  uploadMode === "package" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                标准 Skill 包
              </button>
              <button
                type="button"
                onClick={() => switchUploadMode("adataclaw")}
                className={`rounded-md px-3 py-2 transition ${
                  uploadMode === "adataclaw" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                adataclaw Skill
              </button>
            </div>

            {uploadMode === "package" ? (
              <div
                className={`flex flex-col items-center justify-center text-center cursor-pointer rounded-lg p-8 border-2 border-dashed transition-colors ${
                  dragOver ? "bg-blue-50 border-blue-300" : "border-gray-200 hover:border-blue-300"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Skill 规范评测器
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  拖入压缩包 → 结构评测演示 → 埋点能力待接入
                </p>
                <p className="text-xs text-gray-400 mt-3">
                  支持 .skill / .zip 压缩包格式
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".skill,.zip"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) handleFiles(e.target.files);
                  }}
                />
              </div>
            ) : (
              <div className="rounded-lg border border-fuchsia-100 bg-fuchsia-50/40 p-5 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">登记 adataclaw Skill</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    只登记名称和介绍，不走前置评估或埋点注入。名称需要与 adataclaw 上的 Skill 名称一致。
                  </p>
                </div>

                <label className="block text-xs font-medium text-gray-500">
                  Skill 名称
                  <input
                    value={adataclawName}
                    onChange={(event) => setAdataclawName(event.target.value)}
                    placeholder="与 adataclaw 上的 Skill 名称保持一致"
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-fuchsia-300"
                  />
                </label>

                <label className="block text-xs font-medium text-gray-500">
                  Skill 介绍
                  <textarea
                    value={adataclawDescription}
                    onChange={(event) => setAdataclawDescription(event.target.value)}
                    rows={3}
                    placeholder="说明这个 Skill 解决什么业务问题、适合谁使用"
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-fuchsia-300"
                  />
                </label>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <p className="text-xs text-gray-400">
                    试用入口统一跳转到 adataclaw Skill 页
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAdataclawUpload}
                    disabled={!adataclawName.trim() || !adataclawDescription.trim()}
                    className="gap-1.5"
                  >
                    直接上传
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Scoring (loading) */}
        {visibleStep === "scoring" && analyzing && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
            <p className="text-sm font-medium text-gray-700">AI 正在评测...</p>
            <p className="text-xs text-gray-400 mt-1">
              分析 {uploadedFileName} 的五维规范性
            </p>
          </div>
        )}

        {/* Step 3: Result */}
        {visibleStep === "result" && assessment && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                评测结果
              </h3>
              <Badge className={GRADE_MAP[assessment.grade].color}>
                {GRADE_MAP[assessment.grade].label}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <SkillRadarChart data={radarData} />
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  {Object.entries(assessment.scores).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-gray-600">
                          {DIMENSION_LABELS[key]}
                        </span>
                        <p className="text-xs text-gray-400 truncate">
                          {DIMENSION_TIPS[key]}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              value >= 80
                                ? "bg-green-500"
                                : value >= 60
                                ? "bg-blue-500"
                                : "bg-orange-500"
                            }`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700 w-6 text-right">
                          {value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {assessment.suggestions.length > 0 && (
                  <div className="border-t pt-2">
                    <p className="text-xs font-medium text-gray-500 mb-1">改进建议</p>
                    <ul className="space-y-0.5">
                      {assessment.suggestions.map((s, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                          <span className="text-gray-400">•</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t">
              <Button type="button" variant="ghost" size="sm" onClick={handleReset} className="gap-1.5 text-gray-500">
                <ArrowLeft className="w-3.5 h-3.5" />
                取消
              </Button>
              <Button type="button" size="sm" onClick={handleContinueToBeacon} className="gap-1.5">
                继续上传
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Beacon Injection */}
        {visibleStep === "beacon" && (
          <div className="space-y-5">
            {beaconInjecting ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-4" />
                <p className="text-sm font-medium text-gray-700">正在调用大同注入埋点...</p>
                <p className="text-xs text-gray-400 mt-1">
                  为 {uploadedFileName} 添加数据追踪能力
                </p>
              </div>
            ) : beaconDone ? (
              <>
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-purple-600" />
                  <h3 className="text-base font-semibold text-gray-900">
                    埋点注入完成
                  </h3>
                  <Badge className="bg-purple-100 text-purple-700 text-xs">
                    +{MOCK_BEACON_POINTS.length} 个埋点
                  </Badge>
                </div>

                <p className="text-xs text-gray-500">
                  以下埋点已自动注入，上线后将通过大同上报使用数据：
                </p>

                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium text-gray-600">事件名</th>
                        <th className="text-left px-3 py-2 font-medium text-gray-600">说明</th>
                        <th className="text-left px-3 py-2 font-medium text-gray-600">注入位置</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {MOCK_BEACON_POINTS.map((bp) => (
                        <tr key={bp.event}>
                          <td className="px-3 py-2 font-mono text-purple-700">{bp.event}</td>
                          <td className="px-3 py-2 text-gray-600">{bp.desc}</td>
                          <td className="px-3 py-2 text-gray-400">{bp.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Download instrumented package */}
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <Download className="w-4 h-4 text-purple-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      {uploadedFileName.replace(/\.(skill|zip)$/, "")}_instrumented.skill
                    </p>
                    <p className="text-xs text-gray-500">已注入埋点的版本，可本地预览验证</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs shrink-0">
                    下载
                  </Button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <Button type="button" variant="ghost" size="sm" onClick={handleReset} className="gap-1.5 text-gray-500">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    取消
                  </Button>
                  <Button type="button" size="sm" onClick={handleConfirmUpload} className="gap-1.5">
                    确认上传
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Step 5: Confirm */}
        {visibleStep === "confirm" && (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">上传成功！</h3>
            <p className="text-sm text-gray-500 mt-1">
              {isAdataclawMode
                ? `${uploadedFileName} 已作为 adataclaw Skill 登记`
                : `${uploadedFileName} 已上线，全员可搜索使用`}
            </p>
            {isAdataclawMode && (
              <div className="mt-4 rounded-lg border border-fuchsia-100 bg-fuchsia-50 px-4 py-3 text-center">
                <p className="text-xs font-medium text-fuchsia-700">已跳过 AI 评分和埋点注入</p>
                {registeredAdataclawSkill && (
                  <p className="mt-1 text-xs text-gray-500">
                    Owner：{registeredAdataclawSkill.owner} · 数据源：manual / 0
                  </p>
                )}
                <a
                  href={ADATACLAW_SKILL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs text-fuchsia-700 hover:text-fuchsia-800"
                >
                  adataclaw 试用入口
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            )}
            <div className="flex items-center gap-3 mt-6">
              <Button type="button" variant="outline" size="sm" onClick={handleReset}>
                继续上传
              </Button>
              <Link href="/skills" className={buttonVariants({ size: "sm", className: "gap-1.5" })}>
                查看 Skill 库
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <p className="text-xs text-gray-400 mt-6">
              涉及联盟业务场景？经各组 PM 评审通过后，会进入
              {" "}
              <Link href="/certification" className="text-blue-600 hover:underline">
                联盟认证馆
              </Link>
              {" "}并获得官方推荐
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          联盟 Skill 生态工作台
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          提交、评估、共建联盟 Skill 生态
        </p>
      </div>

      {/* 官方认证提示 */}
      {pendingReviewCount > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            当前有 <strong>{pendingReviewCount}</strong> 个 Skill 进入待确认池，等待各组 PM 完成官方认证确认
          </p>
          <Link
            href="/certification"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            去认证馆 →
          </Link>
        </div>
      )}

      {/* Upload Wizard */}
      <UploadWizard />

      {/* Quick Entry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/skills">
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <Puzzle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">浏览 Skill 库</p>
                <p className="text-xs text-gray-500">查看所有已上线 Skill</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/certification">
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">联盟认证馆</p>
                <p className="text-xs text-gray-500">查看所有官方认证 Skill</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/coverage">
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                <Presentation className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">能力地图</p>
                <p className="text-xs text-gray-500">按服务环节看覆盖和缺口</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 生态动态 - 轮播滚动 */}
      <Card>
        <CardContent className="p-5">
          <p className="text-sm font-medium text-gray-900 mb-3">生态动态</p>
          <ActivityTicker activities={recentActivities} />
        </CardContent>
      </Card>

      {/* Ecosystem Snapshot */}
      <div className="flex items-center justify-center gap-6 py-4 text-sm text-gray-500">
        <span>
          <strong className="text-gray-900">{stats.totalSkills}</strong> Skills
        </span>
        <span className="text-gray-300">·</span>
        <span>
          <strong className="text-gray-900">{stats.totalContributors}</strong>{" "}
          贡献者
        </span>
        <span className="text-gray-300">·</span>
        <span>
          <strong className="text-gray-900">
            {stats.monthlyInvokes.toLocaleString()}
          </strong>{" "}
          调用
        </span>
      </div>
    </div>
  );
}
