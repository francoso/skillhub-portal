import { getRules } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, ArrowRight, ShieldCheck, Upload } from "lucide-react";

export default function RulesPage() {
  const rules = getRules();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
          GOVERNANCE
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">机制规则</h1>
        <p className="text-sm text-gray-500 mt-1">
          Skill 从上传到认证的完整生命周期，以及生态健康保障机制
        </p>
      </div>

      {/* Skill Lifecycle — 准入 + 认证合一 */}
      <Card id="certification">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            Skill 生命周期
          </CardTitle>
          <p className="text-sm text-gray-500">
            从上传到认证的完整路径——上传即可用，认证获推荐
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Three Stages */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">三个阶段</h3>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 flex-1 min-w-[180px]">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">1</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">个人 Skill</p>
                  <p className="text-xs text-gray-500">上传 .skill/.zip 压缩包即上线，全员可用</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
              <div className="flex items-center gap-2 px-4 py-3 bg-orange-50 rounded-lg border border-orange-200 flex-1 min-w-[180px]">
                <div className="w-6 h-6 rounded-full bg-orange-200 flex items-center justify-center text-xs font-bold text-orange-700">2</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">评价中</p>
                  <p className="text-xs text-gray-500">申请认证后纳入月度评价轮次</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
              <div className="flex items-center gap-2 px-4 py-3 bg-green-50 rounded-lg border border-green-200 flex-1 min-w-[180px]">
                <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center text-xs font-bold text-green-700">3</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">联盟认证</p>
                  <p className="text-xs text-gray-500">通过评价，获官方标识 + 优先推荐</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* 准入：上传即上线 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Upload className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-medium text-gray-700">准入：上传即上线</h3>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-gray-700 leading-relaxed">
                任何联盟成员都可以上传 Skill 压缩包（.skill 或 .zip），上传后自动上线为<strong>个人 Skill</strong>，全员即刻可用。无需审批、无需排期——<strong>先用起来，用得好再走认证</strong>。
              </p>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                {[
                  { label: "格式要求", value: ".skill 或 .zip 压缩包" },
                  { label: "上线时间", value: "上传后立即可用" },
                  { label: "适用范围", value: "全员可搜索、可使用" },
                ].map((item, idx) => (
                  <div key={idx} className="text-center p-2 bg-white rounded border border-blue-100">
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* 认证评价流程 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <h3 className="text-sm font-medium text-gray-700">认证：月度评价流程</h3>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              涉及联盟业务场景的 Skill，可申请参与月度认证评价。通过后获得联盟官方认证标识和优先推荐位。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {[
                { step: "申请参评", desc: "Owner 主动申请，需 Skill 已上线且有实际用户" },
                { step: "Demo 会展示", desc: "在月度 Demo 会现场演示核心能力和业务价值" },
                { step: "大众 + 专家评价", desc: "大众点评官（2 名一线用户打分）+ 1 位对口专家 PM（维度评价）" },
                { step: "结果公布", desc: "月底公布，通过者获得认证标识" },
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs font-bold text-blue-600 mb-1">Step {idx + 1}</p>
                  <p className="text-sm font-medium text-gray-800">{item.step}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Pass Criteria */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">通过条件</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <p className="text-sm font-medium text-green-800">大众点评官通过</p>
                <p className="text-xs text-green-600 mt-1">均分 ≥ 3.5 分，且参评人数 ≥ 2 人</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <p className="text-sm font-medium text-green-800">专家评价通过</p>
                <p className="text-xs text-green-600 mt-1">每个 Skill 由 1 位对口专家评价，均分 ≥ 3.0 分即通过</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              两项均达标即通过认证。未通过者将收到改进建议，下轮可再次参评。
            </p>
          </div>

          <Separator />

          {/* Entry Conditions */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">申请认证的前提条件</h3>
            <ul className="space-y-1.5">
              {[
                "Skill 已上线且状态为 active",
                "有实际用户使用（活跃用户 > 0）",
                "涉及联盟业务场景（广告、投放、厂商、变现等）",
                "Owner 愿意参与 Demo 会展示",
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Elimination */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            淘汰机制
          </CardTitle>
          <p className="text-sm text-gray-500">
            {rules.elimination.description}
          </p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {rules.elimination.conditions.map((condition, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                {condition}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

    </div>
  );
}
