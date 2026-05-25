"use client";

import type { CertificationResult } from "./types";

export interface ReviewRecord {
  skillId: string;
  score: number;
  comment: string;
  reviewer: string;
  reviewerType: "public" | "expert";
  submittedAt: string;
}

const REVIEW_KEY_PREFIX = "skillhub-reviews-";
const SETTLED_KEY_PREFIX = "skillhub-settled-";

// === 存取评价 ===

export function saveReview(
  roundId: string,
  skillId: string,
  score: number,
  comment: string,
  reviewer: string,
  reviewerType: "public" | "expert" = "public"
): void {
  const records = getSubmittedReviews(roundId);
  // 去重：同一 reviewer + skillId 只保留最新
  const filtered = records.filter(
    (r) => !(r.skillId === skillId && r.reviewer === reviewer)
  );
  filtered.push({
    skillId,
    score,
    comment,
    reviewer,
    reviewerType,
    submittedAt: new Date().toISOString().slice(0, 10),
  });
  if (typeof window !== "undefined") {
    localStorage.setItem(
      REVIEW_KEY_PREFIX + roundId,
      JSON.stringify(filtered)
    );
  }
}

export function getSubmittedReviews(roundId: string): ReviewRecord[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(REVIEW_KEY_PREFIX + roundId);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ReviewRecord[];
  } catch {
    return [];
  }
}

export function getUserReviewedSkills(
  roundId: string,
  reviewer: string
): Set<string> {
  const reviews = getSubmittedReviews(roundId);
  return new Set(
    reviews.filter((r) => r.reviewer === reviewer).map((r) => r.skillId)
  );
}

// === 结算 ===

interface PassThreshold {
  publicMin: number;
  expertMin: number;
}

const DEFAULT_THRESHOLD: PassThreshold = { publicMin: 3.5, expertMin: 3.0 };

export function settleRound(
  roundId: string,
  skillIds: string[],
  threshold: PassThreshold = DEFAULT_THRESHOLD
): CertificationResult[] {
  const reviews = getSubmittedReviews(roundId);
  const results: CertificationResult[] = [];

  for (const skillId of skillIds) {
    const skillReviews = reviews.filter((r) => r.skillId === skillId);
    const publicReviews = skillReviews.filter((r) => r.reviewerType === "public");
    const expertReviews = skillReviews.filter((r) => r.reviewerType === "expert");

    const publicScore =
      publicReviews.length > 0
        ? publicReviews.reduce((sum, r) => sum + r.score, 0) / publicReviews.length
        : 0;
    const expertScore =
      expertReviews.length > 0
        ? expertReviews.reduce((sum, r) => sum + r.score, 0) / expertReviews.length
        : publicScore; // 没有专家评价时用大众均分代替

    const passed =
      publicScore >= threshold.publicMin && expertScore >= threshold.expertMin;

    // 生成 feedbackSummary（未通过时从评语中提取）
    let feedbackSummary: string | undefined;
    if (!passed) {
      const comments = skillReviews
        .filter((r) => r.comment.trim().length > 0)
        .map((r) => r.comment.trim());
      feedbackSummary = comments.length > 0
        ? `评审反馈：${comments.join("；")}。建议改进后报名下一轮评价。`
        : "未达到通过标准，建议改进后报名下一轮评价。";
    }

    const result: CertificationResult = {
      skillId,
      roundId,
      passed,
      publicScore: Math.round(publicScore * 10) / 10,
      expertScore: Math.round(expertScore * 10) / 10,
      publicCount: publicReviews.length,
      summary: `大众评价均分${(Math.round(publicScore * 10) / 10).toFixed(1)}（${publicReviews.length}人），专家评价${(Math.round(expertScore * 10) / 10).toFixed(1)}分${passed ? "通过" : "未通过"}。`,
      ...(feedbackSummary ? { feedbackSummary } : {}),
    };
    results.push(result);
  }

  // 写入 localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem(SETTLED_KEY_PREFIX + roundId, JSON.stringify(results));
  }

  return results;
}

export function getSettledResults(roundId: string): CertificationResult[] | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SETTLED_KEY_PREFIX + roundId);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CertificationResult[];
  } catch {
    return null;
  }
}

export function isRoundSettled(roundId: string): boolean {
  return getSettledResults(roundId) !== null;
}
