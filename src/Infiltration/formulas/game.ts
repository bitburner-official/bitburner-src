import { Player } from "@player";

export const MaxDif = 4.5;
export const maxEffectTime = 30 * 60 * 1000; // 30 minutes in milliseconds

export const InfiltrationState = {
  successfulInfiltrationTimestamps: [] as Date[],
};

export const cleanRecentInfiltrations = (): void => {
  // Keep only timestamps within the max effect time
  InfiltrationState.successfulInfiltrationTimestamps = InfiltrationState.successfulInfiltrationTimestamps.filter(
    (t) => t > new Date(Date.now() - maxEffectTime),
  );
};

// Calculates the infiltration reward multiplier based on how many and how recent other infiltrations were completed.
// Each infiltration completed reduces the demand for corporate espionage data for a little while, thus affecting the market rate.
export function calculateMarketRateMultiplier(): number {
  cleanRecentInfiltrations();

  return InfiltrationState.successfulInfiltrationTimestamps.reduce((mult, timestamp) => {
    // Effect on the market decreases to none as the infiltration event gets older
    const recencyFactor = 1 - (Date.now() - timestamp.getTime()) / maxEffectTime;
    const multiplier = Math.max(0.1, 1 - recencyFactor * 0.15);
    return mult * multiplier;
  }, 1);
}

function calculateRawDiff(stats: number, startingDifficulty: number): number {
  const difficulty = startingDifficulty - Math.pow(stats, 0.92) / 250 - Player.skills.intelligence / 1600;
  return Math.max(difficulty, 0);
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
  return calculateRawDiff(startingSecurityLevel * 115, startingSecurityLevel) * calculateMarketRateMultiplier();
}
