// === Skill ===
export interface SkillMetrics {
  _source: "manual" | "mock_beacon" | "beacon_api";
  invokeCount: number;
  completionRate: number;
  activeUsers: number;
  lastSyncAt?: string;
}

export interface Skill {
  id: string;
  slug: string;
  name: string;
  description: string;
  owner: string;
  team: string;
  contributors: string[];
  category: string;
  businessType?: "分赛道建设" | "厂商流量" | "APP流量" | "通用";
  status: "developing" | "active" | "deprecated";
  createdAt: string;
  updatedAt: string;
  repoUrl?: string;
  demoUrl?: string;
  docUrl?: string;
  downloadUrl?: string;
  demoSessionId?: number;
  metrics: SkillMetrics;
  score?: number;
  certified?: boolean;
  certifiedAt?: string;
  certificationRoundId?: string;
  readme?: string;
  domains?: SkillDomain[];
  capabilityIds?: string[];
  official?: OfficialSkillMeta;
}

export type SkillDomain = "APP流量" | "平台" | "预算" | "厂商";

export interface OfficialSkillMeta {
  status: "official" | "candidate";
  reviewerGroup: string;
  certifiedBy: string;
  certifiedAt?: string;
  note?: string;
}

// === Contributor ===
export interface Contributor {
  id: string;
  name: string;
  team: string;
  role: string;
  skills: string[];
  totalInvokes: number;
  contributionScore: number;
  // 成长导向扩展
  stage: "starting" | "active" | "core" | "benchmark";
  impactUsers: number;
  weeklyStreak: number;
  dimensions: {
    create: number;
    maintain: number;
    promote: number;
    assist: number;
  };
  milestones: string[];
  contributionType: "creator" | "maintainer" | "assistant";
}

// === Milestone ===
export interface Milestone {
  id: string;
  title: string;
  condition: string;
  category: "create" | "impact" | "consistency" | "community";
}

// === Activity Feed ===
export interface ActivityEvent {
  id: string;
  description: string;
  time: string;
  skillId?: string;
  type: "invoke_milestone" | "new_skill" | "new_user" | "popularity";
}

// === Demo Session ===
export interface DemoSkillEntry {
  skillId: string;
  presenter: string;
  summary: string;
  materialUrl?: string;
  docUrl?: string;
  skillUrl?: string;
}

export interface DemoSession {
  id: number;
  date: string;
  title: string;
  status: "completed" | "upcoming" | "cancelled";
  skills: DemoSkillEntry[];
  replayUrl?: string;
  promotionText?: string;
}

// === Metrics (Dashboard) ===
export interface DailyMetric {
  date: string;
  invokes: number;
  activeSkills: number;
}

export interface GrowthDataPoint {
  week: string;
  totalSkills: number;
  certified: number;
}

export interface DashboardMetrics {
  _source: "manual" | "mock_beacon" | "beacon_api";
  totalInvokes: number;
  monthlyInvokes: number;
  activeSkillCount: number;
  growthTrend: GrowthDataPoint[];
  dailyTrend: DailyMetric[];
}

// === Rules ===
export interface RuleStep {
  step: number;
  title: string;
  description: string;
}

export interface ScoringDimension {
  dimension: string;
  weight: number;
  description: string;
}

export interface Rules {
  admission: {
    description: string;
    steps: RuleStep[];
  };
  scoring: {
    description: string;
    dimensions: ScoringDimension[];
  };
  elimination: {
    description: string;
    conditions: string[];
  };
  incentive: {
    description: string;
    rules: string[];
  };
}

// === Certification ===
export interface CertificationRound {
  id: string;
  month: string;
  status: "collecting" | "reviewing" | "completed";
  skills: string[];
  publicReviewers: string[];
  expertReviewers: string[];
}

export interface Review {
  id: string;
  roundId: string;
  skillId: string;
  reviewerName: string;
  reviewerType: "public" | "expert";
  score: number;
  comment: string;
  dimensions?: {
    normative: number;
    applicability: number;
    unionFeature: number;
    sustainability: number;
    effectiveness: number;
  };
  submittedAt: string;
}

export interface CertificationResult {
  skillId: string;
  roundId: string;
  passed: boolean;
  publicScore: number;
  expertScore: number;
  publicCount: number;
  summary: string;
}

// === Skill Assessment (Upload Analysis) ===
export interface SkillAssessment {
  scores: {
    normative: number;
    usability: number;
    applicability: number;
    unionFeature: number;
    dataSafety: number;
  };
  grade: "excellent" | "good" | "needsWork";
  suggestions: string[];
  analyzedFiles: string[];
}

export interface CapabilityItem {
  id: string;
  title: string;
  description: string;
  domains: SkillDomain[];
  status: "covered" | "building" | "gap";
  skillIds: string[];
  examples?: string[];
}

export interface CapabilityModule {
  name: string;
  capabilities: CapabilityItem[];
}

export interface CapabilityStage {
  serviceStage: string;
  description: string;
  modules: CapabilityModule[];
}

export interface OfficialSkillRecord {
  skillId: string;
  reviewerGroup: string;
  certifiedBy: string;
  certifiedAt: string;
  note: string;
}
