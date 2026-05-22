"use client";

import { Contributor } from "@/lib/types";

const STAGES = [
  { key: "starting", label: "起步", condition: "参与 1 个 Skill，迈出第一步就是胜利 🎉" },
  { key: "active", label: "活跃", condition: "有 1 个自己 owner 的 Skill 上线，你已经能独立交付了！" },
  { key: "core", label: "核心", condition: "2+ Skill 上线，服务 10+ 人，你的 Skill 正在帮到更多同事" },
  { key: "benchmark", label: "标杆", condition: "3+ Skill + Demo 展示 + 帮助他人上架，联盟生态因你更好" },
] as const;

function getStageIndex(stage: Contributor["stage"]): number {
  return STAGES.findIndex((s) => s.key === stage);
}

export function MilestoneProgress({ stage }: { stage: Contributor["stage"] }) {
  const currentIdx = getStageIndex(stage);
  const progress = ((currentIdx + 1) / STAGES.length) * 100;

  // 下一阶段的晋升条件
  const nextStage = currentIdx < STAGES.length - 1 ? STAGES[currentIdx + 1] : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">贡献阶段</span>
        <span className="text-sm font-medium text-blue-600">
          {STAGES[currentIdx].label}
        </span>
      </div>
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between">
        {STAGES.map((s, idx) => (
          <div key={s.key} className="flex flex-col items-center">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                idx <= currentIdx ? "bg-blue-500" : "bg-gray-200"
              }`}
            />
            <span
              className={`text-xs mt-1 ${
                idx <= currentIdx ? "text-gray-700 font-medium" : "text-gray-400"
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* 晋升条件提示 */}
      {nextStage ? (
        <div className="mt-2 p-3 rounded-md bg-gray-50 border border-gray-100">
          <p className="text-xs text-gray-500">
            <span className="font-medium text-gray-700">晋升到「{nextStage.label}」：</span>
            {nextStage.condition}
          </p>
        </div>
      ) : (
        <div className="mt-2 p-3 rounded-md bg-blue-50 border border-blue-100">
          <p className="text-xs text-blue-600 font-medium">
            你已经是成熟的 Skill 制作者，继续努力共建联盟 Skill 生态 💪
          </p>
        </div>
      )}
    </div>
  );
}
