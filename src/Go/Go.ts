import type { BoardState, OpponentStats, Play } from "./Types";

import { GoPlayType, type GoOpponent } from "@enums";
import { getRecordValues, PartialRecord } from "../Types/Record";
import { getNewBoardState } from "./boardState/boardState";
import { EventEmitter } from "../utils/EventEmitter";

export class GoObject {
  // Todo: Make previous game a slimmer interface
  previousGame: BoardState | null = null;
  currentGame: BoardState = getNewBoardState(7);
  stats: PartialRecord<GoOpponent, OpponentStats> = {};
  nextTurn: Promise<Play> = Promise.resolve({ type: GoPlayType.gameOver, x: null, y: null });
  storedCycles: number = 0;

  prestigeAugmentation() {
    for (const stats of getRecordValues(this.stats)) {
      stats.nodePower = 0;
      stats.nodes = 0;
      stats.winStreak = 0;
    }
  }
  prestigeSourceFile() {
    this.previousGame = null;
    this.currentGame = getNewBoardState(7);
    this.stats = {};
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
