import { BoardState, opponentList, Play, playerColors, playTypes, validityReason } from "../boardState/goConstants";
import { getMove, sleep } from "../boardAnalysis/goAI";
import { Player } from "@player";
import {
  getNewBoardState,
  getStateCopy,
  makeMove,
  passTurn,
  updateCaptures,
  updateChains,
} from "../boardState/boardState";
import { evaluateIfMoveIsValid, getControlledSpace, getSimplifiedBoardState } from "../boardAnalysis/boardAnalysis";
import { getScore, resetWinstreak } from "../boardAnalysis/scoring";
import { WorkerScript } from "../../Netscript/WorkerScript";
import { WHRNG } from "../../Casino/RNG";

/**
 * Pass player's turn and await the opponent's response (or logs the end of the game if both players pass)
 */
export async function handlePassTurn(logger: (s: string) => void) {
  passTurn(Player.go.boardState, playerColors.black);
  if (Player.go.boardState.previousPlayer === null) {
    logEndGame(logger);
    return Promise.resolve({
      type: playTypes.gameOver,
      x: -1,
      y: -1,
      success: true,
    });
  }
  return getAIMove(logger, Player.go.boardState);
}

/**
 * Validates and applies the player's router placement
 */
export async function makePlayerMove(logger: (s: string) => void, x: number, y: number) {
  const validity = evaluateIfMoveIsValid(Player.go.boardState, x, y, playerColors.black);
  const result = makeMove(Player.go.boardState, x, y, playerColors.black);

  if (validity !== validityReason.valid || !result) {
    await sleep(500);
    logger(`ERROR: Invalid move: ${validity}`);

    if (validity === validityReason.notYourTurn) {
      logger("Do you have multiple scripts running, or did you forget to await makeMove() ?");
    }

    return Promise.resolve(invalidMoveResponse);
  }

  logger(`Go move played: ${x}, ${y}`);

  const playerUpdatedBoard = getStateCopy(result);
  return getAIMove(logger, playerUpdatedBoard);
}

/**
 * Retrieves a move from the current faction in response to the player's move
 */
async function getAIMove(logger: (s: string) => void, boardState: BoardState, success = true): Promise<Play> {
  let resolve: (value: Play) => void;
  const aiMoveResult = new Promise<Play>((res) => {
    resolve = res;
  });

  getMove(boardState, playerColors.white, Player.go.boardState.ai).then(async (result) => {
    // If a new game has started while this async code ran, drop it
    if (boardState.history.length > Player.go.boardState.history.length) {
      return resolve({ ...result, success: false });
    }
    if (result.type === "gameOver") {
      logEndGame(logger);
    }
    if (result.type !== playTypes.move) {
      Player.go.boardState = boardState;
      return resolve({ ...result, success });
    }

    const aiUpdatedBoard = makeMove(boardState, result.x, result.y, playerColors.white);
    if (!aiUpdatedBoard) {
      boardState.previousPlayer = playerColors.white;
      Player.go.boardState = boardState;
      logger(`Invalid AI move attempted: ${result.x}, ${result.y}. This should not happen.`);
    } else {
      Player.go.boardState = aiUpdatedBoard;
      logger(`Opponent played move: ${result.x}, ${result.y}`);
    }

    await sleep(200);
    resolve({ ...result, success });
  });
  return aiMoveResult;
}

/**
 * Returns a grid of booleans indicating if the coordinates at that location are a valid move for the player (black pieces)
 */
export function getValidMoves() {
  const boardState = Player.go.boardState;
  // Map the board matrix into true/false values
  return boardState.board.map((column, x) =>
    column.reduce((validityArray: boolean[], point, y) => {
      const isValid = evaluateIfMoveIsValid(boardState, x, y, playerColors.black) === validityReason.valid;
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
  return Player.go.boardState.board.map((column) =>
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
  return Player.go.boardState.board.map((column) =>
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
  const boardState = Player.go.boardState;
  const controlled = getControlledSpace(boardState);
  return controlled.map((column, x: number) =>
    column.reduce((ownedPoints: string, owner: playerColors, y: number) => {
      if (owner === playerColors.white) {
        return ownedPoints + "O";
      }
      if (owner === playerColors.black) {
        return ownedPoints + "X";
      }
      if (!boardState.board[x][y]) {
        return ownedPoints + "#";
      }
      if (boardState.board[x][y]?.player === playerColors.empty) {
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
  const boardState = Player.go.boardState;
  const score = getScore(boardState);
  logger(
    `Subnet complete! Final score: ${boardState.ai}: ${score[playerColors.white].sum},  Player: ${
      score[playerColors.black].sum
    }`,
  );
}

/**
 * Clears the board, resets winstreak if applicable
 */
export function resetBoardState(error: (s: string) => void, opponentString: string, boardSize: number) {
  const opponent = opponentList.find((faction) => faction === opponentString);

  if (![5, 7, 9, 13].includes(boardSize)) {
    error(`Invalid subnet size requested (${boardSize}, size must be 5, 7, 9, or 13`);
    return;
  }
  if (!opponent) {
    error(`Invalid opponent requested (${opponentString}), valid options are ${opponentList.join(", ")}`);
    return;
  }

  const oldBoardState = Player.go.boardState;
  if (oldBoardState.previousPlayer !== null && oldBoardState.history.length) {
    resetWinstreak(oldBoardState.ai, false);
  }

  Player.go.boardState = getNewBoardState(boardSize, opponent, true);
  return getSimplifiedBoardState(Player.go.boardState.board);
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
  type: playTypes.invalid,
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
  const state = Player.go.boardState;
  const rng = new WHRNG(Player.totalPlaytime);
  // If cheat is successful, run callback
  if ((successRngOverride ?? rng.random()) <= cheatSuccessChance(state.cheatCount)) {
    callback();
    state.cheatCount++;
    return getAIMove(logger, state, true);
  }
  // If there have been prior cheat attempts, and the cheat fails, there is a 10% chance of instantly losing
  else if (state.cheatCount && (ejectRngOverride ?? rng.random()) < 0.1) {
    logger(`Cheat failed! You have been ejected from the subnet.`);
    resetBoardState(logger, state.ai, state.board[0].length);
    return {
      type: playTypes.gameOver,
      x: -1,
      y: -1,
      success: false,
    };
  }
  // If the cheat fails, your turn is skipped
  else {
    logger(`Cheat failed. Your turn has been skipped.`);
    passTurn(state, playerColors.black, false);
    state.cheatCount++;
    return getAIMove(logger, state, false);
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
  const point = Player.go.boardState.board[x][y];
  if (!point) {
    logger(`The node ${x},${y} is offline, so you cannot clear this point with removeRouter().`);
    return invalidMoveResponse;
  }
  if (point.player === playerColors.empty) {
    logger(`The point ${x},${y} does not have a router on it, so you cannot clear this point with removeRouter().`);
    return invalidMoveResponse;
  }
  return determineCheatSuccess(
    logger,
    () => {
      point.player = playerColors.empty;
      Player.go.boardState = updateChains(Player.go.boardState);
      Player.go.boardState.previousPlayer = playerColors.black;
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
  const point1 = Player.go.boardState.board[x1][y1];
  if (!point1) {
    logger(`The node ${x1},${y1} is offline, so you cannot place a router there.`);
    return invalidMoveResponse;
  }
  if (point1.player !== playerColors.empty) {
    logger(`The point ${x1},${y1} is not empty, so you cannot place a router there.`);
    return invalidMoveResponse;
  }
  const point2 = Player.go.boardState.board[x2][y2];
  if (!point2) {
    logger(`The node ${x2},${y2} is offline, so you cannot place a router there.`);
    return invalidMoveResponse;
  }
  if (point2.player !== playerColors.empty) {
    logger(`The point ${x2},${y2} is not empty, so you cannot place a router there.`);
    return invalidMoveResponse;
  }

  return determineCheatSuccess(
    logger,
    () => {
      point1.player = playerColors.black;
      point2.player = playerColors.black;
      Player.go.boardState = updateCaptures(Player.go.boardState, playerColors.black);
      Player.go.boardState.previousPlayer = playerColors.black;

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
  const point = Player.go.boardState.board[x][y];
  if (point) {
    logger(`The node ${x},${y} is not offline, so you cannot repair the node.`);
    return invalidMoveResponse;
  }

  return determineCheatSuccess(
    logger,
    () => {
      Player.go.boardState.board[x][y] = {
        chain: "",
        liberties: null,
        y,
        player: playerColors.empty,
        x,
      };
      Player.go.boardState = updateChains(Player.go.boardState);
      Player.go.boardState.previousPlayer = playerColors.black;
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
  const point = Player.go.boardState.board[x][y];
  if (!point) {
    logger(`The node ${x},${y} is already offline, so you cannot destroy the node.`);
    return invalidMoveResponse;
  }
  if (point.player !== playerColors.empty) {
    logger(`The point ${x},${y} is not empty, so you cannot destroy this node.`);
    return invalidMoveResponse;
  }

  return determineCheatSuccess(
    logger,
    () => {
      Player.go.boardState.board[x][y] = null;
      Player.go.boardState = updateChains(Player.go.boardState);
      Player.go.boardState.previousPlayer = playerColors.black;
      logger(`Cheat successful. The point ${x},${y} was repaired.`);
    },
    successRngOverride,
    ejectRngOverride,
  );
}
