import type { GoOpponent } from "./Enums";
import type { BoardState, OpponentStats } from "./Types";

import { getRecordValues, PartialRecord } from "../Types/Record";
import { getNewBoardState } from "./boardState/boardState";

class GoObject {
  // Todo: Make previous game a slimmer interface
  previousGame: BoardState | null = null;
  currentGame: BoardState = getNewBoardState(5);
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
    this.currentGame = getNewBoardState(7);
    this.stats = {};
  }
}

export const Go = new GoObject();
