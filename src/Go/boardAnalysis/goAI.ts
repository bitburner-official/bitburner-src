import type { BoardState, EyeMove, Move, MoveOptions, PointState } from "../Types";

import { Player } from "@player";
import { AugmentationName, GoOpponent, GoColor, GoPlayType } from "@enums";
import { opponentDetails } from "../Constants";
import { findNeighbors, floor, isDefined, isNotNull, passTurn } from "../boardState/boardState";
import {
  evaluateIfMoveIsValid,
  evaluateMoveResult,
  findEffectiveLibertiesOfNewMove,
  findEnemyNeighborChainWithFewestLiberties,
  findMinLibertyCountOfAdjacentChains,
  getAllChains,
  getAllEyes,
  getAllEyesByChainId,
  getAllNeighboringChains,
  getAllValidMoves,
} from "./boardAnalysis";
import { findDisputedTerritory } from "./controlledTerritory";
import { findAnyMatchedPatterns } from "./patternMatching";
import { WHRNG } from "../../Casino/RNG";

/*
  Basic GO AIs, each with some personality and weaknesses

  The AIs are aware of chains of connected pieces, their liberties, and their eyes.
  They know how to lok for moves that capture or threaten capture, moves that create eyes, and moves that take
     away liberties from their opponent, as well as some pattern matching on strong move ideas.

  They do not know about larger jump moves, nor about frameworks on the board. Also, they each have a tendancy to
     over-focus on a different type of move, giving each AI a different playstyle and weakness to exploit.
 */

/**
 * Finds an array of potential moves based on the current board state, then chooses one
 * based on the given opponent's personality and preferences. If no preference is given by the AI,
 * will choose one from the reasonable moves at random.
 *
 * @returns a promise that will resolve with a move (or pass) from the designated AI opponent.
 */
export async function getMove(boardState: BoardState, player: GoColor, opponent: GoOpponent, rngOverride?: number) {
  await sleep(300);
  const rng = new WHRNG(rngOverride || Player.totalPlaytime);
  const smart = isSmart(opponent, rng.random());
  const moves = getMoveOptions(boardState, player, rng.random(), smart);

  const priorityMove = await getFactionMove(moves, opponent, rng.random());
  if (priorityMove) {
    return {
      type: GoPlayType.move,
      x: priorityMove.x,
      y: priorityMove.y,
    };
  }

  // If no priority move is chosen, pick one of the reasonable moves
  const moveOptions = [
    (await moves.growth())?.point,
    (await moves.surround())?.point,
    (await moves.defend())?.point,
    (await moves.expansion())?.point,
    (await moves.pattern())?.point,
    (await moves.eyeMove())?.point,
    (await moves.eyeBlock())?.point,
  ]
    .filter(isNotNull)
    .filter(isDefined)
    .filter((point) => evaluateIfMoveIsValid(boardState, point.x, point.y, player, false));

  const chosenMove = moveOptions[floor(rng.random() * moveOptions.length)];

  if (chosenMove) {
    await sleep(200);
    console.debug(`Non-priority move chosen: ${chosenMove.x} ${chosenMove.y}`);
    return {
      type: GoPlayType.move,
      x: chosenMove.x,
      y: chosenMove.y,
    };
  } else {
    console.debug("No valid moves found");
    return handleNoMoveFound(boardState, player);
  }
}

/**
 * Detects if the AI is merely passing their turn, or if the game should end.
 *
 * Ends the game if the player passed on the previous turn before the AI passes,
 *   or if the player will be forced to pass their next turn after the AI passes.
 */
function handleNoMoveFound(boardState: BoardState, player: GoColor) {
  passTurn(boardState, player);
  const opposingPlayer = player === GoColor.white ? GoColor.black : GoColor.white;
  const remainingTerritory = getAllValidMoves(boardState, opposingPlayer).length;
  if (remainingTerritory > 0 && boardState.passCount < 2) {
    return {
      type: GoPlayType.pass,
      x: -1,
      y: -1,
    };
  } else {
    return {
      type: GoPlayType.gameOver,
      x: -1,
      y: -1,
    };
  }
}

/**
 * Given a group of move options, chooses one based on the given opponent's personality (if any fit their priorities)
 */
async function getFactionMove(moves: MoveOptions, faction: GoOpponent, rng: number): Promise<PointState | null> {
  if (faction === GoOpponent.Netburners) {
    return getNetburnersPriorityMove(moves, rng);
  }
  if (faction === GoOpponent.SlumSnakes) {
    return getSlumSnakesPriorityMove(moves, rng);
  }
  if (faction === GoOpponent.TheBlackHand) {
    return getBlackHandPriorityMove(moves, rng);
  }
  if (faction === GoOpponent.Tetrads) {
    return getTetradPriorityMove(moves, rng);
  }
  if (faction === GoOpponent.Daedalus) {
    return getDaedalusPriorityMove(moves, rng);
  }

  return getIlluminatiPriorityMove(moves, rng);
}

/**
 * Determines if certain failsafes and mistake avoidance are enabled for the given move
 */
function isSmart(faction: GoOpponent, rng: number) {
  if (faction === GoOpponent.Netburners) {
    return false;
  }
  if (faction === GoOpponent.SlumSnakes) {
    return rng < 0.3;
  }
  if (faction === GoOpponent.TheBlackHand) {
    return rng < 0.8;
  }

  return true;
}

/**
 * Netburners mostly just put random points around the board, but occasionally have a smart move
 */
async function getNetburnersPriorityMove(moves: MoveOptions, rng: number): Promise<PointState | null> {
  if (rng < 0.2) {
    return getIlluminatiPriorityMove(moves, rng);
  } else if (rng < 0.4 && (await moves.expansion())) {
    return (await moves.expansion())?.point ?? null;
  } else if (rng < 0.6 && (await moves.growth())) {
    return (await moves.growth())?.point ?? null;
  } else if (rng < 0.75) {
    return (await moves.random())?.point ?? null;
  }

  return null;
}

/**
 * Slum snakes prioritize defending their pieces and building chains that snake around as much of the bord as possible.
 */
async function getSlumSnakesPriorityMove(moves: MoveOptions, rng: number): Promise<PointState | null> {
  if (await moves.defendCapture()) {
    return (await moves.defendCapture())?.point ?? null;
  }

  if (rng < 0.2) {
    return getIlluminatiPriorityMove(moves, rng);
  } else if (rng < 0.6 && (await moves.growth())) {
    return (await moves.growth())?.point ?? null;
  } else if (rng < 0.65) {
    return (await moves.random())?.point ?? null;
  }

  return null;
}

/**
 * Black hand just wants to smOrk. They always capture or smother the opponent if possible.
 */
async function getBlackHandPriorityMove(moves: MoveOptions, rng: number): Promise<PointState | null> {
  if (await moves.capture()) {
    console.debug("capture: capture move chosen");
    return (await moves.capture())?.point ?? null;
  }

  const surround = await moves.surround();

  if (surround && surround.point && (surround.newLibertyCount ?? 999) <= 1) {
    console.debug("surround move chosen");
    return surround.point;
  }

  if (await moves.defendCapture()) {
    console.debug("defend capture: defend move chosen");
    return (await moves.defendCapture())?.point ?? null;
  }

  if (surround && surround.point && (surround?.newLibertyCount ?? 999) <= 2) {
    console.debug("surround move chosen");
    return surround.point;
  }

  if (rng < 0.3) {
    return getIlluminatiPriorityMove(moves, rng);
  } else if (rng < 0.75 && surround) {
    return surround.point;
  } else if (rng < 0.8) {
    return (await moves.random())?.point ?? null;
  }

  return null;
}

/**
 * Tetrads really like to be up close and personal, cutting and circling their opponent
 */
async function getTetradPriorityMove(moves: MoveOptions, rng: number): Promise<PointState | null> {
  if (await moves.capture()) {
    console.debug("capture: capture move chosen");
    return (await moves.capture())?.point ?? null;
  }

  if (await moves.defendCapture()) {
    console.debug("defend capture: defend move chosen");
    return (await moves.defendCapture())?.point ?? null;
  }

  if (await moves.pattern()) {
    console.debug("pattern match move chosen");
    return (await moves.pattern())?.point ?? null;
  }

  const surround = await moves.surround();
  if (surround && surround.point && (surround?.newLibertyCount ?? 9) <= 1) {
    console.debug("surround move chosen");
    return surround.point;
  }

  if (rng < 0.4) {
    return getIlluminatiPriorityMove(moves, rng);
  }

  return null;
}

/**
 * Daedalus almost always picks the Illuminati move, but very occasionally gets distracted.
 */
async function getDaedalusPriorityMove(moves: MoveOptions, rng: number): Promise<PointState | null> {
  if (rng < 0.9) {
    return await getIlluminatiPriorityMove(moves, rng);
  }

  return null;
}

/**
 * First prioritizes capturing of opponent pieces.
 * Then, preventing capture of their own pieces.
 * Then, creating "eyes" to solidify their control over the board
 * Then, finding opportunities to capture on their next move
 * Then, blocking the opponent's attempts to create eyes
 * Finally, will match any of the predefined local patterns indicating a strong move.
 */
async function getIlluminatiPriorityMove(moves: MoveOptions, rng: number): Promise<PointState | null> {
  if (await moves.capture()) {
    console.debug("capture: capture move chosen");
    return (await moves.capture())?.point ?? null;
  }

  if (await moves.defendCapture()) {
    console.debug("defend capture: defend move chosen");
    return (await moves.defendCapture())?.point ?? null;
  }

  if (await moves.eyeMove()) {
    console.debug("Create eye move chosen");
    return (await moves.eyeMove())?.point ?? null;
  }

  const surround = await moves.surround();
  if (surround && surround.point && (surround?.newLibertyCount ?? 9) <= 1) {
    console.debug("surround move chosen");
    return surround.point;
  }

  if (await moves.eyeBlock()) {
    console.debug("Block eye move chosen");
    return (await moves.eyeBlock())?.point ?? null;
  }

  if (await moves.corner()) {
    console.debug("Corner move chosen");
    return (await moves.corner())?.point ?? null;
  }

  const hasMoves = [await moves.eyeMove(), await moves.eyeBlock(), await moves.growth(), moves.defend, surround].filter(
    (m) => m,
  ).length;
  const usePattern = rng > 0.25 || !hasMoves;

  if ((await moves.pattern()) && usePattern) {
    console.debug("pattern match move chosen");
    return (await moves.pattern())?.point ?? null;
  }

  if (rng > 0.4 && (await moves.jump())) {
    console.debug("Jump move chosen");
    return (await moves.jump())?.point ?? null;
  }

  if (rng < 0.6 && surround && surround.point && (surround?.newLibertyCount ?? 9) <= 2) {
    console.debug("surround move chosen");
    return surround.point;
  }

  return null;
}

/**
 * Get a move that places a piece to influence (and later control) a corner
 */
function getCornerMove(boardState: BoardState) {
  const boardEdge = boardState.board[0].length - 1;
  const cornerMax = boardEdge - 2;
  if (isCornerAvailableForMove(boardState, cornerMax, cornerMax, boardEdge, boardEdge)) {
    return boardState.board[cornerMax][cornerMax];
  }
  if (isCornerAvailableForMove(boardState, 0, cornerMax, cornerMax, boardEdge)) {
    return boardState.board[2][cornerMax];
  }
  if (isCornerAvailableForMove(boardState, 0, 0, 2, 2)) {
    return boardState.board[2][2];
  }
  if (isCornerAvailableForMove(boardState, cornerMax, 0, boardEdge, 2)) {
    return boardState.board[cornerMax][2];
  }
  return null;
}

/**
 * Find all non-offline nodes in a given area
 */
function findLiveNodesInArea(boardState: BoardState, x1: number, y1: number, x2: number, y2: number) {
  const foundPoints: PointState[] = [];
  boardState.board.forEach((column) =>
    column.forEach(
      (point) => point && point.x >= x1 && point.x <= x2 && point.y >= y1 && point.y <= y2 && foundPoints.push(point),
    ),
  );
  return foundPoints;
}

/**
 * Determine if a corner is largely intact and currently empty, and thus a good target for corner takeover moves
 */
function isCornerAvailableForMove(boardState: BoardState, x1: number, y1: number, x2: number, y2: number) {
  const foundPoints = findLiveNodesInArea(boardState, x1, y1, x2, y2);
  const foundPieces = foundPoints.filter((point) => point.color !== GoColor.empty);
  return foundPoints.length >= 7 ? foundPieces.length === 0 : false;
}

/**
 * Select a move from the list of open-area moves
 */
function getExpansionMove(
  boardState: BoardState,
  player: GoColor,
  availableSpaces: PointState[],
  rng: number,
  moveArray?: Move[],
) {
  const moveOptions = moveArray ?? getExpansionMoveArray(boardState, player, availableSpaces);
  const randomIndex = floor(rng * moveOptions.length);
  return moveOptions[randomIndex];
}

/**
 * Get a move in open space that is nearby a friendly piece
 */
function getJumpMove(
  boardState: BoardState,
  player: GoColor,
  availableSpaces: PointState[],
  rng: number,
  moveArray?: Move[],
) {
  const board = boardState.board;
  const moveOptions = (moveArray ?? getExpansionMoveArray(boardState, player, availableSpaces)).filter(({ point }) =>
    [
      board[point.x]?.[point.y + 2],
      board[point.x + 2]?.[point.y],
      board[point.x]?.[point.y - 2],
      board[point.x - 2]?.[point.y],
    ].some((point) => point?.color === player),
  );

  const randomIndex = floor(rng * moveOptions.length);
  return moveOptions[randomIndex];
}

/**
 * Finds a move in an open area to expand influence and later build on
 */
export function getExpansionMoveArray(boardState: BoardState, player: GoColor, availableSpaces: PointState[]): Move[] {
  // Look for any empty spaces fully surrounded by empty spaces to expand into
  const emptySpaces = availableSpaces.filter((space) => {
    const neighbors = findNeighbors(boardState, space.x, space.y);
    return (
      [neighbors.north, neighbors.east, neighbors.south, neighbors.west].filter(
        (point) => point && point.color === GoColor.empty,
      ).length === 4
    );
  });

  // Once no such empty areas exist anymore, instead expand into any disputed territory
  // to gain a few more points in endgame
  const disputedSpaces = emptySpaces.length ? [] : getDisputedTerritoryMoves(boardState, availableSpaces, 1);

  const moveOptions = [...emptySpaces, ...disputedSpaces];

  return moveOptions.map((point) => {
    return {
      point: point,
      newLibertyCount: -1,
      oldLibertyCount: -1,
    };
  });
}

function getDisputedTerritoryMoves(boardState: BoardState, availableSpaces: PointState[], maxChainSize = 99) {
  const chains = getAllChains(boardState).filter((chain) => chain.length <= maxChainSize);

  return availableSpaces.filter((space) => {
    const chain = chains.find((chain) => chain[0].chain === space.chain) ?? [];
    const playerNeighbors = getAllNeighboringChains(boardState, chain, chains);
    const hasWhitePieceNeighbor = playerNeighbors.find((neighborChain) => neighborChain[0]?.color === GoColor.white);
    const hasBlackPieceNeighbor = playerNeighbors.find((neighborChain) => neighborChain[0]?.color === GoColor.black);

    return hasWhitePieceNeighbor && hasBlackPieceNeighbor;
  });
}

/**
 * Finds all moves that increases the liberties of the player's pieces, making them harder to capture and occupy more space on the board.
 */
async function getLibertyGrowthMoves(boardState: BoardState, player: GoColor, availableSpaces: PointState[]) {
  const friendlyChains = getAllChains(boardState).filter((chain) => chain[0].color === player);

  if (!friendlyChains.length) {
    return [];
  }

  // Get all liberties of friendly chains as potential growth move options
  const liberties = friendlyChains
    .map((chain) =>
      chain[0].liberties?.filter(isNotNull).map((liberty) => ({
        libertyPoint: liberty,
        oldLibertyCount: chain[0].liberties?.length,
      })),
    )
    .flat()
    .filter(isNotNull)
    .filter(isDefined)
    .filter((liberty) =>
      availableSpaces.find((point) => liberty.libertyPoint.x === point.x && liberty.libertyPoint.y === point.y),
    );

  // Find a liberty where playing a piece increases the liberty of the chain (aka expands or defends the chain)
  return liberties
    .map((liberty) => {
      const move = liberty.libertyPoint;

      const newLibertyCount = findEffectiveLibertiesOfNewMove(boardState, move.x, move.y, player).length;

      // Get the smallest liberty count of connected chains to represent the old state
      const oldLibertyCount = findMinLibertyCountOfAdjacentChains(boardState, move.x, move.y, player);

      return {
        point: move,
        oldLibertyCount: oldLibertyCount,
        newLibertyCount: newLibertyCount,
      };
    })
    .filter((move) => move.newLibertyCount > 1 && move.newLibertyCount >= move.oldLibertyCount);
}

/**
 * Find a move that increases the player's liberties by the maximum amount
 */
async function getGrowthMove(initialState: BoardState, player: GoColor, availableSpaces: PointState[], rng: number) {
  const growthMoves = await getLibertyGrowthMoves(initialState, player, availableSpaces);

  const maxLibertyCount = Math.max(...growthMoves.map((l) => l.newLibertyCount - l.oldLibertyCount));

  const moveCandidates = growthMoves.filter((l) => l.newLibertyCount - l.oldLibertyCount === maxLibertyCount);
  return moveCandidates[floor(rng * moveCandidates.length)];
}

/**
 * Find a move that specifically increases a chain's liberties from 1 to more than 1, preventing capture
 */
async function getDefendMove(initialState: BoardState, player: GoColor, availableSpaces: PointState[]) {
  const growthMoves = await getLibertyGrowthMoves(initialState, player, availableSpaces);
  const libertyIncreases =
    growthMoves?.filter((move) => move.oldLibertyCount <= 1 && move.newLibertyCount > move.oldLibertyCount) ?? [];

  const maxLibertyCount = Math.max(...libertyIncreases.map((l) => l.newLibertyCount - l.oldLibertyCount));

  if (maxLibertyCount < 1) {
    return null;
  }

  const moveCandidates = libertyIncreases.filter((l) => l.newLibertyCount - l.oldLibertyCount === maxLibertyCount);
  return moveCandidates[floor(Math.random() * moveCandidates.length)];
}

/**
 * Find a move that reduces the opponent's liberties as much as possible,
 *   capturing (or making it easier to capture) their pieces
 */
async function getSurroundMove(boardState: BoardState, player: GoColor, availableSpaces: PointState[], smart = true) {
  const opposingPlayer = player === GoColor.black ? GoColor.white : GoColor.black;
  const enemyChains = getAllChains(boardState).filter((chain) => chain[0].color === opposingPlayer);

  if (!enemyChains.length || !availableSpaces.length) {
    return null;
  }

  const enemyLiberties = enemyChains
    .map((chain) => chain[0].liberties)
    .flat()
    .filter((liberty) => availableSpaces.find((point) => liberty?.x === point.x && liberty?.y === point.y))
    .filter(isNotNull);

  const captureMoves: Move[] = [];
  const atariMoves: Move[] = [];
  const surroundMoves: Move[] = [];

  enemyLiberties.forEach((move) => {
    const newLibertyCount = findEffectiveLibertiesOfNewMove(boardState, move.x, move.y, player).length;

    const weakestEnemyChain = findEnemyNeighborChainWithFewestLiberties(
      boardState,
      move.x,
      move.y,
      player === GoColor.black ? GoColor.white : GoColor.black,
    );
    const weakestEnemyChainLength = weakestEnemyChain?.length ?? 99;

    const enemyChainLibertyCount = weakestEnemyChain?.[0]?.liberties?.length ?? 99;

    const enemyLibertyGroups = [
      ...(weakestEnemyChain?.[0]?.liberties ?? []).reduce(
        (chainIDs, point) => chainIDs.add(point?.chain ?? ""),
        new Set<string>(),
      ),
    ];

    // Do not suggest moves that do not capture anything and let your opponent immediately capture
    if (newLibertyCount <= 2 && enemyChainLibertyCount > 2) {
      return;
    }

    // If a neighboring enemy chain has only one liberty, the current move suggestion will capture
    if (enemyChainLibertyCount <= 1) {
      captureMoves.push({
        point: move,
        oldLibertyCount: enemyChainLibertyCount,
        newLibertyCount: enemyChainLibertyCount - 1,
      });
    }

    // If the move puts the enemy chain in threat of capture, it forces the opponent to respond.
    // Only do this if your piece cannot be captured, or if the enemy group is surrounded and vulnerable to losing its only interior space
    else if (
      enemyChainLibertyCount === 2 &&
      (newLibertyCount >= 2 || (enemyLibertyGroups.length === 1 && weakestEnemyChainLength > 3) || !smart)
    ) {
      atariMoves.push({
        point: move,
        oldLibertyCount: enemyChainLibertyCount,
        newLibertyCount: enemyChainLibertyCount - 1,
      });
    }

    // If the move will not immediately get re-captured, and limit's the opponent's liberties
    else if (newLibertyCount >= 2) {
      surroundMoves.push({
        point: move,
        oldLibertyCount: enemyChainLibertyCount,
        newLibertyCount: enemyChainLibertyCount - 1,
      });
    }
  });

  return [...captureMoves, ...atariMoves, ...surroundMoves][0];
}

/**
 * Finds all moves that would create an eye for the given player.
 *
 * An "eye" is empty point(s) completely surrounded by a single player's connected pieces.
 * If a chain has multiple eyes, it cannot be captured by the opponent (since they can only fill one eye at a time,
 *  and suiciding your own pieces is not legal unless it captures the opponents' first)
 */
function getEyeCreationMoves(
  boardState: BoardState,
  player: GoColor,
  availableSpaces: PointState[],
  maxLiberties = 99,
) {
  const allEyes = getAllEyesByChainId(boardState, player);
  const currentEyes = getAllEyes(boardState, player, allEyes);

  const currentLivingGroupIDs = Object.keys(allEyes).filter((chainId) => allEyes[chainId].length >= 2);
  const currentLivingGroupsCount = currentLivingGroupIDs.length;
  const currentEyeCount = currentEyes.filter((eye) => eye.length).length;

  const chains = getAllChains(boardState);
  const friendlyLiberties = chains
    .filter((chain) => chain[0].color === player)
    .filter((chain) => chain.length > 1)
    .filter((chain) => chain[0].liberties && chain[0].liberties?.length <= maxLiberties)
    .filter((chain) => !currentLivingGroupIDs.includes(chain[0].chain))
    .map((chain) => chain[0].liberties)
    .flat()
    .filter(isNotNull)
    .filter((point) =>
      availableSpaces.find((availablePoint) => availablePoint.x === point.x && availablePoint.y === point.y),
    )
    .filter((point: PointState) => {
      const neighbors = findNeighbors(boardState, point.x, point.y);
      const neighborhood = [neighbors.north, neighbors.east, neighbors.south, neighbors.west];
      return (
        neighborhood.filter((point) => !point || point?.color === player).length >= 2 &&
        neighborhood.some((point) => point?.color === GoColor.empty)
      );
    });

  const eyeCreationMoves = friendlyLiberties.reduce((moveOptions: EyeMove[], point: PointState) => {
    const evaluationBoard = evaluateMoveResult(boardState, point.x, point.y, player);
    const newEyes = getAllEyes(evaluationBoard, player);
    const newLivingGroupsCount = newEyes.filter((eye) => eye.length >= 2).length;
    const newEyeCount = newEyes.filter((eye) => eye.length).length;
    if (
      newLivingGroupsCount > currentLivingGroupsCount ||
      (newEyeCount > currentEyeCount && newLivingGroupsCount === currentLivingGroupsCount)
    ) {
      moveOptions.push({
        point: point,
        createsLife: newLivingGroupsCount > currentLivingGroupsCount,
      });
    }
    return moveOptions;
  }, []);

  return eyeCreationMoves.sort((moveA, moveB) => +moveB.createsLife - +moveA.createsLife);
}

function getEyeCreationMove(boardState: BoardState, player: GoColor, availableSpaces: PointState[]) {
  return getEyeCreationMoves(boardState, player, availableSpaces)[0];
}

/**
 * If there is only one move that would create two eyes for the opponent, it should be blocked if possible
 */
function getEyeBlockingMove(boardState: BoardState, player: GoColor, availablePoints: PointState[]) {
  const opposingPlayer = player === GoColor.white ? GoColor.black : GoColor.white;
  const opponentEyeMoves = getEyeCreationMoves(boardState, opposingPlayer, availablePoints, 5);
  const twoEyeMoves = opponentEyeMoves.filter((move) => move.createsLife);
  const oneEyeMoves = opponentEyeMoves.filter((move) => !move.createsLife);

  if (twoEyeMoves.length === 1) {
    return twoEyeMoves[0];
  }
  if (!twoEyeMoves.length && oneEyeMoves.length === 1) {
    return oneEyeMoves[0];
  }
  return null;
}

/**
 * Gets a group of reasonable moves based on the current board state, to be passed to the factions' AI to decide on
 */
function getMoveOptions(
  boardState: BoardState,
  player: GoColor,
  rng: number,
  smart = true,
): { [s in keyof MoveOptions]: () => Promise<Move | null> } {
  const availableSpaces = findDisputedTerritory(boardState, player, smart);
  const contestedPoints = getDisputedTerritoryMoves(boardState, availableSpaces);
  const expansionMoves = getExpansionMoveArray(boardState, player, availableSpaces);

  // If the player is passing, and all territory is surrounded by a single color: do not suggest moves that
  // needlessly extend the game, unless they actually can change the score
  const endGameAvailable = !contestedPoints.length && boardState.passCount;

  const moveOptions: { [s in keyof MoveOptions]: Move | null | undefined } = {
    capture: undefined,
    defendCapture: undefined,
    eyeMove: undefined,
    eyeBlock: undefined,
    pattern: undefined,
    growth: undefined,
    expansion: undefined,
    jump: undefined,
    defend: undefined,
    surround: undefined,
    corner: undefined,
    random: undefined,
  };

  const moveOptionGetters: { [s in keyof MoveOptions]: () => Promise<Move | null> } = {
    capture: async () => {
      const surroundMove = await retrieveMoveOption("surround");
      return surroundMove && surroundMove?.newLibertyCount === 0 ? surroundMove : null;
    },
    defendCapture: async () => {
      const defendMove = await retrieveMoveOption("defend");
      return defendMove &&
        defendMove.oldLibertyCount == 1 &&
        defendMove?.newLibertyCount &&
        defendMove?.newLibertyCount > 1
        ? defendMove
        : null;
    },
    eyeMove: async () => (endGameAvailable ? null : getEyeCreationMove(boardState, player, availableSpaces) ?? null),
    eyeBlock: async () => (endGameAvailable ? null : getEyeBlockingMove(boardState, player, availableSpaces) ?? null),
    pattern: async () => {
      const point = endGameAvailable
        ? null
        : await findAnyMatchedPatterns(boardState, player, availableSpaces, smart, rng);
      return point ? { point } : null;
    },
    growth: async () =>
      endGameAvailable ? null : (await getGrowthMove(boardState, player, availableSpaces, rng)) ?? null,
    expansion: async () => (await getExpansionMove(boardState, player, availableSpaces, rng, expansionMoves)) ?? null,
    jump: async () => (await getJumpMove(boardState, player, availableSpaces, rng, expansionMoves)) ?? null,
    defend: async () => (await getDefendMove(boardState, player, availableSpaces)) ?? null,
    surround: async () => (await getSurroundMove(boardState, player, availableSpaces, smart)) ?? null,
    corner: async () => {
      const point = getCornerMove(boardState);
      return point ? { point } : null;
    },
    random: async () => {
      // Only offer a random move if there are some contested spaces on the board.
      // (Random move should not be picked if the AI would otherwise pass turn.)
      const point = contestedPoints.length ? availableSpaces[floor(rng * availableSpaces.length)] : null;
      return point ? { point } : null;
    },
  };

  async function retrieveMoveOption(id: keyof typeof moveOptions): Promise<Move | null> {
    await sleep(100);
    if (moveOptions[id] !== undefined) {
      return moveOptions[id] ?? null;
    }

    const move = (await moveOptionGetters[id]()) ?? null;
    moveOptions[id] = move;
    return move;
  }

  return moveOptionGetters;
}

/**
 * Gets the starting score for white.
 */
export function getKomi(opponent: GoOpponent) {
  return opponentDetails[opponent].komi;
}

/**
 * Allows time to pass
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function showWorldDemon() {
  return Player.hasAugmentation(AugmentationName.TheRedPill, true) && Player.sourceFileLvl(1);
}
