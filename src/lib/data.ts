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
  return certificationsData.results as CertificationResult[];
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
export type SkillStage = "personal" | "reviewing" | "certified";

export function getSkillStage(skillId: string): SkillStage {
  const skill = getSkillById(skillId);
  if (skill?.certified) return "certified";
  const reviewingRound = getCurrentReviewRound();
  if (reviewingRound && reviewingRound.skills.includes(skillId)) return "reviewing";
  return "personal";
}

// 聚合统计
export function getStats() {
  const skills = getSkills();
  const contributors = getContributors();
  const metrics = getMetrics();

  return {
    totalSkills: skills.length,
    activeSkills: skills.filter((s) => s.status === "active").length,
    totalContributors: contributors.length,
    monthlyInvokes: metrics.monthlyInvokes,
    totalInvokes: metrics.totalInvokes,
  };
}
