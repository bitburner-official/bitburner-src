import { CharityVolunteer } from "../CharityVolunteer";
import { CharityVolunteerTask } from "../CharityVolunteerTask";

export interface FormulaCharity {
  prestige: number;
  visibility: number;
  terror: number;
}

export function calculatePrestigeGain(
  cform: FormulaCharity,
  volunteer: CharityVolunteer,
  task: CharityVolunteerTask,
): number {
  if (task.basePrestige === 0) return 0;
  let statWeight =
    (task.hackWeight / 100) * volunteer.hack +
    (task.strWeight / 100) * volunteer.str +
    (task.defWeight / 100) * volunteer.def +
    (task.dexWeight / 100) * volunteer.dex +
    (task.agiWeight / 100) * volunteer.agi +
    (task.chaWeight / 100) * volunteer.cha;
  statWeight -= 4 * task.difficulty;
  if (statWeight <= 0) return 0;
  const terrorMult = calculateTerrorMult(cform);
  const visibilityMult = calculateVisibilityMult(cform);
  return (
    Math.pow(11 * task.basePrestige * statWeight * terrorMult * visibilityMult, (1 + terrorMult + visibilityMult) / 2) /
    10
  ); //(terrorMult + visibilityMult) / 2);
}

export function calculateKarmaGain(
  cform: FormulaCharity,
  volunteer: CharityVolunteer,
  task: CharityVolunteerTask,
): number {
  if (task.baseKarmaGain === 0) return 0;
  let statWeight =
    (task.hackWeight / 100) * volunteer.hack +
    (task.strWeight / 100) * volunteer.str +
    (task.defWeight / 100) * volunteer.def +
    (task.dexWeight / 100) * volunteer.dex +
    (task.agiWeight / 100) * volunteer.agi +
    (task.chaWeight / 100) * volunteer.cha;
  statWeight -= 4 * task.difficulty;
  if (statWeight <= 0) return 0;
  const terrorMult = calculateTerrorMult(cform);
  const visibilityMult = calculateVisibilityMult(cform);
  return (5 * task.baseKarmaGain * statWeight * 0.25 * Math.sqrt((terrorMult + visibilityMult) / 2)) / 10;
}

export function calculateMoneyGainCharity(
  cform: FormulaCharity,
  volunteer: CharityVolunteer,
  task: CharityVolunteerTask,
): number {
  if (task.baseMoneyGain === 0) return 0;
  let statWeight =
    (task.hackWeight / 100) * volunteer.hack +
    (task.strWeight / 100) * volunteer.str +
    (task.defWeight / 100) * volunteer.def +
    (task.dexWeight / 100) * volunteer.dex +
    (task.agiWeight / 100) * volunteer.agi +
    (task.chaWeight / 100) * volunteer.cha;
  statWeight -= 4 * task.difficulty;
  if (statWeight <= 0) return 0;
  const terrorMult = calculateTerrorMult(cform);
  const visibilityMult = calculateVisibilityMult(cform);
  return (
    Math.pow(5 * task.baseMoneyGain * statWeight * terrorMult * visibilityMult, (1 + terrorMult + visibilityMult) / 2) /
    10
  );
}
export function calculateMoneySpendCharity(
  cform: FormulaCharity,
  volunteer: CharityVolunteer,
  task: CharityVolunteerTask,
): number {
  if (task.baseMoneySpend === 0) return 0;
  let statWeight =
    (task.hackWeight / 100) * volunteer.hack +
    (task.strWeight / 100) * volunteer.str +
    (task.defWeight / 100) * volunteer.def +
    (task.dexWeight / 100) * volunteer.dex +
    (task.agiWeight / 100) * volunteer.agi +
    (task.chaWeight / 100) * volunteer.cha;
  statWeight -= 4 * task.difficulty;
  if (statWeight <= 0) return 0;
  const terrorMult = calculateTerrorMult(cform);
  const visibilityMult = calculateVisibilityMult(cform);
  return (
    Math.pow(
      5 * task.baseMoneySpend * statWeight * terrorMult * visibilityMult,
      (1 + terrorMult + visibilityMult) / 2,
    ) / 10
  );
}

export function calculateVisibilityGain(
  cform: FormulaCharity,
  volunteer: CharityVolunteer,
  task: CharityVolunteerTask,
): number {
  if (task.baseVisibility === 0) return 0;
  let statWeight =
    (task.hackWeight / 100) * volunteer.hack +
    (task.strWeight / 100) * volunteer.str +
    (task.defWeight / 100) * volunteer.def +
    (task.dexWeight / 100) * volunteer.dex +
    (task.agiWeight / 100) * volunteer.agi +
    (task.chaWeight / 100) * volunteer.cha;
  statWeight -= 4 * task.difficulty;
  if (statWeight <= 0) return 0;
  const terrorMult = calculateTerrorMult(cform);
  const visibilityMult = calculateVisibilityMult(cform);
  return (
    Math.pow(
      5 * task.baseVisibility * statWeight * terrorMult * visibilityMult,
      (1 + terrorMult + visibilityMult) / 2, //((terrorMult + visibilityMult) / 2) + 0.5,
    ) / 10
  );
}
export function calculateTerrorGain(
  cform: FormulaCharity,
  volunteer: CharityVolunteer,
  task: CharityVolunteerTask,
): number {
  if (task.baseTerror === 0) return 0;
  let statWeight =
    (task.hackWeight / 100) * volunteer.hack +
    (task.strWeight / 100) * volunteer.str +
    (task.defWeight / 100) * volunteer.def +
    (task.dexWeight / 100) * volunteer.dex +
    (task.agiWeight / 100) * volunteer.agi +
    (task.chaWeight / 100) * volunteer.cha;
  statWeight -= 4 * task.difficulty;
  if (statWeight <= 0) return 0;
  const terrorMult = calculateTerrorMult(cform);
  const visibilityMult = calculateVisibilityMult(cform);
  return (
    (-1 *
      Math.pow(
        5 * task.baseTerror * statWeight * terrorMult * visibilityMult,
        (1 + terrorMult + visibilityMult) / 2, //((terrorMult + visibilityMult) / 2) + 0.5,
      )) /
    10
  );
}

export function calculateTerrorMult(cform: FormulaCharity): number {
  //Terror 0: actually 1: 33.333  100: 0.3333...  1 is too high, so we / by 10000 and + .0005
  return ((50 / Math.max(cform.terror, 1)) * 2) / 3 / 10000 + 0.0005;
}

export function calculateVisibilityMult(cform: FormulaCharity): number {
  //Vis 0: = 0.3333... -> 100: = Actually 99: 33.333  1 is too high, so we / by 10000 and + .0005, 0.333 - 33.33 / 10000 -> 0.0000333 - .003333 + .0005
  return ((50 / (100 - Math.min(cform.visibility, 99))) * 2) / 3 / 10000 + 0.0005;
}

export function calculateAscensionPointsGainCharity(exp: number): number {
  return Math.max(exp - 1000, 0);
}

export function calculateAscensionMultCharity(points: number): number {
  return Math.max(Math.pow(points / 2000, 0.5), 1);
}
