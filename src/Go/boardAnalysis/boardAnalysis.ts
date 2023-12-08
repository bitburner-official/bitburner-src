import {
  Board,
  BoardState,
  Neighbor,
  opponents,
  PlayerColor,
  playerColors,
  PointState,
  validityReason,
} from "../boardState/goConstants";
import {
  findAdjacentPointsInChain,
  findNeighbors,
  getArrayFromNeighbor,
  getBoardCopy,
  getEmptySpaces,
  getNewBoardState,
  getStateCopy,
  isDefined,
  isNotNull,
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
export function evaluateIfMoveIsValid(
  boardState: BoardState,
  x: number,
  y: number,
  player: PlayerColor,
  shortcut = true,
) {
  const point = boardState.board?.[x]?.[y];

  if (boardState.previousPlayer === null) {
    return validityReason.gameOver;
  }
  if (boardState.previousPlayer === player) {
    return validityReason.notYourTurn;
  }
  if (!point) {
    return validityReason.pointBroken;
  }
  if (point.player !== playerColors.empty) {
    return validityReason.pointNotEmpty;
  }

  // Detect if the current player has ever previously played this move. Used to detect potential repeated board states
  const moveHasBeenPlayedBefore = !!boardState.history.find((board) => board[x]?.[y]?.player === player);

  if (shortcut) {
    // If the current point has some adjacent open spaces, it is not suicide. If the move is not repeated, it is legal
    const liberties = findAdjacentLibertiesForPoint(boardState, x, y);
    const hasLiberty = liberties.north || liberties.east || liberties.south || liberties.west;
    if (!moveHasBeenPlayedBefore && hasLiberty) {
      return validityReason.valid;
    }

    // If a connected friendly chain has more than one liberty, the move is not suicide. If the move is not repeated, it is legal
    const neighborChainLibertyCount = findMaxLibertyCountOfAdjacentChains(boardState, x, y, player);
    if (!moveHasBeenPlayedBefore && neighborChainLibertyCount > 1) {
      return validityReason.valid;
    }

    // If there is any neighboring enemy chain with only one liberty, and the move is not repeated, it is valid,
    // because it would capture the enemy chain and free up some liberties for itself
    const potentialCaptureChainLibertyCount = findMinLibertyCountOfAdjacentChains(
      boardState,
      x,
      y,
      player === playerColors.black ? playerColors.white : playerColors.black,
    );
    if (!moveHasBeenPlayedBefore && potentialCaptureChainLibertyCount < 2) {
      return validityReason.valid;
    }

    // If there is no direct liberties for the move, no captures, and no neighboring friendly chains with multiple liberties,
    // the move is not valid because it would suicide the piece
    if (!hasLiberty && potentialCaptureChainLibertyCount >= 2 && neighborChainLibertyCount <= 1) {
      return validityReason.noSuicide;
    }
  }

  // If the move has been played before and is not obviously illegal, we have to actually play it out to determine
  // if it is a repeated move, or if it is a valid move
  const evaluationBoard = evaluateMoveResult(boardState, x, y, player, true);
  if (evaluationBoard.board[x]?.[y]?.player !== player) {
    return validityReason.noSuicide;
  }
  if (moveHasBeenPlayedBefore && checkIfBoardStateIsRepeated(evaluationBoard)) {
    return validityReason.boardRepeated;
  }

  return validityReason.valid;
}

/**
 * Create a new evaluation board and play out the results of the given move on the new board
 */
export function evaluateMoveResult(
  initialBoardState: BoardState,
  x: number,
  y: number,
  player: playerColors,
  resetChains = false,
) {
  const boardState = getStateCopy(initialBoardState);
  boardState.history.push(getBoardCopy(boardState).board);
  const point = boardState.board[x]?.[y];
  if (!point) {
    return initialBoardState;
  }

  point.player = player;
  boardState.previousPlayer = player;

  const neighbors = getArrayFromNeighbor(findNeighbors(boardState, x, y));
  const chainIdsToUpdate = [point.chain, ...neighbors.map((point) => point.chain)];
  resetChainsById(boardState, chainIdsToUpdate);

  return updateCaptures(boardState, player, resetChains);
}

export function getControlledSpace(boardState: BoardState) {
  const chains = getAllChains(boardState);
  const length = boardState.board[0].length;
  const whiteControlledEmptyNodes = getAllPotentialEyes(boardState, chains, playerColors.white, length * 2)
    .map((eye) => eye.chain)
    .flat();
  const blackControlledEmptyNodes = getAllPotentialEyes(boardState, chains, playerColors.black, length * 2)
    .map((eye) => eye.chain)
    .flat();

  const ownedPointGrid = Array.from({ length }, () => Array.from({ length }, () => playerColors.empty));
  whiteControlledEmptyNodes.forEach((node) => {
    ownedPointGrid[node.x][node.y] = playerColors.white;
  });
  blackControlledEmptyNodes.forEach((node) => {
    ownedPointGrid[node.x][node.y] = playerColors.black;
  });

  return ownedPointGrid;
}

/**
  Clear the chain and liberty data of all points in the given chains
 */
const resetChainsById = (boardState: BoardState, chainIds: string[]) => {
  const pointsToUpdate = boardState.board
    .flat()
    .filter(isDefined)
    .filter(isNotNull)
    .filter((point) => chainIds.includes(point.chain));
  pointsToUpdate.forEach((point) => {
    point.chain = "";
    point.liberties = [];
  });
};

/**
 * For a potential move, determine what the liberty of the point would be if played, by looking at adjacent empty nodes
 * as well as the remaining liberties of neighboring friendly chains
 */
export function findEffectiveLibertiesOfNewMove(boardState: BoardState, x: number, y: number, player: PlayerColor) {
  const friendlyChains = getAllChains(boardState).filter((chain) => chain[0].player === player);
  const neighbors = findAdjacentLibertiesAndAlliesForPoint(boardState, x, y, player);
  const neighborPoints = [neighbors.north, neighbors.east, neighbors.south, neighbors.west]
    .filter(isNotNull)
    .filter(isDefined);
  // Get all chains that the new move will connect to
  const allyNeighbors = neighborPoints.filter((neighbor) => neighbor.player === player);
  const allyNeighborChainLiberties = allyNeighbors
    .map((neighbor) => {
      const chain = friendlyChains.find((chain) => chain[0].chain === neighbor.chain);
      return chain?.[0]?.liberties ?? null;
    })
    .flat()
    .filter(isNotNull);

  // Get all empty spaces that the new move connects to that aren't already part of friendly liberties
  const directLiberties = neighborPoints.filter((neighbor) => neighbor.player === playerColors.empty);

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
export function findMaxLibertyCountOfAdjacentChains(
  boardState: BoardState,
  x: number,
  y: number,
  player: playerColors,
) {
  const neighbors = findAdjacentLibertiesAndAlliesForPoint(boardState, x, y, player);
  const friendlyNeighbors = [neighbors.north, neighbors.east, neighbors.south, neighbors.west]
    .filter(isNotNull)
    .filter(isDefined)
    .filter((neighbor) => neighbor.player === player);

  return friendlyNeighbors.reduce((max, neighbor) => Math.max(max, neighbor?.liberties?.length ?? 0), 0);
}

/**
 * Find the number of open spaces that are connected to chains adjacent to a given point, and return the minimum
 */
export function findMinLibertyCountOfAdjacentChains(
  boardState: BoardState,
  x: number,
  y: number,
  player: playerColors,
) {
  const chain = findEnemyNeighborChainWithFewestLiberties(boardState, x, y, player);
  return chain?.[0]?.liberties?.length ?? 99;
}

export function findEnemyNeighborChainWithFewestLiberties(
  boardState: BoardState,
  x: number,
  y: number,
  player: playerColors,
) {
  const chains = getAllChains(boardState);
  const neighbors = findAdjacentLibertiesAndAlliesForPoint(boardState, x, y, player);
  const friendlyNeighbors = [neighbors.north, neighbors.east, neighbors.south, neighbors.west]
    .filter(isNotNull)
    .filter(isDefined)
    .filter((neighbor) => neighbor.player === player);

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
export function getAllValidMoves(boardState: BoardState, player: PlayerColor) {
  return getEmptySpaces(boardState).filter(
    (point) => evaluateIfMoveIsValid(boardState, point.x, point.y, player) === validityReason.valid,
  );
}

/**
  Find all empty point groups where either:
  * all of its immediate surrounding player-controlled points are in the same continuous chain, or
  * it is completely surrounded by some single larger chain and the edge of the board

  Eyes are important, because a chain of pieces cannot be captured if it fully surrounds two or more eyes.
 */
export function getAllEyesByChainId(boardState: BoardState, player: playerColors) {
  const allChains = getAllChains(boardState);
  const eyeCandidates = getAllPotentialEyes(boardState, allChains, player);
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
      boardState,
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
export function getAllEyes(boardState: BoardState, player: playerColors, eyesObject?: { [s: string]: PointState[][] }) {
  const eyes = eyesObject ?? getAllEyesByChainId(boardState, player);
  return Object.keys(eyes).map((key) => eyes[key]);
}

/**
  Find all empty spaces completely surrounded by a single player color.
  For each player chain number, add any empty space chains that are completely surrounded by a single player's color to
   an array at that chain number's index.
 */
export function getAllPotentialEyes(
  boardState: BoardState,
  allChains: PointState[][],
  player: playerColors,
  _maxSize?: number,
) {
  const nodeCount = boardState.board.map((row) => row.filter((p) => p)).flat().length;
  const maxSize = _maxSize ?? Math.min(nodeCount * 0.4, 11);
  const emptyPointChains = allChains.filter((chain) => chain[0].player === playerColors.empty);
  const eyeCandidates: { neighbors: PointState[][]; chain: PointState[]; id: string }[] = [];

  emptyPointChains
    .filter((chain) => chain.length <= maxSize)
    .forEach((chain) => {
      const neighboringChains = getAllNeighboringChains(boardState, chain, allChains);

      const hasWhitePieceNeighbor = neighboringChains.find(
        (neighborChain) => neighborChain[0]?.player === playerColors.white,
      );
      const hasBlackPieceNeighbor = neighboringChains.find(
        (neighborChain) => neighborChain[0]?.player === playerColors.black,
      );

      // Record the neighbor chains of the eye candidate empty chain, if all of its neighbors are the same color piece
      if (
        (hasWhitePieceNeighbor && !hasBlackPieceNeighbor && player === playerColors.white) ||
        (!hasWhitePieceNeighbor && hasBlackPieceNeighbor && player === playerColors.black)
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
  boardState: BoardState,
  candidateChain: PointState[],
  neighborChainList: PointState[][],
  allChains: PointState[][],
) {
  const boardMax = boardState.board[0].length - 1;
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

    const evaluationBoard = getStateCopy(boardState);
    const examplePoint = candidateChain[0];
    const otherChainNeighborPoints = removePointAtIndex(neighborChainList, index)
      .flat()
      .filter(isNotNull)
      .filter(isDefined);
    otherChainNeighborPoints.forEach((point) => {
      const pointToEdit = evaluationBoard.board[point.x]?.[point.y];
      if (pointToEdit) {
        pointToEdit.player = playerColors.empty;
      }
    });
    const updatedBoard = updateChains(evaluationBoard);
    const newChains = getAllChains(updatedBoard);
    const newChainID = updatedBoard.board[examplePoint.x]?.[examplePoint.y]?.chain;
    const chain = newChains.find((chain) => chain[0].chain === newChainID) || [];
    const newNeighborChains = getAllNeighboringChains(boardState, chain, allChains);

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
export function getAllNeighboringChains(boardState: BoardState, chain: PointState[], allChains: PointState[][]) {
  const playerNeighbors = getPlayerNeighbors(boardState, chain);

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
export function getPlayerNeighbors(boardState: BoardState, chain: PointState[]) {
  return getAllNeighbors(boardState, chain).filter((neighbor) => neighbor && neighbor.player !== playerColors.empty);
}

/**
 * Gets all points adjacent to the given point
 */
export function getAllNeighbors(boardState: BoardState, chain: PointState[]) {
  const allNeighbors = chain.reduce((chainNeighbors: Set<PointState>, point: PointState) => {
    getArrayFromNeighbor(findNeighbors(boardState, point.x, point.y))
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
 * Looks through the board history to see if the current state is identical to any previous state
 * Capped at 5 for calculation speed, because loops of size 6 are essentially impossible
 */
function checkIfBoardStateIsRepeated(boardState: BoardState) {
  const currentBoard = boardState.board;
  return boardState.history.slice(-5).find((state) => {
    for (let x = 0; x < state.length; x++) {
      for (let y = 0; y < state[x].length; y++) {
        if (currentBoard[x]?.[y]?.player && currentBoard[x]?.[y]?.player !== state[x]?.[y]?.player) {
          return false;
        }
      }
    }
    return true;
  });
}

/**
 * Finds all groups of connected pieces, or empty space groups
 */
export function getAllChains(boardState: BoardState): PointState[][] {
  const chains: { [s: string]: PointState[] } = {};

  for (let x = 0; x < boardState.board.length; x++) {
    for (let y = 0; y < boardState.board[x].length; y++) {
      const point = boardState.board[x]?.[y];
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
export function findAllCapturedChains(chainList: PointState[][], playerWhoMoved: PlayerColor) {
  const opposingPlayer = playerWhoMoved === playerColors.white ? playerColors.black : playerColors.white;
  const enemyChainsToCapture = findCapturedChainOfColor(chainList, opposingPlayer);

  if (enemyChainsToCapture) {
    return enemyChainsToCapture;
  }

  const friendlyChainsToCapture = findCapturedChainOfColor(chainList, playerWhoMoved);
  if (friendlyChainsToCapture) {
    return friendlyChainsToCapture;
  }
}

function findCapturedChainOfColor(chainList: PointState[][], playerColor: PlayerColor) {
  return chainList.filter((chain) => chain?.[0].player === playerColor && chain?.[0].liberties?.length === 0);
}

/**
 * Find all empty points adjacent to any piece in a given chain
 */
export function findLibertiesForChain(boardState: BoardState, chain: PointState[]): PointState[] {
  return getAllNeighbors(boardState, chain).filter((neighbor) => neighbor && neighbor.player === playerColors.empty);
}

/**
 * Find all empty points adjacent to any piece in the chain that a given point belongs to
 */
export function findChainLibertiesForPoint(boardState: BoardState, x: number, y: number): PointState[] {
  const chain = findAdjacentPointsInChain(boardState, x, y);
  return findLibertiesForChain(boardState, chain);
}

/**
 * Returns an object that includes which of the cardinal neighbors are empty
 * (adjacent 'liberties' of the current piece )
 */
export function findAdjacentLibertiesForPoint(boardState: BoardState, x: number, y: number): Neighbor {
  const neighbors = findNeighbors(boardState, x, y);

  const hasNorthLiberty = neighbors.north && neighbors.north.player === playerColors.empty;
  const hasEastLiberty = neighbors.east && neighbors.east.player === playerColors.empty;
  const hasSouthLiberty = neighbors.south && neighbors.south.player === playerColors.empty;
  const hasWestLiberty = neighbors.west && neighbors.west.player === playerColors.empty;

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
  boardState: BoardState,
  x: number,
  y: number,
  _player?: PlayerColor,
): Neighbor {
  const currentPoint = boardState.board[x]?.[y];
  const player =
    _player || (!currentPoint || currentPoint.player === playerColors.empty ? undefined : currentPoint.player);
  const adjacentLiberties = findAdjacentLibertiesForPoint(boardState, x, y);
  const neighbors = findNeighbors(boardState, x, y);

  return {
    north: adjacentLiberties.north || neighbors.north?.player === player ? neighbors.north : null,
    east: adjacentLiberties.east || neighbors.east?.player === player ? neighbors.east : null,
    south: adjacentLiberties.south || neighbors.south?.player === player ? neighbors.south : null,
    west: adjacentLiberties.west || neighbors.west?.player === player ? neighbors.west : null,
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
export function getSimplifiedBoardState(board: Board): string[] {
  return board.map((column) =>
    column.reduce((str, point) => {
      if (!point) {
        return str + "#";
      }
      if (point.player === playerColors.black) {
        return str + "X";
      }
      if (point.player === playerColors.white) {
        return str + "O";
      }
      return str + ".";
    }, ""),
  );
}

export function getBoardFromSimplifiedBoardState(
  boardStrings: string[],
  ai = opponents.Daedalus,
  lastPlayer = playerColors.black,
) {
  const newBoardState = getNewBoardState(boardStrings[0].length, ai);
  newBoardState.previousPlayer = lastPlayer;

  for (let x = 0; x < boardStrings[0].length; x++) {
    for (let y = 0; y < boardStrings[0].length; y++) {
      const boardStringPoint = boardStrings[x]?.[y];
      const newBoardPoint = newBoardState.board[x]?.[y];
      if (boardStringPoint === "#") {
        newBoardState.board[x][y] = null;
      }
      if (boardStringPoint === "X" && newBoardPoint?.player) {
        newBoardPoint.player = playerColors.black;
      }
      if (boardStringPoint === "O" && newBoardPoint?.player) {
        newBoardPoint.player = playerColors.white;
      }
    }
  }

  return updateCaptures(newBoardState, lastPlayer);
}
