"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { Upload, Puzzle, Shield, Presentation } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkillRadarChart } from "@/components/charts/radar-chart";
import { getStats, getSkills, getDemos, getCurrentReviewRound, CURRENT_USER } from "@/lib/data";
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
  applicability: "适用范围",
  unionFeature: "联盟特色",
  sustainability: "可持续性",
  effectiveness: "使用效果",
};

interface ActivityItem {
  type: "skill" | "demo";
  title: string;
  date: string;
  actor: string;
}

function ActivityTicker({ activities }: { activities: ActivityItem[] }) {
  const [offset, setOffset] = useState(0);
  const itemHeight = 40; // px per row
  const visibleCount = 3;
  const totalItems = activities.length;

  useEffect(() => {
    if (totalItems <= visibleCount) return;
    const interval = setInterval(() => {
      setOffset((prev) => prev + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, [totalItems]);

  // Double the list for seamless looping
  const doubled = [...activities, ...activities];

  // Reset offset when it reaches the original length to create seamless loop
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

export default function HomePage() {
  const [assessment, setAssessment] = useState<SkillAssessment | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => isAcceptedFile(f.name));
    if (fileArray.length === 0) return;

    setAnalyzing(true);
    try {
      const result = await analyzeSkillFiles(fileArray);
      setAssessment(result);
    } catch (e) {
      console.error("Analysis failed:", e);
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

  const radarData = assessment
    ? Object.entries(assessment.scores).map(([key, value]) => ({
        dimension: DIMENSION_LABELS[key] || key,
        value,
        fullMark: 100,
      }))
    : [];

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

      {/* 评审邀请通知 */}
      {pendingReviewCount > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            你有 <strong>{pendingReviewCount}</strong> 个 Skill 待评审
          </p>
          <Link
            href="/review"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            去评审 →
          </Link>
        </div>
      )}

      {/* Hero CTA - Upload Zone */}
      <Card className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
        <CardContent className="p-8">
          <div
            className={`flex flex-col items-center justify-center text-center cursor-pointer rounded-lg p-6 transition-colors ${
              dragOver ? "bg-blue-50" : ""
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
              提交你的 Skill，测品质
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              拖入文件 → 秒出评估雷达图
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

          {/* Loading */}
          {analyzing && (
            <div className="mt-6 text-center">
              <div className="inline-block w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500 mt-2">分析中...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certification Guidance */}
      <div className="text-center text-sm text-gray-500 -mt-4">
        上传后即可上线使用。涉及联盟业务场景的 Skill，可申请参与{" "}
        <Link href="/rules#certification" className="text-blue-600 hover:underline font-medium">
          联盟认证
        </Link>
        {" "}→ 获得官方推荐
      </div>

      {/* Assessment Result */}
      {assessment && !analyzing && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">
                评估结果
              </h3>
              <Badge className={GRADE_MAP[assessment.grade].color}>
                {GRADE_MAP[assessment.grade].label}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <div>
                <SkillRadarChart data={radarData} />
              </div>

              {/* Dimension Scores + Suggestions */}
              <div className="space-y-4">
                <div className="space-y-2">
                  {Object.entries(assessment.scores).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600">
                        {DIMENSION_LABELS[key]}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
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
                        <span className="text-sm font-medium text-gray-700 w-8 text-right">
                          {value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3">
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    改进建议
                  </p>
                  <ul className="space-y-1">
                    {assessment.suggestions.map((s, i) => (
                      <li
                        key={i}
                        className="text-xs text-gray-600 flex items-start gap-1.5"
                      >
                        <span className="text-gray-400 mt-0.5">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t pt-3">
                  <p className="text-xs text-gray-400">
                    已分析: {assessment.analyzedFiles.join(", ")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                <p className="text-sm font-medium text-gray-900">本月认证</p>
                <p className="text-xs text-gray-500">评审进度与结果</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/demo">
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                <Presentation className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Demo 会</p>
                <p className="text-xs text-gray-500">近期分享与回放</p>
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
