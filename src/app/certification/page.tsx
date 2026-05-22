import { getCertificationRounds, getResultsByRound, getReviewsByRound } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Star, CheckCircle, XCircle } from "lucide-react";

const statusConfig = {
  collecting: { label: "征集中", color: "bg-yellow-100 text-yellow-800" },
  reviewing: { label: "评审中", color: "bg-blue-100 text-blue-800" },
  completed: { label: "已完成", color: "bg-green-100 text-green-800" },
};

const dimensionLabels: Record<string, string> = {
  normative: "规范性",
  applicability: "适用范围",
  unionFeature: "联盟特色",
  sustainability: "可持续性",
  effectiveness: "使用效果",
};

export default function CertificationPage() {
  const rounds = getCertificationRounds();
  const sortedRounds = [...rounds].sort((a, b) => b.month.localeCompare(a.month));
  const currentRound = sortedRounds[0];
  const historyRounds = sortedRounds.slice(1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
          CERTIFICATION
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">联盟认证</h1>
        <p className="text-sm text-gray-500 mt-1">
          双轨评审机制：大众评审团 + 专家评审，共同把关 Skill 质量
        </p>
      </div>

      {/* 认证通过标准 */}
      <Card className="border-blue-100 bg-blue-50/30">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-800">认证通过标准</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
            <div className="space-y-1.5">
              <p className="font-medium text-gray-700">大众评审团（每月 10 人）</p>
              <p>• 从联盟产运同学中抽选</p>
              <p>• 对当期 Skill 打分（1-5）+ 写评语</p>
              <p>• 通过条件：均分 ≥ 3.5 且 ≥ 6 人提交</p>
            </div>
            <div className="space-y-1.5">
              <p className="font-medium text-gray-700">专家评审（各组 PM/老板）</p>
              <p>• 测试验证 + 五维度打分</p>
              <p>• 维度：规范性 / 适用范围 / 联盟特色 / 可持续性 / 使用效果</p>
              <p>• 通过条件：均分 ≥ 3.0 且至少 1 位标记"通过"</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-blue-100">
            <p className="text-xs text-blue-700 font-medium">
              两者同时满足 → 获得联盟认证 🎖️
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 当前轮次 */}
      {currentRound && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-800">当前轮次</h2>
            <Badge className={statusConfig[currentRound.status].color} variant="secondary">
              {statusConfig[currentRound.status].label}
            </Badge>
          </div>

          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">轮次</p>
                  <p className="text-sm font-medium">{currentRound.month} 期</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">参评 Skill</p>
                  <div className="flex flex-wrap gap-1">
                    {currentRound.skills.map((s) => (
                      <Badge key={s} variant="secondary" className="text-[11px] bg-gray-100">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">评审团</p>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      大众 {currentRound.publicReviewers.length} 人
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      专家 {currentRound.expertReviewers.length} 人
                    </span>
                  </div>
                </div>
              </div>

              {/* 如果已完成，显示结果 */}
              {currentRound.status === "completed" && (
                <ResultsTable roundId={currentRound.id} />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 历史轮次 */}
      {historyRounds.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">历史轮次</h2>
          {historyRounds.map((round) => (
            <Card key={round.id}>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-gray-700">
                      {round.month} 期
                    </h3>
                    <Badge className={statusConfig[round.status].color} variant="secondary">
                      {statusConfig[round.status].label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{round.skills.length} 个 Skill 参评</span>
                    <span>{round.publicReviewers.length + round.expertReviewers.length} 位评审</span>
                  </div>
                </div>

                {round.status === "completed" && (
                  <ResultsTable roundId={round.id} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ResultsTable({ roundId }: { roundId: string }) {
  const results = getResultsByRound(roundId);
  const reviews = getReviewsByRound(roundId);

  if (results.length === 0) return null;

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">Skill</th>
            <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-500">大众评分</th>
            <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-500">专家评分</th>
            <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-500">认证结果</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {results.map((result) => (
            <tr key={result.skillId} className="hover:bg-gray-50/50">
              <td className="px-4 py-3">
                <p className="font-medium text-gray-800">{result.skillId}</p>
                <p className="text-xs text-gray-500 mt-0.5">{result.summary}</p>
              </td>
              <td className="px-4 py-3 text-center">
                <span className={`text-sm font-semibold ${result.publicScore >= 3.5 ? "text-green-600" : "text-red-500"}`}>
                  {result.publicScore.toFixed(1)}
                </span>
                <p className="text-[11px] text-gray-400">{result.publicCount} 人评审</p>
              </td>
              <td className="px-4 py-3 text-center">
                <span className={`text-sm font-semibold ${result.expertScore >= 3.0 ? "text-green-600" : "text-red-500"}`}>
                  {result.expertScore.toFixed(1)}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                {result.passed ? (
                  <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    已认证
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                    <XCircle className="w-3 h-3" />
                    未通过
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
