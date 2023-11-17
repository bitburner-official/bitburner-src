import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { getGoPlayerStartingState, opponentDetails, opponents } from "../boardState/goConstants";
import { floor } from "../boardState/boardState";
import { Player } from "@player";
import { defaultMultipliers, mergeMultipliers, Multipliers } from "../../PersonObjects/Multipliers";
import { PlayerObject } from "../../PersonObjects/Player/PlayerObject";

/**
 * Calculates the effect size of the given player boost, based on the node power (points based on number of subnet
 * nodes captured and player wins) and effect power (scalar for individual boosts)
 */
export function CalculateEffect(nodes: number, faction: opponents): number {
  const power = getEffectPowerForFaction(faction);
  const sourceFileBonus = Player.sourceFileLvl(14) ? 1.25 : 1;
  return (
    1 +
    (Math.log(nodes + 1) / 140) * Math.pow((nodes + 1) / 3, 0.3) * power * currentNodeMults.GoPower * sourceFileBonus
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
  const nodePower = Player.go.status[opponent].nodePower;
  const effectSize = formatPercent(CalculateEffect(nodePower, opponent));
  const effectDescription = getEffectTypeForFaction(opponent);
  return `${effectSize > 0 ? "+" : ""}${effectSize}% ${effectDescription}`;
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
  [
    opponents.Netburners,
    opponents.SlumSnakes,
    opponents.TheBlackHand,
    opponents.Daedalus,
    opponents.Illuminati,
  ].forEach((opponent) => {
    if (!Player.go?.status?.[opponent]) {
      Player.go = getGoPlayerStartingState();
    }

    const effect = CalculateEffect(Player.go.status[opponent].nodePower, opponent);
    switch (opponent) {
      case opponents.Netburners:
        mults.hacknet_node_purchase_cost *= effect;
        break;
      case opponents.SlumSnakes:
        mults.crime_success *= effect;
        break;
      case opponents.TheBlackHand:
        mults.hacking_exp *= effect;
        break;
      case opponents.Daedalus:
        mults.company_rep *= effect;
        mults.faction_rep *= effect;
        break;
      case opponents.Illuminati:
        mults.hacking_speed *= effect;
        break;
    }
  });
  return mults;
}

export function resetGoNodePower(player: PlayerObject) {
  [
    opponents.Netburners,
    opponents.SlumSnakes,
    opponents.TheBlackHand,
    opponents.Daedalus,
    opponents.Illuminati,
  ].forEach((opponent) => {
    player.go.status[opponent].nodePower = 0;
    player.go.status[opponent].nodes = 0;
    player.go.status[opponent].winStreak = 0;
  });
}

export function playerHasDiscoveredGo() {
  const playedGame = Player.go.boardState.history.length || Player.go.previousGameFinalBoardState?.history?.length;
  const hasRecords = [
    opponents.Netburners,
    opponents.SlumSnakes,
    opponents.TheBlackHand,
    opponents.Daedalus,
    opponents.Illuminati,
  ].find((opponent) => Player.go.status[opponent].wins + Player.go.status[opponent].losses);
  const isInBn14 = Player.bitNodeN === 14;

  // TODO: remove this once testing is completed
  const isInTesting = true;

  return !!(playedGame || hasRecords || isInBn14 || isInTesting);
}

function formatPercent(n: number) {
  return floor((n - 1) * 10000) / 100;
}

function getEffectPowerForFaction(opponent: opponents) {
  return opponentDetails[opponent].bonusPower;
}

export function getEffectTypeForFaction(opponent: opponents) {
  return opponentDetails[opponent].bonusDescription;
}

export function getWinstreakMultiplier(winStreak: number) {
  return winStreak ? 1.2 ** (winStreak - 1) : 0.5;
}

export function getDifficultyMultiplier(komi: number) {
  return (komi + 0.5) * 0.25;
}
