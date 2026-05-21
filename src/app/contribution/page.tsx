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
import { Trophy, Medal, Award } from "lucide-react";

export default function ContributionPage() {
  const contributors = getContributors().sort(
    (a, b) => b.contributionScore - a.contributionScore
  );
  const skills = getSkills();

  const rankIcons = [
    <Trophy key="1" className="w-4 h-4 text-yellow-500" />,
    <Medal key="2" className="w-4 h-4 text-gray-400" />,
    <Award key="3" className="w-4 h-4 text-amber-600" />,
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">贡献看板</h1>
        <p className="text-sm text-gray-500 mt-1">
          共 {contributors.length} 位贡献者
        </p>
      </div>

      {/* Leaderboard */}
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
              {contributors.map((c, idx) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {idx < 3 ? (
                        rankIcons[idx]
                      ) : (
                        <span className="text-sm text-gray-400">{idx + 1}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {c.team}
                  </TableCell>
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
                          <Badge
                            key={skillId}
                            variant="secondary"
                            className="text-xs"
                          >
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Data source note */}
      <p className="text-xs text-gray-400">
        注：调用量和贡献分为mock数据（_source: mock_beacon），后续接通Beacon
        API后自动更新
      </p>
    </div>
  );
}
