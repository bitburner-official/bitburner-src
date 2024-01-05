import {
  bitverseBoardShape,
  Board,
  BoardState,
  Move,
  Neighbor,
  opponents,
  PlayerColor,
  playerColors,
  PointState,
  validityReason,
} from "./goConstants";
import { getExpansionMoveArray } from "../boardAnalysis/goAI";
import {
  evaluateIfMoveIsValid,
  findAllCapturedChains,
  findLibertiesForChain,
  getAllChains,
  getBoardFromSimplifiedBoardState,
} from "../boardAnalysis/boardAnalysis";
import { endGoGame } from "../boardAnalysis/scoring";
import { cloneDeep } from "lodash";
import { addObstacles, resetCoordinates, rotate90Degrees } from "./offlineNodes";

/**
 * Generates a new BoardState object with the given opponent and size
 */
export function getNewBoardState(
  boardSize: number,
  ai = opponents.Netburners,
  applyObstacles = false,
  boardToCopy?: Board,
): BoardState {
  if (ai === opponents.w0r1d_d43m0n) {
    boardToCopy = resetCoordinates(rotate90Degrees(getBoardFromSimplifiedBoardState(bitverseBoardShape).board));
  }

  const newBoardState = {
    history: [],
    previousPlayer: playerColors.white,
    ai: ai,
    passCount: 0,
    cheatCount: 0,
    board: Array.from({ length: boardSize }, (_, x) =>
      Array.from({ length: boardSize }, (_, y) =>
        !boardToCopy || boardToCopy?.[x]?.[y]
          ? {
              player: boardToCopy?.[x]?.[y]?.player ?? playerColors.empty,
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
export function getHandicap(boardSize: number, opponent: opponents) {
  // Illuminati and WD get a few starting routers
  if (opponent === opponents.Illuminati || opponent === opponents.w0r1d_d43m0n) {
    return ceil(boardSize * 0.35);
  }
  return 0;
}

/**
 * Make a new move on the given board, and update the board state accordingly
 */
export function makeMove(boardState: BoardState, x: number, y: number, player: PlayerColor) {
  // Do not update on invalid moves
  const validity = evaluateIfMoveIsValid(boardState, x, y, player, false);
  if (validity !== validityReason.valid || !boardState.board[x][y]?.player) {
    console.debug(`Invalid move attempted! ${x} ${y} ${player} : ${validity}`);
    return false;
  }

  boardState.history.push(getBoardCopy(boardState).board);
  boardState.history = boardState.history.slice(-4);
  const point = boardState.board[x][y];
  if (!point) {
    return false;
  }
  point.player = player;
  boardState.previousPlayer = player;
  boardState.passCount = 0;

  return updateCaptures(boardState, player);
}

/**
 * Pass the current player's turn without making a move.
 * Ends the game if this is the second pass in a row.
 */
export function passTurn(boardState: BoardState, player: playerColors, allowEndGame = true) {
  if (boardState.previousPlayer === null || boardState.previousPlayer === player) {
    return;
  }
  boardState.previousPlayer =
    boardState.previousPlayer === playerColors.black ? playerColors.white : playerColors.black;
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
  const handicapMoveOptions = getExpansionMoveArray(boardState, playerColors.black, availableMoves);
  const handicapMoves: Move[] = [];

  // select random distinct moves from the move options list up to the specified handicap amount
  for (let i = 0; i < handicap && i < handicapMoveOptions.length; i++) {
    const index = floor(Math.random() * handicapMoveOptions.length);
    handicapMoves.push(handicapMoveOptions[index]);
    handicapMoveOptions.splice(index, 1);
  }

  handicapMoves.forEach((move: Move) => {
    const point = boardState.board[move.point.x][move.point.y];
    return move.point && point && (point.player = playerColors.white);
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
export function updateCaptures(initialState: BoardState, playerWhoMoved: PlayerColor, resetChains = true): BoardState {
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
    point.player = playerColors.empty;
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
        if (neighbor && neighbor.player === currentPoint.player && !contains(checkedPoints, neighbor)) {
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
      if (point && point.player === playerColors.empty) {
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
  const boardState = cloneDeep(initialState);

  boardState.history = [...initialState.history];
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
        pointToEdit.player = point.player;
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
