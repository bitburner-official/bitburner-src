import { Play, SimpleOpponentStats } from "../Types";

import { Player } from "@player";
import { AugmentationName, GoColor, GoOpponent, GoPlayType, GoValidity } from "@enums";
import { Go, GoEvents } from "../Go";
import { getNewBoardState, makeMove, passTurn, updateCaptures, updateChains } from "../boardState/boardState";
import { makeAIMove } from "../boardAnalysis/goAI";
import {
  evaluateIfMoveIsValid,
  getControlledSpace,
  getPreviousMove,
  simpleBoardFromBoard,
} from "../boardAnalysis/boardAnalysis";
import { getOpponentStats, getScore, resetWinstreak } from "../boardAnalysis/scoring";
import { WHRNG } from "../../Casino/RNG";
import { getRecordKeys } from "../../Types/Record";
import { CalculateEffect, getEffectTypeForFaction } from "./effect";

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
    return makeAIMove(Go.currentGame);
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
    error(`Invalid move: ${x} ${y}. ${validity}.`);
  }

  GoEvents.emit();
  logger(`Go move played: ${x}, ${y}`);
  return makeAIMove(boardState);
}

/**
  Returns the promise that provides the opponent's move, once it finishes thinking.
 */
export async function getOpponentNextMove(logOpponentMove = true, logger: (s: string) => void) {
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
export function resetBoardState(
  logger: (s: string) => void,
  error: (s: string) => void,
  opponent: GoOpponent,
  boardSize: number,
) {
  if (![5, 7, 9, 13].includes(boardSize) && opponent !== GoOpponent.w0r1d_d43m0n) {
    error(`Invalid subnet size requested (${boardSize}), size must be 5, 7, 9, or 13`);
    return;
  }

  if (opponent === GoOpponent.w0r1d_d43m0n && !Player.hasAugmentation(AugmentationName.TheRedPill, true)) {
    error(`Invalid opponent requested (${opponent}), this opponent has not yet been discovered`);
    return;
  }

  const oldBoardState = Go.currentGame;
  if (oldBoardState.previousPlayer !== null && oldBoardState.previousBoards.length) {
    resetWinstreak(oldBoardState.ai, false);
  }

  Go.currentGame = getNewBoardState(boardSize, opponent, true);
  GoEvents.emit(); // Trigger a Go UI rerender
  logger(`New game started: ${opponent}, ${boardSize}x${boardSize}`);
  return simpleBoardFromBoard(Go.currentGame.board);
}

/**
 * Retrieve and clean up stats for each opponent played against
 */
export function getStats() {
  const statDetails: Partial<Record<GoOpponent, SimpleOpponentStats>> = {};
  for (const opponent of getRecordKeys(Go.stats)) {
    const details = getOpponentStats(opponent);
    const nodePower = getOpponentStats(opponent).nodePower;
    const effectPercent = (CalculateEffect(nodePower, opponent) - 1) * 100;
    const effectDescription = getEffectTypeForFaction(opponent);
    statDetails[opponent] = {
      wins: details.wins,
      losses: details.losses,
      winStreak: details.winStreak,
      highestWinStreak: details.highestWinStreak,
      favor: details.favor,
      bonusPercent: effectPercent,
      bonusDescription: effectDescription,
    };
  }

  return statDetails;
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
    return makeAIMove(state);
  }
  // If there have been prior cheat attempts, and the cheat fails, there is a 10% chance of instantly losing
  else if (state.cheatCount && (ejectRngOverride ?? rng.random()) < 0.1) {
    logger(`Cheat failed! You have been ejected from the subnet.`);
    resetBoardState(logger, logger, state.ai, state.board[0].length);
    return {
      type: GoPlayType.gameOver,
      x: null,
      y: null,
    };
  }
  // If the cheat fails, your turn is skipped
  else {
    logger(`Cheat failed. Your turn has been skipped.`);
    passTurn(state, GoColor.black, false);
    state.cheatCount++;
    return makeAIMove(state);
  }
}

/**
 * Cheating success rate scales with player's crime success rate, and decreases with prior cheat attempts.
 *
 * The source file bonus is additive success chance on top of the other multipliers.
 *
 * Cheat success chance required for N cheats with 100% success rate in a game:
 *
 * 1 100% success rate cheat requires +66% increased crime success rate
 * 2 100% success cheats: +145% increased crime success rate
 * 3: +282%
 * 4: +535%
 * 5: +1027%
 * 7: +4278%
 * 10: +59,854%
 * 12: +534,704%
 * 15: +31,358,645%
 */
export function cheatSuccessChance(cheatCount: number) {
  const sourceFileBonus = Player.sourceFileLvl(14) === 3 ? 0.25 : 0;
  const cheatCountScalar = (0.7 - 0.02 * cheatCount) ** cheatCount;
  return Math.max(Math.min(0.6 * cheatCountScalar * Player.mults.crime_success + sourceFileBonus, 1), 0);
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
