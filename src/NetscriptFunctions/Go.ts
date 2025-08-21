import type { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import type { Go as NSGo } from "@nsdefs";
import type { Play } from "../Go/Types";

import { Go } from "../Go/Go";
import { helpers } from "../Netscript/NetscriptHelpers";
import {
  addPointHighlight,
  clearAllPointHighlights,
  clearPointHighlight,
  simpleBoardFromBoard,
} from "../Go/boardAnalysis/boardAnalysis";
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
  resetStats,
  setTestingBoardState,
  validateBoardState,
  validateMove,
} from "../Go/effects/netscriptGoImplementation";
import { getEnumHelper } from "../utils/EnumHelper";
import { errorMessage } from "../Netscript/ErrorMessages";

const logger = (ctx: NetscriptContext) => (message: string) => helpers.log(ctx, () => message);
const error =
  (ctx: NetscriptContext) =>
  (message: string): never => {
    throw errorMessage(ctx, message);
  };

/**
 * Go API implementation
 */
export function NetscriptGo(): InternalAPI<NSGo> {
  return {
    makeMove:
      (ctx: NetscriptContext) =>
      (_x, _y, _playAsWhite): Promise<Play> => {
        const x = helpers.number(ctx, "x", _x);
        const y = helpers.number(ctx, "y", _y);
        const playAsWhite = helpers.boolean(ctx, "playAsWhite", _playAsWhite ?? false);
        validateMove(error(ctx), x, y, "makeMove", { playAsWhite });
        return makePlayerMove(logger(ctx), error(ctx), x, y, playAsWhite);
      },
    passTurn:
      (ctx: NetscriptContext) =>
      (_playAsWhite): Promise<Play> => {
        const playAsWhite = helpers.boolean(ctx, "playAsWhite", _playAsWhite ?? false);
        validateMove(error(ctx), -1, -1, "passTurn", { playAsWhite, pass: true });
        return handlePassTurn(logger(ctx), playAsWhite);
      },
    opponentNextTurn: (ctx: NetscriptContext) => async (_logOpponentMove, _playAsWhite) => {
      const logOpponentMove = helpers.boolean(ctx, "logOpponentMove", _logOpponentMove ?? false);
      const playAsWhite = helpers.boolean(ctx, "playAsWhite", _playAsWhite ?? false);
      return getOpponentNextMove(logger(ctx), logOpponentMove, playAsWhite);
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
      getValidMoves: (ctx) => (_boardState, _priorBoardState, _playAsWhite) => {
        if (_boardState == true) {
          return getValidMoves(undefined, true);
        }
        const playAsWhite = helpers.boolean(ctx, "playAsWhite", _playAsWhite ?? false);
        const State = validateBoardState(error(ctx), _boardState, _priorBoardState, playAsWhite);
        return getValidMoves(State, playAsWhite);
      },
      getChains: (ctx) => (_boardState) => {
        const State = validateBoardState(error(ctx), _boardState);
        return getChains(State?.board);
      },
      getLiberties: (ctx) => (_boardState) => {
        const State = validateBoardState(error(ctx), _boardState);
        return getLiberties(State?.board);
      },
      getControlledEmptyNodes: (ctx) => (_boardState) => {
        const State = validateBoardState(error(ctx), _boardState);
        return getControlledEmptyNodes(State?.board);
      },
      getStats: () => () => {
        return getStats();
      },
      resetStats:
        (ctx) =>
        (_resetAll = false) => {
          const resetAll = helpers.boolean(ctx, "resetAll", _resetAll ?? false);
          resetStats(resetAll);
        },
      setTestingBoardState: (ctx) => (_boardState, _komi) => {
        const State = validateBoardState(error(ctx), _boardState);
        if (!State) {
          error(ctx)("Invalid board state passed to setTestingBoardState()");
          return;
        }
        const komi: number | undefined = _komi !== undefined ? helpers.number(ctx, "komi", _komi) : undefined;
        return setTestingBoardState(State.board, komi);
      },
      highlightPoint: (ctx) => (_x, _y, _color, _text) => {
        const x = helpers.number(ctx, "x", _x);
        const y = helpers.number(ctx, "y", _y);
        const color = helpers.string(ctx, "color", _color ?? "");
        const text = helpers.string(ctx, "text", _text ?? "");
        addPointHighlight(Go.currentGame, x, y, color, text);
      },
      clearPointHighlight: (ctx) => (_x, _y) => {
        const x = helpers.number(ctx, "x", _x);
        const y = helpers.number(ctx, "y", _y);
        clearPointHighlight(Go.currentGame, x, y);
      },
      clearAllPointHighlights: () => () => clearAllPointHighlights(Go.currentGame),
    },
    cheat: {
      getCheatSuccessChance: (ctx: NetscriptContext) => (_cheatCount, _playAsWhite) => {
        checkCheatApiAccess(error(ctx));
        const playAsWhite = helpers.boolean(ctx, "playAsWhite", _playAsWhite ?? false);
        const normalizedCheatCount =
          _cheatCount ?? (playAsWhite ? Go.currentGame.cheatCountForWhite : Go.currentGame.cheatCount);
        const cheatCount = helpers.number(ctx, "cheatCount", normalizedCheatCount);
        return cheatSuccessChance(cheatCount, playAsWhite);
      },
      getCheatCount: (ctx: NetscriptContext) => (_playAsWhite) => {
        checkCheatApiAccess(error(ctx));
        const playAsWhite = helpers.boolean(ctx, "playAsWhite", _playAsWhite ?? false);
        return playAsWhite ? Go.currentGame.cheatCountForWhite : Go.currentGame.cheatCount;
      },
      removeRouter:
        (ctx: NetscriptContext) =>
        (_x, _y, _playAsWhite): Promise<Play> => {
          checkCheatApiAccess(error(ctx));
          const x = helpers.number(ctx, "x", _x);
          const y = helpers.number(ctx, "y", _y);
          const playAsWhite = helpers.boolean(ctx, "playAsWhite", _playAsWhite ?? false);
          validateMove(error(ctx), x, y, "removeRouter", {
            emptyNode: false,
            requireNonEmptyNode: true,
            repeat: false,
            suicide: false,
            playAsWhite: playAsWhite,
          });

          return cheatRemoveRouter(logger(ctx), error(ctx), x, y, undefined, undefined, playAsWhite);
        },
      playTwoMoves:
        (ctx: NetscriptContext) =>
        (_x1, _y1, _x2, _y2, _playAsWhite): Promise<Play> => {
          checkCheatApiAccess(error(ctx));
          const x1 = helpers.number(ctx, "x", _x1);
          const y1 = helpers.number(ctx, "y", _y1);
          const playAsWhite = helpers.boolean(ctx, "playAsWhite", _playAsWhite ?? false);
          validateMove(error(ctx), x1, y1, "playTwoMoves", {
            repeat: false,
            suicide: false,
            playAsWhite,
          });
          const x2 = helpers.number(ctx, "x", _x2);
          const y2 = helpers.number(ctx, "y", _y2);
          validateMove(error(ctx), x2, y2, "playTwoMoves", {
            repeat: false,
            suicide: false,
            playAsWhite,
          });

          return cheatPlayTwoMoves(logger(ctx), error(ctx), x1, y1, x2, y2, undefined, undefined, playAsWhite);
        },
      repairOfflineNode:
        (ctx: NetscriptContext) =>
        (_x, _y, _playAsWhite): Promise<Play> => {
          checkCheatApiAccess(error(ctx));
          const x = helpers.number(ctx, "x", _x);
          const y = helpers.number(ctx, "y", _y);
          const playAsWhite = helpers.boolean(ctx, "playAsWhite", _playAsWhite ?? false);
          validateMove(error(ctx), x, y, "repairOfflineNode", {
            emptyNode: false,
            repeat: false,
            onlineNode: false,
            requireOfflineNode: true,
            suicide: false,
            playAsWhite,
          });

          return cheatRepairOfflineNode(logger(ctx), x, y, undefined, undefined, playAsWhite);
        },
      destroyNode:
        (ctx: NetscriptContext) =>
        (_x, _y, _playAsWhite): Promise<Play> => {
          checkCheatApiAccess(error(ctx));
          const x = helpers.number(ctx, "x", _x);
          const y = helpers.number(ctx, "y", _y);
          const playAsWhite = helpers.boolean(ctx, "playAsWhite", _playAsWhite ?? false);
          validateMove(error(ctx), x, y, "destroyNode", {
            repeat: false,
            onlineNode: true,
            suicide: false,
            playAsWhite,
          });

          return cheatDestroyNode(logger(ctx), x, y, undefined, undefined, playAsWhite);
        },
    },
  };
}
