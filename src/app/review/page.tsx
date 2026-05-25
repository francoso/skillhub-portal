"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ExternalLink, Trophy, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentReviewRound, getSkillById, CURRENT_USER } from "@/lib/data";
import {
  saveReview,
  getUserReviewedSkills,
  getSubmittedReviews,
  settleRound,
  getSettledResults,
  isRoundSettled,
} from "@/lib/review-store";
import type { CertificationResult } from "@/lib/types";

interface ReviewState {
  score: number | null;
  comment: string;
  submitted: boolean;
}

export default function ReviewPage() {
  const round = getCurrentReviewRound();

  // 检查当前用户是否是该轮次的评审员
  const isReviewer = round?.publicReviewers.includes(CURRENT_USER);

  const skillIds = round?.skills || [];
  const skills = skillIds
    .map((id) => getSkillById(id))
    .filter((s) => s !== undefined);

  // 从 localStorage 恢复已提交状态
  const [reviews, setReviews] = useState<Record<string, ReviewState>>(() => {
    const init: Record<string, ReviewState> = {};
    skills.forEach((s) => {
      init[s.id] = { score: null, comment: "", submitted: false };
    });
    return init;
  });

  const [settled, setSettled] = useState<boolean>(false);
  const [settledResults, setSettledResults] = useState<CertificationResult[] | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (!round) return;
    const reviewedSkills = getUserReviewedSkills(round.id, CURRENT_USER);
    if (reviewedSkills.size > 0) {
      setReviews((prev) => {
        const next = { ...prev };
        const allReviews = getSubmittedReviews(round.id);
        for (const skillId of reviewedSkills) {
          const saved = allReviews.find(
            (r) => r.skillId === skillId && r.reviewer === CURRENT_USER
          );
          if (saved && next[skillId]) {
            next[skillId] = {
              score: saved.score,
              comment: saved.comment || "",
              submitted: true,
            };
          }
        }
        return next;
      });
    }

    // 检查是否已结算
    if (isRoundSettled(round.id)) {
      setSettled(true);
      setSettledResults(getSettledResults(round.id));
    }
  }, [round?.id]);

  const allSubmitted =
    skills.length > 0 && skills.every((s) => reviews[s.id]?.submitted);

  const handleScore = (skillId: string, score: number) => {
    setReviews((prev) => ({
      ...prev,
      [skillId]: { ...prev[skillId], score },
    }));
  };

  const handleComment = (skillId: string, comment: string) => {
    setReviews((prev) => ({
      ...prev,
      [skillId]: { ...prev[skillId], comment },
    }));
  };

  const handleSubmit = (skillId: string) => {
    if (!round) return;
    const review = reviews[skillId];
    if (review.score === null) return;

    // 写入 localStorage
    saveReview(
      round.id,
      skillId,
      review.score,
      review.comment,
      CURRENT_USER,
      "public"
    );

    setReviews((prev) => ({
      ...prev,
      [skillId]: { ...prev[skillId], submitted: true },
    }));
  };

  const handleSettle = () => {
    if (!round) return;
    const threshold = (round as unknown as { passThreshold?: { publicMin: number; expertMin: number } }).passThreshold
      || { publicMin: 3.5, expertMin: 3.0 };
    const results = settleRound(round.id, round.skills, threshold);
    setSettled(true);
    setSettledResults(results);
  };

  if (!round || !isReviewer) {
    return (
      <div className="space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" /> 返回首页
        </Link>
        <div className="text-center py-12">
          <p className="text-gray-500">当前没有待评价的任务</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" /> 返回首页
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          本月大众点评官（{round.month}）
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          请对以下 Skill 进行评分和评语，你的反馈将帮助 Skill 持续改进
        </p>
      </div>

      {/* 已结算结果展示 */}
      {settled && settledResults && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-medium text-blue-800">
                本轮评价已完成，结果如下
              </p>
            </div>
            <div className="space-y-2">
              {settledResults.map((result) => {
                const skill = getSkillById(result.skillId);
                return (
                  <div
                    key={result.skillId}
                    className="flex items-center justify-between py-1.5 px-3 bg-white rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      {result.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )}
                      <Link
                        href={`/skills/${skill?.slug || result.skillId}`}
                        className="text-sm font-medium text-gray-700 hover:text-blue-600"
                      >
                        {skill?.name || result.skillId}
                      </Link>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        均分 {result.publicScore.toFixed(1)}
                      </span>
                      <Badge
                        variant={result.passed ? "default" : "secondary"}
                        className={`text-xs ${
                          result.passed
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {result.passed ? "通过" : "待改进"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
            {settledResults.some((r) => !r.passed) && (
              <p className="text-xs text-blue-600 mt-2">
                待改进的 Skill 可在详情页查看具体反馈
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* 全部完成提示 + 结算入口 */}
      {allSubmitted && !settled && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  感谢参与本月评价！
                </p>
                <p className="text-xs text-green-600 mt-0.5">
                  你的评分已记录，可以结算本轮查看结果
                </p>
              </div>
            </div>
            <button
              onClick={handleSettle}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              结算本轮
            </button>
          </CardContent>
        </Card>
      )}

      {/* Skill 评价卡片 */}
      {!settled && (
        <div className="space-y-4">
          {skills.map((skill) => {
            const review = reviews[skill.id];
            const canSubmit = review.score !== null && !review.submitted;

            if (review.submitted) {
              return (
                <Card key={skill.id} className="border-gray-100 bg-gray-50">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-500">
                          {skill.name}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        已评 {review.score} 分
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            }

            return (
              <Card key={skill.id}>
                <CardContent className="p-5 space-y-4">
                  {/* Skill 信息 */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-gray-900">
                        {skill.name}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {skill.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {skill.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-400">
                        Owner: {skill.owner} · {skill.team}
                      </span>
                      {skill.demoUrl && (
                        <a
                          href={skill.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="w-3 h-3" />
                          体验
                        </a>
                      )}
                      {skill.docUrl && (
                        <a
                          href={skill.docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="w-3 h-3" />
                          文档
                        </a>
                      )}
                    </div>
                  </div>

                  {/* 评分 */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">评分</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          onClick={() => handleScore(skill.id, score)}
                          className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${
                            review.score === score
                              ? "bg-blue-600 text-white shadow-md scale-110"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 评语 */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      评语{" "}
                      <span className="text-gray-400 text-xs">（选填）</span>
                    </p>
                    <textarea
                      value={review.comment}
                      onChange={(e) => handleComment(skill.id, e.target.value)}
                      placeholder="说说你对这个 Skill 的使用感受..."
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                    />
                  </div>

                  {/* 提交 */}
                  <button
                    onClick={() => handleSubmit(skill.id)}
                    disabled={!canSubmit}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      canSubmit
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    提交评价
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
