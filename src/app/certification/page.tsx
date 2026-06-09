import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getCertificationRounds,
  getCapabilityCards,
  getOfficialSkills,
  getOfficialSkillRecords,
  getSkillById,
} from "@/lib/data";
import type { OfficialSkillRecord, Skill, SkillDomain } from "@/lib/types";
import { ArrowRight, CheckCircle2, Shield, Users } from "lucide-react";

const domainOrder: SkillDomain[] = ["APP流量", "平台", "预算", "厂商"];

const domainStyles: Record<SkillDomain, string> = {
  "APP流量": "bg-cyan-100 text-cyan-700 border-cyan-200",
  "平台": "bg-violet-100 text-violet-700 border-violet-200",
  "预算": "bg-amber-100 text-amber-700 border-amber-200",
  "厂商": "bg-emerald-100 text-emerald-700 border-emerald-200",
};

function groupSkillsByDomain(
  skills: Skill[],
  records: Map<string, OfficialSkillRecord>
) {
  const result = new Map<SkillDomain, Skill[]>();
  for (const domain of domainOrder) result.set(domain, []);

  for (const skill of skills) {
    const domain = records.get(skill.id)?.ownerDomain ?? skill.official?.ownerDomain ?? "平台";
    result.get(domain)?.push(skill);
  }

  return result;
}

export default function CertificationPage() {
  const officialSkills = getOfficialSkills();
  const officialRecords = new Map(
    getOfficialSkillRecords().map((item) => [item.skillId, item])
  );
  const grouped = groupSkillsByDomain(officialSkills, officialRecords);
  const officialCapabilityCount = getCapabilityCards().filter(
    (card) => card.stage === "官方认证"
  ).length;
  const currentRound = getCertificationRounds().find((round) => round.status === "reviewing");
  const candidateSkills =
    currentRound?.skills
      .map((skillId) => getSkillById(skillId))
      .filter((skill): skill is Skill => Boolean(skill))
      .filter((skill) => !skill.official) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
          OFFICIAL SKILLS
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">联盟认证馆</h1>
        <p className="text-sm text-gray-500 mt-1">
          这里展示已经由各组 PM 评审通过、明确作为联盟官方推荐的 Skill。
        </p>
      </div>

      <Card className="border-blue-100 bg-blue-50/40">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-800">认证口径</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="space-y-1.5">
              <p>认证本质不是系统自动打分，而是各组 PM 内部评审通过后的业务认定。</p>
              <p>平台不管理具体评审过程，只承接结果展示和官方标识透出。</p>
            </div>
            <div className="space-y-1.5">
              <p>官方 Skill 会在 Skill 市场、能力地图、详情页里同步展示。</p>
              <p>认证记录会反向驱动能力卡阶段，目前已带动 {officialCapabilityCount} 张能力卡进入官方认证。</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {domainOrder.map((domain) => (
          <Card key={domain}>
            <CardContent className="p-5">
              <Badge variant="outline" className={domainStyles[domain]}>
                {domain}
              </Badge>
              <p className="mt-3 text-2xl font-bold text-gray-900">
                {grouped.get(domain)?.length ?? 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">已认证官方 Skill</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">官方认证 Skill</h2>
          <span className="text-sm text-gray-400">{officialSkills.length} 个 Skill</span>
        </div>

        {domainOrder.map((domain) => {
          const skills = grouped.get(domain) ?? [];
          if (skills.length === 0) return null;

          return (
            <div key={domain} className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={domainStyles[domain]}>
                  {domain}
                </Badge>
                <span className="text-sm text-gray-400">{skills.length} 个</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {skills.map((skill) => {
                  const record = officialRecords.get(skill.id);
                  return (
                    <Link key={`${domain}-${skill.id}`} href={`/skills/${skill.id}`}>
                      <Card className="h-full hover:shadow-md transition-shadow border-gray-100">
                        <CardContent className="p-5 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                              <p className="text-xs text-gray-400 mt-1">{skill.category}</p>
                            </div>
                            <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full shrink-0">
                              <CheckCircle2 className="w-3 h-3" />
                              官方认证
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">{skill.description}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {record?.workstream && (
                              <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                                {record.workstream}
                              </Badge>
                            )}
                            {(skill.domains ?? []).map((item) => (
                              <Badge key={item} variant="outline" className={domainStyles[item]}>
                                {item}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-xs text-gray-500 space-y-1">
                            <p>评审归属：{record?.reviewerGroup}</p>
                            <p>确认方式：{record?.certifiedBy}</p>
                            <p>确认时间：{record?.certifiedAt}</p>
                          </div>
                          {record?.note && (
                            <div className="pt-3 border-t border-gray-100 text-sm text-gray-600">
                              {record.note}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-800">待各组确认</h2>
        </div>
        <Card>
          <CardContent className="p-5">
            {candidateSkills.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  这部分 Skill 已进入组内评审视野，但还没有形成最终的官方认证结果。
                </p>
                <div className="flex flex-wrap gap-2">
                  {candidateSkills.map((skill) => (
                    <Link key={skill.id} href={`/skills/${skill.id}`}>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 text-sm border border-orange-100 hover:shadow-sm transition-shadow">
                        {skill.name}
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">当前没有待确认的官方 Skill。</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
