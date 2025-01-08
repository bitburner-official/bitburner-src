import { Player } from "@player";
import { calculateIntelligenceBonus } from "../PersonObjects/formulas/intelligence";
import { getCoreBonus } from "../Server/ServerHelpers";
import { clampNumber } from "../utils/helpers/clampNumber";

let sharePower = 1;

export const ShareBonusTime = 10000;

/**
 * When the player shares free RAM via UI, it's a "pending job". After that job finishes, we restore the free RAM by
 * decreasing server.ramUsed by calling server.updateRamUsed(). However, if the player prestiges before that, all
 * servers are reset and ramUsed is reset to 0. This means that when a job finishes, we may modify ramUsed of a new
 * server.
 *
 * To solve this problem, we use an array to save job IDs. When the player prestiges, we clear this array. When a job
 * finishes, we check if that job ID is still in this array. If it is not, it means that the player performed a
 * prestige, and we do not need to decrease ramUsed.
 */
export const pendingUIShareJobIds: number[] = [];

export function calculateEffectiveSharedThreads(threads: number, cpuCores: number): number {
  const coreBonus = getCoreBonus(cpuCores);
  return threads * calculateIntelligenceBonus(Player.skills.intelligence, 2) * coreBonus;
}

export function startSharing(threads: number, cpuCores: number): () => void {
  const effectiveThreads = calculateEffectiveSharedThreads(threads, cpuCores);
  sharePower += effectiveThreads;
  return () => {
    /**
     * Due to floating point inaccuracy, sharePower may be slightly higher or lower than 1 after many times the player
     * shares their RAM. We need to make sure that it's not smaller than 1.
     */
    sharePower = clampNumber(sharePower - effectiveThreads, 1);
    // sharePower may be slightly higher than 1. Reset sharePower if it's smaller than a threshold.
    if (sharePower < 1.00001) {
      sharePower = 1;
    }
  };
}

function calculateShareBonus(sharePower: number): number {
  const bonus = 1 + Math.log(sharePower) / 25;
  if (!Number.isFinite(bonus)) {
    return 1;
  }
  return bonus;
}

export function calculateShareBonusWithAdditionalThreads(threads: number, cpuCores: number): number {
  return calculateShareBonus(sharePower + calculateEffectiveSharedThreads(threads, cpuCores));
}

export function calculateCurrentShareBonus(): number {
  return calculateShareBonus(sharePower);
}
