import { setPlayer } from "@player";
import { GoColor, GoValidity } from "@enums";
import { PlayerObject } from "../../../src/PersonObjects/Player/PlayerObject";
import {
  getAllEyes,
  getAllValidMoves,
  boardStateFromSimpleBoard,
  evaluateIfMoveIsValid,
} from "../../../src/Go/boardAnalysis/boardAnalysis";
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

    const whitePlayerEyes = getAllEyes(boardState.board, GoColor.white).flat().flat();
    const blackPlayerEyes = getAllEyes(boardState.board, GoColor.black).flat().flat();

    expect(whitePlayerEyes?.length).toEqual(4);
    expect(blackPlayerEyes?.length).toEqual(2);
  });

  it("identifies strong patterns on the board", async () => {
    const board = [".....", ".....", ".....", ".....", ".OXO."];
    const boardState = boardStateFromSimpleBoard(board);
    const point = await findAnyMatchedPatterns(
      boardState.board,
      GoColor.white,
      getAllValidMoves(boardState, GoColor.white),
      true,
      0,
    );

    expect(point?.x).toEqual(3);
    expect(point?.y).toEqual(2);
  });

  it("identifies invalid moves from self-capture", async () => {
    const board = [".X...", "X....", ".....", ".....", "....."];
    const boardState = boardStateFromSimpleBoard(board);
    const validity = evaluateIfMoveIsValid(boardState, 0, 0, GoColor.white, false);

    expect(validity).toEqual(GoValidity.noSuicide);
  });

  it("identifies invalid moves from repeat", async () => {
    const board = [".X...", ".....", ".....", ".....", "....."];
    const boardState = boardStateFromSimpleBoard(board);
    boardState.previousBoards.push([".X...", ".....", ".....", ".....", "....."]);
    boardState.previousBoards.push([".X...", ".....", ".....", ".....", "....."]);
    boardState.previousBoards.push([".X...", ".....", ".....", ".....", "....."]);
    boardState.previousBoards.push(["OX...", ".....", ".....", ".....", "....."]);
    const validity = evaluateIfMoveIsValid(boardState, 0, 0, GoColor.white, false);

    expect(validity).toEqual(GoValidity.boardRepeated);
  });
});
