import type { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import type { Go as NSGo } from "@nsdefs";
import type { Play } from "../Go/Types";

import { GoColor } from "@enums";
import { Go } from "../Go/Go";
import { helpers } from "../Netscript/NetscriptHelpers";
import { simpleBoardFromBoard } from "../Go/boardAnalysis/boardAnalysis";
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
import { getEnumHelper } from "../utils/EnumHelper";

const logger = (ctx: NetscriptContext) => (message: string) => helpers.log(ctx, () => message);
const error = (ctx: NetscriptContext) => (message: string) => throwError(ctx.workerScript, message);

/**
 * Ensures the given coordinates are valid for the current board size
 */
function validateRowAndColumn(ctx: NetscriptContext, x: number, y: number) {
  const boardSize = Go.currentGame.board.length;

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
export function NetscriptGo(): InternalAPI<NSGo> {
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
      if (Go.currentGame.previousPlayer === GoColor.black) {
        helpers.log(ctx, () => `It is not your turn; you cannot pass.`);
        helpers.log(ctx, () => `Do you have multiple scripts running, or did you forget to await makeMove() ?`);
        return Promise.resolve(invalidMoveResponse);
      }
      return handlePassTurn(logger(ctx));
    },
    getBoardState: () => () => {
      return simpleBoardFromBoard(Go.currentGame.board);
    },
    getOpponent: () => () => {
      return Go.currentGame.ai;
    },
    resetBoardState: (ctx) => (_opponent, _boardSize) => {
      const opponent = getEnumHelper("GoOpponent").nsGetMember(ctx, _opponent);
      const boardSize = helpers.number(ctx, "boardSize", _boardSize);

      return resetBoardState(error(ctx), opponent, boardSize);
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
        return cheatSuccessChance(Go.currentGame.cheatCount);
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
