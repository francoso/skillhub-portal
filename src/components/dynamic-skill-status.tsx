"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Check, MessageSquare, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CertificationResult } from "@/lib/types";
import type { SkillStage } from "@/lib/data";
import { getSettledResults, getSubmittedReviews } from "@/lib/review-store";

interface Props {
  skillId: string;
  staticStage: SkillStage;
  staticFailedResult?: CertificationResult;
  staticCertResult?: CertificationResult;
  currentRoundId?: string;
}

const stageSteps: { key: SkillStage; label: string; step: number }[] = [
  { key: "personal", label: "已上线", step: 1 },
  { key: "reviewing", label: "评价中", step: 2 },
  { key: "certified", label: "联盟认证", step: 3 },
];

/**
 * Client-side GrowthPath + ReviewFeedback that reads localStorage
 * to show dynamic settled results and review comments.
 */
export function DynamicSkillStatus({ skillId, staticStage, staticFailedResult, staticCertResult, currentRoundId }: Props) {
  const [stage, setStage] = useState<SkillStage>(staticStage);
  const [result, setResult] = useState<CertificationResult | undefined>(staticCertResult || staticFailedResult);
  const [reviews, setReviews] = useState<{ reviewer: string; score: number; comment: string; type: string }[]>([]);

  useEffect(() => {
    if (!currentRoundId) return;

    // Check if round has been settled
    const settled = getSettledResults(currentRoundId);
    if (settled) {
      const skillResult = settled.find(r => r.skillId === skillId);
      if (skillResult) {
        setResult(skillResult);
        setStage(skillResult.passed ? "certified" : "needs-improvement");
      }
    }

    // Load review comments from localStorage
    const allReviews = getSubmittedReviews(currentRoundId);
    const skillReviews = allReviews
      .filter(r => r.skillId === skillId && r.comment.trim().length > 0)
      .map(r => ({
        reviewer: r.reviewer,
        score: r.score,
        comment: r.comment,
        type: r.reviewerType === "expert" ? "专家" : "大众",
      }));
    setReviews(skillReviews);
  }, [skillId, currentRoundId]);

  const currentStep = stage === "certified" ? 3 : stage === "reviewing" ? 2 : 1;

  return (
    <div className="space-y-4">
      {/* Growth Path */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-medium text-gray-500">成长路径</h2>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-4">
            {stageSteps.map((s, idx) => {
              const isCompleted = s.step < currentStep;
              const isCurrent = s.step === currentStep;
              return (
                <div key={s.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isCompleted
                          ? "bg-green-100 text-green-700"
                          : isCurrent
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : s.step}
                    </div>
                    <span
                      className={`text-xs mt-1.5 ${
                        isCurrent ? "text-blue-600 font-medium" : "text-gray-500"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {idx < stageSteps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 -mt-5 ${
                        s.step < currentStep ? "bg-green-300" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Stage-specific guidance */}
          <div className="mt-3 p-3 rounded-lg bg-gray-50 text-sm text-gray-600">
            {stage === "personal" && (
              <p>
                涉及联盟业务场景？可{" "}
                <Link href="/rules#certification" className="text-blue-600 hover:underline">
                  申请参与下月认证评价
                </Link>
                ，通过后获得联盟官方认证标识和优先推荐。
              </p>
            )}
            {stage === "needs-improvement" && result && (
              <div className="space-y-2">
                <p className="flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
                  <span className="font-medium text-amber-700">待改进</span>
                  <span className="text-gray-400 text-xs ml-2">
                    {result.roundId.replace("round-", "")} 轮评价未通过
                  </span>
                </p>
                {result.feedbackSummary && (
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {result.feedbackSummary}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                  大众评价 {result.publicScore.toFixed(1)} 分（{result.publicCount} 人）· 专家评价 {result.expertScore.toFixed(1)} 分
                </p>
                <Link
                  href="/rules#certification"
                  className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  报名下一轮评价
                </Link>
              </div>
            )}
            {stage === "reviewing" && (
              <p>本月评价进行中，经过 Demo 展示 + 大众点评官 + 专家评价，结果将在月底公布。</p>
            )}
            {stage === "certified" && (
              <div className="space-y-1">
                <p className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                  <span className="font-medium text-green-700">已通过联盟认证</span>
                </p>
                {result && (
                  <p className="text-xs text-gray-500 mt-1">
                    大众评价 {result.publicScore.toFixed(1)} 分（{result.publicCount} 人）· 专家评价 {result.expertScore.toFixed(1)} 分
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review Comments Section */}
      {reviews.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-medium text-gray-500">评价反馈</h2>
              <span className="text-xs text-gray-400 ml-auto">{reviews.length} 条评语</span>
            </div>
            <div className="space-y-3">
              {reviews.map((review, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-medium text-gray-700">{review.reviewer}</span>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${
                        review.type === "专家"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {review.type}
                    </Badge>
                    <span className="text-xs text-gray-400 ml-auto">{review.score} 分</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
