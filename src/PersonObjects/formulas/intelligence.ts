import type { Person as IPerson } from "@nsdefs";
import { Player } from "@player";

export function calculateIntelligenceBonus(person: IPerson, weight = 1): number {
  return 1 + (weight * Math.pow(getEffectiveIntelligence(person), 0.8)) / 600;
}

export function getEffectiveIntelligence(person: IPerson): number {
  if (person !== Player || Player.bitNodeOptions.intelligenceOverride === undefined) {
    return person.skills.intelligence;
  }
  return Math.min(Player.bitNodeOptions.intelligenceOverride, person.skills.intelligence);
}
