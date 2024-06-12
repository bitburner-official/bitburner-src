import type { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import type { Go as NSGo } from "@nsdefs";
import type { Play } from "../Go/Types";

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
  getCurrentPlayer,
  getGameState,
  getLiberties,
  getMoveHistory,
  getOpponentNextMove,
  getStats,
  getValidMoves,
  handlePassTurn,
  makePlayerMove,
  resetBoardState,
  validateMove,
  validateTurn,
} from "../Go/effects/netscriptGoImplementation";
import { getEnumHelper } from "../utils/EnumHelper";
import { errorMessage } from "../Netscript/ErrorMessages";

const logger = (ctx: NetscriptContext) => (message: string) => helpers.log(ctx, () => message);
const error = (ctx: NetscriptContext) => (message: string) => {
  throw errorMessage(ctx, message);
};

/**
 * Go API implementation
 */
export function NetscriptGo(): InternalAPI<NSGo> {
  return {
    makeMove:
      (ctx: NetscriptContext) =>
      (_x, _y): Promise<Play> => {
        const x = helpers.number(ctx, "x", _x);
        const y = helpers.number(ctx, "y", _y);
        validateMove(error(ctx), x, y, "makeMove");
        return makePlayerMove(logger(ctx), error(ctx), x, y);
      },
    passTurn: (ctx: NetscriptContext) => async (): Promise<Play> => {
      validateTurn(error(ctx), "passTurn()");
      return handlePassTurn(logger(ctx));
    },
    opponentNextTurn: (ctx: NetscriptContext) => async (_logOpponentMove) => {
      const logOpponentMove = typeof _logOpponentMove === "boolean" ? _logOpponentMove : true;
      return getOpponentNextMove(logOpponentMove, logger(ctx));
    },
    getBoardState: () => () => {
      return simpleBoardFromBoard(Go.currentGame.board);
    },
    getMoveHistory: () => () => {
      return getMoveHistory();
    },
    getCurrentPlayer: () => () => {
      return getCurrentPlayer();
    },
    getGameState: () => () => {
      return getGameState();
    },
    getOpponent: () => () => {
      return Go.currentGame.ai;
    },
    resetBoardState: (ctx) => (_opponent, _boardSize) => {
      const opponent = getEnumHelper("GoOpponent").nsGetMember(ctx, _opponent);
      const boardSize = helpers.number(ctx, "boardSize", _boardSize);

      return resetBoardState(logger(ctx), error(ctx), opponent, boardSize);
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
      getStats: () => () => {
        return getStats();
      },
    },
    cheat: {
      getCheatSuccessChance: (ctx: NetscriptContext) => () => {
        checkCheatApiAccess(error(ctx));
        return cheatSuccessChance(Go.currentGame.cheatCount);
      },
      removeRouter:
        (ctx: NetscriptContext) =>
        (_x, _y): Promise<Play> => {
          checkCheatApiAccess(error(ctx));
          const x = helpers.number(ctx, "x", _x);
          const y = helpers.number(ctx, "y", _y);
          validateMove(error(ctx), x, y, "removeRouter", {
            emptyNode: false,
            requireNonEmptyNode: true,
            repeat: false,
            suicide: false,
          });

          return cheatRemoveRouter(logger(ctx), x, y);
        },
      playTwoMoves:
        (ctx: NetscriptContext) =>
        (_x1, _y1, _x2, _y2): Promise<Play> => {
          checkCheatApiAccess(error(ctx));
          const x1 = helpers.number(ctx, "x", _x1);
          const y1 = helpers.number(ctx, "y", _y1);
          validateMove(error(ctx), x1, y1, "playTwoMoves", {
            repeat: false,
            suicide: false,
          });
          const x2 = helpers.number(ctx, "x", _x2);
          const y2 = helpers.number(ctx, "y", _y2);
          validateMove(error(ctx), x2, y2, "playTwoMoves", {
            repeat: false,
            suicide: false,
          });

          return cheatPlayTwoMoves(logger(ctx), x1, y1, x2, y2);
        },
      repairOfflineNode:
        (ctx: NetscriptContext) =>
        (_x, _y): Promise<Play> => {
          checkCheatApiAccess(error(ctx));
          const x = helpers.number(ctx, "x", _x);
          const y = helpers.number(ctx, "y", _y);
          validateMove(error(ctx), x, y, "repairOfflineNode", {
            emptyNode: false,
            repeat: false,
            onlineNode: false,
            requireOfflineNode: true,
            suicide: false,
          });

          return cheatRepairOfflineNode(logger(ctx), x, y);
        },
      destroyNode:
        (ctx: NetscriptContext) =>
        (_x, _y): Promise<Play> => {
          checkCheatApiAccess(error(ctx));
          const x = helpers.number(ctx, "x", _x);
          const y = helpers.number(ctx, "y", _y);
          validateMove(error(ctx), x, y, "destroyNode", {
            repeat: false,
            onlineNode: true,
            suicide: false,
          });

          return cheatDestroyNode(logger(ctx), x, y);
        },
    },
  };
}
