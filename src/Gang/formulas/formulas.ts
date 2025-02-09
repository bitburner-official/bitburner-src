import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { Gang } from "../Gang";
import { GangMember } from "../GangMember";
import { GangMemberTask } from "../GangMemberTask";
import { GangMemberTasks } from "../GangMemberTasks";

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

export function calculateAscensionPointsGain(exp: number): number {
  return Math.max(exp - 1000, 0);
}

export function calculateAscensionMult(points: number): number {
  return Math.max(Math.pow(points / 2000, 0.5), 1);
}

//FUNCTION RETURNS TOTAL EXP GAINED FOR EACH STAT BASED ON THE PARAMS PROVIDED CYCLES, MEMBER, AND TASK
//RETURNS A LIST OF THOSE TOTAL VALUES IN THIS ORDER [hackExp, strExp, defExp, dexExp, agiExp, chaExp]
//IF THERE ARE NO TASKS ASSIGNED EMPTY ARRAY IS RETURNED
export function calculateGainExperience(numCycles: number , member: GangMember): number[] | string {
  const task = member.getTask();

  if (task === GangMemberTasks.Unassigned) 
    return "There is no task currently assigned.";
  
  let hackExp = 0;
  let strExp = 0;
  let defExp = 0;
  let dexExp = 0;
  let agiExp = 0;
  let chaExp = 0;

  const difficultyMult = Math.pow(task.difficulty, 0.9);
  const difficultyPerCycles = difficultyMult * numCycles;
  const weightDivisor = 1500;
  const expMult = member.expMult();

  hackExp +=
    (task.hackWeight / weightDivisor) *
    difficultyPerCycles *
    expMult.hack *
    member.calculateAscensionMult(member.hack_asc_points);

  strExp +=
    (task.strWeight / weightDivisor) *
    difficultyPerCycles *
    expMult.str *
    member.calculateAscensionMult(member.str_asc_points);

  defExp +=
    (task.defWeight / weightDivisor) *
    difficultyPerCycles *
    expMult.def *
    member.calculateAscensionMult(member.def_asc_points);

  dexExp +=
    (task.dexWeight / weightDivisor) *
    difficultyPerCycles *
    expMult.dex *
    member.calculateAscensionMult(member.dex_asc_points);

  agiExp +=
    (task.agiWeight / weightDivisor) *
    difficultyPerCycles *
    expMult.agi *
    member.calculateAscensionMult(member.agi_asc_points);

  chaExp +=
    (task.chaWeight / weightDivisor) *
    difficultyPerCycles *
    expMult.cha *
    member.calculateAscensionMult(member.cha_asc_points);
 
  return [hackExp, strExp, defExp, agiExp, chaExp];
  }