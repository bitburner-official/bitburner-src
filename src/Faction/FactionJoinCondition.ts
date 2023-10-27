import { CompanyName, JobName, CityName } from "@enums";
import { Server } from "../Server/Server";
import { GetServer } from "../Server/AllServers";
import { HacknetServer } from "../Hacknet/HacknetServer";
import { serverMetadata } from "../Server/data/servers";
import { Companies } from "../Company/Companies";
import { CONSTANTS } from "../Constants";
import { formatReputation, formatMoney, formatRam } from "../ui/formatNumber";
import type { PlayerObject } from "../PersonObjects/Player/PlayerObject";
import type { Skills } from "../PersonObjects/Skills";

export interface JoinCondition {
  toString(): string;
  isSatisfied(p: PlayerObject): boolean;
}

export const haveBackdooredServer = (hostname: string): JoinCondition => ({
  toString(): string {
    return `Backdoor access to ${hostname} server`;
  },
  isSatisfied(): boolean {
    const server = GetServer(hostname);
    if (!(server instanceof Server)) {
      throw new Error(`${hostname} should be a normal server`);
    }
    return server.backdoorInstalled;
  },
});

export const highRankingEmployee = (companyName: CompanyName): JoinCondition => ({
  toString(): string {
    return `Employed at ${companyName} with ${formatReputation(CONSTANTS.CorpFactionRepRequirement)} reputation`;
  },
  isSatisfied(p: PlayerObject): boolean {
    const company = Companies[companyName];
    if (!company) return false;
    const serverMeta = serverMetadata.find((s) => s.specialName === companyName);
    const server = GetServer(serverMeta ? serverMeta.hostname : "");
    const bonus = (server as Server).backdoorInstalled ? -100e3 : 0;
    return Object.hasOwn(p.jobs, companyName) && company.playerReputation > CONSTANTS.CorpFactionRepRequirement + bonus;
  },
});

export const executiveEmployee = (): JoinCondition => ({
  toString(): string {
    return `CTO, CFO, or CEO of a company`;
  },
  isSatisfied(p: PlayerObject): boolean {
    const allPositions = Object.values(p.jobs);
    return (
      allPositions.includes(JobName.software7) || // CTO
      allPositions.includes(JobName.business4) || // CFO
      allPositions.includes(JobName.business5) // CEO
    );
  },
});

export const notEmployee = (...companyNames: CompanyName[]): JoinCondition => ({
  toString(): string {
    return `Not a member of ${joinList(companyNames)}`;
  },
  isSatisfied(p: PlayerObject): boolean {
    for (const companyName of companyNames) {
      if (Object.hasOwn(p.jobs, companyName)) return false;
    }
    return true;
  },
});

export const haveAugmentations = (n: number): JoinCondition => ({
  toString(): string {
    return `${n} augmentations installed`;
  },
  isSatisfied(p: PlayerObject): boolean {
    return p.augmentations.length >= n;
  },
});

export const haveMoney = (n: number): JoinCondition => ({
  toString(): string {
    return `Have ${formatMoney(n)}`;
  },
  isSatisfied(p: PlayerObject): boolean {
    return p.money >= n;
  },
});

export const haveSkill = (skill: keyof Skills, n: number): JoinCondition => ({
  toString(): string {
    return `${capitalize(skill)} level ${n}`;
  },
  isSatisfied(p: PlayerObject): boolean {
    return p.skills[skill] >= n;
  },
});

export const haveCombatSkills = (n: number): JoinCondition => ({
  toString(): string {
    return `All combat skills level ${n}`;
  },
  isSatisfied(p: PlayerObject): boolean {
    return p.skills.strength >= n && p.skills.defense >= n && p.skills.dexterity >= n && p.skills.agility >= n;
  },
});

export const haveKarma = (n: number): JoinCondition => ({
  toString(): string {
    return `${n} karma`;
  },
  isSatisfied(p: PlayerObject): boolean {
    return p.karma <= n;
  },
});

export const haveKilledPeople = (n: number): JoinCondition => ({
  toString(): string {
    return `${n} people killed`;
  },
  isSatisfied(p: PlayerObject): boolean {
    return p.numPeopleKilled >= n;
  },
});

export const locatedInCity = (...cities: CityName[]): JoinCondition => ({
  toString(): string {
    return `Located in ${joinList(cities)}`;
  },
  isSatisfied(p: PlayerObject): boolean {
    for (const city of cities) {
      if (p.city == city) return true;
    }
    return false;
  },
});

export const totalHacknetRam = (n: number): JoinCondition => ({
  toString(): string {
    return `Total Hacknet RAM of ${formatRam(n)}`;
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
  isSatisfied(p: PlayerObject): boolean {
    let total = 0;
    for (const node of iterateHacknet(p)) {
      total += node.level;
      if (total >= n) return true;
    }
    return false;
  },
});

export const anyOf = (...conditions: JoinCondition[]): JoinCondition => ({
  toString(): string {
    return joinList(conditions.map((c) => c.toString()));
  },
  isSatisfied(p: PlayerObject): boolean {
    for (const condition of conditions) {
      if (condition.isSatisfied(p)) return true;
    }
    return false;
  },
});

/* helpers */

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function joinList(list: string[], conjunction = "or", separator = ", ") {
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
