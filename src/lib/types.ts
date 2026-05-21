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
  name: string;
  description: string;
  owner: string;
  contributors: string[];
  category: string;
  status: "developing" | "active" | "deprecated";
  createdAt: string;
  updatedAt: string;
  repoUrl?: string;
  demoSessionId?: number;
  metrics: SkillMetrics;
  score?: number;
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
}

// === Demo Session ===
export interface DemoSkillEntry {
  skillId: string;
  presenter: string;
  summary: string;
  materialUrl?: string;
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

export interface DashboardMetrics {
  _source: "manual" | "mock_beacon" | "beacon_api";
  totalInvokes: number;
  monthlyInvokes: number;
  activeSkillCount: number;
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
