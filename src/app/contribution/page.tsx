"use client";

import { useState, useMemo, Fragment } from "react";
import { getContributors, getSkills, getActivities } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronDown, ChevronUp, Users, Layers, Flame } from "lucide-react";
import { MilestoneProgress } from "@/components/shared/milestone-progress";
import { ActivityFeed } from "@/components/shared/activity-feed";

type ViewMode = "all" | "team";

// 简易雷达图（纯 SVG）
function RadarChart({
  dimensions,
}: {
  dimensions: { create: number; maintain: number; promote: number; assist: number };
}) {
  const labels = ["创建", "维护", "推广", "协助"];
  const values = [dimensions.create, dimensions.maintain, dimensions.promote, dimensions.assist];
  const max = Math.max(...values, 1);
  const normalized = values.map((v) => v / max);

  const cx = 60;
  const cy = 60;
  const r = 40;

  // 4个方向：上、右、下、左
  const angles = [
    -Math.PI / 2,
    0,
    Math.PI / 2,
    Math.PI,
  ];

  const points = normalized.map((v, i) => ({
    x: cx + r * v * Math.cos(angles[i]),
    y: cy + r * v * Math.sin(angles[i]),
  }));

  const axisPoints = angles.map((a) => ({
    x: cx + r * Math.cos(a),
    y: cy + r * Math.sin(a),
  }));

  const labelPositions = angles.map((a) => ({
    x: cx + (r + 14) * Math.cos(a),
    y: cy + (r + 14) * Math.sin(a),
  }));

  const polygon = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="shrink-0">
      {/* Grid */}
      {[0.33, 0.66, 1].map((scale) => (
        <polygon
          key={scale}
          points={axisPoints
            .map((p) => `${cx + (p.x - cx) * scale},${cy + (p.y - cy) * scale}`)
            .join(" ")}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="0.5"
        />
      ))}
      {/* Axes */}
      {axisPoints.map((p, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={p.x}
          y2={p.y}
          stroke="#e5e7eb"
          strokeWidth="0.5"
        />
      ))}
      {/* Data */}
      <polygon points={polygon} fill="rgba(59,130,246,0.15)" stroke="#3b82f6" strokeWidth="1.5" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#3b82f6" />
      ))}
      {/* Labels */}
      {labels.map((label, i) => (
        <text
          key={i}
          x={labelPositions[i].x}
          y={labelPositions[i].y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-[9px] fill-gray-500"
        >
          {label}
        </text>
      ))}
    </svg>
  );
}

export default function ContributionPage() {
  const contributors = getContributors().sort(
    (a, b) => b.contributionScore - a.contributionScore
  );
  const skills = getSkills();
  const activities = getActivities();
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("all");

  // 用第一个用户作为"当前用户"展示 Hero（实际接通登录后替换）
  const currentUser = contributors[0];

  const groupedByTeam = useMemo(() => {
    const map = new Map<
      string,
      { members: typeof contributors; totalInvokes: number; totalScore: number }
    >();
    for (const c of contributors) {
      if (!map.has(c.team)) {
        map.set(c.team, { members: [], totalInvokes: 0, totalScore: 0 });
      }
      const group = map.get(c.team)!;
      group.members.push(c);
      group.totalInvokes += c.totalInvokes;
      group.totalScore += c.contributionScore;
    }
    return [...map.entries()].sort((a, b) => b[1].totalScore - a[1].totalScore);
  }, [contributors]);

  const contributionTypeLabel = (type: string) => {
    switch (type) {
      case "creator": return "创建者";
      case "maintainer": return "维护者";
      case "assistant": return "协助者";
      default: return type;
    }
  };

  const renderContributorRow = (
    c: (typeof contributors)[0],
    idx: number
  ) => (
    <TableRow key={c.id}>
      <TableCell>
        <span className="text-sm text-gray-400">{idx + 1}</span>
      </TableCell>
      <TableCell className="font-medium">{c.name}</TableCell>
      <TableCell className="text-sm text-gray-500">{c.team}</TableCell>
      <TableCell>
        <Badge variant="secondary" className="text-xs">
          {contributionTypeLabel(c.contributionType)}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-1 flex-wrap">
          {c.skills.map((skillId) => {
            const skill = skills.find((s) => s.id === skillId);
            return (
              <Badge key={skillId} variant="secondary" className="text-xs">
                {skill?.name || skillId}
              </Badge>
            );
          })}
        </div>
      </TableCell>
      <TableCell className="text-right text-sm">
        {c.totalInvokes.toLocaleString()}
      </TableCell>
      <TableCell className="text-right">
        <span className="font-semibold text-blue-600">
          {c.contributionScore}
        </span>
      </TableCell>
    </TableRow>
  );

  const renderGroupedTable = (
    groups: [
      string,
      { members: typeof contributors; totalInvokes: number; totalScore: number },
    ][]
  ) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>贡献者</TableHead>
          <TableHead>团队</TableHead>
          <TableHead>类型</TableHead>
          <TableHead>贡献Skill</TableHead>
          <TableHead className="text-right">累计调用</TableHead>
          <TableHead className="text-right">贡献分</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {groups.map(([groupName, group]) => (
          <Fragment key={groupName}>
            <TableRow className="bg-gray-50">
              <TableCell colSpan={5} className="font-semibold text-gray-700">
                {groupName}
                <span className="ml-2 text-xs font-normal text-gray-400">
                  ({group.members.length} 人)
                </span>
              </TableCell>
              <TableCell className="text-right text-sm font-medium text-gray-600">
                {group.totalInvokes.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-semibold text-blue-600">
                {group.totalScore}
              </TableCell>
            </TableRow>
            {group.members
              .sort((a, b) => b.contributionScore - a.contributionScore)
              .map((c, idx) => renderContributorRow(c, idx))}
          </Fragment>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
          CONTRIBUTION
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">贡献看板</h1>
        <p className="text-sm text-gray-500 mt-1">
          共 {contributors.length} 位贡献者参与生态建设
        </p>
      </div>

      {/* === 区块 1：个人贡献概览 Hero === */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">我的贡献概览</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* 左侧：指标卡 + 进度条 */}
            <div className="flex-1 space-y-5">
              {/* 3 个指标卡 */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className="w-4 h-4 text-blue-500" />
                    <span className="text-xs text-gray-500">参与建设</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {currentUser.skills.length}
                    <span className="text-sm font-normal text-gray-500 ml-1">个 Skill</span>
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-gray-500">服务同事</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {currentUser.impactUsers}
                    <span className="text-sm font-normal text-gray-500 ml-1">人使用</span>
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-orange-50 border border-orange-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-xs text-gray-500">持续投入</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {currentUser.weeklyStreak}
                    <span className="text-sm font-normal text-gray-500 ml-1">周连续</span>
                  </p>
                </div>
              </div>

              {/* 里程碑进度条 */}
              <MilestoneProgress stage={currentUser.stage} />
            </div>

            {/* 右侧：雷达图 */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-xs text-gray-500 mb-2">贡献维度</span>
              <RadarChart dimensions={currentUser.dimensions} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* === 区块 2：生态动态 === */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3">生态动态</h2>
        <ActivityFeed events={activities} />
      </div>

      {/* === 区块 3：贡献明细（可展开） === */}
      <div>
        <button
          onClick={() => setDetailOpen(!detailOpen)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          {detailOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          <span>{detailOpen ? "收起详细" : "查看详细排行"}</span>
        </button>

        {detailOpen && (
          <div className="mt-4">
            <Tabs
              defaultValue="all"
              onValueChange={(val) => setViewMode(val as ViewMode)}
            >
              <TabsList>
                <TabsTrigger value="all">全部</TabsTrigger>
                <TabsTrigger value="team">按团队</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <Card>
                  <CardContent className="pt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>贡献者</TableHead>
                          <TableHead>团队</TableHead>
                          <TableHead>类型</TableHead>
                          <TableHead>贡献Skill</TableHead>
                          <TableHead className="text-right">累计调用</TableHead>
                          <TableHead className="text-right">贡献分</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contributors.map((c, idx) =>
                          renderContributorRow(c, idx)
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="team">
                <Card>
                  <CardContent className="pt-4">
                    {renderGroupedTable(groupedByTeam)}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Data source note */}
      <p className="text-xs text-gray-400">
        注：数据为 mock 数据（_source: mock_beacon），后续接通 Beacon API 后自动更新
      </p>
    </div>
  );
}
