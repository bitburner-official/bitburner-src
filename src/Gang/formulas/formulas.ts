import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { GangMember } from "../GangMember";
import { GangMemberTask } from "../GangMemberTask";
import { GangMemberTasks } from "../GangMemberTasks";
import { GangMemberExpGain } from "@nsdefs";

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

export function calculateExpGain(member: GangMember, task: GangMemberTask): GangMemberExpGain {
  if (task.name === GangMemberTasks.Unassigned.name) {
    return {
      hack_exp: 0,
      str_exp: 0,
      def_exp: 0,
      dex_exp: 0,
      agi_exp: 0,
      cha_exp: 0,
    };
  }
  const difficultyMult = Math.pow(task.difficulty, 0.9);
  const weightDivisor = 1500;
  const expMult = {
    hack: (member.hack_mult - 1) / 4 + 1,
    str: (member.str_mult - 1) / 4 + 1,
    def: (member.def_mult - 1) / 4 + 1,
    dex: (member.dex_mult - 1) / 4 + 1,
    agi: (member.agi_mult - 1) / 4 + 1,
    cha: (member.cha_mult - 1) / 4 + 1,
  };
  return {
    hack_exp:
      (task.hackWeight / weightDivisor) *
      difficultyMult *
      expMult.hack *
      calculateAscensionMult(member.hack_asc_points),

    str_exp:
      (task.strWeight / weightDivisor) * difficultyMult * expMult.str * calculateAscensionMult(member.str_asc_points),

    def_exp:
      (task.defWeight / weightDivisor) * difficultyMult * expMult.def * calculateAscensionMult(member.def_asc_points),

    dex_exp:
      (task.dexWeight / weightDivisor) * difficultyMult * expMult.dex * calculateAscensionMult(member.dex_asc_points),

    agi_exp:
      (task.agiWeight / weightDivisor) * difficultyMult * expMult.agi * calculateAscensionMult(member.agi_asc_points),

    cha_exp:
      (task.chaWeight / weightDivisor) * difficultyMult * expMult.cha * calculateAscensionMult(member.cha_asc_points),
  };
}

export function calculateAscensionPointsGain(exp: number): number {
  return Math.max(exp - 1000, 0);
}

export function calculateAscensionMult(points: number): number {
  return Math.max(Math.pow(points / 2000, 0.5), 1);
}
