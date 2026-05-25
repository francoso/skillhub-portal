"use client";

import { useState, useMemo, Fragment } from "react";
import { getContributors, getSkills, getMapSkillIds, getCertifiedSkillCountForOwner } from "@/lib/data";
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
import {
  ChevronDown,
  ChevronUp,
  Users,
  Layers,
  Award,
  Target,
  BarChart3,
  Map,
} from "lucide-react";

export default function ContributionPage() {
  const contributors = getContributors();
  const skills = getSkills();
  const mapSkillIds = getMapSkillIds();
  const [tableOpen, setTableOpen] = useState(false);

  // 为每个 contributor 计算个人共享 vs 团队贡献的拆分
  const enriched = useMemo(() => {
    return contributors.map((c) => {
      const personalSkills = c.skills.filter((id) => !mapSkillIds.has(id));
      const teamSkills = c.skills.filter((id) => mapSkillIds.has(id));

      // 个人共享统计：只看非地图 skill 的使用量
      const personalSkillObjects = personalSkills
        .map((id) => skills.find((s) => s.id === id))
        .filter(Boolean);
      const personalInvokes = personalSkillObjects.reduce(
        (sum, s) => sum + (s?.metrics?.invokeCount ?? 0),
        0
      );
      const personalActiveUsers = personalSkillObjects.reduce(
        (sum, s) => sum + (s?.metrics?.activeUsers ?? 0),
        0
      );

      // 团队贡献统计：地图内 skill 的使用量 + 业务价值
      const teamSkillObjects = teamSkills
        .map((id) => skills.find((s) => s.id === id))
        .filter(Boolean);
      const teamInvokes = teamSkillObjects.reduce(
        (sum, s) => sum + (s?.metrics?.invokeCount ?? 0),
        0
      );
      const teamActiveUsers = teamSkillObjects.reduce(
        (sum, s) => sum + (s?.metrics?.activeUsers ?? 0),
        0
      );
      const certifiedInTeam = teamSkillObjects.filter(
        (s) => s?.certified
      ).length;

      // 动态计算已认证 skill 数（从 certificationResults 推导，不依赖 JSON 硬编码）
      const certifiedSkillCount = getCertifiedSkillCountForOwner(c.skills);

      return {
        ...c,
        personalSkillCount: personalSkills.length,
        personalInvokes,
        personalActiveUsers,
        teamSkillCount: teamSkills.length,
        teamInvokes,
        teamActiveUsers,
        certifiedInTeam,
        certifiedSkillCount,
      };
    });
  }, [contributors, skills, mapSkillIds]);

  // 按团队贡献排序（团队 skill 数 + 认证数 + 调用量加权）
  const sorted = useMemo(() => {
    return [...enriched].sort((a, b) => {
      const scoreA = a.teamSkillCount * 10 + a.certifiedInTeam * 20 + a.teamInvokes * 0.5;
      const scoreB = b.teamSkillCount * 10 + b.certifiedInTeam * 20 + b.teamInvokes * 0.5;
      return scoreB - scoreA;
    });
  }, [enriched]);

  // 按团队分组
  const teamGroups = useMemo(() => {
    const groups: Record<string, typeof sorted> = {};
    for (const c of sorted) {
      const team = c.team;
      if (!groups[team]) groups[team] = [];
      groups[team].push(c);
    }
    return groups;
  }, [sorted]);

  // 用第一个用户作为"当前用户"展示 Hero
  const currentUser = enriched[0];


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
          CONTRIBUTION
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">我的贡献概览</h1>
        <p className="text-sm text-gray-500 mt-1">
          个人共享让生态丰富，团队贡献让业务增长
        </p>
      </div>

      {/* === Hero: 双卡片 === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 左卡：个人共享 (blue) */}
        <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              个人共享
            </CardTitle>
            <p className="text-xs text-gray-400">
              所有我贡献的 Skill，按使用情况衡量
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-gray-500">总Skill数</span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {currentUser.skills.length}
                  <span className="text-sm font-normal text-gray-500 ml-1">个</span>
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-gray-500">调用量</span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {currentUser.totalInvokes.toLocaleString()}
                  <span className="text-sm font-normal text-gray-500 ml-1">次</span>
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-gray-500">使用人数</span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {currentUser.impactUsers}
                  <span className="text-sm font-normal text-gray-500 ml-1">人</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 右卡：团队贡献 (purple) - 调用量 + 业务价值双评 */}
        <Card className="border-purple-200 bg-gradient-to-br from-white to-purple-50/40 ring-1 ring-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Map className="w-4 h-4 text-purple-600" />
              团队贡献
              <Badge variant="secondary" className="text-[10px] bg-purple-100 text-purple-700 ml-1">
                OKR 关联
              </Badge>
            </CardTitle>
            <p className="text-xs text-gray-400">
              建设地图内的 Skill，调用量 + 业务价值双评
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                <div className="flex items-center gap-2 mb-1">
                  <Map className="w-4 h-4 text-purple-500" />
                  <span className="text-xs text-gray-500">地图Skill数</span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {currentUser.teamSkillCount}
                  <span className="text-sm font-normal text-gray-500 ml-1">个</span>
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-purple-500" />
                  <span className="text-xs text-gray-500">调用量</span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {currentUser.teamInvokes.toLocaleString()}
                  <span className="text-sm font-normal text-gray-500 ml-1">次</span>
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span className="text-xs text-gray-500">使用人数</span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {currentUser.teamActiveUsers}
                  <span className="text-sm font-normal text-gray-500 ml-1">人</span>
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-purple-500" />
                  <span className="text-xs text-gray-500">已认证数</span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {currentUser.certifiedSkillCount}
                  <span className="text-sm font-normal text-gray-500 ml-1">个</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* === 团队贡献排行（默认折叠，按组分组，仅团队贡献） === */}
      <div>
        <button
          onClick={() => setTableOpen(!tableOpen)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
        >
          {tableOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          <span>团队贡献排行</span>
          <span className="text-xs text-gray-400 font-normal">
            ({sorted.length} 人 · 仅地图 Skill)
          </span>
        </button>

        {tableOpen && (
          <div className="mt-3">
            <Card>
              <CardContent className="pt-4 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>贡献者</TableHead>
                      <TableHead className="text-right">地图Skill数</TableHead>
                      <TableHead className="text-right">调用量</TableHead>
                      <TableHead className="text-right">使用人数</TableHead>
                      <TableHead className="text-right">已认证</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(teamGroups).map(([team, members]) => {
                      const teamTotalSkills = members.reduce((s, c) => s + c.teamSkillCount, 0);
                      const teamTotalInvokes = members.reduce((s, c) => s + c.teamInvokes, 0);
                      const teamTotalActiveUsers = members.reduce((s, c) => s + c.teamActiveUsers, 0);
                      const teamTotalCertified = members.reduce((s, c) => s + c.certifiedInTeam, 0);

                      return (
                        <Fragment key={team}>
                          {/* Team header row */}
                          <TableRow className="bg-purple-50/60 border-t-2 border-purple-100">
                            <TableCell colSpan={5} className="font-semibold text-purple-800 text-sm py-2">
                              {team}
                              <span className="text-xs font-normal text-gray-500 ml-2">
                                ({members.length} 人)
                              </span>
                            </TableCell>
                          </TableRow>
                          {/* Members */}
                          {members.map((c) => (
                            <TableRow key={c.id}>
                              <TableCell className="font-medium pl-6">{c.name}</TableCell>
                              <TableCell className="text-right text-sm font-medium">
                                {c.teamSkillCount}
                              </TableCell>
                              <TableCell className="text-right text-sm">
                                {c.teamInvokes.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right text-sm">
                                {c.teamActiveUsers}
                              </TableCell>
                              <TableCell className="text-right text-sm">
                                {c.certifiedInTeam}
                              </TableCell>
                            </TableRow>
                          ))}
                          {/* Subtotal row */}
                          <TableRow className="bg-gray-50 border-b-2 border-gray-200">
                            <TableCell className="pl-6 text-xs font-semibold text-gray-500">
                              小计
                            </TableCell>
                            <TableCell className="text-right text-xs font-semibold text-gray-700">
                              {teamTotalSkills}
                            </TableCell>
                            <TableCell className="text-right text-xs font-semibold text-gray-700">
                              {teamTotalInvokes.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right text-xs font-semibold text-gray-700">
                              {teamTotalActiveUsers}
                            </TableCell>
                            <TableCell className="text-right text-xs font-semibold text-gray-700">
                              {teamTotalCertified}
                            </TableCell>
                          </TableRow>
                        </Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Data source note */}
      <p className="text-xs text-gray-400">
        注：个人共享 = 所有贡献的 Skill（仅自己可见）；团队贡献排行 = 地图内 Skill 的调用量 + 业务价值双评（公开）。数据为 mock 数据，后续接通 Beacon API 自动更新。
      </p>
    </div>
  );
}
