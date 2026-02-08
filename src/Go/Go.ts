import type { BoardState, OpponentStats } from "./Types";

import { GoOpponent } from "@enums";
import { getRecordKeys, PartialRecord } from "../Types/Record";
import { resetGoPromises } from "./boardAnalysis/goAI";
import { getNewBoardState } from "./boardState/boardState";
import { EventEmitter } from "../utils/EventEmitter";
import { Player } from "@player";
import { AugmentationName } from "@enums";
import { newOpponentStats } from "./Constants";

export const getEmptyHighlightedPoints = (size: number = 7) => {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => null));
};

export class GoObject {
  // Todo: Make previous game a slimmer interface
  previousGame: BoardState | null = null;
  currentGame: BoardState = getNewBoardState(7);
  stats: PartialRecord<GoOpponent, OpponentStats> = {};
  storedCycles: number = 0;
  // This flag is used when checking the achievement CHALLENGE_BN14.
  moveOrCheatViaApi = false;

  prestigeAugmentation() {
    if (
      Player.bitNodeN === 14 &&
      Player.hasAugmentation(AugmentationName.TheRedPill) &&
      !Go.stats[GoOpponent.w0r1d_d43m0n]
    ) {
      // Show the secret opponent on the go stats page in BN14 if the player has TRP
      Go.stats[GoOpponent.w0r1d_d43m0n] = newOpponentStats();
    }
    // Clear out stats except for reputation as favor from winstreaks on prestige
    for (const opponent of getRecordKeys(Go.stats)) {
      const stats = Go.stats[opponent];
      if (!stats) {
        continue;
      }
      stats.wins = 0;
      stats.losses = 0;
      stats.nodes = 0;
      stats.nodePower = 0;
      stats.winStreak = 0;
      stats.oldWinStreak = 0;
      stats.highestWinStreak = 0;
    }
  }
  prestigeSourceFile() {
    this.previousGame = null;
    this.currentGame = getNewBoardState(7);
    this.stats = {};
    this.moveOrCheatViaApi = false;
    resetGoPromises();
  }

  /**
   * Stores offline time that is consumed to speed up the AI.
   * Only stores offline time if the player has actually been using the mechanic.
   */
  storeCycles(offlineCycles: number) {
    if (this.previousGame) {
      this.storedCycles += offlineCycles ?? 0;
    }
  }
}

export const Go = new GoObject();

/** Event emitter to allow the UI to subscribe to Go gameplay updates in order to trigger rerenders properly */
export const GoEvents = new EventEmitter();
