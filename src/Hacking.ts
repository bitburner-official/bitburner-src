import { BitNodeMultipliers } from "./BitNode/BitNodeMultipliers";
import { Person as IPerson } from "@nsdefs";
import { calculateIntelligenceBonus } from "./PersonObjects/formulas/intelligence";
import { Server as IServer } from "@nsdefs";

/** Returns the chance the person has to successfully hack a server */
export function calculateHackingChance(server: IServer, person: IPerson): number {
  const hackDifficulty = server.hackDifficulty ?? 100;
  const requiredHackingSkill = server.requiredHackingSkill ?? 1e9;
  // Unrooted or unhackable server
  if (!server.hasAdminRights || hackDifficulty >= 100) return 0;
  const hackFactor = 1.75;
  const difficultyMult = (100 - hackDifficulty) / 100;
  const skillMult = hackFactor * person.skills.hacking;
  const skillChance = (skillMult - requiredHackingSkill) / skillMult;
  const chance =
    skillChance *
    difficultyMult *
    person.mults.hacking_chance *
    calculateIntelligenceBonus(person.skills.intelligence, 1);
  return Math.min(1, Math.max(chance, 0));
}

/**
 * Returns the amount of hacking experience the person will gain upon
 * successfully hacking a server
 */
export function calculateHackingExpGain(server: IServer, person: IPerson): number {
  const baseDifficulty = server.baseDifficulty;
  if (!baseDifficulty) return 0;
  const baseExpGain = 3;
  const diffFactor = 0.3;
  let expGain = baseExpGain;
  expGain += baseDifficulty * diffFactor;
  return expGain * person.mults.hacking_exp * BitNodeMultipliers.HackExpGain;
}

/**
 * Returns the percentage of money that will be stolen from a server if
 * it is successfully hacked (returns the decimal form, not the actual percent value)
 */
export function calculatePercentMoneyHacked(server: IServer, person: IPerson): number {
  const hackDifficulty = server.hackDifficulty ?? 100;
  if (hackDifficulty >= 100) return 0;
  const requiredHackingSkill = server.requiredHackingSkill ?? 1e9;
  // Adjust if needed for balancing. This is the divisor for the final calculation
  const balanceFactor = 240;

  const difficultyMult = (100 - hackDifficulty) / 100;
  const skillMult = (person.skills.hacking - (requiredHackingSkill - 1)) / person.skills.hacking;
  const percentMoneyHacked =
    (difficultyMult * skillMult * person.mults.hacking_money * BitNodeMultipliers.ScriptHackMoney) / balanceFactor;

  return Math.min(1, Math.max(percentMoneyHacked, 0));
}

/** Returns time it takes to complete a hack on a server, in seconds */
export function calculateHackingTime(server: IServer, person: IPerson): number {
  const { hackDifficulty, requiredHackingSkill } = server;
  if (typeof hackDifficulty !== "number" || typeof requiredHackingSkill !== "number") return Infinity;
  const difficultyMult = requiredHackingSkill * hackDifficulty;

  const baseDiff = 500;
  const baseSkill = 50;
  const diffFactor = 2.5;
  let skillFactor = diffFactor * difficultyMult + baseDiff;
  skillFactor /= person.skills.hacking + baseSkill;

  const hackTimeMultiplier = 5;
  const hackingTime =
    (hackTimeMultiplier * skillFactor) /
    (person.mults.hacking_speed * calculateIntelligenceBonus(person.skills.intelligence, 1));

  return hackingTime;
}

/** Returns time it takes to complete a grow operation on a server, in seconds */
export function calculateGrowTime(server: IServer, person: IPerson): number {
  const growTimeMultiplier = 3.2; // Relative to hacking time. 16/5 = 3.2

  return growTimeMultiplier * calculateHackingTime(server, person);
}

/** Returns time it takes to complete a weaken operation on a server, in seconds */
export function calculateWeakenTime(server: IServer, person: IPerson): number {
  const weakenTimeMultiplier = 4; // Relative to hacking time

  return weakenTimeMultiplier * calculateHackingTime(server, person);
}
