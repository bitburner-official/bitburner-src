import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { GangMember } from "../GangMember";
import { GangMemberTask } from "../GangMemberTask";

export interface FormulaGang {
  respect: number;
  territory: number;
  wantedLevel: number;
}

export function calculateWantedPenalty(gang: FormulaGang): number {
  return gang.respect / (gang.respect + gang.wantedLevel);
}

export function calculateRespectGain(gang: FormulaGang, member: GangMember, task: GangMemberTask): number {
  if (task.baseRespect === 0) return 0;
  let statWeight =
    (task.hackWeight / 100) * member.hack +
    (task.strWeight / 100) * member.str +
    (task.defWeight / 100) * member.def +
    (task.dexWeight / 100) * member.dex +
    (task.agiWeight / 100) * member.agi +
    (task.chaWeight / 100) * member.cha;
  statWeight -= 4 * task.difficulty;
  if (statWeight <= 0) return 0;
  const territoryMult = Math.max(0.005, Math.pow(gang.territory * 100, task.territory.respect) / 100);
  const territoryPenalty = (0.2 * gang.territory + 0.8) * currentNodeMults.GangSoftcap;
  if (isNaN(territoryMult) || territoryMult <= 0) return 0;
  const respectMult = calculateWantedPenalty(gang);
  return Math.pow(11 * task.baseRespect * statWeight * territoryMult * respectMult, territoryPenalty);
}

export function calculateWantedLevelGain(gang: FormulaGang, member: GangMember, task: GangMemberTask): number {
  if (task.baseWanted === 0) return 0;
  let statWeight =
    (task.hackWeight / 100) * member.hack +
    (task.strWeight / 100) * member.str +
    (task.defWeight / 100) * member.def +
    (task.dexWeight / 100) * member.dex +
    (task.agiWeight / 100) * member.agi +
    (task.chaWeight / 100) * member.cha;
  statWeight -= 3.5 * task.difficulty;
  if (statWeight <= 0) return 0;
  const territoryMult = Math.max(0.005, Math.pow(gang.territory * 100, task.territory.wanted) / 100);
  if (isNaN(territoryMult) || territoryMult <= 0) return 0;
  if (task.baseWanted < 0) {
    return 0.4 * task.baseWanted * statWeight * territoryMult;
  }
  const calc = (7 * task.baseWanted) / Math.pow(3 * statWeight * territoryMult, 0.8);

  // Put an arbitrary cap on this to prevent wanted level from rising too fast if the
  // denominator is very small. Might want to rethink formula later
  return Math.min(100, calc);
}

export function calculateMoneyGain(gang: FormulaGang, member: GangMember, task: GangMemberTask): number {
  if (task.baseMoney === 0) return 0;
  let statWeight =
    (task.hackWeight / 100) * member.hack +
    (task.strWeight / 100) * member.str +
    (task.defWeight / 100) * member.def +
    (task.dexWeight / 100) * member.dex +
    (task.agiWeight / 100) * member.agi +
    (task.chaWeight / 100) * member.cha;

  statWeight -= 3.2 * task.difficulty;
  if (statWeight <= 0) return 0;
  const territoryMult = Math.max(0.005, Math.pow(gang.territory * 100, task.territory.money) / 100);
  if (isNaN(territoryMult) || territoryMult <= 0) return 0;
  const respectMult = calculateWantedPenalty(gang);
  const territoryPenalty = (0.2 * gang.territory + 0.8) * currentNodeMults.GangSoftcap;
  return Math.pow(5 * task.baseMoney * statWeight * territoryMult * respectMult, territoryPenalty);
}

//Calculates memberEXP based on member passed and task passed that the member currently has assigned.
//@returns object containing all exp values that would be gain on task compeletion.
export function calculateMemberExperience(numCycles: number, member: GangMember, task: GangMemberTask): object {
  const expValues = {
    hackEXP: 0,
    strEXP: 0,
    defEXP: 0,
    dexEXP: 0,
    agiEXP: 0,
    chaEXP: 0,
  };

  const difficultyMult = Math.pow(task.difficulty, 0.9);
  const difficultyPerCycles = difficultyMult * numCycles;
  const weightDivisor = 1500;
  const expMult = member.expMult();

  expValues.hackEXP +=
    (task.hackWeight / weightDivisor) *
    difficultyPerCycles *
    expMult.hack *
    member.calculateAscensionMult(member.hack_asc_points);

  expValues.strEXP +=
    (task.strWeight / weightDivisor) *
    difficultyPerCycles *
    expMult.str *
    member.calculateAscensionMult(member.str_asc_points);

  expValues.defEXP +=
    (task.defWeight / weightDivisor) *
    difficultyPerCycles *
    expMult.def *
    member.calculateAscensionMult(member.def_asc_points);

  expValues.dexEXP +=
    (task.dexWeight / weightDivisor) *
    difficultyPerCycles *
    expMult.dex *
    member.calculateAscensionMult(member.dex_asc_points);

  expValues.agiEXP +=
    (task.agiWeight / weightDivisor) *
    difficultyPerCycles *
    expMult.agi *
    member.calculateAscensionMult(member.agi_asc_points);

  expValues.chaEXP +=
    (task.chaWeight / weightDivisor) *
    difficultyPerCycles *
    expMult.cha *
    member.calculateAscensionMult(member.cha_asc_points);

  return expValues;
}

export function calculateAscensionPointsGain(exp: number): number {
  return Math.max(exp - 1000, 0);
}

export function calculateAscensionMult(points: number): number {
  return Math.max(Math.pow(points / 2000, 0.5), 1);
}
