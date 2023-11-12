import { Company } from "./Company";
import { CompanyPosition } from "./CompanyPosition";

import { JoinCondition, haveSkill, employedBy } from "../Faction/FactionJoinCondition";
import type { Skills } from "../PersonObjects/Skills";

export function getJobRequirements(company: Company, pos: CompanyPosition): JoinCondition[] {
  const reqSkills = pos.requiredSkills(company.jobStatReqOffset);
  const reqs = [];
  for (const [skillName, value] of Object.entries(reqSkills)) {
    if (value > 0) reqs.push(haveSkill(skillName as keyof Skills, value));
  }
  if (pos.requiredReputation > 0) {
    reqs.push(employedBy(company.name, { withRep: pos.requiredReputation }));
  }
  return reqs;
}

/** Returns a string with the given CompanyPosition's stat requirements */
export function getJobRequirementText(company: Company, pos: CompanyPosition): string {
  const reqs = getJobRequirements(company, pos);
  return `(Requires: ${reqs.map((s) => s.toString()).join(", ")})`;
}
