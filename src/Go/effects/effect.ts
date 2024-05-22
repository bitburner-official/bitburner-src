import { Player } from "@player";

import { GoOpponent } from "@enums";
import { Go } from "../Go";
import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { opponentDetails } from "../Constants";
import { defaultMultipliers, mergeMultipliers, Multipliers } from "../../PersonObjects/Multipliers";
import { formatPercent } from "../../ui/formatNumber";
import { getOpponentStats } from "../boardAnalysis/scoring";
import { getRecordEntries, getRecordValues } from "../../Types/Record";

/**
 * Calculates the effect size of the given player boost, based on the node power (points based on number of subnet
 * nodes captured and player wins) and effect power (scalar for individual boosts)
 */
export function CalculateEffect(nodes: number, faction: GoOpponent): number {
  const power = getEffectPowerForFaction(faction);
  const sourceFileBonus = Player.sourceFileLvl(14) ? 2 : 1;
  return (
    1 + Math.log(nodes + 1) * Math.pow(nodes + 1, 0.3) * 0.002 * power * currentNodeMults.GoPower * sourceFileBonus
  );
}

/**
 * Get maximum favor that you can gain from IPvGO win streaks
 * for factions you are a member of
 */
export function getMaxFavor() {
  const sourceFileLevel = Player.sourceFileLvl(14);

  if (sourceFileLevel === 1) {
    return 80;
  }
  if (sourceFileLevel === 2) {
    return 100;
  }
  if (sourceFileLevel >= 3) {
    return 120;
  }

  return 40;
}

/**
 * Gets a formatted description of the current bonus from this faction
 */
export function getBonusText(opponent: GoOpponent) {
  const nodePower = getOpponentStats(opponent).nodePower;
  const effectPercent = formatPercent(CalculateEffect(nodePower, opponent) - 1);
  const effectDescription = getEffectTypeForFaction(opponent);
  return `${effectPercent} ${effectDescription}`;
}

/**
 * Update the player object, using the multipliers gained from node power for each faction
 */
export function updateGoMults(): void {
  const mults = calculateMults();
  Player.mults = mergeMultipliers(Player.mults, mults);
  Player.updateSkillLevels();
}

/**
 * Creates a multiplier object based on the player's total node power for each faction
 */
function calculateMults(): Multipliers {
  const mults = defaultMultipliers();
  getRecordEntries(Go.stats).forEach(([opponent, stats]) => {
    const effect = CalculateEffect(stats.nodePower, opponent);
    switch (opponent) {
      case GoOpponent.Netburners:
        mults.hacknet_node_money *= effect;
        break;
      case GoOpponent.SlumSnakes:
        mults.crime_success *= effect;
        break;
      case GoOpponent.TheBlackHand:
        mults.hacking_money *= effect;
        break;
      case GoOpponent.Tetrads:
        mults.strength *= effect;
        mults.defense *= effect;
        mults.dexterity *= effect;
        mults.agility *= effect;
        break;
      case GoOpponent.Daedalus:
        mults.company_rep *= effect;
        mults.faction_rep *= effect;
        break;
      case GoOpponent.Illuminati:
        mults.hacking_speed *= effect;
        break;
      case GoOpponent.w0r1d_d43m0n:
        mults.hacking *= effect;
        break;
    }
  });
  return mults;
}

export function playerHasDiscoveredGo() {
  const playedGame = Go.currentGame.previousBoards.length;
  const hasRecords = getRecordValues(Go.stats).some((stats) => stats.wins + stats.losses);
  const isInBn14 = Player.bitNodeN === 14;

  return !!(playedGame || hasRecords || isInBn14);
}

function getEffectPowerForFaction(opponent: GoOpponent) {
  return opponentDetails[opponent].bonusPower;
}

export function getEffectTypeForFaction(opponent: GoOpponent) {
  return opponentDetails[opponent].bonusDescription;
}

export function getWinstreakMultiplier(winStreak: number, previousWinStreak: number) {
  if (winStreak < 0) {
    return 0.5;
  }
  // If you break a dry streak, gain extra bonus based on the length of the dry streak (up to 5x bonus)
  if (previousWinStreak < 0 && winStreak > 0) {
    const dryStreakBroken = -1 * previousWinStreak;
    return 1 + 0.5 * Math.min(dryStreakBroken, 8);
  }
  // Win streak bonus caps at x3
  return 1 + 0.25 * Math.min(winStreak, 8);
}

export function getDifficultyMultiplier(komi: number, boardSize: number) {
  const isTinyBoardVsIlluminati = boardSize === 5 && komi === opponentDetails[GoOpponent.Illuminati].komi;
  return isTinyBoardVsIlluminati ? 8 : (komi + 0.5) * 0.25;
}
