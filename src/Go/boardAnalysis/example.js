/** @param {NS} ns */
export async function main(ns) {
  let result;

  do {
    const board = ns.go.getBoardState();
    const validMoves = ns.go.analysis.getValidMoves();

    const [growX, growY] = getGrowMove(board, validMoves);
    const [randX, randY] = getRandomMove(board, validMoves);
    // Try to pick a grow move, otherwise choose a random move
    const x = growX ?? randX;
    const y = growY ?? randY;

    if (x === undefined) {
      // Pass turn if no moves are found
      result = await ns.go.passTurn();
    } else {
      // Play the selected move
      result = await ns.go.makeMove(x, y);
    }

    await ns.sleep(100);
  } while (result?.type !== "gameOver" && result?.type !== "pass");

  // After the opponent passes, end the game by passing as well
  await ns.go.passTurn();
}

/**
 * Choose one of the empty points on the board at random to play
 */
const getRandomMove = (board, validMoves) => {
  const moveOptions = [];
  const size = board[0].length;

  // Look through all the points on the board
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      // Make sure the point is a valid move
      const isValidMove = validMoves[x][y];
      // Leave some spaces to make it harder to capture our pieces
      const isNotReservedSpace = x % 2 || y % 2;

      if (isValidMove && isNotReservedSpace) {
        moveOptions.push([x, y]);
      }
    }
  }

  // Choose one of the found moves at random
  const randomIndex = Math.floor(Math.random() * moveOptions.length);
  return moveOptions[randomIndex] ?? [];
};

/**
 * Choose a point connected to a friendly stone to play
 */
const getGrowMove = (board, validMoves) => {
  const moveOptions = [];
  const size = board[0].length;

  // Look through all the points on the board
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      // make sure the move is valid
      const isValidMove = validMoves[x][y];
      // Leave some open spaces to make it harder to capture our pieces
      const isNotReservedSpace = x % 2 || y % 2;

      // Make sure we are connected to a friendly piece
      const neighbors = getNeighbors(board, x, y);
      const hasFriendlyNeighbor = neighbors.includes("X");

      if (isValidMove && isNotReservedSpace && hasFriendlyNeighbor) {
        moveOptions.push([x, y]);
      }
    }
  }

  // Choose one of the found moves at random
  const randomIndex = Math.floor(Math.random() * moveOptions.length);
  return moveOptions[randomIndex] ?? [];
};

/**
 * Find all adjacent points in the four connected directions
 */
const getNeighbors = (board, x, y) => {
  const north = board[x + 1]?.[y];
  const east = board[x][y + 1];
  const south = board[x - 1]?.[y];
  const west = board[x]?.[y - 1];

  return [north, east, south, west];
};
