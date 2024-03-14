import type { BoardState, Play } from "../Types";

import { Player } from "@player";
import { AugmentationName, GoColor, GoOpponent, GoPlayType, GoValidity } from "@enums";
import { Go, GoEvents } from "../Go";
import { getMove, sleep } from "../boardAnalysis/goAI";
import { getNewBoardState, makeMove, passTurn, updateCaptures, updateChains } from "../boardState/boardState";
import {
  evaluateIfMoveIsValid,
  getColorOnSimpleBoard,
  getControlledSpace,
  simpleBoardFromBoard,
} from "../boardAnalysis/boardAnalysis";
import { getScore, resetWinstreak } from "../boardAnalysis/scoring";
import { WorkerScript } from "../../Netscript/WorkerScript";
import { WHRNG } from "../../Casino/RNG";

/**
 * Check the move based on the current settings
 */
export function validateMove(error: (s: string) => void, x: number, y: number, methodName = "", settings = {}) {
  const check = {
    emptyNode: true,
    requireNonEmptyNode: false,
    repeat: true,
    onlineNode: true,
    requireOfflineNode: false,
    suicide: true,
    ...settings,
  };

  const boardSize = Go.currentGame.board.length;
  if (x < 0 || x >= boardSize) {
    error(`Invalid column number (x = ${x}), column must be a number 0 through ${boardSize - 1}`);
  }
  if (y < 0 || y >= boardSize) {
    error(`Invalid row number (y = ${y}), row must be a number 0 through ${boardSize - 1}`);
  }

  const moveString = `${methodName} ${x},${y}: `;
  validateTurn(error, moveString);

  const validity = evaluateIfMoveIsValid(Go.currentGame, x, y, GoColor.black);
  const point = Go.currentGame.board[x][y];
  if (!point && check.onlineNode) {
    error(
      `The node ${x},${y} is offline, so you cannot ${
        methodName === "removeRouter"
          ? "clear this point with removeRouter()"
          : methodName === "destroyNode"
          ? "destroy the node. (Attempted to destroyNode)"
          : "place a router there"
      }.`,
    );
  }
  if (validity === GoValidity.noSuicide && check.suicide) {
    error(
      `${moveString} ${validity}. That point has no neighboring empty nodes, and is not connected to a network with access to empty nodes, meaning it would be instantly captured if played there.`,
    );
  }
  if (validity === GoValidity.boardRepeated && check.repeat) {
    error(
      `${moveString} ${validity}. That move would repeat the previous board state, which is illegal as it leads to infinite loops.`,
    );
  }
  if (point?.color !== GoColor.empty && check.emptyNode) {
    error(
      `The point ${x},${y} is occupied by a router, so you cannot ${
        methodName === "destroyNode" ? "destroy this node. (Attempted to destroyNode)" : "place a router there"
      }`,
    );
  }

  if (point?.color === GoColor.empty && check.requireNonEmptyNode) {
    error(`The point ${x},${y} does not have a router on it, so you cannot clear this point with removeRouter().`);
  }
  if (point && check.requireOfflineNode) {
    error(`The node ${x},${y} is not offline, so you cannot repair the node.`);
  }
}

export function validateTurn(error: (s: string) => void, moveString = "") {
  if (Go.currentGame.previousPlayer === GoColor.black) {
    error(
      `${moveString} ${GoValidity.notYourTurn}. Do you have multiple scripts running, or did you forget to await makeMove() or opponentNextTurn()`,
    );
  }
  if (Go.currentGame.previousPlayer === null) {
    error(
      `${moveString} ${GoValidity.gameOver}. You cannot make more moves. Start a new game using resetBoardState().`,
    );
  }
}

/**
 * Pass player's turn and await the opponent's response (or logs the end of the game if both players pass)
 */
export async function handlePassTurn(logger: (s: string) => void) {
  passTurn(Go.currentGame, GoColor.black);
  logger("Go turn passed.");

  if (Go.currentGame.previousPlayer === null) {
    logEndGame(logger);
    return getOpponentNextMove(false, logger);
  } else {
    return getAIMove(Go.currentGame);
  }
}

/**
 * Validates and applies the player's router placement
 */
export async function makePlayerMove(logger: (s: string) => void, error: (s: string) => void, x: number, y: number) {
  const boardState = Go.currentGame;
  const validity = evaluateIfMoveIsValid(boardState, x, y, GoColor.black);
  const moveWasMade = makeMove(boardState, x, y, GoColor.black);

  if (validity !== GoValidity.valid || !moveWasMade) {
    errorOnInvalidMove(error, validity, `(Played ${x} ${y})`);
  }

  GoEvents.emit();
  logger(`Go move played: ${x}, ${y}`);
  return getAIMove(boardState);
}

/**
  Returns the promise that provides the opponent's move, once it finishes thinking.
 */
export async function getOpponentNextMove(logOpponentMove = true, logger: (s: string) => void) {
  // Handle the case where Go.nextTurn isn't populated yet
  if (!Go.nextTurn) {
    const previousMove = getPreviousMove();
    const type =
      Go.currentGame.previousPlayer === null ? GoPlayType.gameOver : previousMove ? GoPlayType.move : GoPlayType.pass;

    Go.nextTurn = Promise.resolve({
      success: false,
      type,
      x: previousMove?.[0] ?? null,
      y: previousMove?.[1] ?? null,
    });
  }

  // Only asynchronously log the opponent move if not disabled by the player
  if (logOpponentMove) {
    return Go.nextTurn.then((move) => {
      if (move.type === GoPlayType.gameOver) {
        logEndGame(logger);
      } else if (move.type === GoPlayType.pass) {
        logger(`Opponent passed their turn. You can end the game by passing as well.`);
      } else if (move.type === GoPlayType.move) {
        logger(`Opponent played move: ${move.x}, ${move.y}`);
      }
      return move;
    });
  }

  return Go.nextTurn;
}

/**
  Throw an error on invalid move, and provide some feedback as to what happened and why.
 */
function errorOnInvalidMove(error: (s: string) => void, validity: GoValidity, moveString: string) {
  error(
    `ERROR: Invalid move: ${validity}. ${moveString}  ${
      validity === GoValidity.notYourTurn
        ? "Do you have multiple scripts running, or did you forget to await makeMove() or opponentNextTurn()?"
        : ""
    }${
      validity === GoValidity.noSuicide
        ? "That point has no neighboring empty nodes, and is not connected to a network with access to empty nodes."
        : ""
    }${
      validity === GoValidity.boardRepeated
        ? "That move would repeat the previous board state, which is illegal as it leads to infinite loops."
        : ""
    }`,
  );
}

/**
 * Retrieves a move from the current faction in response to the player's move
 */
export async function getAIMove(boardState: BoardState, success = true): Promise<Play> {
  let resolve: (value: Play) => void;
  Go.nextTurn = new Promise<Play>((res) => {
    resolve = res;
  });

  getMove(boardState, GoColor.white, Go.currentGame.ai).then(async (result) => {
    // If a new game has started while this async code ran, drop it
    if (boardState !== Go.currentGame) {
      return resolve({ ...result, success: false });
    }
    if (result.type !== GoPlayType.move || result.x === null || result.y === null) {
      return resolve({ ...result, success });
    }

    await sleep(400);
    const aiUpdatedBoard = makeMove(boardState, result.x, result.y, GoColor.white);

    // Handle the AI breaking. This shouldn't ever happen.
    if (!aiUpdatedBoard) {
      boardState.previousPlayer = GoColor.white;
      console.error(`Invalid AI move attempted: ${result.x}, ${result.y}. This should not happen.`);
      GoEvents.emit();
      return resolve({ ...result, success: false });
    }

    await sleep(300);
    GoEvents.emit();
    resolve({ ...result, success });
  });
  return Go.nextTurn;
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
 * Gets the status of the current game.
 * Shows the current player, current score, and the previous move coordinates.
 * Previous move coordinates will be [-1, -1] for a pass, or if there are no prior moves.
 */
export function getGameState() {
  const currentPlayer = getCurrentPlayer();
  const score = getScore(Go.currentGame);
  const previousMove = getPreviousMove();

  return {
    currentPlayer,
    whiteScore: score[GoColor.white].sum,
    blackScore: score[GoColor.black].sum,
    previousMove,
  };
}

/**
 * Returns 'None' if the game is over, otherwise returns the color of the current player's turn
 */
export function getCurrentPlayer(): "None" | "White" | "Black" {
  if (Go.currentGame.previousPlayer === null) {
    return "None";
  }
  return Go.currentGame.previousPlayer === GoColor.black ? GoColor.white : GoColor.black;
}

/**
 * Find a move made by the previous player, if present.
 */
export function getPreviousMove(): [number, number] | null {
  if (Go.currentGame.passCount) {
    return null;
  }

  const priorBoard = Go.currentGame?.previousBoard;
  for (const rowIndexString in Go.currentGame.board) {
    const row = Go.currentGame.board[+rowIndexString] ?? [];
    for (const pointIndexString in row) {
      const point = row[+pointIndexString];
      const priorColor = point && priorBoard && getColorOnSimpleBoard(priorBoard, point.x, point.y);
      const currentColor = point?.color;
      const isPreviousPlayer = currentColor === Go.currentGame.previousPlayer;
      const isChanged = priorColor !== currentColor;
      if (priorColor && currentColor && isPreviousPlayer && isChanged) {
        return [+rowIndexString, +pointIndexString];
      }
    }
  }

  return null;
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
  x: null,
  y: null,
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
    return getAIMove(state, true);
  }
  // If there have been prior cheat attempts, and the cheat fails, there is a 10% chance of instantly losing
  else if (state.cheatCount && (ejectRngOverride ?? rng.random()) < 0.1) {
    logger(`Cheat failed! You have been ejected from the subnet.`);
    resetBoardState(logger, state.ai, state.board[0].length);
    return {
      type: GoPlayType.gameOver,
      x: null,
      y: null,
      success: false,
    };
  }
  // If the cheat fails, your turn is skipped
  else {
    logger(`Cheat failed. Your turn has been skipped.`);
    passTurn(state, GoColor.black, false);
    state.cheatCount++;
    return getAIMove(state, false);
  }
}

/**
 * Cheating success rate scales with player's crime success rate, and decreases with prior cheat attempts.
 */
export function cheatSuccessChance(cheatCount: number) {
  return Math.min(0.6 * (0.8 ^ cheatCount) * Player.mults.crime_success, 1);
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
  const point = Go.currentGame.board[x][y]!;
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
  const point1 = Go.currentGame.board[x1][y1]!;
  const point2 = Go.currentGame.board[x2][y2]!;

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
