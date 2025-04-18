import type { BoardState, OpponentStats } from "./Types";

import { GoColor, GoOpponent } from "@enums";
import { PartialRecord } from "../Types/Record";
import { EventEmitter } from "../utils/EventEmitter";

export const getEmptyHighlightedPoints = (size: number = 7) => {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => null));
};

export class GoObject {
  previousGame: BoardState | null = null;
  currentGame: BoardState = getEmptyBoardState();
  stats: PartialRecord<GoOpponent, OpponentStats> = {};
  storedCycles: number = 0;

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

function getEmptyBoardState() {
  return {
    previousBoards: [],
    previousPlayer: GoColor.white,
    ai: GoOpponent.Netburners,
    passCount: 0,
    cheatCount: 0,
    cheatCountForWhite: 0,
    komiOverride: null,
    highlightedPoints: Array.from({ length: 7 }, () => Array.from({ length: 7 }, () => null)),
    board: Array.from({ length: 7 }, (_, x) =>
      Array.from({ length: 7 }, (_, y) => ({
        color: GoColor.empty,
        chain: "",
        liberties: null,
        x,
        y,
      })),
    ),
  };
}

export const Go = new GoObject();

/** Event emitter to allow the UI to subscribe to Go gameplay updates in order to trigger rerenders properly */
export const GoEvents = new EventEmitter();
