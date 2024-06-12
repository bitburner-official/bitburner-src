import { setPlayer } from "@player";
import { GoOpponent, GoColor } from "@enums";
import { boardStateFromSimpleBoard } from "../../../src/Go/boardAnalysis/boardAnalysis";
import { getMove } from "../../../src/Go/boardAnalysis/goAI";
import { PlayerObject } from "../../../src/PersonObjects/Player/PlayerObject";
import "../../../src/Faction/Factions";

jest.mock("../../../src/Faction/Factions", () => ({
  Factions: {},
}));

setPlayer(new PlayerObject());

describe("Go AI tests", () => {
  it("prioritizes capture for Black Hand", async () => {
    const board = ["XO...", ".....", ".....", ".....", "....."];
    const boardState = boardStateFromSimpleBoard(board, GoOpponent.TheBlackHand);
    const move = await getMove(boardState, GoColor.white, GoOpponent.TheBlackHand);

    expect([move.x, move.y]).toEqual([1, 0]);
  });

  it("prioritizes defense for Slum Snakes", async () => {
    const board = ["OX...", ".....", ".....", ".....", "....."];
    const boardState = boardStateFromSimpleBoard(board, GoOpponent.SlumSnakes);
    const move = await getMove(boardState, GoColor.white, GoOpponent.SlumSnakes);

    expect([move.x, move.y]).toEqual([1, 0]);
  });

  it("prioritizes eye creation moves for Illuminati", async () => {
    const board = ["...O...", "OOOO...", ".......", ".......", ".......", ".......", "......."];
    const boardState = boardStateFromSimpleBoard(board, GoOpponent.Daedalus);
    const move = await getMove(boardState, GoColor.white, GoOpponent.Daedalus, false, 0);

    expect([move.x, move.y]).toEqual([0, 1]);
  });
});
