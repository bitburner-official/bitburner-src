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
 
  return ((5 * task.baseKarmaGain * statWeight * 0.25) / 10);
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
  //Terror ranges from 0 - 100%, or 0 - 100.000...
  //Values retured are: at 50% returns 1(no change), at 100% returns .5, at 0 returns 2
  //Formula takes into account 2 -- 1 -- .5
  if (cform.terror === 50) {
    // Returns 1 at 50%
    return 1;
  } else if (cform.terror > 50) {
    // Range 50.1 - 100%.  Returns .5 at 100% and .999 at near 50%
    return 50 / cform.terror;
  } else {
    // < 50  Range 49.9% - 0.01  Returns near 2 at near 0 and just over 1 at near 50%
    return Math.sqrt((200 - cform.terror * 2) / 100); // sqrt of (1 - 2), = 1 - 1.45
  }
}

export function calculateVisibilityMult(cform: FormulaCharity): number {
  //Visibility ranges from 0 - 100%, or 1 - 0.000...
  //Values retured are: at 50% returns 1(no change), at 100% returns 2, at 0 returns .5
  //Formula takes into account 2 -- 1 -- .5
  if (cform.visibility === 50) {
    // Returns 1 at 50%
    return 1;
  } else if (cform.visibility > 50) {
    // Range 50.1 - 100%.  Returns 2 at 100% and just over 1 at near 50%
    return Math.sqrt(cform.visibility / 50); //100% 1 / .5 = 2   50.1%  .501 / .5 = 1.002
  } else {
    // < .5  Range 49.9% - 0.01  Returns .5 at 0 and just below 1 at near 50%
    return (cform.visibility + 50) / 100;
  }
}

export function calculateAscensionPointsGainCharity(exp: number): number {
  return Math.max(exp - 1000, 0);
}

export function calculateAscensionMultCharity(points: number): number {
  return Math.max(Math.pow(points / 2000, 0.5), 1);
}
