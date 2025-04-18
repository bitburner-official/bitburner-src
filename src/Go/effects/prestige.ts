import { getRecordKeys } from "../../Types/Record";
import { getNewBoardState } from "../boardState/boardState";
import { resetGoPromises } from "../boardAnalysis/goAI";
import { Go } from "../Go";

export function prestigeGoAugmentation() {
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

export function prestigeGoSourceFile() {
  Go.previousGame = null;
  Go.currentGame = getNewBoardState(7);
  Go.stats = {};
  resetGoPromises();
}
