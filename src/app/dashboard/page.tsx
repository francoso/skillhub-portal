import { getStats, getMetrics } from "@/lib/data";
import { KpiCard } from "@/components/shared/kpi-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const stats = getStats();
  const metrics = getMetrics();

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

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
          DASHBOARD
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">数据看板</h1>
        <p className="text-sm text-gray-500 mt-1">
          联盟 Skill 生态运行状态一览
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
    </div>
  );
}
