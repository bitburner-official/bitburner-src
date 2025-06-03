import type { Board, BoardState, PointState } from "../Types";

import { Player } from "@player";
import { GoOpponent, GoColor, FactionName } from "@enums";
import { newOpponentStats } from "../Constants";
import { getAllChains, getPlayerNeighbors } from "./boardAnalysis";
import { getKomi, resetAI } from "./goAI";
import { getDifficultyMultiplier, getMaxRep, getWinstreakMultiplier } from "../effects/effect";
import { isNotNullish } from "../boardState/boardState";
import { Factions } from "../../Faction/Factions";
import { getEnumHelper } from "../../utils/EnumHelper";
import { Go, GoEvents } from "../Go";
import { addRepToFavor } from "../../Faction/formulas/favor";

/**
 * Returns the score of the current board.
 * Each player gets one point for each piece on the board, and one point for any empty node
 *  fully surrounded by their pieces
 */
export function getScore(boardState: BoardState) {
  const komi = getKomi(boardState) ?? 6.5;
  const whitePieces = getColoredPieceCount(boardState, GoColor.white);
  const blackPieces = getColoredPieceCount(boardState, GoColor.black);
  const territoryScores = getTerritoryScores(boardState.board);

  return {
    [GoColor.white]: {
      pieces: whitePieces,
      territory: territoryScores[GoColor.white],
      komi: komi,
      sum: whitePieces + territoryScores[GoColor.white] + komi,
    },
    [GoColor.black]: {
      pieces: blackPieces,
      territory: territoryScores[GoColor.black],
      komi: 0,
      sum: blackPieces + territoryScores[GoColor.black],
    },
  };
}

/**
 * Handles ending the game. Sets the previous player to null to prevent further moves, calculates score, and updates
 * player node count and power, and game history
 */
export function endGoGame(boardState: BoardState) {
  if (boardState.previousPlayer === null) {
    return;
  }

  boardState.previousPlayer = null;
  const statusToUpdate = getOpponentStats(boardState.ai);
  statusToUpdate.rep = statusToUpdate.rep ?? 0;
  const score = getScore(boardState);

  if (score[GoColor.black].sum < score[GoColor.white].sum) {
    resetWinstreak(boardState.ai, true);
  } else {
    statusToUpdate.wins++;
    statusToUpdate.oldWinStreak = statusToUpdate.winStreak;
    statusToUpdate.winStreak = statusToUpdate.oldWinStreak < 0 ? 1 : statusToUpdate.winStreak + 1;

    if (statusToUpdate.winStreak > statusToUpdate.highestWinStreak) {
      statusToUpdate.highestWinStreak = statusToUpdate.winStreak;
    }

    const factionName = getEnumHelper("FactionName").getMember(boardState.ai);
    if (
      factionName &&
      statusToUpdate.winStreak % 2 === 0 &&
      Player.factions.includes(factionName) &&
      statusToUpdate.rep < getMaxRep()
    ) {
      const currentFavor = Factions[factionName].favor;
      const repToAdd = getMaxRep() / 200;
      const newFavor = addRepToFavor(currentFavor, repToAdd);
      Factions[factionName].setFavor(newFavor);
      statusToUpdate.rep += repToAdd;
    }

    if (factionName === FactionName.Illuminati && statusToUpdate.winStreak >= 10) {
      Player.giveAchievement("IPVGO_WINNING_STREAK");
    }
  }

  statusToUpdate.nodePower +=
    score[GoColor.black].sum *
    getDifficultyMultiplier(score[GoColor.white].komi, boardState.board[0].length) *
    getWinstreakMultiplier(statusToUpdate.winStreak, statusToUpdate.oldWinStreak);

  statusToUpdate.nodes += score[GoColor.black].sum;
  Go.currentGame = boardState;
  Go.previousGame = boardState;
  resetAI(true);
  GoEvents.emit();

  // Update multipliers with new bonuses, once at the end of the game
  Player.applyEntropy(Player.entropy);
}

/**
 * Forcefully ends the game, resetting the winstreak (if any) and ending the game without applying node power bonuses.
 * Used for critically failing a cheat attempt.
 * @param boardState - the boardstate to reset
 */
export function forceEndGoGame(boardState: BoardState) {
  resetWinstreak(boardState.ai, false);
  boardState.previousPlayer = null;
  Go.currentGame = boardState;
  Go.previousGame = boardState;
  resetAI(true);
  GoEvents.emit();
}

/**
 * Sets the winstreak to zero for the given opponent, and adds a loss
 */
export function resetWinstreak(opponent: GoOpponent, gameComplete: boolean) {
  const statusToUpdate = getOpponentStats(opponent);
  statusToUpdate.losses++;
  statusToUpdate.oldWinStreak = statusToUpdate.winStreak;
  if (statusToUpdate.winStreak >= 0) {
    statusToUpdate.winStreak = -1;
  } else if (gameComplete) {
    // Only increase the "dry streak" count if the game actually finished
    statusToUpdate.winStreak--;
  }
}

/**
 * Gets the number pieces of a given color on the board
 */
function getColoredPieceCount(boardState: BoardState, color: GoColor) {
  return boardState.board.reduce(
    (sum, row) => sum + row.filter(isNotNullish).filter((point) => point.color === color).length,
    0,
  );
}

/**
 * Finds all empty spaces fully surrounded by a single player's stones
 */
function getTerritoryScores(board: Board) {
  const emptyTerritoryChains = getAllChains(board).filter(
    (chain) => chain?.[0]?.color === GoColor.empty && chain.length <= board.length * 2,
  );

  return emptyTerritoryChains.reduce(
    (scores, currentChain) => {
      const chainColor = checkTerritoryOwnership(board, currentChain);
      return {
        [GoColor.white]: scores[GoColor.white] + (chainColor === GoColor.white ? currentChain.length : 0),
        [GoColor.black]: scores[GoColor.black] + (chainColor === GoColor.black ? currentChain.length : 0),
      };
    },
    {
      [GoColor.white]: 0,
      [GoColor.black]: 0,
    },
  );
}

/**
 * Finds all neighbors of the empty points in question. If they are all one color, that player controls that space
 */
function checkTerritoryOwnership(board: Board, emptyPointChain: PointState[]) {
  if (emptyPointChain.length > board[0].length ** 2 - 3) {
    return null;
  }

  const playerNeighbors = getPlayerNeighbors(board, emptyPointChain);
  const hasWhitePieceNeighbors = playerNeighbors.find((p) => p.color === GoColor.white);
  const hasBlackPieceNeighbors = playerNeighbors.find((p) => p.color === GoColor.black);
  const isWhiteTerritory = hasWhitePieceNeighbors && !hasBlackPieceNeighbors;
  const isBlackTerritory = hasBlackPieceNeighbors && !hasWhitePieceNeighbors;
  return isWhiteTerritory ? GoColor.white : isBlackTerritory ? GoColor.black : null;
}

/**
 * prints the board state to the console
 */
export function logBoard(boardState: BoardState): void {
  const state = boardState.board;
  console.log("--------------");
  for (let x = 0; x < state.length; x++) {
    let output = `${x}: `;
    for (let y = 0; y < state[x].length; y++) {
      const point = state[x][y];
      output += ` ${point?.chain ?? ""}`;
    }
    console.log(output);
  }
}

export function getOpponentStats(opponent: GoOpponent) {
  return Go.stats[opponent] ?? (Go.stats[opponent] = newOpponentStats());
}
