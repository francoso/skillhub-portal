import { notFound } from "next/navigation";
import Link from "next/link";
import { getSkillById, getSkills, getDemos } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ExternalLink, Users, Activity, Calendar } from "lucide-react";
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

export function generateStaticParams() {
  const skills = getSkills();
  return skills.map((s) => ({ id: s.id }));
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Link href="/skills">
        <Button variant="ghost" size="sm" className="gap-1.5 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          返回Skill目录
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{skill.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={`text-xs ${statusColors[skill.status]}`} variant="secondary">
              {statusLabels[skill.status]}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {skill.category}
            </Badge>
          </div>
        </div>
        {skill.score && (
          <div className="text-right">
            <span className="text-sm text-gray-500">评分</span>
            <p className="text-2xl font-bold text-blue-600">{skill.score}</p>
          </div>
        )}
      </div>

      {/* Description */}
      <Card>
        <CardContent className="p-5">
          <h2 className="text-sm font-medium text-gray-500 mb-2">描述</h2>
          <p className="text-gray-700 leading-relaxed">{skill.description}</p>
        </CardContent>
      </Card>

      {/* People */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-medium text-gray-500">团队</h2>
          </div>
          <div>
            <span className="text-xs text-gray-400">Owner</span>
            <p className="text-gray-900 font-medium">{skill.owner}</p>
          </div>
          {skill.contributors.length > 0 && (
            <>
              <Separator />
              <div>
                <span className="text-xs text-gray-400">Contributors</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {skill.contributors.map((c) => (
                    <Badge key={c} variant="secondary" className="text-xs">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Metrics */}
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
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-gray-50">
              <p className="text-2xl font-bold text-gray-900">{skill.metrics.invokeCount.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">调用量</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-50">
              <p className="text-2xl font-bold text-gray-900">
                {(skill.metrics.completionRate * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">完成率</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-50">
              <p className="text-2xl font-bold text-gray-900">{skill.metrics.activeUsers}</p>
              <p className="text-xs text-gray-500 mt-1">活跃用户</p>
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
              <h2 className="text-sm font-medium text-gray-500">关联Demo会</h2>
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

      {/* Timestamps */}
      <div className="flex items-center justify-between text-xs text-gray-400 px-1">
        <span>创建于 {skill.createdAt}</span>
        <span>更新于 {skill.updatedAt}</span>
      </div>
    </div>
  );
}
