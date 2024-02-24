import type { GoOpponent } from "./Enums";
import type { GameState, OpponentStats } from "./Types";

import { getRecordValues, PartialRecord } from "../Types/Record";
import { getNewBoardState } from "./boardState/boardState";

class GoObject {
  previousGame: GameState | null = null;
  currentGame: GameState = getNewBoardState(5);
  stats: PartialRecord<GoOpponent, OpponentStats> = {};

  prestigeAugmentation() {
    for (const stats of getRecordValues(this.stats)) {
      stats.nodePower = 0;
      stats.nodes = 0;
      stats.winStreak = 0;
    }
  }
  prestigeSourceFile() {
    this.previousGame = null;
    this.currentGame = getNewBoardState(5);
    this.stats = {};
  }
}

export const Go = new GoObject();
