import type { BoardState, OpponentStats, SimpleBoard } from "./Types";
import type { PartialRecord } from "../Types/Record";

import { Truthy } from "lodash";
import { GoColor, GoOpponent } from "@enums";
import { Go } from "./Go";
import { boardStateFromSimpleBoard, simpleBoardFromBoard } from "./boardAnalysis/boardAnalysis";
import { assertLoadingType, isObject } from "../utils/TypeAssertion";
import { getEnumHelper } from "../utils/EnumHelper";
import { boardSizes } from "./Constants";
import { isInteger, isNumber } from "../types";
import { handleNextTurn, resetAI } from "./boardAnalysis/goAI";
import { getMaxRep } from "./effects/effect";

type PreviousGameSaveData = { ai: GoOpponent; board: SimpleBoard; previousPlayer: GoColor | null } | null;
type CurrentGameSaveData = PreviousGameSaveData & {
  previousBoard?: string;
  cheatCount: number;
  cheatCountForWhite: number;
  passCount: number;
};

type SaveFormat = {
  previousGame: PreviousGameSaveData;
  currentGame: CurrentGameSaveData;
  stats: PartialRecord<GoOpponent, OpponentStats>;
  storedCycles: number;
  moveOrCheatViaApi: boolean;
};

export function getGoSave(): SaveFormat {
  return {
    previousGame: Go.previousGame
      ? {
          ai: Go.previousGame.ai,
          board: simpleBoardFromBoard(Go.previousGame.board),
          previousPlayer: Go.previousGame.previousPlayer,
        }
      : null,
    currentGame: {
      ai: Go.currentGame.ai,
      board: simpleBoardFromBoard(Go.currentGame.board),
      previousBoard: Go.currentGame.previousBoards[0] ?? "",
      previousPlayer: Go.currentGame.previousPlayer,
      cheatCount: Go.currentGame.cheatCount,
      cheatCountForWhite: Go.currentGame.cheatCount,
      passCount: Go.currentGame.passCount,
    },
    stats: Go.stats,
    storedCycles: Go.storedCycles,
    moveOrCheatViaApi: Go.moveOrCheatViaApi,
  };
}

export function loadGo(data: unknown): boolean {
  /** Function for ending the loading process, showing an error if there is one, and indicating load success/failure */
  function showError(error: unknown): boolean {
    console.warn("Encountered the following issue while loading Go savedata:");
    console.error(error);
    console.warn("Savedata:");
    console.error(data);
    return false;
  }
  if (!data) return showError("There was no go savedata");
  // Parsing the savedata
  if (typeof data !== "string") return showError("Savedata was not a string");
  let parsedData;
  try {
    parsedData = JSON.parse(data) as unknown;
  } catch (e) {
    return showError(`Cannot JSON.parse the savedata: ${data}`);
  }
  if (!parsedData || typeof parsedData !== "object") return showError("Parsed savedata was not an object");
  assertLoadingType<SaveFormat>(parsedData);
  // currentGame
  const currentGame = loadCurrentGame(parsedData.currentGame);
  if (typeof currentGame === "string") return showError(currentGame);

  // previousGame
  const previousGame = loadPreviousGame(parsedData.previousGame);
  if (typeof previousGame === "string") return showError(previousGame);

  // stats
  const stats = loadStats(parsedData.stats);
  if (typeof stats === "string") return showError(stats);

  Go.currentGame = currentGame;
  Go.previousGame = previousGame;
  Go.stats = stats;
  Go.storeCycles(loadStoredCycles(parsedData.storedCycles));
  if (typeof parsedData.moveOrCheatViaApi === "boolean") {
    Go.moveOrCheatViaApi = parsedData.moveOrCheatViaApi;
  }

  resetAI();
  handleNextTurn(currentGame).catch((error) => {
    showError(new Error(`Error while initializing first IPvGO move: ${error}`, { cause: error }));
  });
  return true;
}

/** Loading for Go.currentGame
 * @returns The currentGame object if it can be loaded with no issues. IF there is an issue, a string is returned instead describing the issue.  */
function loadCurrentGame(currentGame: unknown): BoardState | string {
  if (!currentGame) return "Savedata did not contain a currentGame";
  assertLoadingType<CurrentGameSaveData>(currentGame);
  const ai = getEnumHelper("GoOpponent").getMember(currentGame.ai);
  if (!ai) return `currentGame had an invalid opponent: ${currentGame.ai}`;

  if (!Array.isArray(currentGame.board)) return "Non-array encountered while trying to load a board.";
  const requiredSize = currentGame.board.length;
  const board = loadSimpleBoard(currentGame.board, requiredSize);
  if (typeof board === "string") return board;
  const previousPlayer = getEnumHelper("GoColor").getMember(currentGame.previousPlayer) ?? null;
  const normalizedCheatCount = isInteger(currentGame.cheatCount) ? Math.max(0, currentGame.cheatCount || 0) : 0;
  const normalizedCheatCountForWhite = isInteger(currentGame.cheatCountForWhite)
    ? Math.max(0, currentGame.cheatCountForWhite || 0)
    : 0;
  if (!isInteger(currentGame.passCount) || currentGame.passCount < 0) return "invalid number for currentGame.passCount";
  const previousBoards =
    currentGame.previousBoard && typeof currentGame.previousBoard === "string" ? [currentGame.previousBoard] : [];

  const boardState = boardStateFromSimpleBoard(board, ai);
  boardState.previousPlayer = previousPlayer;
  boardState.cheatCount = normalizedCheatCount;
  boardState.cheatCountForWhite = normalizedCheatCountForWhite;
  boardState.passCount = currentGame.passCount;
  boardState.previousBoards = previousBoards;
  return boardState;
}

/** Loading for Go.previousGame
 * @returns The previousGame object if it can be loaded with no issues. IF there is an issue, a string is returned instead describing the issue.  */
function loadPreviousGame(previousGame: unknown): BoardState | null | string {
  if (!previousGame) return null;
  assertLoadingType<Truthy<PreviousGameSaveData>>(previousGame);
  const ai = getEnumHelper("GoOpponent").getMember(previousGame.ai);
  if (!ai) return `currentGame had an invalid opponent: ${previousGame.ai}`;

  if (!Array.isArray(previousGame.board)) return "Non-array encountered while trying to load a board.";
  const board = loadSimpleBoard(previousGame.board);
  if (typeof board === "string") return board;
  const previousPlayer = getEnumHelper("GoColor").getMember(previousGame.previousPlayer) ?? null;

  const boardState = boardStateFromSimpleBoard(board, ai);
  boardState.previousPlayer = previousPlayer;
  return boardState;
}

/** Loading for Go.stats
 * @returns The stats object if it can be loaded with no issues. IF there is an issue, a string is returned instead describing the issue.  */
function loadStats(stats: unknown): PartialRecord<GoOpponent, OpponentStats> | string {
  const finalStats: PartialRecord<GoOpponent, OpponentStats> = {};
  if (!stats) return "Savedata did not contain a stats object.";
  if (typeof stats !== "object") return "Non-object encountered for Go.stats";
  const entries: [string, unknown][] = Object.entries(stats);
  for (const [opponent, opponentStats] of entries) {
    if (!getEnumHelper("GoOpponent").isMember(opponent)) return `Invalid opponent in Go.stats: ${opponent}`;
    if (!isObject(opponentStats)) return "Non-object encountered for an opponent's stats";
    const { highestWinStreak, losses, nodes, wins, oldWinStreak, winStreak, nodePower } = opponentStats;
    // Integers >= 0. Todo: make a better helper for this.
    let rep;
    // We stored favor instead of rep in pre-v3.0.0.
    if ("favor" in opponentStats) {
      if (!isInteger(opponentStats.favor) || opponentStats.favor < 0) {
        return `A favor entry in Go.stats was invalid. Opponent: ${opponent}. Favor: ${opponentStats.favor}`;
      }
      /**
       * - Pre-v3.0.0: 1 favor each "winning two games in a row".
       * - V3+: 500/1000/1500/2000 rep each "winning two games in a row". "getMaxRep() / 200" is how we calculate
       * repToAdd in src\Go\boardAnalysis\scoring.ts.
       */
      rep = opponentStats.favor * (getMaxRep() / 200);
    } else {
      rep = opponentStats.rep;
    }
    if (!isInteger(rep) || rep < 0) return "A rep entry in Go.stats was invalid";
    if (!isInteger(highestWinStreak) || highestWinStreak < 0) return "A highestWinStreak entry in Go.stats was invalid";
    if (!isInteger(losses) || losses < 0) return "A losses entry in Go.stats was invalid";
    if (!isInteger(nodes) || nodes < 0) return "A nodes entry in Go.stats was invalid";
    if (!isInteger(wins) || wins < 0) return "A wins entry in Go.stats was invalid";

    // Integers with no clamping
    if (!isInteger(oldWinStreak)) return "An oldWinStreak entry in Go.stats was invalid";
    if (!isInteger(winStreak)) return "An oldWinStreak entry in Go.stats was invalid";

    // Numbers >= 0
    if (!isNumber(nodePower) || nodePower < 0) return "A nodePower entry in Go.stats was invalid";
    finalStats[opponent] = { rep, highestWinStreak, losses, nodes, wins, oldWinStreak, winStreak, nodePower };
  }
  return finalStats;
}

/** Loading for a SimpleBoard. Also used to load real boards, which are converted from simple boards higher up.
 * @returns The SimpleBoard object if it can be loaded with no issues. If there is an issue, a string is returned instead describing the issue. */
function loadSimpleBoard(simpleBoard: unknown, requiredSize?: number): SimpleBoard | string {
  if (!Array.isArray(simpleBoard)) return "Non-array encountered while trying to load a SimpleBoard.";
  requiredSize ??= simpleBoard.length;
  if (!boardSizes.includes(requiredSize)) return `Invalid board size when loading a SimpleBoard: ${requiredSize}`;
  if (simpleBoard.length !== requiredSize) return "Incorrect size while trying to load a SimpleBoard";
  if (!simpleBoard.every((column) => typeof column === "string" && column.length === requiredSize)) {
    return "Incorrect types or column size while loading a SimpleBoard.";
  }
  return simpleBoard as SimpleBoard;
}

function loadStoredCycles(storedCycles: unknown): number {
  if (!storedCycles || isNaN(+storedCycles)) {
    return 0;
  }

  return +storedCycles;
}
