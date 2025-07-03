import { Player } from "@player";
import { clampNumber } from "../../utils/helpers/clampNumber";

export const MaxDifficultyForInfiltration = 3.5;
const MaxEffectTime = 30 * 60 * 1000; // 30 minutes in milliseconds

export const InfiltrationState = {
  successfulInfiltrationTimestamps: [] as number[],
};

export const cleanRecentInfiltrations = (): void => {
  const now = Date.now();
  // Keep only timestamps within the max effect time
  InfiltrationState.successfulInfiltrationTimestamps = InfiltrationState.successfulInfiltrationTimestamps.filter(
    (ts) => ts > now - MaxEffectTime && ts < now,
  );
};

// Calculates the infiltration reward multiplier based on how many and how recent other infiltrations were completed.
// Each infiltration completed reduces the demand for corporate espionage data for a little while, thus affecting the
// market demand.
export function calculateMarketDemandMultiplier(): number {
  cleanRecentInfiltrations();

  const marketDemandMultiplier = InfiltrationState.successfulInfiltrationTimestamps.reduce((mult, timestamp) => {
    // Effect on the market decreases to none as the infiltration event gets older
    const recencyFactor = 1 - (Date.now() - timestamp) / MaxEffectTime;
    const multiplier = Math.max(0.1, 1 - recencyFactor * 0.15);
    return mult * multiplier;
  }, 1);
  return clampNumber(marketDemandMultiplier, 0, 1);
}

function calculateRawDiff(stats: number, startingDifficulty: number): number {
  return clampNumber(startingDifficulty - Math.pow(stats, 0.9) / 250 - Player.skills.intelligence / 1600, 0);
}

export function calculateDifficulty(startingSecurityLevel: number): number {
  const totalStats =
    Player.skills.strength +
    Player.skills.defense +
    Player.skills.dexterity +
    Player.skills.agility +
    Player.skills.charisma;
  return calculateRawDiff(totalStats, startingSecurityLevel);
}

export function calculateReward(startingSecurityLevel: number): number {
  return clampNumber(calculateRawDiff(465, startingSecurityLevel), 0, 3) * calculateMarketDemandMultiplier();
}
