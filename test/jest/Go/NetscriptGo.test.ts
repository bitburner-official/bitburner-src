import { Player, setPlayer } from "@player";
import { AugmentationName, GoColor, GoOpponent, GoPlayType } from "@enums";
import { Go } from "../../../src/Go/Go";
import { boardStateFromSimpleBoard, simpleBoardFromBoard } from "../../../src/Go/boardAnalysis/boardAnalysis";
import {
  cheatPlayTwoMoves,
  cheatRemoveRouter,
  cheatRepairOfflineNode,
  cheatSuccessChance,
  getChains,
  getControlledEmptyNodes,
  getGameState,
  getLiberties,
  getValidMoves,
  handlePassTurn,
  makePlayerMove,
  resetBoardState,
  validateMove,
} from "../../../src/Go/effects/netscriptGoImplementation";
import { PlayerObject } from "../../../src/PersonObjects/Player/PlayerObject";
import "../../../src/Faction/Factions";
import { getNewBoardState } from "../../../src/Go/boardState/boardState";
import { installAugmentations } from "../../../src/Augmentation/AugmentationHelpers";
import { AddToAllServers } from "../../../src/Server/AllServers";
import { Server } from "../../../src/Server/Server";
import { initSourceFiles } from "../../../src/SourceFile/SourceFiles";

jest.mock("../../../src/Faction/Factions", () => ({
  Factions: {},
}));

jest.mock("../../../src/ui/GameRoot", () => ({
  Router: {
    page: () => ({}),
    toPage: () => ({}),
  },
}));

setPlayer(new PlayerObject());
AddToAllServers(new Server({ hostname: "home" }));

describe("Netscript Go API unit tests", () => {
  describe("makeMove() tests", () => {
    it("should handle invalid moves", async () => {
      const board = ["XOO..", ".....", ".....", ".....", "....."];
      Go.currentGame = boardStateFromSimpleBoard(board, GoOpponent.Daedalus, GoColor.white);
      const mockLogger = jest.fn();
      const mockError = jest.fn(() => {
        throw new Error("Invalid");
      });

      await makePlayerMove(mockLogger, mockError, 0, 0).catch((_) => _);

      expect(mockError).toHaveBeenCalledWith("Invalid move: 0 0. That node is already occupied by a piece.");
    });

    it("should update the board with valid player moves", async () => {
      const board = ["OXX..", ".....", ".....", ".....", "....."];
      const boardState = boardStateFromSimpleBoard(board, GoOpponent.Daedalus, GoColor.white);
      Go.currentGame = boardState;
      const mockLogger = jest.fn();
      const mockError = jest.fn();

      await makePlayerMove(mockLogger, mockError, 1, 0);

      expect(mockLogger).toHaveBeenCalledWith("Go move played: 1, 0");
      expect(boardState.board[1]?.[0]?.color).toEqual(GoColor.black);
      expect(boardState.board[0]?.[0]?.color).toEqual(GoColor.empty);
    });
  });
  describe("passTurn() tests", () => {
    it("should handle pass attempts", async () => {
      Go.currentGame = getNewBoardState(7);
      const mockLogger = jest.fn();

      const result = await handlePassTurn(mockLogger);

      expect(result.type).toEqual(GoPlayType.move);
    });
  });

  describe("getBoardState() tests", () => {
    it("should correctly return a string version of the bard state", () => {
      const board = ["OXX..", ".....", ".....", ".....", "..###"];
      const boardState = boardStateFromSimpleBoard(board);

      const result = simpleBoardFromBoard(boardState.board);

      expect(result).toEqual(board);
    });
  });

  describe("getGameState() tests", () => {
    it("should correctly retrieve the current game state", async () => {
      const board = ["OXX..", ".....", "..#..", "...XX", "...X."];
      const boardState = boardStateFromSimpleBoard(board, GoOpponent.Daedalus, GoColor.black);
      boardState.previousBoards = ["OX.........#.....XX...X."];
      Go.currentGame = boardState;

      const result = getGameState();

      expect(result).toEqual({
        currentPlayer: GoColor.white,
        whiteScore: 6.5,
        blackScore: 6,
        previousMove: [0, 2],
        bonusCycles: 0,
        komi: 5.5,
      });
    });
  });

  describe("resetBoardState() tests", () => {
    it("should set the player's board to the requested size and opponent", () => {
      const board = ["OXX..", ".....", ".....", ".....", "..###"];
      Go.currentGame = boardStateFromSimpleBoard(board);
      const mockLogger = jest.fn();
      const mockError = jest.fn();

      const newBoard = resetBoardState(mockLogger, mockError, GoOpponent.SlumSnakes, 9);

      expect(newBoard?.[0].length).toEqual(9);
      expect(Go.currentGame.board.length).toEqual(9);
      expect(Go.currentGame.ai).toEqual(GoOpponent.SlumSnakes);
      expect(mockError).not.toHaveBeenCalled();
      expect(mockLogger).toHaveBeenCalledWith(`New game started: ${GoOpponent.SlumSnakes}, 9x9`);
    });
    it("should throw an error if an invalid opponent is requested", () => {
      const board = ["OXX..", ".....", ".....", ".....", "..###"];
      Go.currentGame = boardStateFromSimpleBoard(board);
      const mockLogger = jest.fn();
      const mockError = jest.fn();

      resetBoardState(mockLogger, mockError, GoOpponent.w0r1d_d43m0n, 9);

      expect(mockError).toHaveBeenCalledWith(
        `Invalid opponent requested (${GoOpponent.w0r1d_d43m0n}), this opponent has not yet been discovered`,
      );
    });
    it("should throw an error if an invalid size is requested", () => {
      const board = ["OXX..", ".....", ".....", ".....", "..###"];
      Go.currentGame = boardStateFromSimpleBoard(board);
      const mockLogger = jest.fn();
      const mockError = jest.fn();

      resetBoardState(mockLogger, mockError, GoOpponent.TheBlackHand, 31337);

      expect(mockError).toHaveBeenCalledWith("Invalid subnet size requested (31337), size must be 5, 7, 9, or 13");
    });
  });

  describe("getValidMoves() unit tests", () => {
    it("should return all valid and invalid moves on the board", () => {
      const board = ["XXO.#", "XO.O.", ".OOOO", "XXXXX", "X.X.X"];
      Go.currentGame = boardStateFromSimpleBoard(board, GoOpponent.Daedalus, GoColor.white);

      const result = getValidMoves();

      expect(result).toEqual([
        [false, false, false, false, false],
        [false, false, false, false, false],
        [true, false, false, false, false],
        [false, false, false, false, false],
        [false, true, false, true, false],
      ]);
    });
  });

  describe("getChains() unit tests", () => {
    it("should assign an ID to all contiguous chains on the board", () => {
      const board = ["XXO.#", "XO.O.", ".OOOO", "XXXXX", "X.X.X"];
      Go.currentGame = boardStateFromSimpleBoard(board, GoOpponent.Daedalus, GoColor.white);

      const result = getChains();

      expect(result[4][0]).toEqual(result[3][4]);
      expect(result[2][1]).toEqual(result[1][3]);
      expect(result[0][0]).toEqual(result[1][0]);
      expect(result[0][4]).toEqual(null);
    });
  });

  describe("getLiberties() unit tests", () => {
    it("should display the number of connected empty nodes for each chain on the board", () => {
      const board = ["XXO.#", "XO.O.", ".OOOO", "XXXXX", "X.X.X"];
      Go.currentGame = boardStateFromSimpleBoard(board, GoOpponent.Daedalus, GoColor.white);

      const result = getLiberties();

      expect(result).toEqual([
        [1, 1, 2, -1, -1],
        [1, 4, -1, 4, -1],
        [-1, 4, 4, 4, 4],
        [3, 3, 3, 3, 3],
        [3, -1, 3, -1, 3],
      ]);
    });
  });
  describe("getControlledEmptyNodes() unit tests", () => {
    it("should show the owner of each empty node, if a single player has fully encircled it", () => {
      const board = ["XXO.#", "XO.O.", ".OOOO", "XXXXX", "X.X.X"];
      Go.currentGame = boardStateFromSimpleBoard(board, GoOpponent.Daedalus, GoColor.white);

      const result = getControlledEmptyNodes();

      expect(result).toEqual(["...O#", "..O.O", "?....", ".....", ".X.X."]);
    });
  });
  describe("cheatPlayTwoMoves() tests", () => {
    it("should handle invalid moves", async () => {
      const board = ["XOO..", ".....", ".....", ".....", "....."];
      Go.currentGame = boardStateFromSimpleBoard(board, GoOpponent.Daedalus, GoColor.white);
      const mockError = jest.fn();
      validateMove(mockError, 0, 0, "playTwoMoves", {
        repeat: false,
        suicide: false,
      });
      expect(mockError).toHaveBeenCalledWith(
        "The point 0,0 is occupied by a router, so you cannot place a router there",
      );
    });

    it("should update the board with both player moves if nodes are unoccupied and cheat is successful", async () => {
      const board = ["OXX..", ".....", ".....", ".....", "....O"];
      Go.currentGame = boardStateFromSimpleBoard(board, GoOpponent.Daedalus, GoColor.white);
      const mockLogger = jest.fn();

      await cheatPlayTwoMoves(mockLogger, 4, 3, 3, 4, 0, 0);
      expect(mockLogger).toHaveBeenCalledWith("Cheat successful. Two go moves played: 4,3 and 3,4");
      expect(Go.currentGame.board[4]?.[3]?.color).toEqual(GoColor.black);
      expect(Go.currentGame.board[3]?.[4]?.color).toEqual(GoColor.black);
      expect(Go.currentGame.board[4]?.[4]?.color).toEqual(GoColor.empty);
    });

    it("should pass player turn to AI if the cheat is unsuccessful but player is not ejected", async () => {
      const board = ["OXX..", ".....", ".....", ".....", "....O"];
      Go.currentGame = boardStateFromSimpleBoard(board, GoOpponent.Daedalus, GoColor.white);
      const mockLogger = jest.fn();

      await cheatPlayTwoMoves(mockLogger, 4, 3, 3, 4, 2, 1);
      expect(mockLogger).toHaveBeenCalledWith("Cheat failed. Your turn has been skipped.");
      expect(Go.currentGame.board[4]?.[3]?.color).toEqual(GoColor.empty);
      expect(Go.currentGame.board[3]?.[4]?.color).toEqual(GoColor.empty);
      expect(Go.currentGame.board[4]?.[4]?.color).toEqual(GoColor.white);
    });

    it("should reset the board if the cheat is unsuccessful and the player is ejected", async () => {
      const board = ["OXX..", ".....", ".....", ".....", "....O"];
      Go.currentGame = boardStateFromSimpleBoard(board, GoOpponent.Daedalus, GoColor.white);
      Go.currentGame.cheatCount = 1;
      const mockLogger = jest.fn();

      await cheatPlayTwoMoves(mockLogger, 4, 3, 3, 4, 1, 0);
      expect(mockLogger).toHaveBeenCalledWith("Cheat failed! You have been ejected from the subnet.");
      expect(Go.currentGame.previousBoards).toEqual([]);
    });
  });
  describe("cheatRemoveRouter() tests", () => {
    it("should handle invalid moves", async () => {
      const board = ["XOO..", ".....", ".....", ".....", "....."];
      Go.currentGame = boardStateFromSimpleBoard(board, GoOpponent.Daedalus, GoColor.white);
      const mockError = jest.fn();
      validateMove(mockError, 1, 0, "removeRouter", {
        emptyNode: false,
        requireNonEmptyNode: true,
        repeat: false,
        suicide: false,
      });
      expect(mockError).toHaveBeenCalledWith(
        "The point 1,0 does not have a router on it, so you cannot clear this point with removeRouter().",
      );
    });

    it("should remove the router if the move is valid", async () => {
      const board = ["XOO..", ".....", ".....", ".....", "....."];
      Go.currentGame = boardStateFromSimpleBoard(board, GoOpponent.Daedalus, GoColor.white);
      const mockLogger = jest.fn();

      await cheatRemoveRouter(mockLogger, 0, 0, 0, 0);

      expect(mockLogger).toHaveBeenCalledWith("Cheat successful. The point 0,0 was cleared.");
      expect(Go.currentGame.board[0][0]?.color).toEqual(GoColor.empty);
    });

    it("should reset the board if the cheat is unsuccessful and the player is ejected", async () => {
      const board = ["OXX..", ".....", ".....", ".....", "....O"];
      Go.currentGame = boardStateFromSimpleBoard(board, GoOpponent.Daedalus, GoColor.white);
      Go.currentGame.cheatCount = 1;
      const mockLogger = jest.fn();

      await cheatRemoveRouter(mockLogger, 0, 0, 1, 0);
      expect(mockLogger).toHaveBeenCalledWith("Cheat failed! You have been ejected from the subnet.");
      expect(Go.currentGame.previousBoards).toEqual([]);
    });
  });
  describe("cheatRepairOfflineNode() tests", () => {
    it("should handle invalid moves", async () => {
      const board = ["XOO..", ".....", ".....", ".....", "....#"];
      Go.currentGame = boardStateFromSimpleBoard(board, GoOpponent.Daedalus, GoColor.white);
      const mockError = jest.fn();
      validateMove(mockError, 0, 0, "repairOfflineNode", {
        emptyNode: false,
        repeat: false,
        onlineNode: false,
        requireOfflineNode: true,
        suicide: false,
      });

      expect(mockError).toHaveBeenCalledWith("The node 0,0 is not offline, so you cannot repair the node.");
    });

    it("should update the board with the repaired node if the cheat is successful", async () => {
      const board = ["OXX..", ".....", ".....", ".....", "....#"];
      Go.currentGame = boardStateFromSimpleBoard(board, GoOpponent.Daedalus, GoColor.white);
      const mockLogger = jest.fn();

      await cheatRepairOfflineNode(mockLogger, 4, 4, 0, 0);
      expect(mockLogger).toHaveBeenCalledWith("Cheat successful. The point 4,4 was repaired.");
      expect(Go.currentGame.board[4]?.[4]?.color).toEqual(GoColor.empty);
    });
  });

  describe("Cheat success chance unit tests", () => {
    it("should have a base chance", () => {
      expect(cheatSuccessChance(0)).toEqual(0.6);
    });

    it("should have a scaled chance based on cheat count", () => {
      expect(cheatSuccessChance(4)).toEqual(0.6 * (0.7 - 0.08) ** 4);
    });

    it("should have a scaled chance based on layer cheat success level", () => {
      Player.setBitNodeNumber(13);
      initSourceFiles();
      Player.queueAugmentation(AugmentationName.BrachiBlades);
      Player.queueAugmentation(AugmentationName.GrapheneBrachiBlades);
      Player.queueAugmentation(AugmentationName.INFRARet);
      Player.queueAugmentation(AugmentationName.PCMatrix);
      Player.queueAugmentation(AugmentationName.NeuroFluxGovernor);
      installAugmentations();

      expect(cheatSuccessChance(4)).toEqual(0.6 * (0.7 - 0.08) ** 4 * Player.mults.crime_success);
    });
  });
});
