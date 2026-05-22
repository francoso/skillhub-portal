import { getRules } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, AlertTriangle, Star, ArrowRight, ShieldCheck } from "lucide-react";

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
          Skill 生态的准入、评分、认证、淘汰和激励机制
        </p>
      </div>

      {/* Admission */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            准入机制
          </CardTitle>
          <p className="text-sm text-gray-500">{rules.admission.description}</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap">
            {rules.admission.steps.map((step, idx) => (
              <div key={step.step} className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                  <span className="text-xs font-bold text-blue-600">
                    {step.step}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {idx < rules.admission.steps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-gray-300" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Certification Process */}
      <Card id="certification">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            联盟认证流程
          </CardTitle>
          <p className="text-sm text-gray-500">
            涉及联盟业务场景的 Skill，可申请联盟认证以获得官方推荐和更高可见度
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Three Stages */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Skill 三阶段</h3>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 flex-1 min-w-[180px]">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">1</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">个人 Skill</p>
                  <p className="text-xs text-gray-500">上传即上线，任何人可用</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
              <div className="flex items-center gap-2 px-4 py-3 bg-orange-50 rounded-lg border border-orange-200 flex-1 min-w-[180px]">
                <div className="w-6 h-6 rounded-full bg-orange-200 flex items-center justify-center text-xs font-bold text-orange-700">2</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">试用 Skill</p>
                  <p className="text-xs text-gray-500">纳入认证轮次，Demo + 评审中</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
              <div className="flex items-center gap-2 px-4 py-3 bg-green-50 rounded-lg border border-green-200 flex-1 min-w-[180px]">
                <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center text-xs font-bold text-green-700">3</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">联盟认证 Skill</p>
                  <p className="text-xs text-gray-500">通过认证，获官方标识 + 优先推荐</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Process Flow */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">认证评审流程</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {[
                { step: "Demo 会展示", desc: "在月度 Demo 会进行现场演示，展示核心能力和业务价值" },
                { step: "大众评审", desc: "6-10 名一线用户打分（1-5 分），评估实用性和体验" },
                { step: "专家评审", desc: "1-3 名领域 PM 从规范性、联盟特色、可持续性等维度评审" },
                { step: "结果公布", desc: "月底公布认证结果，通过者获得认证标识" },
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
                <p className="text-sm font-medium text-green-800">大众评审通过</p>
                <p className="text-xs text-green-600 mt-1">均分 ≥ 3.5 分，且参评人数 ≥ 6 人</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <p className="text-sm font-medium text-green-800">专家评审通过</p>
                <p className="text-xs text-green-600 mt-1">均分 ≥ 3.0 分，至少 1 位专家评审通过</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              两项均达标即通过认证。未通过者将收到改进建议，下轮可再次参评。
            </p>
          </div>

          <Separator />

          {/* Entry Conditions */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">申请条件</h3>
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

      {/* Scoring */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            评分机制
          </CardTitle>
          <p className="text-sm text-gray-500">{rules.scoring.description}</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>评分维度</TableHead>
                <TableHead className="w-20">权重</TableHead>
                <TableHead>说明</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.scoring.dimensions.map((dim) => (
                <TableRow key={dim.dimension}>
                  <TableCell className="font-medium">{dim.dimension}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {(dim.weight * 100).toFixed(0)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {dim.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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

      {/* Incentive */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            🎯 激励机制
          </CardTitle>
          <p className="text-sm text-gray-500">
            {rules.incentive.description}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {rules.incentive.rules.map((rule, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700"
              >
                <span className="text-green-500 font-mono text-xs">+</span>
                {rule}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
