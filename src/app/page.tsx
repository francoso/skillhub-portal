import { getStats, getMetrics, getSkills, getDemos } from "@/lib/data";
import { KpiCard } from "@/components/shared/kpi-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const stats = getStats();
  const metrics = getMetrics();
  const skills = getSkills();
  const demos = getDemos();

  // 计算本周 vs 上周环比
  const dailyTrend = metrics.dailyTrend;
  const thisWeek = dailyTrend.slice(-7);
  const lastWeek = dailyTrend.slice(-14, -7);
  const thisWeekTotal = thisWeek.reduce((sum, d) => sum + d.invokes, 0);
  const lastWeekTotal = lastWeek.reduce((sum, d) => sum + d.invokes, 0);
  const weekOverWeekChange =
    lastWeekTotal > 0
      ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100)
      : 0;

  // 最近动态
  const recentActivities = [
    ...skills
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 3)
      .map((s) => ({
        type: "skill" as const,
        title: `${s.name} 更新`,
        date: s.updatedAt,
        detail: s.status === "developing" ? "开发中" : "已上线",
      })),
    ...demos.slice(0, 2).map((d) => ({
      type: "demo" as const,
      title: d.title,
      date: d.date,
      detail: d.status === "completed" ? "已完成" : "即将举办",
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">总览</h1>
        <p className="text-sm text-gray-500 mt-1">
          Skill生态运行状态一览
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Skill总数" value={stats.totalSkills} icon="skills" />
        <KpiCard
          title="贡献者"
          value={stats.totalContributors}
          icon="contributors"
        />
        <KpiCard
          title="本月调用量"
          value={stats.monthlyInvokes.toLocaleString()}
          icon="invokes"
          subtitle={`本周 ${thisWeekTotal} | 上周 ${lastWeekTotal}`}
          trend={{
            value: Math.abs(weekOverWeekChange),
            isPositive: weekOverWeekChange >= 0,
          }}
        />
        <KpiCard title="活跃Skill" value={stats.activeSkills} icon="active" />
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">使用趋势（近30天）</CardTitle>
          <p className="text-xs text-gray-400">数据源: mock_beacon</p>
        </CardHeader>
        <CardContent>
          <TrendChart data={metrics.dailyTrend} />
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">最近动态</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      activity.type === "skill" ? "default" : "secondary"
                    }
                    className="text-xs"
                  >
                    {activity.type === "skill" ? "Skill" : "Demo"}
                  </Badge>
                  <span className="text-sm text-gray-700">
                    {activity.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {activity.date}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {activity.detail}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
