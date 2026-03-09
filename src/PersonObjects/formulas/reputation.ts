import { CONSTANTS } from "../../Constants";
import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { calculateCurrentShareBonus } from "../../NetworkShare/Share";
import { Person as IPerson } from "@nsdefs";
import { calculateIntelligenceBonus, getEffectiveIntelligence } from "./intelligence";
import { Player } from "@player";

function mult(favor: number): number {
  let favorMult = 1 + favor / 100;
  if (isNaN(favorMult)) {
    favorMult = 1;
  }
  return favorMult * currentNodeMults.FactionWorkRepGain;
}

export function getHackingWorkRepGain(p: IPerson, favor: number): number {
  return (
    ((p.skills.hacking + getEffectiveIntelligence(p) + getDarknetCharismaBonus(p, 0.15) / 3) /
      CONSTANTS.MaxSkillLevel) *
    p.mults.faction_rep *
    calculateIntelligenceBonus(p, 1) *
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
        (p.skills.hacking + getEffectiveIntelligence(p) + getDarknetCharismaBonus(p, 0.3)) *
          calculateCurrentShareBonus())) /
    CONSTANTS.MaxSkillLevel /
    4.5;
  return t * p.mults.faction_rep * mult(favor) * calculateIntelligenceBonus(p, 1);
}

export function getFactionFieldWorkRepGain(p: IPerson, favor: number): number {
  const t =
    (0.9 *
      (p.skills.strength +
        p.skills.defense +
        p.skills.dexterity +
        p.skills.agility +
        p.skills.charisma +
        (p.skills.hacking + getEffectiveIntelligence(p) + getDarknetCharismaBonus(p, 0.3)) *
          calculateCurrentShareBonus())) /
    CONSTANTS.MaxSkillLevel /
    5.5;
  return t * p.mults.faction_rep * mult(favor) * calculateIntelligenceBonus(p, 1);
}

function getDarknetCharismaBonus(p: IPerson, scalar: number = 1): number {
  if (Player.sourceFileLvl(15) >= 3) {
    return p.skills.charisma * scalar;
  }
  return 0;
}
