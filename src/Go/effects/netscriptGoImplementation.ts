import type { BoardState, Play } from "../Types";

import { Player } from "@player";
import { AugmentationName, GoColor, GoOpponent, GoPlayType, GoValidity } from "@enums";
import { Go, GoEvents } from "../Go";
import { getMove, sleep } from "../boardAnalysis/goAI";
import { getNewBoardState, makeMove, passTurn, updateCaptures, updateChains } from "../boardState/boardState";
import { evaluateIfMoveIsValid, getControlledSpace, simpleBoardFromBoard } from "../boardAnalysis/boardAnalysis";
import { getScore, resetWinstreak } from "../boardAnalysis/scoring";
import { WorkerScript } from "../../Netscript/WorkerScript";
import { WHRNG } from "../../Casino/RNG";

/**
 * Pass player's turn and await the opponent's response (or logs the end of the game if both players pass)
 */
export async function handlePassTurn(logger: (s: string) => void) {
  passTurn(Go.currentGame, GoColor.black);
  if (Go.currentGame.previousPlayer === null) {
    logEndGame(logger);
    return Promise.resolve({
      type: GoPlayType.gameOver,
      x: -1,
      y: -1,
      success: true,
    });
  }
  return getAIMove(logger, Go.currentGame);
}

/**
 * Validates and applies the player's router placement
 */
export async function makePlayerMove(logger: (s: string) => void, x: number, y: number) {
  const boardState = Go.currentGame;
  const validity = evaluateIfMoveIsValid(boardState, x, y, GoColor.black);
  const moveWasMade = makeMove(boardState, x, y, GoColor.black);

  if (validity !== GoValidity.valid || !moveWasMade) {
    await sleep(500);
    logger(`ERROR: Invalid move: ${validity}`);

    if (validity === GoValidity.notYourTurn) {
      logger("Do you have multiple scripts running, or did you forget to await makeMove() ?");
    }

    return Promise.resolve(invalidMoveResponse);
  }

  GoEvents.emit();
  logger(`Go move played: ${x}, ${y}`);
  const response = getAIMove(logger, boardState);
  await sleep(300);
  return response;
}

/**
 * Retrieves a move from the current faction in response to the player's move
 */
async function getAIMove(logger: (s: string) => void, boardState: BoardState, success = true): Promise<Play> {
  let resolve: (value: Play) => void;
  const aiMoveResult = new Promise<Play>((res) => {
    resolve = res;
  });

  getMove(boardState, GoColor.white, Go.currentGame.ai).then(async (result) => {
    // If a new game has started while this async code ran, drop it
    if (boardState !== Go.currentGame) {
      return resolve({ ...result, success: false });
    }
    if (result.type === "gameOver") {
      logEndGame(logger);
    }
    if (result.type !== GoPlayType.move) {
      return resolve({ ...result, success });
    }

    await sleep(400);
    const aiUpdatedBoard = makeMove(boardState, result.x, result.y, GoColor.white);
    if (!aiUpdatedBoard) {
      boardState.previousPlayer = GoColor.white;
      logger(`Invalid AI move attempted: ${result.x}, ${result.y}. This should not happen.`);
    } else {
      logger(`Opponent played move: ${result.x}, ${result.y}`);
    }
    GoEvents.emit();
    resolve({ ...result, success });
  });
  return aiMoveResult;
}

/**
 * Returns a grid of booleans indicating if the coordinates at that location are a valid move for the player (black pieces)
 */
export function getValidMoves() {
  const boardState = Go.currentGame;
  // Map the board matrix into true/false values
  return boardState.board.map((column, x) =>
    column.reduce((validityArray: boolean[], point, y) => {
      const isValid = evaluateIfMoveIsValid(boardState, x, y, GoColor.black) === GoValidity.valid;
      validityArray.push(isValid);
      return validityArray;
    }, []),
  );
}

/**
 * Returns a grid with an ID for each contiguous chain of same-state nodes (excluding dead/offline nodes)
 */
export function getChains() {
  const chains: string[] = [];
  // Turn the internal chain IDs into nice consecutive numbers for display to the player
  return Go.currentGame.board.map((column) =>
    column.reduce((chainIdArray: (number | null)[], point) => {
      if (!point) {
        chainIdArray.push(null);
        return chainIdArray;
      }
      if (!chains.includes(point.chain)) {
        chains.push(point.chain);
      }
      chainIdArray.push(chains.indexOf(point.chain));
      return chainIdArray;
    }, []),
  );
}

/**
 * Returns a grid of numbers representing the number of open-node connections each player-owned chain has.
 */
export function getLiberties() {
  return Go.currentGame.board.map((column) =>
    column.reduce((libertyArray: number[], point) => {
      libertyArray.push(point?.liberties?.length || -1);
      return libertyArray;
    }, []),
  );
}

/**
 * Returns a grid indicating which player, if any, controls the empty nodes by fully encircling it with their routers
 */
export function getControlledEmptyNodes() {
  const board = Go.currentGame.board;
  const controlled = getControlledSpace(board);
  return controlled.map((column, x: number) =>
    column.reduce((ownedPoints: string, owner: GoColor, y: number) => {
      if (owner === GoColor.white) {
        return ownedPoints + "O";
      }
      if (owner === GoColor.black) {
        return ownedPoints + "X";
      }
      if (!board[x][y]) {
        return ownedPoints + "#";
      }
      if (board[x][y]?.color === GoColor.empty) {
        return ownedPoints + "?";
      }
      return ownedPoints + ".";
    }, ""),
  );
}

/**
 * Handle post-game logging
 */
function logEndGame(logger: (s: string) => void) {
  const boardState = Go.currentGame;
  const score = getScore(boardState);
  logger(
    `Subnet complete! Final score: ${boardState.ai}: ${score[GoColor.white].sum},  Player: ${score[GoColor.black].sum}`,
  );
}

/**
 * Clears the board, resets winstreak if applicable
 */
export function resetBoardState(error: (s: string) => void, opponent: GoOpponent, boardSize: number) {
  if (![5, 7, 9, 13].includes(boardSize)) {
    error(`Invalid subnet size requested (${boardSize}), size must be 5, 7, 9, or 13`);
    return;
  }

  if (opponent === GoOpponent.w0r1d_d43m0n && !Player.hasAugmentation(AugmentationName.TheRedPill, true)) {
    error(`Invalid opponent requested (${opponent}), this opponent has not yet been discovered`);
    return;
  }

  const oldBoardState = Go.currentGame;
  if (oldBoardState.previousPlayer !== null && oldBoardState.previousBoard) {
    resetWinstreak(oldBoardState.ai, false);
  }

  Go.currentGame = getNewBoardState(boardSize, opponent, true);
  GoEvents.emit(); // Trigger a Go UI rerender
  return simpleBoardFromBoard(Go.currentGame.board);
}

/** Validate singularity access by throwing an error if the player does not have access. */
export function checkCheatApiAccess(error: (s: string) => void): void {
  const hasSourceFile = Player.sourceFileLvl(14) > 1;
  const isBitnodeFourteenTwo = Player.sourceFileLvl(14) === 1 && Player.bitNodeN === 14;
  if (!hasSourceFile && !isBitnodeFourteenTwo) {
    error(
      `The go.cheat API requires Source-File 14.2 to run, a power up you obtain later in the game.
      It will be very obvious when and how you can obtain it.`,
    );
  }
}

export const invalidMoveResponse: Play = {
  success: false,
  type: GoPlayType.invalid,
  x: -1,
  y: -1,
};

/**
 * Determines if the attempted cheat move is successful. If so, applies the cheat via the callback, and gets the opponent's response.
 *
 * If it fails, determines if the player's turn is skipped, or if the player is ejected from the subnet.
 */
export async function determineCheatSuccess(
  logger: (s: string) => void,
  callback: () => void,
  successRngOverride?: number,
  ejectRngOverride?: number,
): Promise<Play> {
  const state = Go.currentGame;
  const rng = new WHRNG(Player.totalPlaytime);
  // If cheat is successful, run callback
  if ((successRngOverride ?? rng.random()) <= cheatSuccessChance(state.cheatCount)) {
    callback();
    state.cheatCount++;
    GoEvents.emit();
    return getAIMove(logger, state, true);
  }
  // If there have been prior cheat attempts, and the cheat fails, there is a 10% chance of instantly losing
  else if (state.cheatCount && (ejectRngOverride ?? rng.random()) < 0.1) {
    logger(`Cheat failed! You have been ejected from the subnet.`);
    resetBoardState(logger, state.ai, state.board[0].length);
    return {
      type: GoPlayType.gameOver,
      x: -1,
      y: -1,
      success: false,
    };
  }
  // If the cheat fails, your turn is skipped
  else {
    logger(`Cheat failed. Your turn has been skipped.`);
    passTurn(state, GoColor.black, false);
    state.cheatCount++;
    return getAIMove(logger, state, false);
  }
}

/**
 * Cheating success rate scales with player's crime success rate, and decreases with prior cheat attempts.
 */
export function cheatSuccessChance(cheatCount: number) {
  const sourceFileBonus = Player.sourceFileLvl(14) === 3 ? 1.25 : 1;
  return Math.min(0.6 * 0.65 ** cheatCount * Player.mults.crime_success * sourceFileBonus, 1);
}

/**
 * Throw a runtime error that halts the player's script
 */
export function throwError(ws: WorkerScript, errorMessage: string) {
  throw `RUNTIME ERROR\n${ws.name}@${ws.hostname} (PID - ${ws.pid})\n\n ${errorMessage}`;
}

/**
 * Attempts to remove an existing router from the board. Can fail. If failed, can immediately end the game
 */
export function cheatRemoveRouter(
  logger: (s: string) => void,
  x: number,
  y: number,
  successRngOverride?: number,
  ejectRngOverride?: number,
) {
  const point = Go.currentGame.board[x][y];
  if (!point) {
    logger(`The node ${x},${y} is offline, so you cannot clear this point with removeRouter().`);
    return invalidMoveResponse;
  }
  if (point.color === GoColor.empty) {
    logger(`The point ${x},${y} does not have a router on it, so you cannot clear this point with removeRouter().`);
    return invalidMoveResponse;
  }
  return determineCheatSuccess(
    logger,
    () => {
      point.color = GoColor.empty;
      updateChains(Go.currentGame.board);
      Go.currentGame.previousPlayer = GoColor.black;
      logger(`Cheat successful. The point ${x},${y} was cleared.`);
    },
    successRngOverride,
    ejectRngOverride,
  );
}

/**
 * Attempts play two moves at once. Can fail. If failed, can immediately end the game
 */
export function cheatPlayTwoMoves(
  logger: (s: string) => void,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  successRngOverride?: number,
  ejectRngOverride?: number,
) {
  const point1 = Go.currentGame.board[x1][y1];
  if (!point1) {
    logger(`The node ${x1},${y1} is offline, so you cannot place a router there.`);
    return invalidMoveResponse;
  }
  if (point1.color !== GoColor.empty) {
    logger(`The point ${x1},${y1} is not empty, so you cannot place a router there.`);
    return invalidMoveResponse;
  }
  const point2 = Go.currentGame.board[x2][y2];
  if (!point2) {
    logger(`The node ${x2},${y2} is offline, so you cannot place a router there.`);
    return invalidMoveResponse;
  }
  if (point2.color !== GoColor.empty) {
    logger(`The point ${x2},${y2} is not empty, so you cannot place a router there.`);
    return invalidMoveResponse;
  }

  return determineCheatSuccess(
    logger,
    () => {
      point1.color = GoColor.black;
      point2.color = GoColor.black;
      updateCaptures(Go.currentGame.board, GoColor.black);
      Go.currentGame.previousPlayer = GoColor.black;

      logger(`Cheat successful. Two go moves played: ${x1},${y1} and ${x2},${y2}`);
    },
    successRngOverride,
    ejectRngOverride,
  );
}

export function cheatRepairOfflineNode(
  logger: (s: string) => void,
  x: number,
  y: number,
  successRngOverride?: number,
  ejectRngOverride?: number,
) {
  const point = Go.currentGame.board[x][y];
  if (point) {
    logger(`The node ${x},${y} is not offline, so you cannot repair the node.`);
    return invalidMoveResponse;
  }

  return determineCheatSuccess(
    logger,
    () => {
      Go.currentGame.board[x][y] = {
        chain: "",
        liberties: null,
        y,
        color: GoColor.empty,
        x,
      };
      updateChains(Go.currentGame.board);
      Go.currentGame.previousPlayer = GoColor.black;
      logger(`Cheat successful. The point ${x},${y} was repaired.`);
    },
    successRngOverride,
    ejectRngOverride,
  );
}

export function cheatDestroyNode(
  logger: (s: string) => void,
  x: number,
  y: number,
  successRngOverride?: number,
  ejectRngOverride?: number,
) {
  const point = Go.currentGame.board[x][y];
  if (!point) {
    logger(`The node ${x},${y} is already offline, so you cannot destroy the node.`);
    return invalidMoveResponse;
  }
  if (point.color !== GoColor.empty) {
    logger(`The point ${x},${y} is not empty, so you cannot destroy this node.`);
    return invalidMoveResponse;
  }

  return determineCheatSuccess(
    logger,
    () => {
      Go.currentGame.board[x][y] = null;
      updateChains(Go.currentGame.board);
      Go.currentGame.previousPlayer = GoColor.black;
      logger(`Cheat successful. The point ${x},${y} was destroyed.`);
    },
    successRngOverride,
    ejectRngOverride,
  );
}
