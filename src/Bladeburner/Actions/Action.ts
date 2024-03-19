import type { Bladeburner } from "../Bladeburner";
import type { Person } from "../../PersonObjects/Person";
import type { ActionAvailability, SuccessChanceParams } from "../Types";

import { addOffset } from "../../utils/helpers/addOffset";
import { BladeburnerConstants } from "../data/Constants";
import { calculateIntelligenceBonus } from "../../PersonObjects/formulas/intelligence";

class StatsMultiplier {
  [key: string]: number;

  hack = 0;
  str = 0;
  def = 0;
  dex = 0;
  agi = 0;
  cha = 0;
  int = 0;
}

export interface ActionParams {
  desc: string;
  baseDifficulty?: number;
  rewardFac?: number;
  rankGain?: number;
  rankLoss?: number;
  hpLoss?: number;
  isStealth?: boolean;
  isKill?: boolean;
  weights?: StatsMultiplier;
  decays?: StatsMultiplier;
}

export abstract class ActionClass {
  desc = "";
  // For LevelableActions, the base difficulty can be increased based on action level
  baseDifficulty = 100;

  // All of these scale with level/difficulty
  rankGain = 0;
  rankLoss = 0;
  hpLoss = 0;

  // Action Category. Current categories are stealth and kill
  isStealth = false;
  isKill = false;

  // Weighting of each stat in determining action success rate
  weights: StatsMultiplier = {
    hack: 1 / 7,
    str: 1 / 7,
    def: 1 / 7,
    dex: 1 / 7,
    agi: 1 / 7,
    cha: 1 / 7,
    int: 1 / 7,
  };
  // Diminishing returns of stats (stat ^ decay where 0 <= decay <= 1)
  decays: StatsMultiplier = {
    hack: 0.9,
    str: 0.9,
    def: 0.9,
    dex: 0.9,
    agi: 0.9,
    cha: 0.9,
    int: 0.9,
  };

  constructor(params: ActionParams | null = null) {
    if (!params) return;
    this.desc = params.desc;
    if (params.baseDifficulty) this.baseDifficulty = addOffset(params.baseDifficulty, 10);

    if (params.rankGain) this.rankGain = params.rankGain;
    if (params.rankLoss) this.rankLoss = params.rankLoss;
    if (params.hpLoss) this.hpLoss = params.hpLoss;

    if (params.isStealth) this.isStealth = params.isStealth;
    if (params.isKill) this.isKill = params.isKill;

    if (params.weights) this.weights = params.weights;
    if (params.decays) this.decays = params.decays;
  }

  /** Tests for success. Should be called when an action has completed */
  attempt(bladeburner: Bladeburner, person: Person): boolean {
    return Math.random() < this.getSuccessChance(bladeburner, person);
  }

  // All the functions below are overwritten by certain subtypes of action, e.g. BlackOps ignore city stats
  getPopulationSuccessFactor(bladeburner: Bladeburner, { est }: SuccessChanceParams): number {
    const city = bladeburner.getCurrentCity();
    const pop = est ? city.popEst : city.pop;
    return Math.pow(pop / BladeburnerConstants.PopulationThreshold, BladeburnerConstants.PopulationExponent);
  }

  getChaosSuccessFactor(bladeburner: Bladeburner): number {
    const city = bladeburner.getCurrentCity();
    if (city.chaos > BladeburnerConstants.ChaosThreshold) {
      const diff = 1 + (city.chaos - BladeburnerConstants.ChaosThreshold);
      const mult = Math.pow(diff, 0.5);
      return mult;
    }

    return 1;
  }

  getActionTime(bladeburner: Bladeburner, person: Person): number {
    const difficulty = this.getDifficulty();
    let baseTime = difficulty / BladeburnerConstants.DifficultyToTimeFactor;
    const skillFac = bladeburner.skillMultipliers.actionTime; // Always < 1

    const effAgility = person.skills.agility * bladeburner.skillMultipliers.effAgi;
    const effDexterity = person.skills.dexterity * bladeburner.skillMultipliers.effDex;
    const statFac =
      0.5 *
      (Math.pow(effAgility, BladeburnerConstants.EffAgiExponentialFactor) +
        Math.pow(effDexterity, BladeburnerConstants.EffDexExponentialFactor) +
        effAgility / BladeburnerConstants.EffAgiLinearFactor +
        effDexterity / BladeburnerConstants.EffDexLinearFactor); // Always > 1

    baseTime = Math.max(1, (baseTime * skillFac) / statFac);

    return Math.ceil(baseTime * this.getActionTimePenalty());
  }

  getTeamSuccessBonus(__bladeburner: Bladeburner): number {
    return 1;
  }

  getActionTypeSkillSuccessBonus(__bladeburner: Bladeburner): number {
    return 1;
  }

  getAvailability(__bladeburner: Bladeburner): ActionAvailability {
    return { available: true };
  }

  getActionTimePenalty(): number {
    return 1;
  }

  getDifficulty(): number {
    return this.baseDifficulty;
  }

  getSuccessRange(bladeburner: Bladeburner, person: Person): [minChance: number, maxChance: number] {
    function clamp(x: number): number {
      return Math.max(0, Math.min(x, 1));
    }
    const est = this.getSuccessChance(bladeburner, person, { est: true });
    const real = this.getSuccessChance(bladeburner, person);
    const diff = Math.abs(real - est);
    let low = real - diff;
    let high = real + diff;
    const city = bladeburner.getCurrentCity();
    let r = city.pop / city.popEst;
    if (Number.isNaN(r)) r = 0;
    if (r < 1) low *= r;
    else high *= r;
    return [clamp(low), clamp(high)];
  }

  getSuccessChance(inst: Bladeburner, person: Person, { est }: SuccessChanceParams = { est: false }): number {
    let difficulty = this.getDifficulty();
    let competence = 0;
    for (const stat of Object.keys(this.weights)) {
      if (Object.hasOwn(this.weights, stat)) {
        const playerStatLvl = person.queryStatFromString(stat);
        const key = "eff" + stat.charAt(0).toUpperCase() + stat.slice(1);
        let effMultiplier = inst.skillMultipliers[key];
        if (effMultiplier == null) {
          console.error(`Failed to find Bladeburner Skill multiplier for: ${stat}`);
          effMultiplier = 1;
        }
        competence += this.weights[stat] * Math.pow(effMultiplier * playerStatLvl, this.decays[stat]);
      }
    }
    competence *= calculateIntelligenceBonus(person.skills.intelligence, 0.75);
    competence *= inst.calculateStaminaPenalty();

    competence *= this.getTeamSuccessBonus(inst);

    competence *= this.getPopulationSuccessFactor(inst, { est });
    difficulty *= this.getChaosSuccessFactor(inst);

    // Factor skill multipliers into success chance
    competence *= inst.skillMultipliers.successChanceAll;
    competence *= this.getActionTypeSkillSuccessBonus(inst);
    if (this.isStealth) {
      competence *= inst.skillMultipliers.successChanceStealth;
    }
    if (this.isKill) {
      competence *= inst.skillMultipliers.successChanceKill;
    }

    // Augmentation multiplier
    competence *= person.mults.bladeburner_success_chance;

    if (isNaN(competence)) {
      throw new Error("Competence calculated as NaN in Action.getSuccessChance()");
    }
    return Math.min(1, competence / difficulty);
  }
}
