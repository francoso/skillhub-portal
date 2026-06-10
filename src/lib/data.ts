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
  CapabilityCard,
  OfficialSkillRecord,
  SkillDomain,
  Workstream,
  WorkflowTag,
  PlatformWorkflowTag,
} from "./types";

// Demo mock 当前用户
export const CURRENT_USER = "员工A";
export const CURRENT_SKILL_OWNER = "vicyanzhang";

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

export const TRAFFIC_WORKFLOW_TAGS: WorkflowTag[] = [
  "市场分析",
  "流量接入",
  "形态样式",
  "变现调优",
  "体验管理",
  "客户服务",
];

export const BUDGET_WORKFLOW_TAGS: WorkflowTag[] = [
  "日常服务沉淀",
  "基本面分析",
  "可投可播分析",
  "模版双率优化",
  "优质流量提渗",
  "扶持策略设计",
  "case诊断优化",
];

export const PLATFORM_WORKFLOW_TAGS: PlatformWorkflowTag[] = [
  "准入准出管理",
  "规则治理",
  "开发者服务",
  "运营支持",
  "合同&结算管理",
  "流量违规治理",
];

export const BUSINESS_DOMAINS: SkillDomain[] = ["APP流量", "平台", "预算", "厂商"];

export function getSkills(): Skill[] {
  const skills = skillsData as Skill[];
  const capabilityCards = getCapabilityCards();
  const officialLookup = new Map(
    getOfficialSkillRecords().map((item) => [item.skillId, item])
  );
  const skillMeta = new Map<
    string,
    {
      domains: Set<SkillDomain>;
      capabilityIds: string[];
      workstreams: Set<Workstream>;
      workflowTags: Set<WorkflowTag>;
      category?: string;
    }
  >();

  for (const card of capabilityCards) {
    const domains = [card.ownerDomain, ...card.relatedDomains];
    const skillIds = new Set([...card.skillIds, ...card.officialSkillIds]);

    for (const skillId of skillIds) {
      const current = skillMeta.get(skillId) ?? {
        domains: new Set<SkillDomain>(),
        capabilityIds: [],
        workstreams: new Set<Workstream>(),
        workflowTags: new Set<WorkflowTag>(),
        category: card.workflowTag,
      };
      domains.forEach((domain) => current.domains.add(domain));
      if (!current.capabilityIds.includes(card.id)) current.capabilityIds.push(card.id);
      current.workstreams.add(card.workstream);
      current.workflowTags.add(card.workflowTag);
      current.category = current.category ?? card.workflowTag;
      skillMeta.set(skillId, current);
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
      workstreams: meta ? Array.from(meta.workstreams) : [],
      workflowTags: meta ? Array.from(meta.workflowTags) : [],
      certified: official ? true : skill.certified,
      certifiedAt: official?.certifiedAt ?? skill.certifiedAt,
      official: official
        ? {
            status: "official",
            reviewerGroup: official.reviewerGroup,
            certifiedBy: official.certifiedBy,
            certifiedAt: official.certifiedAt,
            note: official.note,
            ownerDomain: official.ownerDomain,
            workstream: official.workstream,
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

export function getCapabilityCards(): CapabilityCard[] {
  const officialIds = new Set(getOfficialSkillRecords().map((item) => item.skillId));

  return (capabilityMapData as CapabilityCard[]).map((card) => {
    const officialSkillIds = Array.from(
      new Set([
        ...card.officialSkillIds,
        ...card.skillIds.filter((skillId) => officialIds.has(skillId)),
      ])
    );

    return {
      ...card,
      officialSkillIds,
      stage: officialSkillIds.length > 0 ? "官方认证" : card.stage,
    };
  });
}

export function getCapabilityMap(): CapabilityCard[] {
  return getCapabilityCards();
}

export function getCapabilityItems(): CapabilityCard[] {
  return getCapabilityCards();
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
  const capabilityCards = getCapabilityCards();

  // Count unique owners from skills as real contributor count
  const uniqueOwners = new Set(skills.map((s) => s.owner)).size;

  return {
    totalSkills: skills.length,
    activeSkills: skills.filter((s) => s.status === "active").length,
    totalContributors: uniqueOwners,
    monthlyInvokes: metrics.monthlyInvokes,
    totalInvokes: metrics.totalInvokes,
    officialSkillCount: skills.filter((s) => s.official?.status === "official").length,
    coveredCapabilityCount: capabilityCards.filter((item) => item.stage === "官方认证").length,
    totalCapabilityCount: capabilityCards.length,
  };
}
