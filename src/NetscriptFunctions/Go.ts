import { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import { helpers } from "../Netscript/NetscriptHelpers";
import { Player } from "@player";
import { Go } from "@nsdefs";
import { Play, playerColors } from "../Go/boardState/goConstants";
import { getSimplifiedBoardState } from "../Go/boardAnalysis/boardAnalysis";
import {
  cheatDestroyNode,
  cheatPlayTwoMoves,
  cheatRemoveRouter,
  cheatRepairOfflineNode,
  cheatSuccessChance,
  checkCheatApiAccess,
  getChains,
  getControlledEmptyNodes,
  getLiberties,
  getValidMoves,
  handlePassTurn,
  invalidMoveResponse,
  makePlayerMove,
  resetBoardState,
  throwError,
} from "../Go/effects/netscriptGoImplementation";

const logger = (ctx: NetscriptContext) => (message: string) => helpers.log(ctx, () => message);
const error = (ctx: NetscriptContext) => (message: string) => throwError(ctx.workerScript, message);

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

        return makePlayerMove(logger(ctx), x, y);
      },
    passTurn: (ctx: NetscriptContext) => async (): Promise<Play> => {
      if (Player.go.boardState.previousPlayer === playerColors.black) {
        helpers.log(ctx, () => `It is not your turn; you cannot pass.`);
        return Promise.resolve(invalidMoveResponse);
      }
      return handlePassTurn(logger(ctx));
    },
    getBoardState: () => () => {
      return getSimplifiedBoardState(Player.go.boardState.board);
    },
    getOpponent: () => () => {
      return Player.go.boardState.ai;
    },
    resetBoardState: (ctx) => (_opponent, _boardSize) => {
      const opponentString = helpers.string(ctx, "opponent", _opponent);
      const boardSize = helpers.number(ctx, "boardSize", _boardSize);

      return resetBoardState(error(ctx), opponentString, boardSize);
    },
    analysis: {
      getValidMoves: () => () => {
        return getValidMoves();
      },
      getChains: () => () => {
        return getChains();
      },
      getLiberties: () => () => {
        return getLiberties();
      },
      getControlledEmptyNodes: () => () => {
        return getControlledEmptyNodes();
      },
    },
    cheat: {
      getCheatSuccessChance: (ctx: NetscriptContext) => () => {
        checkCheatApiAccess(error(ctx));
        return cheatSuccessChance(Player.go.boardState.cheatCount);
      },
      removeRouter:
        (ctx: NetscriptContext) =>
        async (_x, _y): Promise<Play> => {
          checkCheatApiAccess(error(ctx));
          const x = helpers.number(ctx, "x", _x);
          const y = helpers.number(ctx, "y", _y);
          validateRowAndColumn(ctx, x, y);

          return cheatRemoveRouter(logger(ctx), x, y);
        },
      playTwoMoves:
        (ctx: NetscriptContext) =>
        async (_x1, _y1, _x2, _y2): Promise<Play> => {
          checkCheatApiAccess(error(ctx));
          const x1 = helpers.number(ctx, "x", _x1);
          const y1 = helpers.number(ctx, "y", _y1);
          validateRowAndColumn(ctx, x1, y1);
          const x2 = helpers.number(ctx, "x", _x2);
          const y2 = helpers.number(ctx, "y", _y2);
          validateRowAndColumn(ctx, x2, y2);

          return cheatPlayTwoMoves(logger(ctx), x1, y1, x2, y2);
        },
      repairOfflineNode:
        (ctx: NetscriptContext) =>
        async (_x, _y): Promise<Play> => {
          checkCheatApiAccess(error(ctx));
          const x = helpers.number(ctx, "x", _x);
          const y = helpers.number(ctx, "y", _y);
          validateRowAndColumn(ctx, x, y);

          return cheatRepairOfflineNode(logger(ctx), x, y);
        },
      destroyNode:
        (ctx: NetscriptContext) =>
        async (_x, _y): Promise<Play> => {
          checkCheatApiAccess(error(ctx));
          const x = helpers.number(ctx, "x", _x);
          const y = helpers.number(ctx, "y", _y);
          validateRowAndColumn(ctx, x, y);

          return cheatDestroyNode(logger(ctx), x, y);
        },
    },
  };
}
