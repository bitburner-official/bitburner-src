import { CONSTANTS } from "../../Constants";
import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { calculateCurrentShareBonus } from "../../NetworkShare/Share";
import { Person as IPerson } from "@nsdefs";
import { calculateIntelligenceBonus } from "./intelligence";

function mult(favor: number): number {
  let favorMult = 1 + favor / 100;
  if (isNaN(favorMult)) {
    favorMult = 1;
  }
  return favorMult * currentNodeMults.FactionWorkRepGain;
}

export function getHackingWorkRepGain(p: IPerson, favor: number): number {
  return (
    ((p.skills.hacking + p.skills.intelligence / 3) / CONSTANTS.MaxSkillLevel) *
    p.mults.faction_rep *
    calculateIntelligenceBonus(p.skills.intelligence, 1) *
    mult(favor) *
    calculateCurrentShareBonus()
  );
}

export function getFactionSecurityWorkRepGain(p: IPerson, favor: number): number {
  const t =
    (0.9 *
      (p.skills.strength +
        p.skills.defense +
        p.skills.dexterity +
        p.skills.agility +
        (p.skills.hacking + p.skills.intelligence) * calculateCurrentShareBonus())) /
    CONSTANTS.MaxSkillLevel /
    4.5;
  return t * p.mults.faction_rep * mult(favor) * calculateIntelligenceBonus(p.skills.intelligence, 1);
}

export function getFactionFieldWorkRepGain(p: IPerson, favor: number): number {
  const t =
    (0.9 *
      (p.skills.strength +
        p.skills.defense +
        p.skills.dexterity +
        p.skills.agility +
        p.skills.charisma +
        (p.skills.hacking + p.skills.intelligence) * calculateCurrentShareBonus())) /
    CONSTANTS.MaxSkillLevel /
    5.5;
  return t * p.mults.faction_rep * mult(favor) * calculateIntelligenceBonus(p.skills.intelligence, 1);
}
