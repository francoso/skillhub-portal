import { getDemos, getSkillById } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink, Users } from "lucide-react";

const statusConfig = {
  completed: { label: "已完成", color: "bg-green-100 text-green-800" },
  upcoming: { label: "即将举办", color: "bg-blue-100 text-blue-800" },
  cancelled: { label: "已取消", color: "bg-gray-100 text-gray-600" },
};

export default function DemoPage() {
  const demos = getDemos();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Demo会管理</h1>
        <p className="text-sm text-gray-500 mt-1">
          已举办 {demos.filter((d) => d.status === "completed").length} 期，
          计划中 {demos.filter((d) => d.status === "upcoming").length} 期
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {demos
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .map((demo) => {
            const config = statusConfig[demo.status];
            return (
              <Card key={demo.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">
                          {demo.title}
                        </h3>
                        <Badge
                          className={`text-xs ${config.color}`}
                          variant="secondary"
                        >
                          {config.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{demo.date}</span>
                      </div>
                    </div>
                    {demo.replayUrl && (
                      <a
                        href={demo.replayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        回看
                      </a>
                    )}
                  </div>

                  {/* Skills presented */}
                  <div className="space-y-3">
                    {demo.skills.map((entry, idx) => {
                      const skill = getSkillById(entry.skillId);
                      return (
                        <div
                          key={idx}
                          className="flex items-start gap-3 pl-4 border-l-2 border-blue-200"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-800">
                                {skill?.name || entry.skillId}
                              </span>
                              <span className="text-xs text-gray-400">
                                — {entry.presenter}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {entry.summary}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Promotion text */}
                  {demo.promotionText && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">宣发文案</p>
                      <p className="text-sm text-gray-700">
                        {demo.promotionText}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
