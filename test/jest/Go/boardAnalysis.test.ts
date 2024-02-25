import { setPlayer } from "@player";
import { GoColor } from "@enums";
import { PlayerObject } from "../../../src/PersonObjects/Player/PlayerObject";
import { getAllEyes, getAllValidMoves, boardStateFromSimpleBoard } from "../../../src/Go/boardAnalysis/boardAnalysis";
import { findAnyMatchedPatterns } from "../../../src/Go/boardAnalysis/patternMatching";

setPlayer(new PlayerObject());

describe("Go board analysis tests", () => {
  it("identifies chains and liberties", async () => {
    const board = ["XOO..", ".....", ".....", ".....", "....."];
    const boardState = boardStateFromSimpleBoard(board);

    expect(boardState.board[0]?.[0]?.liberties?.length).toEqual(1);
    expect(boardState.board[0]?.[1]?.liberties?.length).toEqual(3);
  });

  it("identifies all points that are part of 'eyes' on the board", async () => {
    const board = ["..O..", "OOOOO", "..XXX", "..XX.", "..X.X"];
    const boardState = boardStateFromSimpleBoard(board);

    const whitePlayerEyes = getAllEyes(boardState, GoColor.white).flat().flat();
    const blackPlayerEyes = getAllEyes(boardState, GoColor.black).flat().flat();

    expect(whitePlayerEyes?.length).toEqual(4);
    expect(blackPlayerEyes?.length).toEqual(2);
  });

  it("identifies strong patterns on the board", async () => {
    const board = [".....", ".....", ".....", ".....", ".OXO."];
    const boardState = boardStateFromSimpleBoard(board);
    const point = await findAnyMatchedPatterns(
      boardState,
      GoColor.white,
      getAllValidMoves(boardState, GoColor.white),
      true,
      0,
    );

    expect(point?.x).toEqual(3);
    expect(point?.y).toEqual(2);
  });
});
