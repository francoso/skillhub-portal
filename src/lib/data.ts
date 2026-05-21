import type { Skill, Contributor, DemoSession, DashboardMetrics, Rules } from "./types";

import skillsData from "@/data/skills.json";
import contributorsData from "@/data/contributors.json";
import demosData from "@/data/demos.json";
import metricsData from "@/data/metrics.json";
import rulesData from "@/data/rules.json";

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
