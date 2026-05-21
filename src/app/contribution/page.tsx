"use client";

import { useState, useMemo } from "react";
import { getContributors, getSkills } from "@/lib/data";
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
import { Trophy, Medal, Award } from "lucide-react";

type ViewMode = "all" | "team" | "role";

export default function ContributionPage() {
  const contributors = getContributors().sort(
    (a, b) => b.contributionScore - a.contributionScore
  );
  const skills = getSkills();
  const [viewMode, setViewMode] = useState<ViewMode>("all");

  const rankIcons = [
    <Trophy key="1" className="w-4 h-4 text-yellow-500" />,
    <Medal key="2" className="w-4 h-4 text-gray-400" />,
    <Award key="3" className="w-4 h-4 text-amber-600" />,
  ];

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

  const groupedByRole = useMemo(() => {
    const map = new Map<
      string,
      { members: typeof contributors; totalInvokes: number; totalScore: number }
    >();
    for (const c of contributors) {
      if (!map.has(c.role)) {
        map.set(c.role, { members: [], totalInvokes: 0, totalScore: 0 });
      }
      const group = map.get(c.role)!;
      group.members.push(c);
      group.totalInvokes += c.totalInvokes;
      group.totalScore += c.contributionScore;
    }
    return [...map.entries()].sort((a, b) => b[1].totalScore - a[1].totalScore);
  }, [contributors]);

  const renderContributorRow = (
    c: (typeof contributors)[0],
    idx: number,
    showRank: boolean
  ) => (
    <TableRow key={c.id}>
      <TableCell>
        <div className="flex items-center justify-center">
          {showRank && idx < 3 ? (
            rankIcons[idx]
          ) : (
            <span className="text-sm text-gray-400">{idx + 1}</span>
          )}
        </div>
      </TableCell>
      <TableCell className="font-medium">{c.name}</TableCell>
      <TableCell className="text-sm text-gray-500">{c.team}</TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs">
          {c.role}
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
          <TableHead>角色</TableHead>
          <TableHead>贡献Skill</TableHead>
          <TableHead className="text-right">累计调用</TableHead>
          <TableHead className="text-right">贡献分</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {groups.map(([groupName, group]) => (
          <>
            <TableRow key={`group-${groupName}`} className="bg-gray-50">
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
              .map((c, idx) => renderContributorRow(c, idx, false))}
          </>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">贡献看板</h1>
        <p className="text-sm text-gray-500 mt-1">
          共 {contributors.length} 位贡献者
        </p>
      </div>

      {/* View Mode Tabs */}
      <Tabs
        defaultValue="all"
        onValueChange={(val) => setViewMode(val as ViewMode)}
      >
        <TabsList>
          <TabsTrigger value="all">全部</TabsTrigger>
          <TabsTrigger value="team">按团队</TabsTrigger>
          <TabsTrigger value="role">按角色</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">贡献排行榜</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">排名</TableHead>
                    <TableHead>贡献者</TableHead>
                    <TableHead>团队</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead>贡献Skill</TableHead>
                    <TableHead className="text-right">累计调用</TableHead>
                    <TableHead className="text-right">贡献分</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contributors.map((c, idx) =>
                    renderContributorRow(c, idx, true)
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                按团队分组
              </CardTitle>
            </CardHeader>
            <CardContent>{renderGroupedTable(groupedByTeam)}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="role">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                按角色分组
              </CardTitle>
            </CardHeader>
            <CardContent>{renderGroupedTable(groupedByRole)}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Data source note */}
      <p className="text-xs text-gray-400">
        注：调用量和贡献分为mock数据（_source: mock_beacon），后续接通Beacon
        API后自动更新
      </p>
    </div>
  );
}
