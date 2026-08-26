import { Board, BoardState, OpponentStats, Play, SimpleBoard, SimpleOpponentStats } from "../Types";

import { Player } from "@player";
import { AugmentationName, GoColor, GoOpponent, GoPlayType, GoValidity } from "@enums";
import { Go, GoEvents } from "../Go";
import {
  getNewBoardState,
  getNewBoardStateFromSimpleBoard,
  makeMove,
  passTurn,
  updateCaptures,
} from "../boardState/boardState";
import { getNextTurn, handleNextTurn, resetGoPromises } from "../boardAnalysis/goAI";
import {
  clearAllPointHighlights,
  evaluateIfMoveIsValid,
  getControlledSpace,
  getPreviousMove,
  simpleBoardFromBoard,
  simpleBoardFromBoardString,
} from "../boardAnalysis/boardAnalysis";
import { forceEndGoGame, getOpponentStats, getScore, resetWinstreak } from "../boardAnalysis/scoring";
import { WHRNG } from "../../Casino/RNG";
import { getRecordKeys } from "../../Types/Record";
import { CalculateEffect, getEffectTypeForFaction } from "./effect";
import { newOpponentStats } from "../Constants";
import { helpers } from "../../Netscript/NetscriptHelpers";
import type { NetscriptContext } from "../../Netscript/APIWrapper";
import { errorMessage } from "../../Netscript/ErrorMessages";

/**
 * Check the move based on the current settings
 */
export function validateMove(ctx: NetscriptContext, x: number, y: number, methodName = "", settings = {}): void {
  Go.moveOrCheatViaApi = true;
  const check = {
    emptyNode: true,
    requireNonEmptyNode: false,
    repeat: true,
    onlineNode: true,
    requireOfflineNode: false,
    suicide: true,
    playAsWhite: false,
    pass: false,
    ...settings,
  };

  const moveString = methodName + (check.pass ? "" : ` ${x},${y}`) + (check.playAsWhite ? " （白方）" : "") + ": ";
  const moveColor = check.playAsWhite ? GoColor.white : GoColor.black;

  if (check.playAsWhite) {
    validatePlayAsWhite(ctx);
  }
  validateTurn(ctx, moveString, moveColor);

  if (check.pass) {
    return;
  }

  const boardSize = Go.currentGame.board.length;
  if (x < 0 || x >= boardSize) {
    throw errorMessage(ctx, `无效的列号（x = ${x}），列号必须是 0 到 ${boardSize - 1} 之间的数字`);
  }
  if (y < 0 || y >= boardSize) {
    throw errorMessage(ctx, `无效的行号（y = ${y}），行号必须是 0 到 ${boardSize - 1} 之间的数字`);
  }

  const validity = evaluateIfMoveIsValid(Go.currentGame, x, y, moveColor);
  const point = Go.currentGame.board[x][y];
  if (!point && check.onlineNode) {
    throw errorMessage(
      ctx,
      `节点 ${x},${y} 已离线，因此无法${
        methodName === "removeRouter"
          ? "使用 removeRouter() 清除此位置"
          : methodName === "destroyNode"
          ? "摧毁该节点。（尝试调用 destroyNode）"
          : "在此放置路由器"
      }。`,
    );
  }
  if (validity === GoValidity.noSuicide && check.suicide) {
    throw errorMessage(
      ctx,
      `${moveString} ${validity}。该位置周围没有任何空节点，也不与任何连通空节点的网络相连，在此落子会立刻被提掉。`,
    );
  }
  if (validity === GoValidity.boardRepeated && check.repeat) {
    throw errorMessage(ctx, `${moveString} ${validity}。这步棋会重复之前的棋盘状态，属于违规，因为会导致无限循环。`);
  }
  if (point?.color !== GoColor.empty && check.emptyNode) {
    throw errorMessage(
      ctx,
      `位置 ${x},${y} 已有路由器占据，因此无法${
        methodName === "destroyNode" ? "摧毁该节点。（尝试调用 destroyNode）" : "在此放置路由器"
      }`,
    );
  }

  if (point?.color === GoColor.empty && check.requireNonEmptyNode) {
    throw errorMessage(ctx, `位置 ${x},${y} 上没有路由器，因此无法使用 removeRouter() 清除该位置。`);
  }
  if (point && check.requireOfflineNode) {
    throw errorMessage(ctx, `节点 ${x},${y} 并未离线，因此无法修复该节点。`);
  }
}

function validatePlayAsWhite(ctx: NetscriptContext) {
  if (Go.currentGame.ai !== GoOpponent.none) {
    throw errorMessage(ctx, `${GoValidity.invalid}。只有在与 'No AI' 对战时才能执白`);
  }

  if (Go.currentGame.previousPlayer === GoColor.white) {
    throw errorMessage(ctx, `${GoValidity.notYourTurn}。在对手落子之前，你不能执白落子或停一手。`);
  }
}

function validateTurn(ctx: NetscriptContext, moveString = "", color = GoColor.black) {
  if (Go.currentGame.previousPlayer === color) {
    throw errorMessage(
      ctx,
      `${moveString} ${GoValidity.notYourTurn}。你是否同时运行了多个脚本，或者忘记 await makeMove() 或 opponentNextTurn()`,
    );
  }
  if (Go.currentGame.previousPlayer === null) {
    throw errorMessage(
      ctx,
      `${moveString} ${GoValidity.gameOver}。不能再继续落子了。请使用 resetBoardState() 开始新对局。`,
    );
  }
}

/**
 * Pass player's turn and await the opponent's response (or logs the end of the game if both players pass)
 */
export function handlePassTurn(ctx: NetscriptContext, passAsWhite = false) {
  const color = passAsWhite ? GoColor.white : GoColor.black;
  passTurn(Go.currentGame, color);
  helpers.log(ctx, () => "已停一手。");
  if (Go.currentGame.previousPlayer === null) {
    logEndGame(ctx);
  }
  return handleNextTurn(Go.currentGame, true);
}

/**
 * Validates and applies the player's router placement
 */
export function makePlayerMove(ctx: NetscriptContext, x: number, y: number, playAsWhite = false) {
  const boardState = Go.currentGame;
  const color = playAsWhite ? GoColor.white : GoColor.black;
  const validity = evaluateIfMoveIsValid(boardState, x, y, color);
  const moveWasMade = makeMove(boardState, x, y, color);

  if (validity !== GoValidity.valid || !moveWasMade) {
    throw errorMessage(ctx, `无效落子：${x} ${y}。${validity}。`);
  }

  helpers.log(ctx, () => `已落子：${x}, ${y}${playAsWhite ? " （白方）" : ""}`);
  return handleNextTurn(boardState, true);
}

/**
  Returns the promise that provides the opponent's move, once it finishes thinking.
 */
export function getOpponentNextMove(ctx: NetscriptContext, logOpponentMove = true, playAsWhite = false) {
  const playerColor = playAsWhite ? GoColor.white : GoColor.black;
  const nextTurn = getNextTurn(playerColor);
  // Only asynchronously log the opponent move if not disabled by the player
  if (logOpponentMove) {
    return nextTurn.then((move) => {
      if (move.type === GoPlayType.gameOver) {
        logEndGame(ctx);
      } else if (move.type === GoPlayType.pass) {
        helpers.log(ctx, () => `对手停一手。你也可以停一手来结束对局。`);
      } else if (move.type === GoPlayType.move) {
        helpers.log(ctx, () => `对手落子：${move.x}, ${move.y}`);
      }
      return move;
    });
  }

  return nextTurn;
}

/**
 * Returns a grid of booleans indicating if the coordinates at that location are a valid move for the player
 */
export function getValidMoves(_boardState?: BoardState, playAsWhite = false) {
  const boardState = _boardState || Go.currentGame;
  const color = playAsWhite ? GoColor.white : GoColor.black;

  // If the game is over, or if it is not your turn, there are no valid moves
  if (!boardState.previousPlayer || boardState.previousPlayer === color) {
    return boardState.board.map((): boolean[] => Array(boardState.board.length).fill(false) as boolean[]);
  }

  // Map the board matrix into true/false values
  return boardState.board.map((column, x) =>
    column.reduce((validityArray: boolean[], point, y) => {
      const isValid = evaluateIfMoveIsValid(boardState, x, y, color) === GoValidity.valid;
      validityArray.push(isValid);
      return validityArray;
    }, []),
  );
}

/**
 * Returns a grid with an ID for each contiguous chain of same-state nodes (excluding dead/offline nodes)
 */
export function getChains(_board?: Board) {
  const board = _board || Go.currentGame.board;
  const chains: string[] = [];
  // Turn the internal chain IDs into nice consecutive numbers for display to the player
  return board.map((column) =>
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
export function getLiberties(_board?: Board) {
  const board = _board || Go.currentGame.board;
  return board.map((column) =>
    column.map((point) => {
      if (!point?.liberties || point.color === GoColor.empty) {
        return -1;
      }
      return point.liberties.length;
    }, []),
  );
}

/**
 * Returns a grid indicating which player, if any, controls the empty nodes by fully encircling it with their routers
 */
export function getControlledEmptyNodes(_board?: Board) {
  const board = _board || Go.currentGame.board;
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
 * Resets the active game to be a new board with "No AI" as the opponent. Applies the specified board state and komi to the new game.
 * Used for testing scenarios.
 */
export function setTestingBoardState(ctx: NetscriptContext, state: BoardState, komi?: number) {
  resetBoardState(ctx, GoOpponent.none, state.board.length);
  Go.currentGame = state;
  if (komi != undefined) {
    Go.currentGame.komiOverride = komi;
  }
  updateCaptures(Go.currentGame.board, Go.currentGame.previousPlayer ?? GoColor.white, true);
  GoEvents.emit();
}

/**
 * Returns all previous board states as SimpleBoards
 */
export function getHistory(): string[][] {
  return Go.currentGame.previousBoards.map((boardString): string[] => simpleBoardFromBoardString(boardString));
}

/**
 * Gets the status of the current game.
 * Shows the current player, current score, and the previous move coordinates.
 * Previous move will be null for a pass, or if there are no prior moves.
 *
 * Also provides the white player's komi (bonus starting score), and the amount of bonus cycles from offline time remaining
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
    komi: score[GoColor.white].komi,
    bonusCycles: Go.storedCycles,
  };
}

export function getMoveHistory(): SimpleBoard[] {
  return Go.currentGame.previousBoards.map((boardString) => simpleBoardFromBoardString(boardString));
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
function logEndGame(ctx: NetscriptContext) {
  const boardState = Go.currentGame;
  const score = getScore(boardState);
  helpers.log(
    ctx,
    () => `子网攻略完成！最终得分：${boardState.ai}：${score[GoColor.white].sum}，玩家：${score[GoColor.black].sum}`,
  );
}

/**
 * Clears the board, resets winstreak if applicable
 */
export function resetBoardState(ctx: NetscriptContext, opponent: GoOpponent, boardSize: number) {
  if (![5, 7, 9, 13].includes(boardSize) && opponent !== GoOpponent.w0r1d_d43m0n) {
    throw errorMessage(ctx, `请求的子网大小无效（${boardSize}），大小必须为 5、7、9 或 13`);
  }

  if (opponent === GoOpponent.w0r1d_d43m0n && !Player.hasAugmentation(AugmentationName.TheRedPill, true)) {
    throw errorMessage(ctx, `请求的对手无效（${opponent}），该对手尚未被发现`);
  }

  const oldBoardState = Go.currentGame;
  if (oldBoardState.previousPlayer !== null && oldBoardState.previousBoards.length) {
    resetWinstreak(oldBoardState.ai, false);
  }

  Go.currentGame = getNewBoardState(boardSize, opponent, true);
  resetGoPromises();
  clearAllPointHighlights(Go.currentGame);
  helpers.log(ctx, () => `新对局开始：${opponent}，${boardSize}x${boardSize}`);
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
      rep: details.rep,
      bonusPercent: effectPercent,
      bonusDescription: effectDescription,
    };
  }

  return statDetails;
}

/**
 * Reset all win/loss numbers for the No AI opponent.
 * @param resetAll if true, reset win/loss records for all opponents. This leaves node power and bonuses unchanged.
 */
export function resetStats(resetAll = false) {
  if (resetAll) {
    for (const opponent of getRecordKeys(Go.stats)) {
      Go.stats[opponent] = {
        ...(Go.stats[opponent] as OpponentStats),
        wins: 0,
        losses: 0,
        winStreak: 0,
        oldWinStreak: 0,
        highestWinStreak: 0,
      };
    }
  } else {
    Go.stats[GoOpponent.none] = newOpponentStats();
  }
}

const boardValidity = {
  valid: "",
  badShape: "无效的 boardState：棋盘必须是正方形",
  badType: "无效的 boardState：棋盘必须是字符串数组",
  badSize: "无效的 boardState：棋盘大小必须为 5、7、9、13 或 19",
  badCharacters: '无效的棋盘状态：发现了未知字符。"X" 代表黑子，"O" 代表白子，"." 代表空位，"#" 代表离线节点。',
  failedToCreateBoard: "无效的棋盘状态：创建棋盘失败",
} as const;

/**
 * Validate the given SimpleBoard and prior board state (if present) and turn it into a full BoardState with updated analytics
 */
export function validateBoardState(
  ctx: NetscriptContext,
  _boardState?: unknown,
  _priorBoardState?: unknown,
  playAsWhite = false,
): BoardState | undefined {
  const simpleBoard = getSimpleBoardFromUnknown(ctx, _boardState);
  const priorSimpleBoard = getSimpleBoardFromUnknown(ctx, _priorBoardState);

  if (!_boardState || !simpleBoard) {
    return undefined;
  }

  try {
    return getNewBoardStateFromSimpleBoard(
      simpleBoard,
      priorSimpleBoard,
      GoOpponent.none,
      playAsWhite ? GoColor.black : GoColor.white,
    );
  } catch (e) {
    throw errorMessage(ctx, boardValidity.failedToCreateBoard);
  }
}

/**
 * Check that the given boardState is a valid SimpleBoard, and return it if it is.
 */
function getSimpleBoardFromUnknown(ctx: NetscriptContext, _boardState: unknown): SimpleBoard | undefined {
  if (!_boardState) {
    return undefined;
  }
  if (!Array.isArray(_boardState)) {
    throw errorMessage(ctx, boardValidity.badType);
  }
  if ((_boardState as unknown[]).find((row) => typeof row !== "string")) {
    throw errorMessage(ctx, boardValidity.badType);
  }

  const boardState = _boardState as string[];

  if (boardState.find((row) => row.length !== boardState.length)) {
    throw errorMessage(ctx, boardValidity.badShape);
  }
  if (![5, 7, 9, 13, 19].includes(boardState.length)) {
    throw errorMessage(ctx, boardValidity.badSize);
  }
  if (boardState.find((row) => row.match(/[^XO#.]/))) {
    throw errorMessage(ctx, boardValidity.badCharacters);
  }
  return boardState as SimpleBoard;
}

/** Validate singularity access by throwing an error if the player does not have access. */
export function checkCheatApiAccess(ctx: NetscriptContext): void {
  const hasSourceFile = Player.activeSourceFileLvl(14) > 1;
  const isBitnodeFourteenTwo = Player.activeSourceFileLvl(14) === 1 && Player.bitNodeN === 14;
  if (!hasSourceFile && !isBitnodeFourteenTwo) {
    throw errorMessage(
      ctx,
      `go.cheat API 需要 源文件 14.2 才能运行，这是你在游戏后期才能获得的强化能力。
      到时候你该如何获得它会非常显而易见。`,
    );
  }
}

/**
 * Determines if the attempted cheat move is successful. If so, applies the cheat via the callback, and gets the opponent's response.
 *
 * If it fails, determines if the player's turn is skipped, or if the player is ejected from the subnet.
 */
export function determineCheatSuccess(
  ctx: NetscriptContext,
  callback: () => void,
  successRngOverride?: number,
  ejectRngOverride?: number,
  playAsWhite = false,
): Promise<Play> {
  const state = Go.currentGame;
  const rng = new WHRNG(Player.totalPlaytime);
  state.passCount = 0;
  const priorCheatCount = playAsWhite ? state.cheatCountForWhite : state.cheatCount;
  const playerColor = playAsWhite ? GoColor.white : GoColor.black;

  // If cheat is successful, run callback
  if ((successRngOverride ?? rng.random()) <= cheatSuccessChance(state.cheatCount, playAsWhite)) {
    callback();
  }
  // If there have been prior cheat attempts, and the cheat fails, there is a 10% chance of instantly ending the game
  else if (priorCheatCount && (ejectRngOverride ?? rng.random()) < 0.1 && state.ai !== GoOpponent.none) {
    helpers.log(ctx, () => `作弊失败！你已被逐出子网。`);
    forceEndGoGame(state);
    Player.giveAchievement("IPVGO_ANTICHEAT");
    return handleNextTurn(state, true);
  } else {
    // If the cheat fails, your turn is skipped
    helpers.log(ctx, () => `作弊失败。你的回合已被跳过。`);
    passTurn(state, playerColor, false);
  }

  if (playAsWhite) {
    state.cheatCountForWhite++;
  } else {
    state.cheatCount++;
  }
  Go.currentGame.previousPlayer = playerColor;
  updateCaptures(Go.currentGame.board, playerColor, true);

  return handleNextTurn(state, true);
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
export function cheatSuccessChance(cheatCountOverride: number, playAsWhite = false) {
  const cheatCount =
    cheatCountOverride ?? (playAsWhite ? Go.currentGame.cheatCountForWhite : Go.currentGame.cheatCount);
  const sourceFileBonus = Player.activeSourceFileLvl(14) === 3 ? 0.25 : 0;
  const cheatCountScalar = (0.7 - 0.02 * cheatCount) ** cheatCount;
  return Math.max(Math.min(0.6 * cheatCountScalar * Player.mults.crime_success + sourceFileBonus, 1), 0);
}

/**
 * Attempts to remove an existing router from the board. Can fail. If failed, can immediately end the game
 */
export function cheatRemoveRouter(
  ctx: NetscriptContext,
  x: number,
  y: number,
  successRngOverride?: number,
  ejectRngOverride?: number,
  playAsWhite = false,
): Promise<Play> {
  const point = Go.currentGame.board[x][y];
  if (!point) {
    throw errorMessage(ctx, `作弊失败。位置 ${x},${y} 已经离线。`);
  }
  return determineCheatSuccess(
    ctx,
    () => {
      point.color = GoColor.empty;
      helpers.log(ctx, () => `作弊成功。位置 ${x},${y} 已被清除。`);
    },
    successRngOverride,
    ejectRngOverride,
    playAsWhite,
  );
}

/**
 * Attempts play two moves at once. Can fail. If failed, can immediately end the game
 */
export function cheatPlayTwoMoves(
  ctx: NetscriptContext,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  successRngOverride?: number,
  ejectRngOverride?: number,
  playAsWhite = false,
): Promise<Play> {
  const point1 = Go.currentGame.board[x1][y1];
  const point2 = Go.currentGame.board[x2][y2];

  if (!point1 || !point2) {
    throw errorMessage(ctx, `作弊失败。位置 ${x1},${y1} 或 ${x2},${y2} 中有一个已经离线。`);
  }
  const playerColor = playAsWhite ? GoColor.white : GoColor.black;

  return determineCheatSuccess(
    ctx,
    () => {
      point1.color = playerColor;
      point2.color = playerColor;

      helpers.log(ctx, () => `作弊成功。已连下两手：${x1},${y1} 和 ${x2},${y2}`);
    },
    successRngOverride,
    ejectRngOverride,
    playAsWhite,
  );
}

export function cheatRepairOfflineNode(
  ctx: NetscriptContext,
  x: number,
  y: number,
  successRngOverride?: number,
  ejectRngOverride?: number,
  playAsWhite = false,
): Promise<Play> {
  return determineCheatSuccess(
    ctx,
    () => {
      Go.currentGame.board[x][y] = {
        chain: "",
        liberties: null,
        y,
        color: GoColor.empty,
        x,
      };
      helpers.log(ctx, () => `作弊成功。位置 ${x},${y} 已被修复。`);
    },
    successRngOverride,
    ejectRngOverride,
    playAsWhite,
  );
}

export function cheatDestroyNode(
  ctx: NetscriptContext,
  x: number,
  y: number,
  successRngOverride?: number,
  ejectRngOverride?: number,
  playAsWhite = false,
): Promise<Play> {
  return determineCheatSuccess(
    ctx,
    () => {
      Go.currentGame.board[x][y] = null;
      helpers.log(ctx, () => `作弊成功。位置 ${x},${y} 已被摧毁。`);
    },
    successRngOverride,
    ejectRngOverride,
    playAsWhite,
  );
}
