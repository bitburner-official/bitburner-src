import { GangMemberType } from "@enums";
import { ITaskParams, ITerritory } from "./ITaskParams";

export class GangMemberTask {
  name: string;
  desc: string;

  restrictedTypes?: GangMemberType[];

  baseRespect: number;
  baseWanted: number;
  baseMoney: number;

  hackWeight: number;
  strWeight: number;
  defWeight: number;
  dexWeight: number;
  agiWeight: number;
  chaWeight: number;

  difficulty: number;

  territory: ITerritory;

  territoryPower: number;
  deathRisk: boolean;

  // Defines tasks that Gang Members can work on
  constructor(name: string, desc: string, params: ITaskParams, restrictedTypes?: GangMemberType[]) {
    this.name = name;
    this.desc = desc;

    this.restrictedTypes = restrictedTypes;

    // Base gain rates for respect/wanted/money
    this.baseRespect = params.baseRespect ? params.baseRespect : 0;
    this.baseWanted = params.baseWanted ? params.baseWanted : 0;
    this.baseMoney = params.baseMoney ? params.baseMoney : 0;

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
      console.error(`GangMemberTask ${this.name} weights do not add up to 100`);
    }

    // 1 - 100
    this.difficulty = params.difficulty ? params.difficulty : 1;

    // Territory Factors. Exponential factors that dictate how territory affects gains
    // Formula: Territory Multiplier = (Territory * 100) ^ factor / 100
    // So factor of 0 means no scaling, 1 means scaling linearly
    this.territory = params.territory ? params.territory : { money: 1, respect: 1, wanted: 1 };

    this.territoryPower = params.territoryPower ?? 0;
    this.deathRisk = params.deathRisk ?? false;
  }
}
