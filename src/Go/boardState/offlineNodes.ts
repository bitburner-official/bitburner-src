import type { Board, BoardState, PointState } from "../Types";

import { Player } from "@player";
import { boardSizes } from "../Constants";
import { WHRNG } from "../../Casino/RNG";

type rand = (n1: number, n2: number) => number;

export function addObstacles(boardState: BoardState) {
  const rng = new WHRNG(Player.totalPlaytime ?? new Date().getTime());
  const random = (n1: number, n2: number) => n1 + Math.floor((n2 - n1 + 1) * rng.random());

  const shouldRemoveCorner = !random(0, 4);
  const shouldRemoveRows = !shouldRemoveCorner && !random(0, 4);
  const shouldAddCenterBreak = !shouldRemoveCorner && !shouldRemoveRows && random(0, 3);
  const obstacleTypeCount = +shouldRemoveCorner + +shouldRemoveRows + +shouldAddCenterBreak;

  const edgeDeadCount = random(0, (getScale(boardState.board) + 2 - obstacleTypeCount) * 1.5);

  if (shouldRemoveCorner) {
    boardState.board = addDeadCorners(boardState.board, random);
  }

  if (shouldAddCenterBreak) {
    boardState.board = addCenterBreak(boardState.board, random);
  }

  boardState.board = randomizeRotation(boardState.board, random);

  if (shouldRemoveRows) {
    boardState.board = removeRows(boardState.board, random);
  }

  boardState.board = addDeadNodesToEdge(boardState.board, random, edgeDeadCount);

  boardState.board = resetCoordinates(boardState.board);
}

export function resetCoordinates(board: Board) {
  const size = board[0].length;
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const point = board[x]?.[y];
      if (point) {
        point.x = x;
        point.y = y;
      }
    }
  }
  return board;
}

function getScale(board: Board) {
  return boardSizes.indexOf(board[0].length);
}

function removeRows(board: Board, random: rand) {
  const rowsToRemove = Math.max(random(-2, getScale(board)), 1);
  for (let i = 0; i < rowsToRemove; i++) {
    board[i] = board[i].map(() => null);
  }
  board = rotateNTimes(board, 3);
  return board;
}

function addDeadNodesToEdge(board: Board, random: rand, maxPerEdge: number) {
  const size = board[0].length;
  for (let i = 0; i < 4; i++) {
    const count = random(0, maxPerEdge);
    for (let j = 0; j < count; j++) {
      const yIndex = Math.max(random(-2, size - 1), 0);
      board[0][yIndex] = null;
    }
    board = rotate90Degrees(board);
  }

  return board;
}

function addDeadCorners(board: Board, random: rand) {
  const scale = getScale(board) + 1;

  addDeadCorner(board, random, scale);

  if (!random(0, 3)) {
    board = rotate90Degrees(board);
    board = rotate90Degrees(board);

    addDeadCorner(board, random, scale - 2);
  }

  return randomizeRotation(board, random);
}

function addDeadCorner(board: Board, random: rand, size: number) {
  let currentSize = size;
  for (let i = 0; i < size && i < currentSize; i++) {
    random(0, 1) && currentSize--;
    board[i].forEach((point, index) => index < currentSize && point && (board[point.x][point.y] = null));
  }
  return board;
}

function addCenterBreak(board: Board, random: rand) {
  const size = board[0].length;
  const maxOffset = getScale(board);
  const xIndex = random(0, maxOffset * 2) - maxOffset + Math.floor(size / 2);
  const length = random(1, Math.floor(size / 2 - 1));

  board[xIndex] = board[xIndex].map((point, index) => (index < length ? null : point));

  return randomizeRotation(board, random);
}

function randomizeRotation(board: Board, random: rand) {
  return rotateNTimes(board, random(0, 3));
}

function rotateNTimes(board: Board, rotations: number) {
  for (let i = 0; i < rotations; i++) {
    board = rotate90Degrees(board);
  }
  return board;
}

export function rotate90Degrees(board: Board): Board {
  return board[0].map((_, index: number) => board.map((row: (PointState | null)[]) => row[index]).reverse());
}
