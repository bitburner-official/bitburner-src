import { getNewBoardState, makeMove, passTurn, updateCaptures } from "../../../src/Go/boardState/boardState";
import { GoColor, GoOpponent } from "@enums";
import { boardFromSimpleBoard, simpleBoardFromBoard } from "../../../src/Go/boardAnalysis/boardAnalysis";
import { resetCoordinates, rotate90Degrees } from "../../../src/Go/boardState/offlineNodes";
import { bitverseBoardShape } from "../../../src/Go/Constants";

describe("Board analysis utility tests", () => {
  it("Correctly applies the board size and handicap for 5x5 board", () => {
    const result = getNewBoardState(5, GoOpponent.Illuminati, false);
    const whitePieceCount = simpleBoardFromBoard(result.board)
      .join("")
      .split("")
      .filter((p) => p === "O").length;
    expect(whitePieceCount).toEqual(1);
    expect(result).toEqual({
      board: expect.any(Object),
      previousPlayer: GoColor.white,
      previousBoards: [],
      ai: GoOpponent.Illuminati,
      passCount: 0,
      cheatCount: 0,
    });
  });

  it("Correctly applies the board size and handicap for the special opponent", () => {
    const result = getNewBoardState(5, GoOpponent.w0r1d_d43m0n, true);
    const simpleBoard = simpleBoardFromBoard(result.board);
    const whitePieceCount = simpleBoard
      .join("")
      .split("")
      .filter((p) => p === "O").length;
    // Handicap of 7
    expect(whitePieceCount).toEqual(7);
    // Special board: 19x19 (even if other board size is passed in)
    expect(result.board[0]?.length).toEqual(19);

    // Special board shape
    const boardWithNoRouters = simpleBoard.map((row) =>
      row
        .split("")
        .map((p) => (p === "O" ? "." : p))
        .join(""),
    );
    const specialBoardTemplate = simpleBoardFromBoard(
      resetCoordinates(rotate90Degrees(boardFromSimpleBoard(bitverseBoardShape))),
    );
    expect(boardWithNoRouters).toEqual(specialBoardTemplate);
  });

  it("Correctly applies moves made", () => {
    const result = getNewBoardState(5, GoOpponent.Daedalus, false);
    makeMove(result, 1, 1, GoColor.black);

    expect(simpleBoardFromBoard(result.board)).toEqual([".....", ".X...", ".....", ".....", "....."]);
  });

  it("Correctly applies passes made", () => {
    const result = getNewBoardState(5, GoOpponent.Daedalus, false);
    expect(result.previousPlayer).toEqual(GoColor.white);
    passTurn(result, GoColor.black);
    expect(result.passCount).toEqual(1);
    expect(result.previousPlayer).toEqual(GoColor.black);
    passTurn(result, GoColor.white);
    expect(result.passCount).toEqual(2);
    expect(result.previousPlayer).toEqual(null);
  });

  it("Correctly updates captures and chains", () => {
    const boardState = boardFromSimpleBoard(["OX...", "XX...", ".....", ".....", "....."]);
    expect(boardState[0][0]?.color).toEqual(GoColor.white);

    updateCaptures(boardState, GoColor.black, true);

    expect(boardState[0][0]?.color).toEqual(GoColor.empty);
    expect(boardState[0][1]?.chain).toEqual("0,1");
  });
});
