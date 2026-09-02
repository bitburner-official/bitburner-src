import type { Multipliers } from "@nsdefs";

export const defaultMultipliers = (): Multipliers => {
  return {
    hacking_chance: 1,
    hacking_speed: 1,
    hacking_money: 1,
    hacking_grow: 1,
    hacking: 1,
    hacking_exp: 1,
    strength: 1,
    strength_exp: 1,
    defense: 1,
    defense_exp: 1,
    dexterity: 1,
    dexterity_exp: 1,
    agility: 1,
    agility_exp: 1,
    charisma: 1,
    charisma_exp: 1,
    hacknet_node_money: 1,
    hacknet_node_purchase_cost: 1,
    hacknet_node_ram_cost: 1,
    hacknet_node_core_cost: 1,
    hacknet_node_level_cost: 1,
    company_rep: 1,
    faction_rep: 1,
    work_money: 1,
    crime_success: 1,
    crime_money: 1,
    dnet_money: 1,
    bladeburner_max_stamina: 1,
    bladeburner_stamina_gain: 1,
    bladeburner_analysis: 1,
    bladeburner_success_chance: 1,
  };
};

const allMultiplierKeys = Object.keys(defaultMultipliers()) as (keyof Multipliers)[];

export const mergeMultipliers = (result: Multipliers, m1: Multipliers): void => {
  for (const key of allMultiplierKeys) {
    result[key] *= m1[key];
  }
};

export const scaleMultipliers = (result: Multipliers, v: number): void => {
  for (const key of allMultiplierKeys) {
    const effect = result[key];
    // For buffs that apply positively, this is a linear scaling. For
    // instance, scaling a 2x mult (+100%) by 1.5 gives 2.5x (+150%).
    //
    // However, inverse mults apply in a reciprocal fashion, so we have to
    // take that into effect here. For instance, scaling a 0.5x mult (/2) by
    // 1.5 gives a 0.4x mult (/2.5). This has the same effect on stats, but a
    // more complicated formula. We assume any mult that is less than 1 is
    // applying this way.
    if (effect >= 1) {
      result[key] = (effect - 1) * v + 1;
    } else {
      result[key] = 1 / ((1 / effect - 1) * v + 1);
    }
  }
};
