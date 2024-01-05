import { getBoardFromSimplifiedBoardState, getSimplifiedBoardState } from "../../../src/Go/boardAnalysis/boardAnalysis";
import {
  cheatPlayTwoMoves,
  cheatRemoveRouter,
  cheatRepairOfflineNode,
  getChains,
  getControlledEmptyNodes,
  getLiberties,
  getValidMoves,
  handlePassTurn,
  invalidMoveResponse,
  makePlayerMove,
  resetBoardState,
} from "../../../src/Go/effects/netscriptGoImplementation";
import { Player, setPlayer } from "@player";
import { PlayerObject } from "../../../src/PersonObjects/Player/PlayerObject";
import "../../../src/Faction/Factions";
import { opponents, playerColors, playTypes } from "../../../src/Go/boardState/goConstants";
import { getNewBoardState } from "../../../src/Go/boardState/boardState";

jest.mock("../../../src/Faction/Factions", () => ({
  Factions: {},
}));

setPlayer(new PlayerObject());

describe("Netscript Go API unit tests", () => {
  describe("makeMove() tests", () => {
    it("should handle invalid moves", async () => {
      const board = ["XOO..", ".....", ".....", ".....", "....."];
      Player.go.boardState = getBoardFromSimplifiedBoardState(board, opponents.Daedalus, playerColors.white);
      const mockLogger = jest.fn();

      const result = await makePlayerMove(mockLogger, 0, 0);

      expect(result).toEqual(invalidMoveResponse);
      expect(mockLogger).toHaveBeenCalledWith("ERROR: Invalid move: That node is already occupied by a piece");
    });

    it("should update the board with valid player moves", async () => {
      const board = ["OXX..", ".....", ".....", ".....", "....."];
      Player.go.boardState = getBoardFromSimplifiedBoardState(board, opponents.Daedalus, playerColors.white);
      const mockLogger = jest.fn();

      const result = await makePlayerMove(mockLogger, 1, 0);

      expect(result.success).toEqual(true);
      expect(mockLogger).toHaveBeenCalledWith("Go move played: 1, 0");
      expect(Player.go.boardState.board[1]?.[0]?.player).toEqual(playerColors.black);
      expect(Player.go.boardState.board[0]?.[0]?.player).toEqual(playerColors.empty);
    });
  });
  describe("passTurn() tests", () => {
    it("should handle pass attempts", async () => {
      Player.go.boardState = getNewBoardState(7);
      const mockLogger = jest.fn();

      const result = await handlePassTurn(mockLogger);

      expect(result.success).toEqual(true);
      expect(result.type).toEqual(playTypes.move);
    });
  });

  describe("getBoardState() tests", () => {
    it("should correctly return a string version of the bard state", () => {
      const board = ["OXX..", ".....", ".....", ".....", "..###"];
      const boardState = getBoardFromSimplifiedBoardState(board);

      const result = getSimplifiedBoardState(boardState.board);

      expect(result).toEqual(board);
    });
  });

  describe("resetBoardState() tests", () => {
    it("should set the player's board to the requested size and opponent", () => {
      const board = ["OXX..", ".....", ".....", ".....", "..###"];
      Player.go.boardState = getBoardFromSimplifiedBoardState(board);
      const mockError = jest.fn();

      const newBoard = resetBoardState(mockError, opponents.SlumSnakes, 9);

      expect(newBoard?.[0].length).toEqual(9);
      expect(Player.go.boardState.board.length).toEqual(9);
      expect(Player.go.boardState.ai).toEqual(opponents.SlumSnakes);
    });
    it("should throw an error if an invalid opponent is requested", () => {
      const board = ["OXX..", ".....", ".....", ".....", "..###"];
      Player.go.boardState = getBoardFromSimplifiedBoardState(board);
      const mockError = jest.fn();

      resetBoardState(mockError, "fake opponent", 9);

      expect(mockError).toHaveBeenCalledWith(
        "Invalid opponent requested (fake opponent), valid options are Netburners, Slum Snakes, The Black Hand, Tetrads, Daedalus, Illuminati",
      );
    });

    it("should throw an error if an invalid size is requested", () => {
      const board = ["OXX..", ".....", ".....", ".....", "..###"];
      Player.go.boardState = getBoardFromSimplifiedBoardState(board);
      const mockError = jest.fn();

      resetBoardState(mockError, opponents.TheBlackHand, 31337);

      expect(mockError).toHaveBeenCalledWith("Invalid subnet size requested (31337, size must be 5, 7, 9, or 13");
    });
  });

  describe("getValidMoves() unit tests", () => {
    it("should return all valid and invalid moves on the board", () => {
      const board = ["XXO.#", "XO.O.", ".OOOO", "XXXXX", "X.X.X"];
      Player.go.boardState = getBoardFromSimplifiedBoardState(board, opponents.Daedalus, playerColors.white);

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
      Player.go.boardState = getBoardFromSimplifiedBoardState(board, opponents.Daedalus, playerColors.white);

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
      Player.go.boardState = getBoardFromSimplifiedBoardState(board, opponents.Daedalus, playerColors.white);

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
      Player.go.boardState = getBoardFromSimplifiedBoardState(board, opponents.Daedalus, playerColors.white);

      const result = getControlledEmptyNodes();

      expect(result).toEqual(["...O#", "..O.O", "?....", ".....", ".X.X."]);
    });
  });
  describe("cheatPlayTwoMoves() tests", () => {
    it("should handle invalid moves", async () => {
      const board = ["XOO..", ".....", ".....", ".....", "....."];
      Player.go.boardState = getBoardFromSimplifiedBoardState(board, opponents.Daedalus, playerColors.white);
      const mockLogger = jest.fn();

      const result = await cheatPlayTwoMoves(mockLogger, 0, 0, 1, 0, 0, 0);

      expect(result).toEqual(invalidMoveResponse);
      expect(mockLogger).toHaveBeenCalledWith("The point 0,0 is not empty, so you cannot place a router there.");
    });

    it("should update the board with both player moves if nodes are unoccupied and cheat is successful", async () => {
      const board = ["OXX..", ".....", ".....", ".....", "....O"];
      Player.go.boardState = getBoardFromSimplifiedBoardState(board, opponents.Daedalus, playerColors.white);
      const mockLogger = jest.fn();

      const result = await cheatPlayTwoMoves(mockLogger, 4, 3, 3, 4, 0, 0);
      expect(mockLogger).toHaveBeenCalledWith("Cheat successful. Two go moves played: 4,3 and 3,4");
      expect(result.success).toEqual(true);
      expect(Player.go.boardState.board[4]?.[3]?.player).toEqual(playerColors.black);
      expect(Player.go.boardState.board[3]?.[4]?.player).toEqual(playerColors.black);
      expect(Player.go.boardState.board[4]?.[4]?.player).toEqual(playerColors.empty);
    });

    it("should pass player turn to AI if the cheat is unsuccessful but player is not ejected", async () => {
      const board = ["OXX..", ".....", ".....", ".....", "....O"];
      Player.go.boardState = getBoardFromSimplifiedBoardState(board, opponents.Daedalus, playerColors.white);
      const mockLogger = jest.fn();

      const result = await cheatPlayTwoMoves(mockLogger, 4, 3, 3, 4, 2, 1);
      console.log(result);
      expect(mockLogger).toHaveBeenCalledWith("Cheat failed. Your turn has been skipped.");
      expect(result.success).toEqual(false);
      expect(Player.go.boardState.board[4]?.[3]?.player).toEqual(playerColors.empty);
      expect(Player.go.boardState.board[3]?.[4]?.player).toEqual(playerColors.empty);
      expect(Player.go.boardState.board[4]?.[4]?.player).toEqual(playerColors.white);
    });

    it("should reset the board if the cheat is unsuccessful and the player is ejected", async () => {
      const board = ["OXX..", ".....", ".....", ".....", "....O"];
      Player.go.boardState = getBoardFromSimplifiedBoardState(board, opponents.Daedalus, playerColors.white);
      Player.go.boardState.cheatCount = 1;
      const mockLogger = jest.fn();

      const result = await cheatPlayTwoMoves(mockLogger, 4, 3, 3, 4, 1, 0);
      console.log(result);
      expect(mockLogger).toHaveBeenCalledWith("Cheat failed! You have been ejected from the subnet.");
      expect(result.success).toEqual(false);
      expect(Player.go.boardState.history.length).toEqual(0);
    });
  });
  describe("cheatRemoveRouter() tests", () => {
    it("should handle invalid moves", async () => {
      const board = ["XOO..", ".....", ".....", ".....", "....."];
      Player.go.boardState = getBoardFromSimplifiedBoardState(board, opponents.Daedalus, playerColors.white);
      const mockLogger = jest.fn();

      const result = await cheatRemoveRouter(mockLogger, 1, 0, 0, 0);

      expect(result).toEqual(invalidMoveResponse);
      expect(mockLogger).toHaveBeenCalledWith(
        "The point 1,0 does not have a router on it, so you cannot clear this point with removeRouter().",
      );
    });

    it("should remove the router if the move is valid", async () => {
      const board = ["XOO..", ".....", ".....", ".....", "....."];
      Player.go.boardState = getBoardFromSimplifiedBoardState(board, opponents.Daedalus, playerColors.white);
      const mockLogger = jest.fn();

      const result = await cheatRemoveRouter(mockLogger, 0, 0, 0, 0);

      expect(result.success).toEqual(true);
      expect(mockLogger).toHaveBeenCalledWith("Cheat successful. The point 0,0 was cleared.");
      expect(Player.go.boardState.board[0][0]?.player).toEqual(playerColors.empty);
    });

    it("should reset the board if the cheat is unsuccessful and the player is ejected", async () => {
      const board = ["OXX..", ".....", ".....", ".....", "....O"];
      Player.go.boardState = getBoardFromSimplifiedBoardState(board, opponents.Daedalus, playerColors.white);
      Player.go.boardState.cheatCount = 1;
      const mockLogger = jest.fn();

      const result = await cheatRemoveRouter(mockLogger, 0, 0, 1, 0);
      console.log(result);
      expect(mockLogger).toHaveBeenCalledWith("Cheat failed! You have been ejected from the subnet.");
      expect(result.success).toEqual(false);
      expect(Player.go.boardState.history.length).toEqual(0);
    });
  });
  describe("cheatRepairOfflineNode() tests", () => {
    it("should handle invalid moves", async () => {
      const board = ["XOO..", ".....", ".....", ".....", "....#"];
      Player.go.boardState = getBoardFromSimplifiedBoardState(board, opponents.Daedalus, playerColors.white);
      const mockLogger = jest.fn();

      const result = await cheatRepairOfflineNode(mockLogger, 0, 0);

      expect(result).toEqual(invalidMoveResponse);
      expect(mockLogger).toHaveBeenCalledWith("The node 0,0 is not offline, so you cannot repair the node.");
    });

    it("should update the board with the repaired node if the cheat is successful", async () => {
      const board = ["OXX..", ".....", ".....", ".....", "....#"];
      Player.go.boardState = getBoardFromSimplifiedBoardState(board, opponents.Daedalus, playerColors.white);
      const mockLogger = jest.fn();

      const result = await cheatRepairOfflineNode(mockLogger, 4, 4, 0, 0);
      expect(mockLogger).toHaveBeenCalledWith("Cheat successful. The point 4,4 was repaired.");
      expect(result.success).toEqual(true);
      expect(Player.go.boardState.board[4]?.[4]?.player).toEqual(playerColors.empty);
    });
  });
});
