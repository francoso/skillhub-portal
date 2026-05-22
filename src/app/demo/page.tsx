import { getDemos, getSkillById } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink, FileText, Rocket } from "lucide-react";

const statusConfig = {
  completed: { label: "已完成", color: "bg-green-100 text-green-800" },
  upcoming: { label: "即将举办", color: "bg-blue-100 text-blue-800" },
  cancelled: { label: "已取消", color: "bg-gray-100 text-gray-600" },
};

// 封面渐变色
const coverGradients = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-red-500",
  "from-purple-500 to-pink-500",
  "from-cyan-500 to-blue-500",
];

export default function DemoPage() {
  const demos = getDemos();
  const sortedDemos = [...demos].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
          DEMO SESSION
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">Demo 会</h1>
        <p className="text-sm text-gray-500 mt-1">
          已举办 {demos.filter((d) => d.status === "completed").length} 期，
          计划中 {demos.filter((d) => d.status === "upcoming").length} 期
        </p>
      </div>

      {/* Card Grid — 参考知识库卡片样式 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedDemos.map((demo, idx) => {
          const config = statusConfig[demo.status];
          const gradient = coverGradients[idx % coverGradients.length];
          const episodeNum = sortedDemos.length - idx;

          return (
            <Card key={demo.id} className="overflow-hidden border-gray-100 hover:shadow-md transition-shadow">
              {/* 封面渐变色块 */}
              <div className={`h-32 bg-gradient-to-br ${gradient} relative`}>
                <div className="absolute top-3 left-4">
                  <span className="text-white/80 text-xs font-medium">
                    NO.{episodeNum}
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="font-semibold text-white text-lg leading-tight">
                    {demo.title}
                  </h3>
                </div>
                <div className="absolute top-3 right-4">
                  <Badge
                    className={`text-xs ${config.color}`}
                    variant="secondary"
                  >
                    {config.label}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-5">
                {/* 日期 */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{demo.date}</span>
                  {demo.replayUrl && (
                    <a
                      href={demo.replayUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      回看
                    </a>
                  )}
                </div>

                {/* Skills presented */}
                <div className="space-y-2.5">
                  {demo.skills.map((entry, entryIdx) => {
                    const skill = getSkillById(entry.skillId);
                    return (
                      <div
                        key={entryIdx}
                        className="flex items-start gap-2 pl-3 border-l-2 border-gray-200"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-800 truncate">
                              {skill?.name || entry.skillId}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            {entry.presenter} · {entry.summary}
                          </p>
                          {/* 使用链接 & 介绍文档 */}
                          {(entry.skillUrl || entry.docUrl) && (
                            <div className="flex items-center gap-2 mt-1.5">
                              {entry.skillUrl && (
                                <a
                                  href={entry.skillUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                >
                                  <Rocket className="w-3 h-3" />
                                  使用链接
                                </a>
                              )}
                              {entry.docUrl && (
                                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                  <FileText className="w-3 h-3" />
                                  {entry.docUrl}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Promotion text */}
                {demo.promotionText && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">宣发文案</p>
                    <p className="text-xs text-gray-600 line-clamp-3">
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
