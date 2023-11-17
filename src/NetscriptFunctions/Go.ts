import { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import { helpers } from "../Netscript/NetscriptHelpers";
import { Player } from "@player";
import {
  getNewBoardState,
  getStateCopy,
  makeMove,
  passTurn,
  updateCaptures,
  updateChains,
} from "../Go/boardState/boardState";
import { getScore, resetWinstreak } from "../Go/boardAnalysis/scoring";
import { BoardState, opponents, Play, playerColors, playTypes, validityReason } from "../Go/boardState/goConstants";
import { getMove } from "../Go/boardAnalysis/goAI";
import { evaluateIfMoveIsValid, getControlledSpace, getSimplifiedBoardState } from "../Go/boardAnalysis/boardAnalysis";
import { Go } from "@nsdefs";
import { WorkerScript } from "../Netscript/WorkerScript";
import { WHRNG } from "../Casino/RNG";

/**
 * Retrieves a move from the current faction in response to the player's move
 */
async function getAIMove(ctx: NetscriptContext, boardState: BoardState, success = true): Promise<Play> {
  let resolve: (value: Play) => void;
  const aiMoveResult = new Promise<Play>((res) => (resolve = res));

  getMove(boardState, playerColors.white, Player.go.boardState.ai).then(async (result) => {
    if (result.type !== playTypes.move) {
      Player.go.boardState = boardState;
      resolve({ ...result, success });
    }

    const aiUpdatedBoard = makeMove(boardState, result.x, result.y, playerColors.white);
    if (!aiUpdatedBoard) {
      boardState.previousPlayer = playerColors.white;
      Player.go.boardState = boardState;
      helpers.log(ctx, () => `Invalid AI move attempted: ${result.x}, ${result.y}`);
    } else {
      Player.go.boardState = aiUpdatedBoard;
      helpers.log(ctx, () => `Opponent played move: ${result.x}, ${result.y}`);
    }

    await sleep(200);
    resolve({ ...result, success });
  });
  return aiMoveResult;
}

/**
 * Validates and applies the player's router placement
 */
async function makePlayerMove(ctx: NetscriptContext, x: number, y: number) {
  const validity = evaluateIfMoveIsValid(Player.go.boardState, x, y, playerColors.black);

  if (validity !== validityReason.valid) {
    await sleep(500);
    helpers.log(ctx, () => `ERROR: Invalid move: '${x}, ${y}': ${validity}`);
    return null;
  }

  const result = makeMove(Player.go.boardState, x, y, playerColors.black);
  if (!result) {
    await sleep(500);
    helpers.log(ctx, () => `ERROR: Invalid move`);
    return null;
  }

  helpers.log(ctx, () => `Go move played: ${x}, ${y}`);

  const playerUpdatedBoard = getStateCopy(result);
  return getAIMove(ctx, playerUpdatedBoard);
}

function logEndGame(ctx: NetscriptContext) {
  const boardState = Player.go.boardState;
  const score = getScore(boardState);
  helpers.log(
    ctx,
    () =>
      `Subnet complete! Final score: ${boardState.ai}: ${score[playerColors.white].sum},  Player: ${
        score[playerColors.black].sum
      }`,
  );
}

/**
 * Throw a runtime error that halts the player's script
 */
function throwError(ws: WorkerScript, errorMessage: string) {
  throw `RUNTIME ERROR\n${ws.name}@${ws.hostname} (PID - ${ws.pid})\n\n ${errorMessage}`;
}

/**
 * Ensures the given coordinates are valid for the current board size
 */
function validateRowAndColumn(ctx: NetscriptContext, x: number, y: number) {
  const boardSize = Player.go.boardState.board.length;

  if (x < 0 || x >= boardSize) {
    throwError(
      ctx.workerScript,
      `Invalid column number (x = ${x}), column must be a number 0 through ${boardSize - 1}`,
    );
  }
  if (y < 0 || y >= boardSize) {
    throwError(ctx.workerScript, `Invalid row number (y = ${y}), row must be a number 0 through ${boardSize - 1}`);
  }
}

/**
 * Clears the board, resets winstreak if applicable
 */
function resetBoardState() {
  const oldBoardState = Player.go.boardState;
  if (oldBoardState.previousPlayer !== null && oldBoardState.history.length) {
    resetWinstreak(oldBoardState.ai);
  }

  Player.go.boardState = getNewBoardState(oldBoardState.board[0].length, oldBoardState.ai);
  return getSimplifiedBoardState(Player.go.boardState.board);
}

/** Validate singularity access by throwing an error if the player does not have access. */
function checkCheatApiAccess(ctx: NetscriptContext): void {
  const hasSourceFile = Player.sourceFileLvl(14) > 1;
  const isBitnodeFourteenTwo = Player.sourceFileLvl(14) === 1 && Player.bitNodeN === 14;
  if (!hasSourceFile && !isBitnodeFourteenTwo) {
    throw throwError(
      ctx.workerScript,
      `The go.cheat API requires Source-File 14.2 to run, a power up you obtain later in the game.
      It will be very obvious when and how you can obtain it.`,
    );
  }
}

const invalidMoveResponse: Play = {
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
async function determineCheatSuccess(ctx: NetscriptContext, callback: () => void): Promise<Play> {
  const rng = new WHRNG(Player.totalPlaytime);
  if (rng.random() < cheatSuccessChance()) {
    callback();
    return getAIMove(ctx, Player.go.boardState, true);
  } else if (rng.random() < 0.1) {
    resetBoardState();
    helpers.log(ctx, () => `Cheat failed! You have been ejected from the subnet.`);
    return {
      type: playTypes.gameOver,
      x: -1,
      y: -1,
      success: false,
    };
  } else {
    helpers.log(ctx, () => `Cheat failed. Your turn has been skipped.`);
    passTurn(Player.go.boardState, playerColors.black, false);
    return getAIMove(ctx, Player.go.boardState, false);
  }
}

/**
 * Cheating success rate scales with player's crime success rate.
 */
function cheatSuccessChance() {
  return Math.min(0.2 * Player.mults.crime_success, 0.8);
}

/**
 * Go API implementation
 */
export function NetscriptGo(): InternalAPI<Go> {
  return {
    makeMove:
      (ctx: NetscriptContext) =>
      async (_x, _y): Promise<Play> => {
        const x = helpers.number(ctx, "x", _x);
        const y = helpers.number(ctx, "y", _y);
        validateRowAndColumn(ctx, x, y);

        return (await makePlayerMove(ctx, x, y)) ?? invalidMoveResponse;
      },
    passTurn: (ctx: NetscriptContext) => async (): Promise<Play> => {
      if (Player.go.boardState.previousPlayer === playerColors.black) {
        helpers.log(ctx, () => `It is not your turn; you cannot pass.`);
        return Promise.resolve(invalidMoveResponse);
      }

      passTurn(Player.go.boardState, playerColors.black);
      if (Player.go.boardState.previousPlayer === null) {
        logEndGame(ctx);
        return Promise.resolve({
          type: playTypes.gameOver,
          x: -1,
          y: -1,
          success: true,
        });
      }
      return getAIMove(ctx, Player.go.boardState);
    },
    getBoardState: () => () => {
      return getSimplifiedBoardState(Player.go.boardState.board);
    },
    resetBoardState: (ctx) => (_opponent, _boardSize) => {
      const opponentString = helpers.string(ctx, "opponent", _opponent);
      const opponentOptions = [
        opponents.Netburners,
        opponents.SlumSnakes,
        opponents.TheBlackHand,
        opponents.Daedalus,
        opponents.Illuminati,
      ];
      const opponent = opponentOptions.find((faction) => faction === opponentString);

      const boardSize = helpers.number(ctx, "boardSize", _boardSize);
      if (![5, 7, 9, 13].includes(boardSize)) {
        throwError(ctx.workerScript, `Invalid subnet size requested (${boardSize}, size must be 5, 7, 9, or 13`);
      }
      if (!opponent) {
        throwError(
          ctx.workerScript,
          `Invalid opponent requested (${opponentString}), valid options are ${opponentOptions.join(", ")}`,
        );
      }
      return resetBoardState();
    },
    analysis: {
      getValidMoves: () => () => {
        const boardState = Player.go.boardState;
        // Map the board matrix into true/false values
        return boardState.board.map((column, x) =>
          column.reduce((validityArray: boolean[], point, y) => {
            const isValid = evaluateIfMoveIsValid(boardState, x, y, playerColors.black) === validityReason.valid;
            validityArray.push(isValid);
            return validityArray;
          }, []),
        );
      },
      getChains: () => () => {
        const chains: string[] = [];
        // Turn the internal chain IDs into nice consecutive numbers for display to the player
        return Player.go.boardState.board.map((column) =>
          column.reduce((chainIdArray: number[], point) => {
            if (!chains.includes(point.chain)) {
              chains.push(point.chain);
            }
            chainIdArray.push(chains.indexOf(point.chain));
            return chainIdArray;
          }, []),
        );
      },
      getLiberties: () => () => {
        return Player.go.boardState.board.map((column) =>
          column.reduce((libertyArray: number[], point) => {
            libertyArray.push(point.liberties?.length ?? -1);
            return libertyArray;
          }, []),
        );
      },
      getControlledEmptyNodes: () => () => {
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
            if (boardState.board[x][y].player === playerColors.empty) {
              return "?";
            }
            return ".";
          }, ""),
        );
      },
    },
    cheat: {
      getCheatSuccessChance: (ctx: NetscriptContext) => () => {
        checkCheatApiAccess(ctx);
        return cheatSuccessChance();
      },
      removeOpponentRouter:
        (ctx: NetscriptContext) =>
        async (_x, _y): Promise<Play> => {
          checkCheatApiAccess(ctx);
          const x = helpers.number(ctx, "x", _x);
          const y = helpers.number(ctx, "y", _y);
          validateRowAndColumn(ctx, x, y);

          const point = Player.go.boardState.board[x][y];
          if (point.player !== playerColors.white) {
            helpers.log(
              ctx,
              () =>
                `The point ${x},${y} does not have an opponent's router on it, so you cannot clear this point with removeOpponentRouter().`,
            );
            return invalidMoveResponse;
          }

          return determineCheatSuccess(ctx, () => {
            point.player = playerColors.empty;
            Player.go.boardState = updateChains(Player.go.boardState);
          });
        },
      removeAllyRouter:
        (ctx: NetscriptContext) =>
        async (_x, _y): Promise<Play> => {
          checkCheatApiAccess(ctx);
          const x = helpers.number(ctx, "x", _x);
          const y = helpers.number(ctx, "y", _y);
          validateRowAndColumn(ctx, x, y);
          const point = Player.go.boardState.board[x][y];
          if (point.player !== playerColors.black) {
            helpers.log(
              ctx,
              () =>
                `The point ${x},${y} does not have your router on it, so you cannot clear this point with removeAllyRouter().`,
            );
            return invalidMoveResponse;
          }

          return determineCheatSuccess(ctx, () => {
            point.player = playerColors.empty;
            Player.go.boardState = updateChains(Player.go.boardState);
          });
        },
      playTwoMoves:
        (ctx: NetscriptContext) =>
        async (_x1, _y1, _x2, _y2): Promise<Play> => {
          checkCheatApiAccess(ctx);
          const x1 = helpers.number(ctx, "x", _x1);
          const y1 = helpers.number(ctx, "y", _y1);
          validateRowAndColumn(ctx, x1, y1);
          const x2 = helpers.number(ctx, "x", _x2);
          const y2 = helpers.number(ctx, "y", _y2);
          validateRowAndColumn(ctx, x2, y2);

          const point1 = Player.go.boardState.board[x1][y1];
          if (point1.player !== playerColors.black) {
            helpers.log(ctx, () => `The point ${x1},${y1} is not empty, so you cannot place a router there.`);
            return invalidMoveResponse;
          }
          const point2 = Player.go.boardState.board[x2][y2];
          if (point2.player !== playerColors.black) {
            helpers.log(ctx, () => `The point ${x2},${y2} is not empty, so you cannot place a router there.`);
            return invalidMoveResponse;
          }

          return determineCheatSuccess(ctx, () => {
            point1.player = playerColors.black;
            point2.player = playerColors.black;
            Player.go.boardState = updateCaptures(Player.go.boardState, playerColors.black);
          });
        },
    },
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
