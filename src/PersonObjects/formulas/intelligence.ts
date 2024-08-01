import { Player } from "@player";

export function calculateIntelligenceBonus(intelligence: number, weight = 1): number {
  const effectiveIntelligence =
    Player.bitNodeOptions.intelligenceOverride !== undefined
      ? Math.min(Player.bitNodeOptions.intelligenceOverride, intelligence)
      : intelligence;
  return 1 + (weight * Math.pow(effectiveIntelligence, 0.8)) / 600;
}
