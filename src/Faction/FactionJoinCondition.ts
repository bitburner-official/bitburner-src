import { CompanyName, JobName, CityName, AugmentationName, LiteratureName, MessageFilename } from "@enums";
import { ServerName } from "../Types/strings";
import { Server } from "../Server/Server";
import { GetServer } from "../Server/AllServers";
import { HacknetServer } from "../Hacknet/HacknetServer";
import { Companies } from "../Company/Companies";
import { formatReputation, formatMoney, formatRam } from "../ui/formatNumber";
import type { PlayerObject } from "../PersonObjects/Player/PlayerObject";
import type { Skills } from "../PersonObjects/Skills";
import type {
  PlayerRequirement,
  BackdoorRequirement,
  CityRequirement,
  CompanyReputationRequirement,
  EmployedByRequirement,
  JobTitleRequirement,
  KarmaRequiremennt,
  MoneyRequirement,
  NumAugmentationsRequirement,
  PeopleKilledRequirement,
  SkillRequirement,
  FileRequirement,
  BladeburnerRankRequirement,
  HacknetRAMRequirement,
  HacknetCoresRequirement,
  HacknetLevelsRequirement,
  NotRequirement,
  SomeRequirement,
  EveryRequirement,
} from "@nsdefs";
import { calculateEffectiveRequiredReputation } from "../Company/utils";

/**
 * Declarative format for checking that the player satisfies some condition, such as the requirements for being invited to a faction.
 */
export interface PlayerCondition {
  toString(): string;
  toJSON(): PlayerRequirement;
  isSatisfied(p: PlayerObject): boolean;
}

export const haveBackdooredServer = (hostname: ServerName): PlayerCondition => ({
  toString(): string {
    return `Backdoor access to ${hostname} server`;
  },
  toJSON(): BackdoorRequirement {
    return { type: "backdoorInstalled", server: hostname };
  },
  isSatisfied(): boolean {
    const server = GetServer(hostname);
    if (!(server instanceof Server)) {
      throw new Error(`${hostname} should be a normal server`);
    }
    return server.backdoorInstalled;
  },
});

export const employedBy = (companyName: CompanyName): PlayerCondition => ({
  toString(): string {
    return `Employed at ${companyName}`;
  },
  toJSON(): EmployedByRequirement {
    return { type: "employedBy", company: companyName };
  },
  isSatisfied(p: PlayerObject): boolean {
    return Object.hasOwn(p.jobs, companyName);
  },
});

export const haveCompanyRep = (companyName: CompanyName, rep: number): PlayerCondition => ({
  toString(): string {
    return `${formatReputation(calculateEffectiveRequiredReputation(companyName, rep))} reputation with ${companyName}`;
  },
  toJSON(): CompanyReputationRequirement {
    return {
      type: "companyReputation",
      company: companyName,
      reputation: calculateEffectiveRequiredReputation(companyName, rep),
    };
  },
  isSatisfied(): boolean {
    const company = Companies[companyName];
    if (!company) return false;
    return company.playerReputation >= calculateEffectiveRequiredReputation(companyName, rep);
  },
});

export const haveJobTitle = (jobTitle: JobName): PlayerCondition => ({
  toString(): string {
    return `Employed as a ${jobTitle}`;
  },
  toJSON(): JobTitleRequirement {
    return { type: "jobTitle", jobTitle: jobTitle };
  },
  isSatisfied(p: PlayerObject): boolean {
    const allPositions = Object.values(p.jobs);
    return allPositions.includes(jobTitle);
  },
});

export const executiveEmployee = (): PlayerCondition => ({
  ...someCondition([JobName.software7, JobName.business4, JobName.business5].map((jobTitle) => haveJobTitle(jobTitle))),
  toString(): string {
    return `CTO, CFO, or CEO of a company`;
  },
});

export const notEmployedBy = (companyName: CompanyName): PlayerCondition => ({
  ...notCondition(employedBy(companyName)),
  toString(): string {
    return `Not working for the ${companyName}`;
  },
});

export const haveAugmentations = (n: number): PlayerCondition => ({
  toString(): string {
    return `${n || "No"} augmentations installed`;
  },
  toJSON(): NumAugmentationsRequirement {
    return { type: "numAugmentations", numAugmentations: n };
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

export const haveMoney = (n: number): PlayerCondition => ({
  toString(): string {
    return `Have ${formatMoney(n)}`;
  },
  toJSON(): MoneyRequirement {
    return { type: "money", money: n };
  },
  isSatisfied(p: PlayerObject): boolean {
    return p.money >= n;
  },
});

export const haveSkill = (skill: keyof Skills, n: number): PlayerCondition => ({
  toString(): string {
    return `${capitalize(skill)} level ${n}`;
  },
  toJSON(): SkillRequirement {
    return { type: "skills", skills: { [skill]: n } };
  },
  isSatisfied(p: PlayerObject): boolean {
    return p.skills[skill] >= n;
  },
});

export const haveCombatSkills = (n: number): CompoundPlayerCondition => ({
  ...everyCondition(["strength", "defense", "dexterity", "agility"].map((s) => haveSkill(s as keyof Skills, n))),
  toString(): string {
    return `All combat skills level ${n}`;
  },
  toJSON(): SkillRequirement {
    return { type: "skills", skills: { strength: n, defense: n, dexterity: n, agility: n } };
  },
});

export const haveKarma = (n: number): PlayerCondition => ({
  toString(): string {
    if (n < -1000) return "An extensive criminal record";
    else if (n < -40) return "A criminal reputation";
    else if (n < -20) return "A disregard for the law";
    else if (n < -10) return "A history of violence";
    else return "Street cred";
  },
  toJSON(): KarmaRequiremennt {
    return { type: "karma", karma: n };
  },
  isSatisfied(p: PlayerObject): boolean {
    return p.karma <= n;
  },
});

export const haveKilledPeople = (n: number): PlayerCondition => ({
  toString(): string {
    return `${n} people killed`;
  },
  toJSON(): PeopleKilledRequirement {
    return { type: "numPeopleKilled", numPeopleKilled: n };
  },
  isSatisfied(p: PlayerObject): boolean {
    return p.numPeopleKilled >= n;
  },
});

export const locatedInCity = (city: CityName): PlayerCondition => ({
  toString(): string {
    return `Located in ${city}`;
  },
  toJSON(): CityRequirement {
    return { type: "city", city: city };
  },
  isSatisfied(p: PlayerObject): boolean {
    return p.city == city;
  },
});

export const locatedInSomeCity = (...cities: CityName[]): PlayerCondition => ({
  ...someCondition(cities.map((city) => locatedInCity(city))),
  toString(): string {
    return `Located in ${joinList(cities)}`;
  },
});

export const totalHacknetRam = (n: number): PlayerCondition => ({
  toString(): string {
    return `Total Hacknet RAM of ${formatRam(n)}`;
  },
  toJSON(): HacknetRAMRequirement {
    return { type: "hacknetRAM", hacknetRAM: n };
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

export const totalHacknetCores = (n: number): PlayerCondition => ({
  toString(): string {
    return `Total Hacknet cores of ${n}`;
  },
  toJSON(): HacknetCoresRequirement {
    return { type: "hacknetCores", hacknetCores: n };
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

export const totalHacknetLevels = (n: number): PlayerCondition => ({
  toString(): string {
    return `Total Hacknet levels of ${n}`;
  },
  toJSON(): HacknetLevelsRequirement {
    return { type: "hacknetLevels", hacknetLevels: n };
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

export const haveBladeburnerRank = (n: number): PlayerCondition => ({
  toString(): string {
    return `Rank ${n} in the Bladeburner Division`;
  },
  toJSON(): BladeburnerRankRequirement {
    return { type: "bladeburnerRank", bladeburnerRank: n };
  },
  isSatisfied(p: PlayerObject): boolean {
    const rank = p.bladeburner?.rank || 0;
    return rank >= n;
  },
});

export const haveSourceFile = (n: number): PlayerCondition => ({
  toString(): string {
    return `In BitNode ${n} or have SourceFile ${n}`;
  },
  toJSON(): SomeRequirement {
    return {
      type: "someCondition",
      conditions: [
        { type: "bitNodeN", bitNodeN: n },
        { type: "sourceFile", sourceFile: n },
      ],
    };
  },
  isSatisfied(p: PlayerObject): boolean {
    return p.bitNodeN == n || p.sourceFileLvl(n) > 0;
  },
});

export const haveSomeSourceFile = (...nodeNums: number[]): PlayerCondition => ({
  ...someCondition(nodeNums.map((n) => haveSourceFile(n))),
  toString(): string {
    return `In BitNode ${joinList(nodeNums)} or have SourceFile ${joinList(nodeNums)}`;
  },
});

export const haveFile = (fileName: LiteratureName | MessageFilename): PlayerCondition => ({
  toString(): string {
    return `Have the file '${fileName}'`;
  },
  toJSON(): FileRequirement {
    return { type: "file", file: fileName };
  },
  isSatisfied(p: PlayerObject): boolean {
    const homeComputer = p.getHomeComputer();
    return homeComputer.messages.includes(fileName);
  },
});

/* higher-order conditions */

export interface CompoundPlayerCondition extends PlayerCondition, Iterable<PlayerCondition> {
  type: "someCondition" | "everyCondition";
  [Symbol.iterator]: () => IterableIterator<PlayerCondition>;
}

export const unsatisfiable: PlayerCondition = {
  toString(): string {
    return "(unsatisfiable)";
  },
  toJSON(): SomeRequirement {
    return { type: "someCondition", conditions: [] };
  },
  isSatisfied(): boolean {
    return false;
  },
};

export const notCondition = (condition: PlayerCondition): PlayerCondition => ({
  toString(): string {
    return `Not ${condition.toString()}`;
  },
  toJSON(): NotRequirement {
    return { type: "not", condition: condition.toJSON() };
  },
  isSatisfied(p: PlayerObject): boolean {
    return !condition.isSatisfied(p);
  },
});

export const someCondition = (conditions: PlayerCondition[]): CompoundPlayerCondition => ({
  type: "someCondition",
  toString(): string {
    return joinList(conditions.map((c) => c.toString()));
  },
  toJSON(): SomeRequirement {
    return { type: "someCondition", conditions: conditions.map((c) => c.toJSON()) };
  },
  isSatisfied(p: PlayerObject): boolean {
    return conditions.some((c) => c.isSatisfied(p));
  },
  *[Symbol.iterator](): IterableIterator<PlayerCondition> {
    for (const cond of conditions) {
      if ("type" in cond && cond.type == "someCondition") {
        // automatically flatten nested OR lists
        yield* cond as CompoundPlayerCondition;
      } else {
        yield cond;
      }
    }
  },
});

export const everyCondition = (conditions: PlayerCondition[]): CompoundPlayerCondition => ({
  type: "everyCondition",
  toString(): string {
    return joinList(
      conditions.map((c) => c.toString()),
      "and",
    );
  },
  toJSON(): EveryRequirement {
    return { type: "everyCondition", conditions: conditions.map((c) => c.toJSON()) };
  },
  isSatisfied(p: PlayerObject): boolean {
    return conditions.every((c) => c.isSatisfied(p));
  },
  *[Symbol.iterator](): IterableIterator<PlayerCondition> {
    for (const cond of conditions) {
      if ("type" in cond && cond.type == "everyCondition") {
        // automatically flatten nested AND lists
        yield* cond as CompoundPlayerCondition;
      } else {
        yield cond;
      }
    }
  },
});

export const delayedCondition = (arg: () => PlayerCondition): PlayerCondition => ({
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
