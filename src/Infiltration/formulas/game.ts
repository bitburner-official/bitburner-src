import { Player } from "@player";
import { clampNumber } from "../../utils/helpers/clampNumber";

export const MaxDifficultyForInfiltration = 3.5;
// This value is typically denoted "lambda," and is the instantaneous rate of decay.
const DecayRate = -1e-5;
// This is the scalar for how much each floor completed affects the rewards for infiltration.
const MarketDemandFactor = 1e-3;

export const InfiltrationStateDefault = {
  lastChangeTimestamp: 0,
  floors: 0,
};
// Tracks an exponential moving average of number of successful infiltrations performed,
// which decays back to 0. This state is only updated after a successful infil.
export const InfiltrationState = { ...InfiltrationStateDefault };

function calculateCurrentInfilFloors(timestamp: number): number {
  return InfiltrationState.floors * Math.exp(DecayRate * (timestamp - InfiltrationState.lastChangeTimestamp));
}

// Calculates the infiltration reward multiplier based on how many and how recent other infiltrations were completed.
// Each infiltration completed reduces the demand for corporate espionage data for a little while, thus affecting the
// market demand.
export function calculateMarketDemandMultiplier(timestamp: number): number {
  const floors = calculateCurrentInfilFloors(timestamp);
  // A parabola is chosen because it is easy to analyze and tune. The constant
  // is a tuning factor, which primarily adjusts what the optimum rate of
  // auto-infil is, and thus how good auto-infil is. The optimum
  // marketDemandMultiplier will be 2/3 regardless of this constant.
  const marketDemandMultiplier = 1 - MarketDemandFactor * floors * floors;

  // Asymptote to 0 at very low market demand, so the UI can always show the demand rising over time
  // Without this, the demand can go far below 0%, and thus not visibly move for some time.
  if (marketDemandMultiplier < 0.03) {
    return clampNumber(0.94 ** floors, 0, 0.03);
  }

  return clampNumber(marketDemandMultiplier, 0, 1);
}

export function decreaseMarketDemandMultiplier(timestamp: number, floors: number) {
  InfiltrationState.floors = calculateCurrentInfilFloors(timestamp) + floors;
  InfiltrationState.lastChangeTimestamp = timestamp;
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
  return clampNumber(calculateRawDiff(465, startingSecurityLevel), 0, 3);
}
