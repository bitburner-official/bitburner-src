import type { BoardState, OpponentStats } from "./Types";

import type { GoOpponent } from "@enums";
import { getRecordKeys, PartialRecord } from "../Types/Record";
import { resetGoPromises } from "./boardAnalysis/goAI";
import { getNewBoardState } from "./boardState/boardState";
import { EventEmitter } from "../utils/EventEmitter";
import { newOpponentStats } from "./Constants";

export class GoObject {
  // Todo: Make previous game a slimmer interface
  previousGame: BoardState | null = null;
  currentGame: BoardState = getNewBoardState(7);
  stats: PartialRecord<GoOpponent, OpponentStats> = {};
  storedCycles: number = 0;

  prestigeAugmentation() {
    for (const opponent of getRecordKeys(Go.stats)) {
      Go.stats[opponent] = newOpponentStats();
    }
  }
  prestigeSourceFile() {
    this.previousGame = null;
    this.currentGame = getNewBoardState(7);
    this.stats = {};
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
