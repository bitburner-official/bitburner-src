import {
  BoardState,
  getGoPlayerStartingState,
  opponents,
  PlayerColor,
  playerColors,
  PointState,
} from "../boardState/goConstants";
import { getAllChains, getPlayerNeighbors } from "./boardAnalysis";
import { getKomi } from "./goAI";
import { Player } from "@player";
import { getDifficultyMultiplier, getMaxFavor, getWinstreakMultiplier } from "../effects/effect";
import { floor, isNotNull } from "../boardState/boardState";
import { Factions } from "../../Faction/Factions";
import { FactionName } from "@enums";

/**
 * Returns the score of the current board.
 * Each player gets one point for each piece on the board, and one point for any empty node
 *  fully surrounded by their pieces
 */
export function getScore(boardState: BoardState) {
  const komi = getKomi(boardState.ai) ?? 6.5;
  const whitePieces = getColoredPieceCount(boardState, playerColors.white);
  const blackPieces = getColoredPieceCount(boardState, playerColors.black);
  const territoryScores = getTerritoryScores(boardState);

  return {
    [playerColors.white]: {
      pieces: whitePieces,
      territory: territoryScores[playerColors.white],
      komi: komi,
      sum: whitePieces + territoryScores[playerColors.white] + komi,
    },
    [playerColors.black]: {
      pieces: blackPieces,
      territory: territoryScores[playerColors.black],
      komi: 0,
      sum: blackPieces + territoryScores[playerColors.black],
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
  const statusToUpdate = getPlayerStats(boardState.ai);
  statusToUpdate.favor = statusToUpdate.favor ?? 0;
  const score = getScore(boardState);

  if (score[playerColors.black].sum < score[playerColors.white].sum) {
    resetWinstreak(boardState.ai, true);
    statusToUpdate.nodePower += floor(score[playerColors.black].sum * 0.25);
  } else {
    statusToUpdate.wins++;
    statusToUpdate.oldWinStreak = statusToUpdate.winStreak;
    statusToUpdate.winStreak = statusToUpdate.oldWinStreak < 0 ? 1 : statusToUpdate.winStreak + 1;

    if (statusToUpdate.winStreak > statusToUpdate.highestWinStreak) {
      statusToUpdate.highestWinStreak = statusToUpdate.winStreak;
    }

    const factionName = boardState.ai as unknown as FactionName;
    if (
      statusToUpdate.winStreak % 2 === 0 &&
      Player.factions.includes(factionName) &&
      statusToUpdate.favor < getMaxFavor() &&
      Factions?.[factionName]
    ) {
      Factions[factionName].favor++;
      statusToUpdate.favor++;
    }
  }

  statusToUpdate.nodePower +=
    score[playerColors.black].sum *
    getDifficultyMultiplier(score[playerColors.white].komi, boardState.board[0].length) *
    getWinstreakMultiplier(statusToUpdate.winStreak, statusToUpdate.oldWinStreak);

  statusToUpdate.nodes += score[playerColors.black].sum;
  Player.go.boardState = boardState;
  Player.go.previousGameFinalBoardState = boardState;

  // Update multipliers with new bonuses, once at the end of the game
  Player.applyEntropy(Player.entropy);
}

/**
 * Sets the winstreak to zero for the given opponent, and adds a loss
 */
export function resetWinstreak(opponent: opponents, gameComplete: boolean) {
  const statusToUpdate = getPlayerStats(opponent);
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
function getColoredPieceCount(boardState: BoardState, color: PlayerColor) {
  return boardState.board.reduce(
    (sum, row) => sum + row.filter(isNotNull).filter((point) => point.player === color).length,
    0,
  );
}

/**
 * Finds all empty spaces fully surrounded by a single player's stones
 */
function getTerritoryScores(boardState: BoardState) {
  const emptyTerritoryChains = getAllChains(boardState).filter((chain) => chain?.[0]?.player === playerColors.empty);

  return emptyTerritoryChains.reduce(
    (scores, currentChain) => {
      const chainColor = checkTerritoryOwnership(boardState, currentChain);
      return {
        [playerColors.white]:
          scores[playerColors.white] + (chainColor === playerColors.white ? currentChain.length : 0),
        [playerColors.black]:
          scores[playerColors.black] + (chainColor === playerColors.black ? currentChain.length : 0),
      };
    },
    {
      [playerColors.white]: 0,
      [playerColors.black]: 0,
    },
  );
}

/**
 * Finds all neighbors of the empty points in question. If they are all one color, that player controls that space
 */
function checkTerritoryOwnership(boardState: BoardState, emptyPointChain: PointState[]) {
  if (emptyPointChain.length > boardState.board[0].length ** 2 - 3) {
    return null;
  }

  const playerNeighbors = getPlayerNeighbors(boardState, emptyPointChain);
  const hasWhitePieceNeighbors = playerNeighbors.find((p) => p.player === playerColors.white);
  const hasBlackPieceNeighbors = playerNeighbors.find((p) => p.player === playerColors.black);
  const isWhiteTerritory = hasWhitePieceNeighbors && !hasBlackPieceNeighbors;
  const isBlackTerritory = hasBlackPieceNeighbors && !hasWhitePieceNeighbors;
  return isWhiteTerritory ? playerColors.white : isBlackTerritory ? playerColors.black : null;
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

export function getPlayerStats(opponent: opponents) {
  if (!Player.go.status[opponent]) {
    Player.go = getGoPlayerStartingState();
  }
  return Player.go.status[opponent];
}
