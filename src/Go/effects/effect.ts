import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { getGoPlayerStartingState, opponentDetails, opponentList, opponents } from "../boardState/goConstants";
import { Player } from "@player";
import { defaultMultipliers, mergeMultipliers, Multipliers } from "../../PersonObjects/Multipliers";
import { PlayerObject } from "../../PersonObjects/Player/PlayerObject";
import { formatPercent } from "../../ui/formatNumber";
import { getPlayerStats } from "../boardAnalysis/scoring";

/**
 * Calculates the effect size of the given player boost, based on the node power (points based on number of subnet
 * nodes captured and player wins) and effect power (scalar for individual boosts)
 */
export function CalculateEffect(nodes: number, faction: opponents): number {
  const power = getEffectPowerForFaction(faction);
  const sourceFileBonus = Player.sourceFileLvl(14) ? 1.25 : 1;
  return (
    1 + Math.log(nodes + 1) * Math.pow(nodes + 1, 0.3) * 0.004 * power * currentNodeMults.GoPower * sourceFileBonus
  );
}

export function getMaxFavor() {
  const sourceFileLevel = Player.sourceFileLvl(14);

  if (sourceFileLevel === 1) {
    return 90;
  }
  if (sourceFileLevel === 2) {
    return 100;
  }
  if (sourceFileLevel >= 3) {
    return 120;
  }

  return 80;
}

/**
 * Gets a formatted description of the current bonus from this faction
 */
export function getBonusText(opponent: opponents) {
  const nodePower = getPlayerStats(opponent).nodePower;
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
  [...opponentList, opponents.w0r1d_d43m0n].forEach((opponent) => {
    if (!Player.go?.status?.[opponent]) {
      Player.go = getGoPlayerStartingState();
    }

    const effect = CalculateEffect(getPlayerStats(opponent).nodePower, opponent);
    switch (opponent) {
      case opponents.Netburners:
        mults.hacknet_node_money *= effect;
        break;
      case opponents.SlumSnakes:
        mults.crime_success *= effect;
        break;
      case opponents.TheBlackHand:
        mults.hacking_money *= effect;
        break;
      case opponents.Tetrads:
        mults.strength *= effect;
        mults.dexterity *= effect;
        mults.agility *= effect;
        break;
      case opponents.Daedalus:
        mults.company_rep *= effect;
        mults.faction_rep *= effect;
        break;
      case opponents.Illuminati:
        mults.hacking_speed *= effect;
        break;
      case opponents.w0r1d_d43m0n:
        mults.hacking *= effect;
        break;
    }
  });
  return mults;
}

export function resetGoNodePower(player: PlayerObject) {
  opponentList.forEach((opponent) => {
    player.go.status[opponent].nodePower = 0;
    player.go.status[opponent].nodes = 0;
    player.go.status[opponent].winStreak = 0;
  });
}

export function playerHasDiscoveredGo() {
  const playedGame = Player.go.boardState.history.length || Player.go.previousGameFinalBoardState?.history?.length;
  const hasRecords = opponentList.find((opponent) => getPlayerStats(opponent).wins + getPlayerStats(opponent).losses);
  const isInBn14 = Player.bitNodeN === 14;

  // TODO: remove this once testing is completed
  const isInTesting = true;

  return !!(playedGame || hasRecords || isInBn14 || isInTesting);
}

function getEffectPowerForFaction(opponent: opponents) {
  return opponentDetails[opponent].bonusPower;
}

export function getEffectTypeForFaction(opponent: opponents) {
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
  const isTinyBoardVsIlluminati = boardSize === 5 && komi === opponentDetails[opponents.Illuminati].komi;
  return isTinyBoardVsIlluminati ? 8 : (komi + 0.5) * 0.25;
}
