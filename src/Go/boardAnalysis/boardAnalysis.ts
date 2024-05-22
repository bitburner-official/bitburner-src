import type { Board, BoardState, Neighbor, PointState, SimpleBoard } from "../Types";

import { GoValidity, GoOpponent, GoColor } from "@enums";
import { Go } from "../Go";
import {
  findAdjacentPointsInChain,
  findNeighbors,
  getArrayFromNeighbor,
  getBoardCopy,
  getEmptySpaces,
  getNewBoardState,
  isNotNullish,
  updateCaptures,
  updateChains,
} from "../boardState/boardState";

/**
 * Determines if the given player can legally make a move at the specified coordinates.
 *
 * You cannot repeat previous board states, to prevent endless loops (superko rule)
 *
 * You cannot make a move that would remove all liberties of your own piece(s) unless it captures opponent's pieces
 *
 * You cannot make a move in an occupied space
 *
 * You cannot make a move if it is not your turn, or if the game is over
 *
 * @returns a validity explanation for if the move is legal or not
 */
export function evaluateIfMoveIsValid(boardState: BoardState, x: number, y: number, player: GoColor, shortcut = true) {
  const point = boardState.board[x]?.[y];

  if (boardState.previousPlayer === null) {
    return GoValidity.gameOver;
  }
  if (boardState.previousPlayer === player) {
    return GoValidity.notYourTurn;
  }
  if (!point) {
    return GoValidity.pointBroken;
  }
  if (point.color !== GoColor.empty) {
    return GoValidity.pointNotEmpty;
  }

  // Detect if the move might be an immediate repeat (only one board of history is saved to check)
  const possibleRepeat = boardState.previousBoards.find((board) => getColorOnSimpleBoard(board, x, y) === player);

  if (shortcut) {
    // If the current point has some adjacent open spaces, it is not suicide. If the move is not repeated, it is legal
    const liberties = findAdjacentLibertiesForPoint(boardState.board, x, y);
    const hasLiberty = liberties.north || liberties.east || liberties.south || liberties.west;
    if (!possibleRepeat && hasLiberty) {
      return GoValidity.valid;
    }

    // If a connected friendly chain has more than one liberty, the move is not suicide. If the move is not repeated, it is legal
    const neighborChainLibertyCount = findMaxLibertyCountOfAdjacentChains(boardState, x, y, player);
    if (!possibleRepeat && neighborChainLibertyCount > 1) {
      return GoValidity.valid;
    }

    // If there is any neighboring enemy chain with only one liberty, and the move is not repeated, it is valid,
    // because it would capture the enemy chain and free up some liberties for itself
    const potentialCaptureChainLibertyCount = findMinLibertyCountOfAdjacentChains(
      boardState.board,
      x,
      y,
      player === GoColor.black ? GoColor.white : GoColor.black,
    );
    if (!possibleRepeat && potentialCaptureChainLibertyCount < 2) {
      return GoValidity.valid;
    }

    // If there is no direct liberties for the move, no captures, and no neighboring friendly chains with multiple liberties,
    // the move is not valid because it would suicide the piece
    if (!hasLiberty && potentialCaptureChainLibertyCount >= 2 && neighborChainLibertyCount <= 1) {
      return GoValidity.noSuicide;
    }
  }

  // If the move has been played before and is not obviously illegal, we have to actually play it out to determine
  // if it is a repeated move, or if it is a valid move
  const evaluationBoard = evaluateMoveResult(boardState.board, x, y, player, true);
  if (evaluationBoard[x]?.[y]?.color !== player) {
    return GoValidity.noSuicide;
  }
  if (possibleRepeat && boardState.previousBoards.length) {
    const simpleEvalBoard = simpleBoardFromBoard(evaluationBoard);
    if (boardState.previousBoards.find((board) => areSimpleBoardsIdentical(simpleEvalBoard, board))) {
      return GoValidity.boardRepeated;
    }
  }

  return GoValidity.valid;
}

/**
 * Create a new evaluation board and play out the results of the given move on the new board
 * @returns the evaluation board
 */
export function evaluateMoveResult(board: Board, x: number, y: number, player: GoColor, resetChains = false): Board {
  const evaluationBoard = getBoardCopy(board);
  const point = evaluationBoard[x]?.[y];
  if (!point) return board;

  point.color = player;

  const neighbors = getArrayFromNeighbor(findNeighbors(board, x, y));
  const chainIdsToUpdate = [point.chain, ...neighbors.map((point) => point.chain)];
  resetChainsById(evaluationBoard, chainIdsToUpdate);
  updateCaptures(evaluationBoard, player, resetChains);
  return evaluationBoard;
}

export function getControlledSpace(board: Board) {
  const chains = getAllChains(board);
  const length = board[0].length;
  const whiteControlledEmptyNodes = getAllPotentialEyes(board, chains, GoColor.white, length * 2)
    .map((eye) => eye.chain)
    .flat();
  const blackControlledEmptyNodes = getAllPotentialEyes(board, chains, GoColor.black, length * 2)
    .map((eye) => eye.chain)
    .flat();

  const ownedPointGrid = Array.from({ length }, () => Array.from({ length }, () => GoColor.empty));
  whiteControlledEmptyNodes.forEach((node) => {
    ownedPointGrid[node.x][node.y] = GoColor.white;
  });
  blackControlledEmptyNodes.forEach((node) => {
    ownedPointGrid[node.x][node.y] = GoColor.black;
  });

  return ownedPointGrid;
}

/**
  Clear the chain and liberty data of all points in the given chains
 */
const resetChainsById = (board: Board, chainIds: string[]) => {
  for (const column of board) {
    for (const point of column) {
      if (!point || !chainIds.includes(point.chain)) continue;
      point.chain = "";
      point.liberties = [];
    }
  }
};

/**
 * For a potential move, determine what the liberty of the point would be if played, by looking at adjacent empty nodes
 * as well as the remaining liberties of neighboring friendly chains
 */
export function findEffectiveLibertiesOfNewMove(board: Board, x: number, y: number, player: GoColor) {
  const friendlyChains = getAllChains(board).filter((chain) => chain[0].color === player);
  const neighbors = findAdjacentLibertiesAndAlliesForPoint(board, x, y, player);
  const neighborPoints = [neighbors.north, neighbors.east, neighbors.south, neighbors.west].filter(isNotNullish);
  // Get all chains that the new move will connect to
  const allyNeighbors = neighborPoints.filter((neighbor) => neighbor.color === player);
  const allyNeighborChainLiberties = allyNeighbors
    .map((neighbor) => {
      const chain = friendlyChains.find((chain) => chain[0].chain === neighbor.chain);
      return chain?.[0]?.liberties ?? null;
    })
    .flat()
    .filter(isNotNullish);

  // Get all empty spaces that the new move connects to that aren't already part of friendly liberties
  const directLiberties = neighborPoints.filter((neighbor) => neighbor.color === GoColor.empty);

  const allLiberties = [...directLiberties, ...allyNeighborChainLiberties];

  // filter out duplicates, and starting point
  return allLiberties
    .filter(
      (liberty, index) =>
        allLiberties.findIndex((neighbor) => liberty.x === neighbor.x && liberty.y === neighbor.y) === index,
    )
    .filter((liberty) => liberty.x !== x || liberty.y !== y);
}

/**
 * Find the number of open spaces that are connected to chains adjacent to a given point, and return the maximum
 */
export function findMaxLibertyCountOfAdjacentChains(boardState: BoardState, x: number, y: number, player: GoColor) {
  const neighbors = findAdjacentLibertiesAndAlliesForPoint(boardState.board, x, y, player);
  const friendlyNeighbors = [neighbors.north, neighbors.east, neighbors.south, neighbors.west]
    .filter(isNotNullish)
    .filter((neighbor) => neighbor.color === player);

  return friendlyNeighbors.reduce((max, neighbor) => Math.max(max, neighbor?.liberties?.length ?? 0), 0);
}

/**
 * Find the number of open spaces that are connected to chains adjacent to a given point, and return the minimum
 */
export function findMinLibertyCountOfAdjacentChains(board: Board, x: number, y: number, player: GoColor) {
  const chain = findEnemyNeighborChainWithFewestLiberties(board, x, y, player);
  return chain?.[0]?.liberties?.length ?? 99;
}

export function findEnemyNeighborChainWithFewestLiberties(board: Board, x: number, y: number, player: GoColor) {
  const chains = getAllChains(board);
  const neighbors = findAdjacentLibertiesAndAlliesForPoint(board, x, y, player);
  const friendlyNeighbors = [neighbors.north, neighbors.east, neighbors.south, neighbors.west]
    .filter(isNotNullish)
    .filter((neighbor) => neighbor.color === player);

  const minimumLiberties = friendlyNeighbors.reduce(
    (min, neighbor) => Math.min(min, neighbor?.liberties?.length ?? 0),
    friendlyNeighbors?.[0]?.liberties?.length ?? 99,
  );

  const chainId = friendlyNeighbors.find((neighbor) => neighbor?.liberties?.length === minimumLiberties)?.chain;
  return chains.find((chain) => chain[0].chain === chainId);
}

/**
 * Returns a list of points that are valid moves for the given player
 */
export function getAllValidMoves(boardState: BoardState, player: GoColor) {
  return getEmptySpaces(boardState.board).filter(
    (point) => evaluateIfMoveIsValid(boardState, point.x, point.y, player) === GoValidity.valid,
  );
}

/**
  Find all empty point groups where either:
  * all of its immediate surrounding player-controlled points are in the same continuous chain, or
  * it is completely surrounded by some single larger chain and the edge of the board

  Eyes are important, because a chain of pieces cannot be captured if it fully surrounds two or more eyes.
 */
export function getAllEyesByChainId(board: Board, player: GoColor) {
  const allChains = getAllChains(board);
  const eyeCandidates = getAllPotentialEyes(board, allChains, player);
  const eyes: { [s: string]: PointState[][] } = {};

  eyeCandidates.forEach((candidate) => {
    if (candidate.neighbors.length === 0) {
      return;
    }

    // If only one chain surrounds the empty space, it is a true eye
    if (candidate.neighbors.length === 1) {
      const neighborChainID = candidate.neighbors[0][0].chain;
      eyes[neighborChainID] = eyes[neighborChainID] || [];
      eyes[neighborChainID].push(candidate.chain);
      return;
    }

    // If any chain fully encircles the empty space (even if there are other chains encircled as well), the eye is true
    const neighborsEncirclingEye = findNeighboringChainsThatFullyEncircleEmptySpace(
      board,
      candidate.chain,
      candidate.neighbors,
      allChains,
    );
    neighborsEncirclingEye.forEach((neighborChain) => {
      const neighborChainID = neighborChain[0].chain;
      eyes[neighborChainID] = eyes[neighborChainID] || [];
      eyes[neighborChainID].push(candidate.chain);
    });
  });

  return eyes;
}

/**
 * Get a list of all eyes, grouped by the chain they are adjacent to
 */
export function getAllEyes(board: Board, player: GoColor, eyesObject?: { [s: string]: PointState[][] }) {
  const eyes = eyesObject ?? getAllEyesByChainId(board, player);
  return Object.keys(eyes).map((key) => eyes[key]);
}

/**
  Find all empty spaces completely surrounded by a single player color.
  For each player chain number, add any empty space chains that are completely surrounded by a single player's color to
   an array at that chain number's index.
 */
export function getAllPotentialEyes(board: Board, allChains: PointState[][], player: GoColor, _maxSize?: number) {
  const nodeCount = board.map((row) => row.filter((p) => p)).flat().length;
  const maxSize = _maxSize ?? Math.min(nodeCount * 0.4, 11);
  const emptyPointChains = allChains.filter((chain) => chain[0].color === GoColor.empty);
  const eyeCandidates: { neighbors: PointState[][]; chain: PointState[]; id: string }[] = [];

  emptyPointChains
    .filter((chain) => chain.length <= maxSize)
    .forEach((chain) => {
      const neighboringChains = getAllNeighboringChains(board, chain, allChains);

      const hasWhitePieceNeighbor = neighboringChains.find(
        (neighborChain) => neighborChain[0]?.color === GoColor.white,
      );
      const hasBlackPieceNeighbor = neighboringChains.find(
        (neighborChain) => neighborChain[0]?.color === GoColor.black,
      );

      // Record the neighbor chains of the eye candidate empty chain, if all of its neighbors are the same color piece
      if (
        (hasWhitePieceNeighbor && !hasBlackPieceNeighbor && player === GoColor.white) ||
        (!hasWhitePieceNeighbor && hasBlackPieceNeighbor && player === GoColor.black)
      ) {
        eyeCandidates.push({
          neighbors: neighboringChains,
          chain: chain,
          id: chain[0].chain,
        });
      }
    });

  return eyeCandidates;
}

/**
 *  For each chain bordering an eye candidate:
 *    remove all other neighboring chains. (replace with empty points)
 *    check if the eye candidate is a simple true eye now
 *       If so, the original candidate is a true eye.
 */
function findNeighboringChainsThatFullyEncircleEmptySpace(
  board: Board,
  candidateChain: PointState[],
  neighborChainList: PointState[][],
  allChains: PointState[][],
) {
  const boardMax = board[0].length - 1;
  const candidateSpread = findFurthestPointsOfChain(candidateChain);
  return neighborChainList.filter((neighborChain, index) => {
    // If the chain does not go far enough to surround the eye in question, don't bother building an eval board
    const neighborSpread = findFurthestPointsOfChain(neighborChain);

    const couldWrapNorth =
      neighborSpread.north > candidateSpread.north ||
      (candidateSpread.north === boardMax && neighborSpread.north === boardMax);
    const couldWrapEast =
      neighborSpread.east > candidateSpread.east ||
      (candidateSpread.east === boardMax && neighborSpread.east === boardMax);
    const couldWrapSouth =
      neighborSpread.south < candidateSpread.south || (candidateSpread.south === 0 && neighborSpread.south === 0);
    const couldWrapWest =
      neighborSpread.west < candidateSpread.west || (candidateSpread.west === 0 && neighborSpread.west === 0);

    if (!couldWrapNorth || !couldWrapEast || !couldWrapSouth || !couldWrapWest) {
      return false;
    }

    const evaluationBoard = getBoardCopy(board);
    const examplePoint = candidateChain[0];
    const otherChainNeighborPoints = removePointAtIndex(neighborChainList, index).flat().filter(isNotNullish);
    otherChainNeighborPoints.forEach((point) => {
      const pointToEdit = evaluationBoard[point.x]?.[point.y];
      if (pointToEdit) {
        pointToEdit.color = GoColor.empty;
      }
    });
    updateChains(evaluationBoard);
    const newChains = getAllChains(evaluationBoard);
    const newChainID = evaluationBoard[examplePoint.x]?.[examplePoint.y]?.chain;
    const chain = newChains.find((chain) => chain[0].chain === newChainID) || [];
    const newNeighborChains = getAllNeighboringChains(board, chain, allChains);

    return newNeighborChains.length === 1;
  });
}

/**
 * Determine the furthest that a chain extends in each of the cardinal directions
 */
function findFurthestPointsOfChain(chain: PointState[]) {
  return chain.reduce(
    (directions, point) => {
      if (point.y > directions.north) {
        directions.north = point.y;
      }
      if (point.y < directions.south) {
        directions.south = point.y;
      }
      if (point.x > directions.east) {
        directions.east = point.x;
      }
      if (point.x < directions.west) {
        directions.west = point.x;
      }

      return directions;
    },
    {
      north: chain[0].y,
      east: chain[0].x,
      south: chain[0].y,
      west: chain[0].x,
    },
  );
}

/**
 * Removes an element from an array at the given index
 */
function removePointAtIndex(arr: PointState[][], index: number) {
  const newArr = [...arr];
  newArr.splice(index, 1);
  return newArr;
}

/**
 * Get all player chains that are adjacent / touching the current chain
 */
export function getAllNeighboringChains(board: Board, chain: PointState[], allChains: PointState[][]) {
  const playerNeighbors = getPlayerNeighbors(board, chain);

  const neighboringChains = playerNeighbors.reduce(
    (neighborChains, neighbor) =>
      neighborChains.add(allChains.find((chain) => chain[0].chain === neighbor.chain) || []),
    new Set<PointState[]>(),
  );

  return [...neighboringChains];
}

/**
 * Gets all points that have player pieces adjacent to the given point
 */
export function getPlayerNeighbors(board: Board, chain: PointState[]) {
  return getAllNeighbors(board, chain).filter((neighbor) => neighbor && neighbor.color !== GoColor.empty);
}

/**
 * Gets all points adjacent to the given point
 */
export function getAllNeighbors(board: Board, chain: PointState[]) {
  const allNeighbors = chain.reduce((chainNeighbors: Set<PointState>, point: PointState) => {
    getArrayFromNeighbor(findNeighbors(board, point.x, point.y))
      .filter((neighborPoint) => !isPointInChain(neighborPoint, chain))
      .forEach((neighborPoint) => chainNeighbors.add(neighborPoint));
    return chainNeighbors;
  }, new Set<PointState>());
  return [...allNeighbors];
}

/**
 * Determines if chain has a point that matches the given coordinates
 */
export function isPointInChain(point: PointState, chain: PointState[]) {
  return !!chain.find((chainPoint) => chainPoint.x === point.x && chainPoint.y === point.y);
}

/**
 * Finds all groups of connected pieces, or empty space groups
 */
export function getAllChains(board: Board): PointState[][] {
  const chains: { [s: string]: PointState[] } = {};

  for (let x = 0; x < board.length; x++) {
    for (let y = 0; y < board[x].length; y++) {
      const point = board[x]?.[y];
      // If the current chain is already analyzed, skip it
      if (!point || point.chain === "") {
        continue;
      }

      chains[point.chain] = chains[point.chain] || [];
      chains[point.chain].push(point);
    }
  }

  return Object.keys(chains).map((key) => chains[key]);
}

/**
 * Find any group of stones with no liberties (who therefore are to be removed from the board)
 */
export function findAllCapturedChains(chainList: PointState[][], playerWhoMoved: GoColor) {
  const opposingPlayer = playerWhoMoved === GoColor.white ? GoColor.black : GoColor.white;
  const enemyChainsToCapture = findCapturedChainOfColor(chainList, opposingPlayer);

  if (enemyChainsToCapture.length) {
    return enemyChainsToCapture;
  }

  const friendlyChainsToCapture = findCapturedChainOfColor(chainList, playerWhoMoved);
  if (friendlyChainsToCapture.length) {
    return friendlyChainsToCapture;
  }
}

function findCapturedChainOfColor(chainList: PointState[][], playerColor: GoColor) {
  return chainList.filter((chain) => chain?.[0].color === playerColor && chain?.[0].liberties?.length === 0);
}

/**
 * Find all empty points adjacent to any piece in a given chain
 */
export function findLibertiesForChain(board: Board, chain: PointState[]): PointState[] {
  return getAllNeighbors(board, chain).filter((neighbor) => neighbor && neighbor.color === GoColor.empty);
}

/**
 * Find all empty points adjacent to any piece in the chain that a given point belongs to
 */
export function findChainLibertiesForPoint(board: Board, x: number, y: number): PointState[] {
  const chain = findAdjacentPointsInChain(board, x, y);
  return findLibertiesForChain(board, chain);
}

/**
 * Returns an object that includes which of the cardinal neighbors are empty
 * (adjacent 'liberties' of the current piece )
 */
export function findAdjacentLibertiesForPoint(board: Board, x: number, y: number): Neighbor {
  const neighbors = findNeighbors(board, x, y);

  const hasNorthLiberty = neighbors.north && neighbors.north.color === GoColor.empty;
  const hasEastLiberty = neighbors.east && neighbors.east.color === GoColor.empty;
  const hasSouthLiberty = neighbors.south && neighbors.south.color === GoColor.empty;
  const hasWestLiberty = neighbors.west && neighbors.west.color === GoColor.empty;

  return {
    north: hasNorthLiberty ? neighbors.north : null,
    east: hasEastLiberty ? neighbors.east : null,
    south: hasSouthLiberty ? neighbors.south : null,
    west: hasWestLiberty ? neighbors.west : null,
  };
}

/**
 * Returns an object that includes which of the cardinal neighbors are either empty or contain the
 * current player's pieces. Used for making the connection map on the board
 */
export function findAdjacentLibertiesAndAlliesForPoint(
  board: Board,
  x: number,
  y: number,
  _player?: GoColor,
): Neighbor {
  const currentPoint = board[x]?.[y];
  const player = _player || (!currentPoint || currentPoint.color === GoColor.empty ? undefined : currentPoint.color);
  const adjacentLiberties = findAdjacentLibertiesForPoint(board, x, y);
  const neighbors = findNeighbors(board, x, y);

  return {
    north: adjacentLiberties.north || neighbors.north?.color === player ? neighbors.north : null,
    east: adjacentLiberties.east || neighbors.east?.color === player ? neighbors.east : null,
    south: adjacentLiberties.south || neighbors.south?.color === player ? neighbors.south : null,
    west: adjacentLiberties.west || neighbors.west?.color === player ? neighbors.west : null,
  };
}

/**
 * Retrieves a simplified version of the board state. "X" represents black pieces, "O" white, and "." empty points.
 *
 * For example, a 5x5 board might look like this:
 * ```
 * [
 *   "XX.O.",
 *   "X..OO",
 *   ".XO..",
 *   "XXO..",
 *   ".XOO.",
 * ]
 * ```
 *
 * Each string represents a vertical column on the board, and each character in the string represents a point.
 *
 * Traditional notation for Go is e.g. "B,1" referring to second ("B") column, first rank. This is the equivalent of index [1][0].
 *
 * Note that the [0][0] point is shown on the bottom-left on the visual board (as is traditional), and each
 * string represents a vertical column on the board. In other words, the printed example above can be understood to
 * be rotated 90 degrees clockwise compared to the board UI as shown in the IPvGO game.
 *
 */
export function simpleBoardFromBoard(board: Board): string[] {
  return board.map((column) =>
    column.reduce((str, point) => {
      if (!point) {
        return str + "#";
      }
      if (point.color === GoColor.black) {
        return str + "X";
      }
      if (point.color === GoColor.white) {
        return str + "O";
      }
      return str + ".";
    }, ""),
  );
}

/** Creates a board object from a simple board. The resulting board has no analytics (liberties/chains) */
export function boardFromSimpleBoard(simpleBoard: SimpleBoard): Board {
  return simpleBoard.map((column, x) =>
    column.split("").map((char, y) => {
      if (char === "#") return null;
      if (char === "X") return blankPointState(GoColor.black, x, y);
      if (char === "O") return blankPointState(GoColor.white, x, y);
      return blankPointState(GoColor.empty, x, y);
    }),
  );
}

export function boardStateFromSimpleBoard(
  simpleBoard: SimpleBoard,
  ai = GoOpponent.Daedalus,
  lastPlayer = GoColor.black,
): BoardState {
  const newBoardState = getNewBoardState(simpleBoard[0].length, ai, false, boardFromSimpleBoard(simpleBoard));
  newBoardState.previousPlayer = lastPlayer;
  updateCaptures(newBoardState.board, lastPlayer);
  return newBoardState;
}

export function blankPointState(color: GoColor, x: number, y: number): PointState {
  return {
    color: color,
    y,
    x,
    chain: "",
    liberties: null,
  };
}

export function areSimpleBoardsIdentical(simpleBoard1: SimpleBoard, simpleBoard2: SimpleBoard) {
  return simpleBoard1.every((column, x) => column === simpleBoard2[x]);
}

export function getColorOnSimpleBoard(simpleBoard: SimpleBoard, x: number, y: number): GoColor | null {
  const char = simpleBoard[x]?.[y];
  if (char === "X") return GoColor.black;
  if (char === "O") return GoColor.white;
  if (char === ".") return GoColor.empty;
  return null;
}

/** Find a move made by the previous player, if present. */
export function getPreviousMove(): [number, number] | null {
  const priorBoard = Go.currentGame?.previousBoards[0];
  if (Go.currentGame.passCount || !priorBoard) {
    return null;
  }

  for (const rowIndexString in Go.currentGame.board) {
    const row = Go.currentGame.board[+rowIndexString] ?? [];
    for (const pointIndexString in row) {
      const point = row[+pointIndexString];
      const priorColor = point && priorBoard && getColorOnSimpleBoard(priorBoard, point.x, point.y);
      const currentColor = point?.color;
      const isPreviousPlayer = currentColor === Go.currentGame.previousPlayer;
      const isChanged = priorColor !== currentColor;
      if (priorColor && currentColor && isPreviousPlayer && isChanged) {
        return [+rowIndexString, +pointIndexString];
      }
    }
  }

  return null;
}
