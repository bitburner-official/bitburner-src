import { getBoardFromSimplifiedBoardState } from "../../../src/Go/boardAnalysis/boardAnalysis";
import { opponents, playerColors } from "../../../src/Go/boardState/goConstants";
import { getMove } from "../../../src/Go/boardAnalysis/goAI";
import { setPlayer } from "@player";
import { PlayerObject } from "../../../src/PersonObjects/Player/PlayerObject";
import "../../../src/Faction/Factions";

jest.mock("../../../src/Faction/Factions", () => ({
  Factions: {},
}));

setPlayer(new PlayerObject());

describe("Go AI tests", () => {
  it("prioritizes capture for Black Hand", async () => {
    const board = ["XO...", ".....", ".....", ".....", "....."];
    const boardState = getBoardFromSimplifiedBoardState(board, opponents.TheBlackHand);
    const move = await getMove(boardState, playerColors.white, opponents.TheBlackHand);

    expect([move.x, move.y]).toEqual([1, 0]);
  });

  it("prioritizes defense for Slum Snakes", async () => {
    const board = ["OX...", ".....", ".....", ".....", "....."];
    const boardState = getBoardFromSimplifiedBoardState(board, opponents.SlumSnakes);
    const move = await getMove(boardState, playerColors.white, opponents.SlumSnakes);

    expect([move.x, move.y]).toEqual([1, 0]);
  });

  it("prioritizes eye creation moves for Illuminati", async () => {
    const board = ["...O...", "OOOO...", ".......", ".......", ".......", ".......", "......."];
    const boardState = getBoardFromSimplifiedBoardState(board, opponents.Daedalus);
    const move = await getMove(boardState, playerColors.white, opponents.Daedalus, 0);

    console.log(move);

    expect([move.x, move.y]).toEqual([0, 1]);
  });
});
