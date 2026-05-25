import type { SkillAssessment } from "./types";

const UNION_KEYWORDS = [
  "联盟",
  "广告",
  "投放",
  "厂商",
  "预算",
  "流量",
  "变现",
  "小游戏",
];

interface FileInfo {
  name: string;
  content: string;
}

function scoreNormative(files: FileInfo[]): number {
  let score = 0;
  const names = files.map((f) => f.name.toLowerCase());
  const allContent = files.map((f) => f.content).join("\n");

  // 有 README 或 SKILL.md
  if (names.some((n) => n.includes("readme") || n.includes("skill.md"))) {
    score += 30;
  }

  // 有 YAML 配置
  if (names.some((n) => n.endsWith(".yaml") || n.endsWith(".yml"))) {
    score += 25;
  }

  // 文件命名无中文无空格
  const hasCleanNames = names.every(
    (n) => !/[\u4e00-\u9fff]/.test(n) && !n.includes(" ")
  );
  if (hasCleanNames) {
    score += 20;
  }

  // 有使用说明段落
  if (
    allContent.includes("## 使用") ||
    allContent.includes("## Usage") ||
    allContent.includes("## 说明") ||
    allContent.includes("# How to")
  ) {
    score += 25;
  }

  return Math.min(score, 100);
}

function scoreApplicability(files: FileInfo[]): number {
  let score = 0;
  const allContent = files.map((f) => f.content).join("\n");
  const names = files.map((f) => f.name.toLowerCase());

  // 描述中场景关键词
  const sceneKeywords = [
    "场景",
    "适用",
    "用于",
    "解决",
    "应用",
    "scenario",
    "use case",
    "适合",
  ];
  const matchCount = sceneKeywords.filter((kw) =>
    allContent.includes(kw)
  ).length;
  score += Math.min(matchCount * 20, 60);

  // 有示例文件
  if (
    names.some(
      (n) =>
        n.includes("example") || n.includes("demo") || n.includes("sample")
    )
  ) {
    score += 20;
  }

  // 有参数/输入说明
  if (
    allContent.includes("参数") ||
    allContent.includes("输入") ||
    allContent.includes("input") ||
    allContent.includes("params") ||
    allContent.includes("Args")
  ) {
    score += 20;
  }

  return Math.min(score, 100);
}

function scoreUnionFeature(files: FileInfo[]): number {
  let score = 0;
  const allContent = files.map((f) => f.content).join("\n");

  // 命中联盟关键词
  const hitCount = UNION_KEYWORDS.filter((kw) =>
    allContent.includes(kw)
  ).length;
  score += Math.min(hitCount * 12, 60);

  // 有联盟赛道分类标记
  if (
    allContent.includes("category") ||
    allContent.includes("赛道") ||
    allContent.includes("分类") ||
    allContent.includes("联盟")
  ) {
    score += 40;
  }

  return Math.min(score, 100);
}

function scoreSustainability(files: FileInfo[]): number {
  let score = 0;
  const names = files.map((f) => f.name.toLowerCase());
  const allContent = files.map((f) => f.content).join("\n");

  // 文件数 >= 3
  if (files.length >= 3) {
    score += 30;
  }

  // 有 changelog/version
  if (
    names.some(
      (n) => n.includes("changelog") || n.includes("version")
    ) ||
    allContent.includes("version") ||
    allContent.includes("## 更新日志")
  ) {
    score += 30;
  }

  // 多贡献者 @ 提及
  const atMentions = allContent.match(/@\w+/g);
  if (atMentions && atMentions.length >= 2) {
    score += 20;
  }

  // 代码有注释
  if (
    allContent.includes("//") ||
    allContent.includes("#") ||
    allContent.includes("/*")
  ) {
    score += 20;
  }

  return Math.min(score, 100);
}

function scoreEffectiveness(files: FileInfo[]): number {
  let score = 0;
  const names = files.map((f) => f.name.toLowerCase());
  const allContent = files.map((f) => f.content).join("\n");

  // 有 test/example 文件
  if (
    names.some(
      (n) =>
        n.includes("test") || n.includes("example") || n.includes("spec")
    )
  ) {
    score += 35;
  }

  // 有输入输出说明
  if (
    (allContent.includes("输入") || allContent.includes("input")) &&
    (allContent.includes("输出") || allContent.includes("output"))
  ) {
    score += 35;
  }

  // 有错误处理/edge case
  if (
    allContent.includes("error") ||
    allContent.includes("错误") ||
    allContent.includes("异常") ||
    allContent.includes("edge") ||
    allContent.includes("try") ||
    allContent.includes("catch")
  ) {
    score += 30;
  }

  return Math.min(score, 100);
}

function generateSuggestions(scores: SkillAssessment["scores"]): string[] {
  const suggestions: string[] = [];

  if (scores.normative < 60) {
    suggestions.push("建议添加 README.md 或 SKILL.md 说明文档，补充使用说明段落");
  }
  if (scores.usability < 60) {
    suggestions.push("建议补充使用场景描述、参数说明和示例文件，让使用者能快速上手");
  }
  if (scores.applicability < 60) {
    suggestions.push("建议明确适用人群和赛道范围，标注是全员通用还是特定场景");
  }
  if (scores.unionFeature < 60) {
    suggestions.push(
      "建议在描述中体现联盟业务特色（投放/流量/变现等场景），添加赛道分类标记"
    );
  }
  if (scores.dataSafety < 60) {
    suggestions.push("建议说明数据来源和输出准确性保障，确认无数据泄露风险");
  }

  if (suggestions.length === 0) {
    suggestions.push("各维度表现良好，继续保持迭代节奏");
  }

  return suggestions;
}

function getGrade(avgScore: number): SkillAssessment["grade"] {
  if (avgScore >= 80) return "excellent";
  if (avgScore >= 60) return "good";
  return "needsWork";
}

const ACCEPTED_EXTENSIONS = [
  ".skill",
  ".zip",
];

export function isAcceptedFile(filename: string): boolean {
  return ACCEPTED_EXTENSIONS.some((ext) =>
    filename.toLowerCase().endsWith(ext)
  );
}

export async function analyzeSkillFiles(
  files: File[]
): Promise<SkillAssessment> {
  const fileInfos: FileInfo[] = await Promise.all(
    files.map(async (f) => ({
      name: f.name,
      content: await f.text(),
    }))
  );

  const scores = {
    normative: scoreNormative(fileInfos),
    usability: scoreApplicability(fileInfos),
    applicability: scoreSustainability(fileInfos),
    unionFeature: scoreUnionFeature(fileInfos),
    dataSafety: scoreEffectiveness(fileInfos),
  };

  const avgScore =
    Object.values(scores).reduce((a, b) => a + b, 0) /
    Object.values(scores).length;

  return {
    scores,
    grade: getGrade(avgScore),
    suggestions: generateSuggestions(scores),
    analyzedFiles: fileInfos.map((f) => f.name),
  };
}
