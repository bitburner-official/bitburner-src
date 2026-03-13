import type { Person as IPerson } from "@nsdefs";
import { Player } from "@player";
import { Person } from "../Person";

export function calculateIntelligenceBonus(person: IPerson, weight = 1): number {
  return 1 + (weight * Math.pow(getEffectiveIntelligence(person), 0.8)) / 600;
}

export function getEffectiveIntelligence(person: IPerson): number {
  if (!(person instanceof Person) || Player.bitNodeOptions.intelligenceOverride === undefined) {
    return person.skills.intelligence;
  }
  return Math.min(Player.bitNodeOptions.intelligenceOverride, person.skills.intelligence);
}
