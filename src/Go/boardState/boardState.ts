import type { Board, BoardState, Move, Neighbor, PointState } from "../Types";

import { GoOpponent, GoColor, GoValidity } from "@enums";
import { bitverseBoardShape } from "../Constants";
import { getExpansionMoveArray } from "../boardAnalysis/goAI";
import {
  evaluateIfMoveIsValid,
  findAllCapturedChains,
  findLibertiesForChain,
  getAllChains,
  boardFromSimpleBoard,
  simpleBoardFromBoard,
} from "../boardAnalysis/boardAnalysis";
import { endGoGame } from "../boardAnalysis/scoring";
import { addObstacles, resetCoordinates, rotate90Degrees } from "./offlineNodes";

/** Generates a new BoardState object with the given opponent and size. Optionally use an existing board. */
export function getNewBoardState(
  boardSize: number,
  ai = GoOpponent.Netburners,
  applyObstacles = false,
  boardToCopy?: Board,
): BoardState {
  if (ai === GoOpponent.w0r1d_d43m0n) {
    boardToCopy = resetCoordinates(rotate90Degrees(boardFromSimpleBoard(bitverseBoardShape)));
    boardSize = 19;
    applyObstacles = false;
  }

  const newBoardState: BoardState = {
    previousBoards: [],
    previousPlayer: GoColor.white,
    ai: ai,
    passCount: 0,
    cheatCount: 0,
    board: Array.from({ length: boardSize }, (_, x) =>
      Array.from({ length: boardSize }, (_, y) =>
        !boardToCopy || boardToCopy?.[x]?.[y]
          ? {
              color: boardToCopy?.[x]?.[y]?.color ?? GoColor.empty,
              chain: "",
              liberties: null,
              x,
              y,
            }
          : null,
      ),
    ),
  };

  if (applyObstacles) {
    addObstacles(newBoardState);
  }

  const handicap = getHandicap(newBoardState.board[0].length, ai);
  if (handicap) {
    applyHandicap(newBoardState.board, handicap);
  }
  return newBoardState;
}

/**
 * Determines how many starting pieces the opponent has on the board
 */
export function getHandicap(boardSize: number, opponent: GoOpponent) {
  // Illuminati and WD get a few starting routers
  if (opponent === GoOpponent.Illuminati || opponent === GoOpponent.w0r1d_d43m0n) {
    return {
      [5]: 1,
      [7]: 3,
      [9]: 4,
      [13]: 5,
      [19]: 7,
    }[boardSize];
  }
  return 0;
}

/**
 * Make a new move on the given board, and update the board state accordingly
 * Modifies the board state in place
 * @returns a boolean representing whether the move was successful
 */
export function makeMove(boardState: BoardState, x: number, y: number, player: GoColor) {
  // Do not update on invalid moves
  const validity = evaluateIfMoveIsValid(boardState, x, y, player, false);
  if (validity !== GoValidity.valid || !boardState.board[x][y]?.color) {
    //console.debug(`Invalid move attempted! ${x} ${y} ${player} : ${validity}`);
    return false;
  }

  // Only maintain last 7 moves
  boardState.previousBoards.unshift(simpleBoardFromBoard(boardState.board));
  if (boardState.previousBoards.length > 7) {
    boardState.previousBoards.pop();
  }

  const point = boardState.board[x][y];
  if (!point) return false;

  point.color = player;
  boardState.previousPlayer = player;
  boardState.passCount = 0;

  updateCaptures(boardState.board, player);
  return true;
}

/**
 * Pass the current player's turn without making a move.
 * Ends the game if this is the second pass in a row.
 */
export function passTurn(boardState: BoardState, player: GoColor, allowEndGame = true) {
  if (boardState.previousPlayer === null || boardState.previousPlayer === player) {
    return;
  }
  boardState.previousPlayer = boardState.previousPlayer === GoColor.black ? GoColor.white : GoColor.black;
  boardState.passCount++;

  if (boardState.passCount >= 2 && allowEndGame) {
    endGoGame(boardState);
  }
}

/**
 * Makes a number of random moves on the board before the game starts, to give one player an edge.
 * Modifies the board in place.
 */
export function applyHandicap(board: Board, handicap: number): void {
  const availableMoves = getEmptySpaces(board);
  const handicapMoveOptions = getExpansionMoveArray(board, availableMoves);
  const handicapMoves: Move[] = [];

  // Special handling for 5x5: extra weight on handicap piece in the center of the board
  if (availableMoves.length < 26 && board[2][2] && Math.random() < 0.2) {
    board[2][2].color = GoColor.white;
    updateChains(board);
    return;
  }

  // select random distinct moves from the move options list up to the specified handicap amount
  for (let i = 0; i < handicap && i < handicapMoveOptions.length; i++) {
    const index = Math.floor(Math.random() * handicapMoveOptions.length);
    handicapMoves.push(handicapMoveOptions[index]);
    handicapMoveOptions.splice(index, 1);
  }

  handicapMoves.forEach((move: Move) => {
    const point = board[move.point.x][move.point.y];
    return move.point && point && (point.color = GoColor.white);
  });
  updateChains(board);
}

/**
 * Finds all groups of connected stones on the board, and updates the points in them with their
 * chain information and liberties.
 * Updates a board in-place.
 */
export function updateChains(board: Board, resetChains = true): void {
  resetChains && clearChains(board);

  for (let x = 0; x < board.length; x++) {
    for (let y = 0; y < board[x].length; y++) {
      const point = board[x][y];
      // If the current point is already analyzed, skip it
      if (!point || point.chain !== "") continue;

      const chainMembers = findAdjacentPointsInChain(board, x, y);
      const libertiesForChain = findLibertiesForChain(board, chainMembers);
      const id = `${point.x},${point.y}`;

      chainMembers.forEach((member) => {
        member.chain = id;
        member.liberties = libertiesForChain;
      });
    }
  }
}

/**
 * Assign each point on the board a chain ID, and link its list of 'liberties' (which are empty spaces
 * adjacent to some point on the chain including the current point).
 *
 * Then, remove any chains with no liberties.
 * Modifies the board in place.
 */
export function updateCaptures(board: Board, playerWhoMoved: GoColor, resetChains = true): void {
  updateChains(board, resetChains);
  const chains = getAllChains(board);

  const chainsToCapture = findAllCapturedChains(chains, playerWhoMoved);
  if (!chainsToCapture?.length) {
    return;
  }

  chainsToCapture?.forEach((chain) => captureChain(chain));
  updateChains(board);
}

/**
 * Removes a chain from the board, after being captured
 */
function captureChain(chain: PointState[]) {
  chain.forEach((point) => {
    point.color = GoColor.empty;
    point.chain = "";
    point.liberties = [];
  });
}

/**
 * Removes the chain data from all points on a board, in preparation for being recalculated later
 * Updates the board in-place
 */
function clearChains(board: Board): void {
  for (const column of board) {
    for (const point of column) {
      if (!point) continue;
      point.chain = "";
      point.liberties = null;
    }
  }
}

/**
 * Finds all the pieces in the current continuous group, or 'chain'
 *
 * Iteratively traverse the adjacent pieces of the same color to find all the pieces in the same chain,
 * which are the pieces connected directly via a path consisting only of only up/down/left/right
 */
export function findAdjacentPointsInChain(board: Board, x: number, y: number) {
  const point = board[x][y];
  if (!point) {
    return [];
  }
  const checkedPoints: PointState[] = [];
  const adjacentPoints: PointState[] = [point];
  const pointsToCheckNeighbors: PointState[] = [point];

  while (pointsToCheckNeighbors.length) {
    const currentPoint = pointsToCheckNeighbors.pop();
    if (!currentPoint) {
      break;
    }

    checkedPoints.push(currentPoint);
    const neighbors = findNeighbors(board, currentPoint.x, currentPoint.y);

    [neighbors.north, neighbors.east, neighbors.south, neighbors.west].filter(isNotNullish).forEach((neighbor) => {
      if (neighbor && neighbor.color === currentPoint.color && !contains(checkedPoints, neighbor)) {
        adjacentPoints.push(neighbor);
        pointsToCheckNeighbors.push(neighbor);
      }
      checkedPoints.push(neighbor);
    });
  }

  return adjacentPoints;
}

/**
 * Finds all empty spaces on the board.
 */
export function getEmptySpaces(board: Board): PointState[] {
  const emptySpaces: PointState[] = [];

  board.forEach((column) => {
    column.forEach((point) => {
      if (point && point.color === GoColor.empty) {
        emptySpaces.push(point);
      }
    });
  });

  return emptySpaces;
}

/**
 * Makes a deep copy of the given board state
 */
export function getStateCopy(initialState: BoardState) {
  const boardState = structuredClone(initialState);

  boardState.previousBoards = initialState.previousBoards ?? [];
  boardState.previousPlayer = initialState.previousPlayer;
  boardState.ai = initialState.ai;
  boardState.passCount = initialState.passCount;

  return boardState;
}

/** Make a deep copy of a board */
export function getBoardCopy(board: Board): Board {
  return structuredClone(board);
}

export function contains(arr: PointState[], point: PointState) {
  return !!arr.find((p) => p && p.x === point.x && p.y === point.y);
}

export function findNeighbors(board: Board, x: number, y: number): Neighbor {
  return {
    north: board[x]?.[y + 1],
    east: board[x + 1]?.[y],
    south: board[x]?.[y - 1],
    west: board[x - 1]?.[y],
  };
}

export function getArrayFromNeighbor(neighborObject: Neighbor): PointState[] {
  return [neighborObject.north, neighborObject.east, neighborObject.south, neighborObject.west].filter(isNotNullish);
}

export function isNotNullish<T>(argument: T | undefined | null): argument is T {
  return argument != null;
}
