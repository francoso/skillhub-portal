import type { Skill, Contributor, DemoSession, DashboardMetrics, Rules, Milestone, ActivityEvent, CertificationRound, Review, CertificationResult } from "./types";

// Demo mock 当前用户
export const CURRENT_USER = "员工A";

import skillsData from "@/data/skills.json";
import contributorsData from "@/data/contributors.json";
import demosData from "@/data/demos.json";
import metricsData from "@/data/metrics.json";
import rulesData from "@/data/rules.json";
import milestonesData from "@/data/milestones.json";
import activitiesData from "@/data/activities.json";
import certificationsData from "@/data/certifications.json";
import coverageData from "@/data/coverage.json";

// 数据加载层 — MVP阶段从JSON读取，后续切API只改这里

export function getSkills(): Skill[] {
  return skillsData as Skill[];
}

export function getSkillById(id: string): Skill | undefined {
  return getSkills().find((s) => s.id === id);
}

export function getContributors(): Contributor[] {
  return contributorsData as Contributor[];
}

export function getDemos(): DemoSession[] {
  return demosData as DemoSession[];
}

export function getMetrics(): DashboardMetrics {
  return metricsData as DashboardMetrics;
}

export function getRules(): Rules {
  return rulesData as unknown as Rules;
}

export function getMilestones(): Milestone[] {
  return milestonesData as Milestone[];
}

export function getActivities(): ActivityEvent[] {
  return activitiesData as ActivityEvent[];
}

// === Certification ===
export function getCertificationRounds(): CertificationRound[] {
  return certificationsData.rounds as CertificationRound[];
}

export function getReviews(): Review[] {
  return certificationsData.reviews as Review[];
}

export function getCertificationResults(): CertificationResult[] {
  const staticResults = [...(certificationsData.results as CertificationResult[])];

  // 合并 localStorage 中的动态结算结果
  if (typeof window !== "undefined") {
    const { getSettledResults } = require("./review-store");
    const rounds = certificationsData.rounds as CertificationRound[];
    for (const round of rounds) {
      const settled = getSettledResults(round.id);
      if (settled) {
        // 动态结果覆盖同 roundId+skillId 的静态数据
        for (const result of settled) {
          const existIdx = staticResults.findIndex(
            (r) => r.roundId === result.roundId && r.skillId === result.skillId
          );
          if (existIdx >= 0) {
            staticResults[existIdx] = result;
          } else {
            staticResults.push(result);
          }
        }
      }
    }
  }

  return staticResults;
}

export function getReviewsByRound(roundId: string): Review[] {
  return getReviews().filter((r) => r.roundId === roundId);
}

export function getResultsByRound(roundId: string): CertificationResult[] {
  return getCertificationResults().filter((r) => r.roundId === roundId);
}

// === Review helpers ===
export function getCurrentReviewRound(): CertificationRound | undefined {
  return getCertificationRounds().find(r => r.status === "reviewing");
}

// === Skill Stage ===
export type SkillStage = "personal" | "reviewing" | "certified" | "needs-improvement";

export function getSkillStage(skillId: string): SkillStage {
  // 优先从认证结果判断（数据驱动）
  const results = getCertificationResults();
  const passed = results.find(r => r.skillId === skillId && r.passed);
  if (passed) return "certified";

  // 兼容 skill 字段标记
  const skill = getSkillById(skillId);
  if (skill?.certified) return "certified";

  // 是否在当前评价轮次中
  const reviewingRound = getCurrentReviewRound();
  if (reviewingRound && reviewingRound.skills.includes(skillId)) return "reviewing";

  // 是否曾经评价未通过（有 failed result 且不在当前轮次）
  const failed = results.find(r => r.skillId === skillId && !r.passed);
  if (failed) return "needs-improvement";

  return "personal";
}

/** Get the failed certification result with feedback for a skill */
export function getFailedResult(skillId: string): CertificationResult | undefined {
  return getCertificationResults().find(r => r.skillId === skillId && !r.passed);
}

// === Coverage Map ===
interface CoverageTask {
  content: string;
  businessType: string;
  status: string;
  skillId: string | null;
}
interface CoverageModule {
  name: string;
  tasks: CoverageTask[];
}
interface CoverageWorkflow {
  workflow: string;
  modules: CoverageModule[];
}

export function getCoverage(): CoverageWorkflow[] {
  return coverageData as CoverageWorkflow[];
}

/** Returns all skill IDs that appear in the coverage map (建设地图) */
export function getMapSkillIds(): Set<string> {
  const ids = new Set<string>();
  for (const wf of getCoverage()) {
    for (const mod of wf.modules) {
      for (const task of mod.tasks) {
        if (task.skillId) {
          ids.add(task.skillId);
        }
      }
    }
  }
  return ids;
}

/** Compute certified skill count for a contributor dynamically from certification results */
export function getCertifiedSkillCountForOwner(ownerSkillIds: string[]): number {
  const results = getCertificationResults();
  return ownerSkillIds.filter(id => results.some(r => r.skillId === id && r.passed)).length;
}

// 聚合统计
export function getStats() {
  const skills = getSkills();
  const contributors = getContributors();
  const metrics = getMetrics();

  // Count unique owners from skills as real contributor count
  const uniqueOwners = new Set(skills.map((s) => s.owner)).size;

  return {
    totalSkills: skills.length,
    activeSkills: skills.filter((s) => s.status === "active").length,
    totalContributors: uniqueOwners,
    monthlyInvokes: metrics.monthlyInvokes,
    totalInvokes: metrics.totalInvokes,
  };
}
