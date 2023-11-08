import { ITaskParams } from "./ITaskParams";

export class CharityVolunteerTask {
  name: string;
  desc: string;

  isSpending: boolean;

  basePrestige: number;
  baseVisibility: number;
  baseTerror: number;
  baseMoneyGain: number;
  baseMoneySpend: number;
  baseKarmaGain: number;

  hackWeight: number;
  strWeight: number;
  defWeight: number;
  dexWeight: number;
  agiWeight: number;
  chaWeight: number;

  difficulty: number;

  // Defines tasks that Gang Members can work on
  constructor(name: string, desc: string, isSpending: boolean, params: ITaskParams) {
    this.name = name;
    this.desc = desc;
    this.isSpending = isSpending;

    // Base gain rates for respect/wanted/money
    this.basePrestige = params.basePrestige ? params.basePrestige : 0;
    this.baseVisibility = params.baseVisibility ? params.baseVisibility : 0;
    this.baseTerror = params.baseTerror ? params.baseTerror : 0;
    this.baseMoneyGain = params.baseMoneyGain ? params.baseMoneyGain : 0;
    this.baseMoneySpend = params.baseMoneySpend ? params.baseMoneySpend : 0;
    this.baseKarmaGain = params.baseKarmaGain ? params.baseKarmaGain : 0;

    // Weighting for the effect that each stat has on the tasks effectiveness.
    // Weights must add up to 100
    this.hackWeight = params.hackWeight ? params.hackWeight : 0;
    this.strWeight = params.strWeight ? params.strWeight : 0;
    this.defWeight = params.defWeight ? params.defWeight : 0;
    this.dexWeight = params.dexWeight ? params.dexWeight : 0;
    this.agiWeight = params.agiWeight ? params.agiWeight : 0;
    this.chaWeight = params.chaWeight ? params.chaWeight : 0;

    if (
      Math.round(
        this.hackWeight + this.strWeight + this.defWeight + this.dexWeight + this.agiWeight + this.chaWeight,
      ) != 100
    ) {
      console.error(`CharityVolunteerTask ${this.name} weights do not add up to 100`);
    }

    // 1 - 100
    this.difficulty = params.difficulty ? params.difficulty : 1;
  }
}
