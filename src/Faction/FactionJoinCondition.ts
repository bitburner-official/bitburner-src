import { CompanyName, JobName, CityName, AugmentationName, LiteratureName, MessageFilename } from "@enums";
import { ServerName } from "../Types/strings";
import { Server } from "../Server/Server";
import { GetServer } from "../Server/AllServers";
import { HacknetServer } from "../Hacknet/HacknetServer";
import { serverMetadata } from "../Server/data/servers";
import { Companies } from "../Company/Companies";
import { formatReputation, formatMoney, formatRam } from "../ui/formatNumber";
import type { PlayerObject } from "../PersonObjects/Player/PlayerObject";
import type { Skills } from "../PersonObjects/Skills";
import type { RequirementInfo } from "@nsdefs";

/**
 * Declarative requirements for joining a faction or company.
 */
export interface JoinCondition {
  toString(): string;
  toJSON(): RequirementInfo;
  isSatisfied(p: PlayerObject): boolean;
}

export const haveBackdooredServer = (hostname: ServerName): JoinCondition => ({
  toString(): string {
    return `Backdoor access to ${hostname} server`;
  },
  toJSON(): RequirementInfo {
    return { backdoorInstalled: hostname };
  },
  isSatisfied(): boolean {
    const server = GetServer(hostname);
    if (!(server instanceof Server)) {
      throw new Error(`${hostname} should be a normal server`);
    }
    return server.backdoorInstalled;
  },
});

export const employedBy = (companyName: CompanyName): JoinCondition => ({
  toString(): string {
    return `Employed at ${companyName}`;
  },
  toJSON(): RequirementInfo {
    return { employedBy: companyName };
  },
  isSatisfied(p: PlayerObject): boolean {
    return Object.hasOwn(p.jobs, companyName);
  },
});

export const haveCompanyRep = (companyName: CompanyName, rep: number): JoinCondition => ({
  toString(): string {
    return `${formatReputation(rep)} reputation with ${companyName}`;
  },
  toJSON(): RequirementInfo {
    return { companyReputation: [companyName, rep] };
  },
  isSatisfied(): boolean {
    const company = Companies[companyName];
    if (!company) return false;
    const serverMeta = serverMetadata.find((s) => s.specialName === companyName);
    const server = GetServer(serverMeta ? serverMeta.hostname : "");
    const bonus = server?.backdoorInstalled ? 100e3 : 0;
    return company.playerReputation + bonus >= rep;
  },
});

export const haveJobTitle = (jobTitle: JobName): JoinCondition => ({
  toString(): string {
    return `Employed as a ${jobTitle}`;
  },
  toJSON(): RequirementInfo {
    return { jobTitle: jobTitle };
  },
  isSatisfied(p: PlayerObject): boolean {
    const allPositions = Object.values(p.jobs);
    return allPositions.includes(jobTitle);
  },
});

export const executiveEmployee = (): JoinCondition => ({
  ...someCondition([JobName.software7, JobName.business4, JobName.business5].map((jobTitle) => haveJobTitle(jobTitle))),
  toString(): string {
    return `CTO, CFO, or CEO of a company`;
  },
});

export const notEmployedBy = (companyName: CompanyName): JoinCondition => ({
  ...notCondition(employedBy(companyName)),
  toString(): string {
    return `Not working for the ${companyName}`;
  },
});

export const haveAugmentations = (n: number): JoinCondition => ({
  toString(): string {
    return `${n || "No"} augmentations installed`;
  },
  toJSON(): RequirementInfo {
    return { numAugmentations: n };
  },
  isSatisfied(p: PlayerObject): boolean {
    if (n == 0) {
      const augs = [...p.augmentations, ...p.queuedAugmentations].filter(
        (a) => a.name !== AugmentationName.NeuroFluxGovernor,
      );
      return augs.length == 0;
    }
    return p.augmentations.length >= n;
  },
});

export const haveMoney = (n: number): JoinCondition => ({
  toString(): string {
    return `Have ${formatMoney(n)}`;
  },
  toJSON(): RequirementInfo {
    return { money: n };
  },
  isSatisfied(p: PlayerObject): boolean {
    return p.money >= n;
  },
});

export const haveSkill = (skill: keyof Skills, n: number): JoinCondition => ({
  toString(): string {
    return `${capitalize(skill)} level ${n}`;
  },
  toJSON(): RequirementInfo {
    return { skills: { [skill]: n } };
  },
  isSatisfied(p: PlayerObject): boolean {
    return p.skills[skill] >= n;
  },
});

export const haveCombatSkills = (n: number): JoinCondition => ({
  toString(): string {
    return `All combat skills level ${n}`;
  },
  toJSON(): RequirementInfo {
    return { skills: { strength: n, defense: n, dexterity: n, agility: n } };
  },
  isSatisfied(p: PlayerObject): boolean {
    return p.skills.strength >= n && p.skills.defense >= n && p.skills.dexterity >= n && p.skills.agility >= n;
  },
});

export const haveKarma = (n: number): JoinCondition => ({
  toString(): string {
    return `${n} karma`;
  },
  toJSON(): RequirementInfo {
    return { karma: n };
  },
  isSatisfied(p: PlayerObject): boolean {
    return p.karma <= n;
  },
});

export const haveKilledPeople = (n: number): JoinCondition => ({
  toString(): string {
    return `${n} people killed`;
  },
  toJSON(): RequirementInfo {
    return { numPeopleKilled: n };
  },
  isSatisfied(p: PlayerObject): boolean {
    return p.numPeopleKilled >= n;
  },
});

export const locatedInCity = (city: CityName): JoinCondition => ({
  toString(): string {
    return `Located in ${city}`;
  },
  toJSON(): RequirementInfo {
    return { city: city };
  },
  isSatisfied(p: PlayerObject): boolean {
    return p.city == city;
  },
});

export const locatedInSomeCity = (...cities: CityName[]): JoinCondition => ({
  ...someCondition(cities.map((city) => locatedInCity(city))),
  toString(): string {
    return `Located in ${joinList(cities)}`;
  },
});

export const totalHacknetRam = (n: number): JoinCondition => ({
  toString(): string {
    return `Total Hacknet RAM of ${formatRam(n)}`;
  },
  toJSON(): RequirementInfo {
    return { hacknetRAM: n };
  },
  isSatisfied(p: PlayerObject): boolean {
    let total = 0;
    for (const node of iterateHacknet(p)) {
      total += node.ram;
      if (total >= n) return true;
    }
    return false;
  },
});

export const totalHacknetCores = (n: number): JoinCondition => ({
  toString(): string {
    return `Total Hacknet cores of ${n}`;
  },
  toJSON(): RequirementInfo {
    return { hacknetCores: n };
  },
  isSatisfied(p: PlayerObject): boolean {
    let total = 0;
    for (const node of iterateHacknet(p)) {
      total += node.cores;
      if (total >= n) return true;
    }
    return false;
  },
});

export const totalHacknetLevels = (n: number): JoinCondition => ({
  toString(): string {
    return `Total Hacknet levels of ${n}`;
  },
  toJSON(): RequirementInfo {
    return { hacknetLevels: n };
  },
  isSatisfied(p: PlayerObject): boolean {
    let total = 0;
    for (const node of iterateHacknet(p)) {
      total += node.level;
      if (total >= n) return true;
    }
    return false;
  },
});

export const haveBladeburnerRank = (n: number): JoinCondition => ({
  toString(): string {
    return `Rank ${n} in the Bladeburner Division`;
  },
  toJSON(): RequirementInfo {
    return { bladeburnerRank: n };
  },
  isSatisfied(p: PlayerObject): boolean {
    const rank = p.bladeburner?.rank || 0;
    return rank >= n;
  },
});

export const haveSourceFile = (n: number): JoinCondition => ({
  toString(): string {
    return `In BitNode ${n} or have SourceFile ${n}`;
  },
  toJSON(): RequirementInfo {
    return { someCondition: [{ bitNodeN: n }, { sourceFile: n }] };
  },
  isSatisfied(p: PlayerObject): boolean {
    return p.bitNodeN == n || p.sourceFileLvl(n) > 0;
  },
});

export const haveSomeSourceFile = (...nodeNums: number[]): JoinCondition => ({
  ...someCondition(nodeNums.map((n) => haveSourceFile(n))),
  toString(): string {
    return `In BitNode ${joinList(nodeNums)} or have SourceFile ${joinList(nodeNums)}`;
  },
});

export const haveFile = (fileName: LiteratureName | MessageFilename): JoinCondition => ({
  toString(): string {
    return `Have the file '${fileName}'`;
  },
  toJSON(): RequirementInfo {
    return { file: fileName };
  },
  isSatisfied(p: PlayerObject): boolean {
    const homeComputer = p.getHomeComputer();
    return homeComputer.messages.includes(fileName);
  },
});

export const unsatisfiable: JoinCondition = {
  toString(): string {
    return "(unsatisfiable)";
  },
  toJSON(): RequirementInfo {
    return {};
  },
  isSatisfied(): boolean {
    return false;
  },
};

/* higher-order conditions */

export const notCondition = (condition: JoinCondition): JoinCondition => ({
  toString(): string {
    return `Not ${condition.toString()}`;
  },
  toJSON(): RequirementInfo {
    return { not: condition.toJSON() };
  },
  isSatisfied(p: PlayerObject): boolean {
    return !condition.isSatisfied(p);
  },
});

export const someCondition = (conditions: JoinCondition[]): JoinCondition => ({
  toString(): string {
    return joinList(conditions.map((c) => c.toString()));
  },
  toJSON(): RequirementInfo {
    return { someCondition: conditions.map((c) => c.toJSON()) };
  },
  isSatisfied(p: PlayerObject): boolean {
    return conditions.some((c) => c.isSatisfied(p));
  },
});

export const delayedCondition = (arg: () => JoinCondition): JoinCondition => ({
  toString: () => arg().toString(),
  toJSON: () => arg().toJSON(),
  isSatisfied: (p: PlayerObject) => arg().isSatisfied(p),
});

/* helpers */

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function joinList(list: (string | number)[], conjunction = "or", separator = ", ") {
  if (list.length < 3) {
    return list.join(` ${conjunction} `);
  }
  list = [...list];
  list[list.length - 1] = `${conjunction} ${list[list.length - 1]}`;
  return list.join(`${separator}`);
}

function* iterateHacknet(p: PlayerObject) {
  for (let i = 0; i < p.hacknetNodes.length; ++i) {
    const v = p.hacknetNodes[i];
    if (typeof v === "string") {
      const hserver = GetServer(v);
      if (hserver === null || !(hserver instanceof HacknetServer))
        throw new Error("player hacknet server was not HacknetServer");
      yield {
        ram: hserver.maxRam,
        cores: hserver.cores,
        level: hserver.level,
      };
    } else {
      yield {
        ram: v.ram,
        cores: v.cores,
        level: v.level,
      };
    }
  }
}
