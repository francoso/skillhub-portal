import { notFound } from "next/navigation";
import Link from "next/link";
import { getSkillById, getSkills, getDemos, getSkillStage, getCertificationResults } from "@/lib/data";
import type { SkillStage } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Users, Activity, Calendar, ShieldCheck, Check, Download, FileText } from "lucide-react";
import { SkillRadarChart } from "@/components/charts/radar-chart";
import type { Skill } from "@/lib/types";

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

const teamColors: Record<string, string> = {
  联盟产品: "bg-blue-100 text-blue-700",
  联盟运营: "bg-orange-100 text-orange-700",
  联盟商务: "bg-emerald-100 text-emerald-700",
  联盟研发: "bg-purple-100 text-purple-700",
};

export function generateStaticParams() {
  const skills = getSkills();
  return skills.map((s) => ({ id: s.id }));
}

function getRadarData(skill: Skill) {
  // 业务视角5维评分（与首页上传评测一致）— 每个维度0-100

  // 规范性：有repo/demo/文档/README/标准化程度
  const hasRepo = skill.repoUrl ? 20 : 0;
  const hasDemo = skill.demoSessionId ? 20 : 0;
  const hasDoc = skill.docUrl ? 15 : 0;
  const hasMetrics = skill.metrics._source !== "manual" ? 25 : 0;
  const isActive = skill.status === "active" ? 20 : 0;
  const normative = Math.min(100, hasRepo + hasDemo + hasDoc + hasMetrics + isActive);

  // 可用性：完成率 + 活跃用户数 + 有下载链接
  const completionPart = skill.metrics.completionRate * 50;
  const userPart = Math.min(30, (skill.metrics.activeUsers / 20) * 30);
  const downloadPart = skill.downloadUrl ? 20 : 0;
  const usability = Math.min(100, Math.round(completionPart + userPart + downloadPart));

  // 适用范围：活跃用户覆盖 + businessType通用性 + 调用量
  const coverageUsers = Math.min(40, (skill.metrics.activeUsers / 25) * 40);
  const typeBonus = skill.businessType === "通用" ? 30 : 15;
  const invokeBonus = Math.min(30, (skill.metrics.invokeCount / 1000) * 30);
  const applicability = Math.min(100, Math.round(coverageUsers + typeBonus + invokeBonus));

  // 联盟特色：关键词命中 + 业务类型标注 + 联盟认证
  const unionKeywords = ["联盟", "广告", "投放", "厂商", "BD", "小游戏", "IAA", "变现", "流量"];
  const unionHits = unionKeywords.filter(
    (k) => skill.description.includes(k) || skill.name.includes(k)
  ).length;
  const certBonus = skill.certified ? 25 : 0;
  const bizTypeBonus = skill.businessType ? 15 : 0;
  const unionFeature = Math.min(100, unionHits * 15 + certBonus + bizTypeBonus);

  // 数据安全性：有埋点数据源 + 非手动 + 有同步时间 + 状态规范
  const hasBeacon = skill.metrics._source === "mock_beacon" || skill.metrics._source === "beacon_api" ? 40 : 0;
  const hasSyncTime = skill.metrics.lastSyncAt ? 20 : 0;
  const statusNorm = skill.status !== "deprecated" ? 20 : 0;
  const noExternalLeak = skill.repoUrl?.includes("woa.com") || !skill.repoUrl ? 20 : 10;
  const dataSafety = Math.min(100, hasBeacon + hasSyncTime + statusNorm + noExternalLeak);

  return [
    { dimension: "规范性", value: Math.round(normative), fullMark: 100 },
    { dimension: "可用性", value: Math.round(usability), fullMark: 100 },
    { dimension: "适用范围", value: Math.round(applicability), fullMark: 100 },
    { dimension: "联盟特色", value: Math.round(unionFeature), fullMark: 100 },
    { dimension: "数据安全性", value: Math.round(dataSafety), fullMark: 100 },
  ];
}

const stageSteps: { key: SkillStage; label: string; step: number }[] = [
  { key: "personal", label: "已上线", step: 1 },
  { key: "reviewing", label: "评价中", step: 2 },
  { key: "certified", label: "联盟认证", step: 3 },
];

function GrowthPath({ stage, skill }: { stage: SkillStage; skill: Skill }) {
  const currentStep = stage === "certified" ? 3 : stage === "reviewing" ? 2 : 1;
  const certResult = stage === "certified"
    ? getCertificationResults().find(r => r.skillId === skill.id)
    : undefined;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-medium text-gray-500">成长路径</h2>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-4">
          {stageSteps.map((s, idx) => {
            const isCompleted = s.step < currentStep;
            const isCurrent = s.step === currentStep;
            return (
              <div key={s.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isCompleted
                        ? "bg-green-100 text-green-700"
                        : isCurrent
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : s.step}
                  </div>
                  <span
                    className={`text-xs mt-1.5 ${
                      isCurrent ? "text-blue-600 font-medium" : "text-gray-500"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < stageSteps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 -mt-5 ${
                      s.step < currentStep ? "bg-green-300" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Stage-specific guidance */}
        <div className="mt-3 p-3 rounded-lg bg-gray-50 text-sm text-gray-600">
          {stage === "personal" && (
            <p>
              涉及联盟业务场景？可{" "}
              <Link href="/rules#certification" className="text-blue-600 hover:underline">
                申请参与下月认证评价
              </Link>
              ，通过后获得联盟官方认证标识和优先推荐。
            </p>
          )}
          {stage === "reviewing" && (
            <p>本月评价进行中，经过 Demo 展示 + 大众点评官 + 专家评价，结果将在月底公布。</p>
          )}
          {stage === "certified" && (
            <div className="space-y-1">
              <p className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                <span className="font-medium text-green-700">已通过联盟认证</span>
                {skill.certifiedAt && (
                  <span className="text-gray-400 text-xs ml-2">认证于 {skill.certifiedAt}</span>
                )}
              </p>
              {certResult && (
                <p className="text-xs text-gray-500 mt-1">
                  大众评价 {certResult.publicScore.toFixed(1)} 分（{certResult.publicCount} 人）· 专家评价 {certResult.expertScore.toFixed(1)} 分
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const skill = getSkillById(id);
  if (!skill) notFound();

  const demos = getDemos();
  const demoSession = skill.demoSessionId
    ? demos.find((d) => d.id === skill.demoSessionId)
    : undefined;

  const radarData = getRadarData(skill);
  const stage = getSkillStage(skill.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Link href="/skills">
        <Button variant="ghost" size="sm" className="gap-1.5 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          返回 Skill 库
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
            SKILL DETAIL
          </p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{skill.name}</h1>
          <p className="text-xs text-gray-400 font-mono mt-1">{skill.slug}</p>
          <div className="flex items-center gap-2 mt-3">
            <Badge className={`text-xs ${statusColors[skill.status]}`} variant="secondary">
              {statusLabels[skill.status]}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {skill.category}
            </Badge>
            {skill.businessType && (
              <Badge variant="outline" className="text-xs">
                {skill.businessType}
              </Badge>
            )}
            <Badge
              className={`text-xs ${teamColors[skill.team] || "bg-gray-100 text-gray-600"}`}
              variant="secondary"
            >
              {skill.team}
            </Badge>
            {stage === "certified" && (
              <Badge className="bg-green-100 text-green-700 border-green-200 text-xs gap-1" variant="outline">
                <ShieldCheck className="w-3 h-3" />
                联盟认证
              </Badge>
            )}
          </div>
        </div>
        {skill.score && (
          <div className="text-right">
            <span className="text-sm text-gray-500">综合评分</span>
            <p className="text-3xl font-bold text-blue-600">{skill.score}</p>
          </div>
        )}
      </div>

      {/* Download / Try Button */}
      {skill.downloadUrl && (
        <a
          href={skill.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
        >
          <Download className="w-4 h-4" />
          试用 / 下载此 Skill
        </a>
      )}

      {/* Growth Path */}
      <GrowthPath stage={stage} skill={skill} />

      {/* Metrics + Radar Chart */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-medium text-gray-500">数据指标</h2>
            <span className="text-[10px] text-gray-300 ml-auto">
              数据源: {skill.metrics._source}
              {skill.metrics.lastSyncAt && ` · 同步于 ${skill.metrics.lastSyncAt}`}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Numbers */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-gray-50">
                <p className="text-2xl font-bold text-gray-900">
                  {skill.metrics.invokeCount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">调用量</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50">
                <p className="text-2xl font-bold text-gray-900">
                  {(skill.metrics.completionRate * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">完成率</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50">
                <p className="text-2xl font-bold text-gray-900">
                  {skill.metrics.activeUsers}
                </p>
                <p className="text-xs text-gray-500 mt-1">活跃用户</p>
              </div>
            </div>
            {/* Radar */}
            {skill.metrics.invokeCount > 0 && (
              <div>
                <SkillRadarChart data={radarData} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Description + People (compact) */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-2">描述</h2>
            <p className="text-gray-700 leading-relaxed">{skill.description}</p>
          </div>

          {/* Compact People/Team row */}
          <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
            <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div className="flex items-center gap-3 flex-wrap text-sm">
              <span className="text-gray-500">
                Owner: <span className="text-gray-900 font-medium">{skill.owner}</span>
              </span>
              {skill.contributors.length > 0 && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-500">
                    Contributors:{" "}
                    {skill.contributors.map((c, i) => (
                      <span key={c}>
                        <span className="text-gray-700">{c}</span>
                        {i < skill.contributors.length - 1 && ", "}
                      </span>
                    ))}
                  </span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Repo URL */}
      {skill.repoUrl && (
        <Card>
          <CardContent className="p-5">
            <h2 className="text-sm font-medium text-gray-500 mb-2">代码仓库</h2>
            <a
              href={skill.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {skill.repoUrl}
            </a>
          </CardContent>
        </Card>
      )}

      {/* Demo Session */}
      {demoSession && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-medium text-gray-500">关联 Demo 会</h2>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{demoSession.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{demoSession.date}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {demoSession.status === "completed" ? "已完成" : demoSession.status === "upcoming" ? "即将举行" : "已取消"}
                </Badge>
              </div>
              {demoSession.replayUrl && (
                <a
                  href={demoSession.replayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs mt-2"
                >
                  <ExternalLink className="w-3 h-3" />
                  观看回放
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* README */}
      {skill.readme && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-medium text-gray-500">README</h2>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-sans bg-gray-50 rounded-lg p-4 overflow-x-auto">
              {skill.readme}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Timestamps */}
      <div className="flex items-center justify-between text-xs text-gray-400 px-1">
        <span>创建于 {skill.createdAt}</span>
        <span>更新于 {skill.updatedAt}</span>
      </div>
    </div>
  );
}
