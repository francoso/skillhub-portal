import Link from "next/link";
import coverageData from "@/data/coverage.json";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Task {
  content: string;
  businessType: string;
  status: "covered" | "building" | "unclaimed";
  skillId: string | null;
}

interface Module {
  name: string;
  tasks: Task[];
}

interface Workflow {
  workflow: string;
  modules: Module[];
}

const statusConfig = {
  covered: { label: "已覆盖", color: "bg-green-500", chipColor: "bg-green-100 text-green-700 border-green-200" },
  building: { label: "建设中", color: "bg-orange-400", chipColor: "bg-orange-100 text-orange-700 border-orange-200" },
  unclaimed: { label: "待认领", color: "bg-gray-300", chipColor: "bg-gray-100 text-gray-500 border-gray-200" },
};

const workflowColors: Record<string, string> = {
  "市场分析": "border-blue-200 bg-blue-50/50",
  "变现调优": "border-purple-200 bg-purple-50/50",
  "客户服务": "border-green-200 bg-green-50/50",
  "流量接入": "border-orange-200 bg-orange-50/50",
  "形态样式": "border-pink-200 bg-pink-50/50",
  "体验管理": "border-cyan-200 bg-cyan-50/50",
};

export default function CoveragePage() {
  const data = coverageData as Workflow[];

  // Calculate stats
  const allTasks = data.flatMap((w) => w.modules.flatMap((m) => m.tasks));
  const coveredCount = allTasks.filter((t) => t.status === "covered").length;
  const buildingCount = allTasks.filter((t) => t.status === "building").length;
  const unclaimedCount = allTasks.filter((t) => t.status === "unclaimed").length;
  const totalCount = allTasks.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">建设地图</h1>
        <p className="text-sm text-gray-500 mt-1">
          联盟 Skill 工作流覆盖全景
        </p>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-gray-500">覆盖率</p>
              <p className="text-2xl font-bold text-gray-900">
                {coveredCount}/{totalCount}{" "}
                <span className="text-sm font-normal text-gray-500">
                  个工作内容已有 Skill
                </span>
              </p>
              <div className="w-64 h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${(coveredCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-600">已覆盖 {coveredCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-400" />
                <span className="text-gray-600">建设中 {buildingCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-300" />
                <span className="text-gray-600">待认领 {unclaimedCount}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {data.map((workflow) => {
          const wfTasks = workflow.modules.flatMap((m) => m.tasks);
          const wfCovered = wfTasks.filter((t) => t.status === "covered").length;
          const wfTotal = wfTasks.length;

          return (
            <Card
              key={workflow.workflow}
              className={`border ${workflowColors[workflow.workflow] || "border-gray-200"}`}
            >
              <CardContent className="p-4">
                {/* Workflow Header */}
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-gray-900">
                    {workflow.workflow}
                  </h2>
                  <span className="text-xs text-gray-400">
                    {wfCovered}/{wfTotal}
                  </span>
                </div>

                {/* Modules */}
                <div className="space-y-3">
                  {workflow.modules.map((mod) => (
                    <div key={mod.name}>
                      <p className="text-xs font-medium text-gray-500 mb-1.5">
                        {mod.name}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {mod.tasks.map((task) => {
                          const config = statusConfig[task.status];
                          const inner = (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs border ${config.chipColor} ${
                                task.skillId ? "cursor-pointer hover:shadow-sm transition-shadow" : ""
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${config.color} shrink-0`}
                              />
                              {task.content}
                            </span>
                          );

                          if (task.skillId) {
                            return (
                              <Link
                                key={task.content}
                                href={`/skills/${task.skillId}`}
                              >
                                {inner}
                              </Link>
                            );
                          }
                          return <span key={task.content}>{inner}</span>;
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Legend */}
      <div className="text-xs text-gray-400 text-center pt-4">
        点击绿色标签可跳转到对应 Skill 详情页
      </div>
    </div>
  );
}
