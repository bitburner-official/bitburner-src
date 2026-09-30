import { CONSTANTS } from "../../Constants";
import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { calculateCurrentShareBonus } from "../../NetworkShare/Share";
import { Person as IPerson } from "@nsdefs";
import { calculateIntelligenceBonus } from "./intelligence";
import { Player } from "@player";

function mult(p: IPerson, favor: number): number {
  let favorMult = 1 + favor / 100;
  if (isNaN(favorMult)) {
    favorMult = 1;
  }
  return (
    favorMult *
    currentNodeMults.FactionWorkRepGain *
    p.mults.faction_rep *
    calculateIntelligenceBonus(p.skills.intelligence, 1) *
    calculateCurrentShareBonus()
  );
}

export function getHackingWorkRepGain(p: IPerson, favor: number): number {
  const t = (p.skills.hacking + p.skills.intelligence / 3 + getDarknetCharismaBonus(p, 0.1)) / CONSTANTS.MaxSkillLevel;
  return t * mult(p, favor);
}

export function getFactionSecurityWorkRepGain(p: IPerson, favor: number): number {
  const t =
    (0.9 *
      (p.skills.strength +
        p.skills.defense +
        p.skills.dexterity +
        p.skills.agility +
        p.skills.hacking +
        p.skills.intelligence +
        getDarknetCharismaBonus(p, 0.3))) /
    CONSTANTS.MaxSkillLevel /
    4.5;
  return t * mult(p, favor);
}

export function getFactionFieldWorkRepGain(p: IPerson, favor: number): number {
  const t =
    (0.9 *
      (p.skills.strength +
        p.skills.defense +
        p.skills.dexterity +
        p.skills.agility +
        p.skills.charisma +
        p.skills.hacking +
        p.skills.intelligence +
        getDarknetCharismaBonus(p, 0.3))) /
    CONSTANTS.MaxSkillLevel /
    5.5;
  return t * mult(p, favor);
}

function getDarknetCharismaBonus(p: IPerson, scalar: number = 1): number {
  if (Player.activeSourceFileLvl(15) >= 3) {
    return p.skills.charisma * scalar;
  }
  return 0;
}
