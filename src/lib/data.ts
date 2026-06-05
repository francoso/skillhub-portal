import type {
  Skill,
  Contributor,
  DemoSession,
  DashboardMetrics,
  Rules,
  Milestone,
  ActivityEvent,
  CertificationRound,
  Review,
  CertificationResult,
  CapabilityStage,
  CapabilityItem,
  OfficialSkillRecord,
  SkillDomain,
} from "./types";

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
import capabilityMapData from "@/data/capability-map.json";
import officialSkillsData from "@/data/official-skills.json";

// 数据加载层 — MVP阶段从JSON读取，后续切API只改这里

export function getSkills(): Skill[] {
  const skills = skillsData as Skill[];
  const capabilityMap = getCapabilityMap();
  const officialLookup = new Map(
    getOfficialSkillRecords().map((item) => [item.skillId, item])
  );
  const skillMeta = new Map<
    string,
    { domains: Set<SkillDomain>; capabilityIds: string[]; category?: string }
  >();

  for (const stage of capabilityMap) {
    for (const section of stage.modules) {
      for (const capability of section.capabilities) {
        for (const skillId of capability.skillIds) {
          const current = skillMeta.get(skillId) ?? {
            domains: new Set<SkillDomain>(),
            capabilityIds: [],
            category: stage.serviceStage,
          };
          capability.domains.forEach((domain) => current.domains.add(domain));
          current.capabilityIds.push(capability.id);
          current.category = current.category ?? stage.serviceStage;
          skillMeta.set(skillId, current);
        }
      }
    }
  }

  return skills.map((skill) => {
    const meta = skillMeta.get(skill.id);
    const official = officialLookup.get(skill.id);
    return {
      ...skill,
      category: meta?.category ?? skill.category,
      domains: meta ? Array.from(meta.domains) : [],
      capabilityIds: meta?.capabilityIds ?? [],
      certified: official ? true : skill.certified,
      certifiedAt: official?.certifiedAt ?? skill.certifiedAt,
      official: official
        ? {
            status: "official",
            reviewerGroup: official.reviewerGroup,
            certifiedBy: official.certifiedBy,
            certifiedAt: official.certifiedAt,
            note: official.note,
          }
        : undefined,
    };
  });
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

export function getCapabilityMap(): CapabilityStage[] {
  return capabilityMapData as CapabilityStage[];
}

export function getCapabilityItems(): CapabilityItem[] {
  return getCapabilityMap().flatMap((stage) =>
    stage.modules.flatMap((module) => module.capabilities)
  );
}

export function getOfficialSkillRecords(): OfficialSkillRecord[] {
  return officialSkillsData as OfficialSkillRecord[];
}

export function getOfficialSkills(): Skill[] {
  const officialIds = new Set(getOfficialSkillRecords().map((item) => item.skillId));
  return getSkills().filter((skill) => officialIds.has(skill.id));
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
  if (skill?.official?.status === "official" || skill?.certified) return "certified";
  const reviewingRound = getCurrentReviewRound();
  if (reviewingRound && reviewingRound.skills.includes(skillId)) return "reviewing";
  return "personal";
}

// 聚合统计
export function getStats() {
  const skills = getSkills();
  const metrics = getMetrics();
  const capabilityItems = getCapabilityItems();

  // Count unique owners from skills as real contributor count
  const uniqueOwners = new Set(skills.map((s) => s.owner)).size;

  return {
    totalSkills: skills.length,
    activeSkills: skills.filter((s) => s.status === "active").length,
    totalContributors: uniqueOwners,
    monthlyInvokes: metrics.monthlyInvokes,
    totalInvokes: metrics.totalInvokes,
    officialSkillCount: skills.filter((s) => s.official?.status === "official").length,
    coveredCapabilityCount: capabilityItems.filter((item) => item.status === "covered").length,
    totalCapabilityCount: capabilityItems.length,
  };
}
