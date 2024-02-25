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
  }

  const newBoardState: BoardState = {
    previousBoard: null,
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
    applyHandicap(newBoardState, handicap);
  }
  return newBoardState;
}

/**
 * Determines how many starting pieces the opponent has on the board
 */
export function getHandicap(boardSize: number, opponent: GoOpponent) {
  // Illuminati and WD get a few starting routers
  if (opponent === GoOpponent.Illuminati || opponent === GoOpponent.w0r1d_d43m0n) {
    return ceil(boardSize * 0.35);
  }
  return 0;
}

/**
 * Make a new move on the given board, and update the board state accordingly
 */
export function makeMove(boardState: BoardState, x: number, y: number, player: GoColor) {
  // Do not update on invalid moves
  const validity = evaluateIfMoveIsValid(boardState, x, y, player, false);
  if (validity !== GoValidity.valid || !boardState.board[x][y]?.color) {
    console.debug(`Invalid move attempted! ${x} ${y} ${player} : ${validity}`);
    return false;
  }

  boardState.previousBoard = simpleBoardFromBoard(boardState.board);
  const point = boardState.board[x][y];
  if (!point) return false;

  point.color = player;
  boardState.previousPlayer = player;
  boardState.passCount = 0;

  return updateCaptures(boardState, player);
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
 */
export function applyHandicap(boardState: BoardState, handicap: number) {
  const availableMoves = getEmptySpaces(boardState);
  const handicapMoveOptions = getExpansionMoveArray(boardState, GoColor.black, availableMoves);
  const handicapMoves: Move[] = [];

  // select random distinct moves from the move options list up to the specified handicap amount
  for (let i = 0; i < handicap && i < handicapMoveOptions.length; i++) {
    const index = floor(Math.random() * handicapMoveOptions.length);
    handicapMoves.push(handicapMoveOptions[index]);
    handicapMoveOptions.splice(index, 1);
  }

  handicapMoves.forEach((move: Move) => {
    const point = boardState.board[move.point.x][move.point.y];
    return move.point && point && (point.color = GoColor.white);
  });
  return updateChains(boardState);
}

/**
 * Finds all groups of connected stones on the board, and updates the points in them with their
 * chain information and liberties.
 */
export function updateChains(boardState: BoardState, resetChains = true) {
  resetChains && clearChains(boardState);

  for (let x = 0; x < boardState.board.length; x++) {
    for (let y = 0; y < boardState.board[x].length; y++) {
      const point = boardState.board[x][y];
      // If the current point is already analyzed, skip it
      if (!point || point.chain !== "") {
        continue;
      }

      const chainMembers = findAdjacentPointsInChain(boardState, x, y);
      const libertiesForChain = findLibertiesForChain(boardState, chainMembers);
      const id = `${point.x},${point.y}`;

      chainMembers.forEach((member) => {
        member.chain = id;
        member.liberties = libertiesForChain;
      });
    }
  }

  return boardState;
}

/**
 * Assign each point on the board a chain ID, and link its list of 'liberties' (which are empty spaces
 * adjacent to some point on the chain including the current point).
 *
 * Then, remove any chains with no liberties.
 */
export function updateCaptures(initialState: BoardState, playerWhoMoved: GoColor, resetChains = true): BoardState {
  const boardState = updateChains(initialState, resetChains);
  const chains = getAllChains(boardState);

  const chainsToCapture = findAllCapturedChains(chains, playerWhoMoved);
  if (!chainsToCapture?.length) {
    return boardState;
  }

  chainsToCapture?.forEach((chain) => captureChain(chain));
  return updateChains(boardState);
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
 * Removes the chain data from given points, in preparation for being recalculated later
 */
function clearChains(boardState: BoardState): BoardState {
  for (const x in boardState.board) {
    for (const y in boardState.board[x]) {
      const point = boardState.board[x][y];
      if (point && point.chain && point.liberties) {
        point.chain = "";
        point.liberties = null;
      }
    }
  }
  return boardState;
}

/**
 * Finds all the pieces in the current continuous group, or 'chain'
 *
 * Iteratively traverse the adjacent pieces of the same color to find all the pieces in the same chain,
 * which are the pieces connected directly via a path consisting only of only up/down/left/right
 */
export function findAdjacentPointsInChain(boardState: BoardState, x: number, y: number) {
  const point = boardState.board[x][y];
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
    const neighbors = findNeighbors(boardState, currentPoint.x, currentPoint.y);

    [neighbors.north, neighbors.east, neighbors.south, neighbors.west]
      .filter(isNotNull)
      .filter(isDefined)
      .forEach((neighbor) => {
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
export function getEmptySpaces(boardState: BoardState): PointState[] {
  const emptySpaces: PointState[] = [];

  boardState.board.forEach((column) => {
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

  boardState.previousBoard = initialState.previousBoard ? [...initialState.previousBoard] : null;
  boardState.previousPlayer = initialState.previousPlayer;
  boardState.ai = initialState.ai;
  boardState.passCount = initialState.passCount;

  return boardState;
}

/**
 * Makes a deep copy of the given BoardState's board
 */
export function getBoardCopy(boardState: BoardState) {
  const boardCopy = getNewBoardState(boardState.board[0].length);
  const board = boardState.board;

  for (let x = 0; x < board.length; x++) {
    for (let y = 0; y < board[x].length; y++) {
      const pointToEdit = boardCopy.board[x][y];
      const point = board[x][y];
      if (!point || !pointToEdit) {
        boardCopy.board[x][y] = null;
      } else {
        pointToEdit.color = point.color;
      }
    }
  }

  return boardCopy;
}

export function contains(arr: PointState[], point: PointState) {
  return !!arr.find((p) => p && p.x === point.x && p.y === point.y);
}

export function findNeighbors(boardState: BoardState, x: number, y: number): Neighbor {
  const board = boardState.board;
  return {
    north: board[x]?.[y + 1],
    east: board[x + 1]?.[y],
    south: board[x]?.[y - 1],
    west: board[x - 1]?.[y],
  };
}

export function getArrayFromNeighbor(neighborObject: Neighbor): PointState[] {
  return [neighborObject.north, neighborObject.east, neighborObject.south, neighborObject.west]
    .filter(isNotNull)
    .filter(isDefined);
}

export function isNotNull<T>(argument: T | null): argument is T {
  return argument !== null;
}
export function isDefined<T>(argument: T | undefined): argument is T {
  return argument !== undefined;
}

export function floor(n: number) {
  return ~~n;
}
export function ceil(n: number) {
  const floored = floor(n);
  return floored === n ? n : floored + 1;
}
