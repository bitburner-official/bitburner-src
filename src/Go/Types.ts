import type { GoColor, GoOpponent, GoPlayType } from "@enums";

export type Board = (PointState | null)[][];

export type SimpleBoard = string[];

export type Move = {
  point: PointState;
  oldLibertyCount?: number | null;
  newLibertyCount?: number | null;
  createsLife?: boolean;
};

export type MoveType =
  | "capture"
  | "defendCapture"
  | "eyeMove"
  | "eyeBlock"
  | "pattern"
  | "growth"
  | "expansion"
  | "jump"
  | "defend"
  | "surround"
  | "corner"
  | "random";

export type MoveOptions = {
  readonly eyeMove: () => Move | null;
  readonly random: () => Move | null;
  readonly defendCapture: () => Promise<Move | null>;
  readonly corner: () => Move | null;
  readonly defend: () => Move | null;
  readonly pattern: () => Promise<Move | null>;
  readonly capture: () => Promise<Move | null>;
  readonly growth: () => Move | null;
  readonly eyeBlock: () => Move | null;
  readonly surround: () => Move | null;
  readonly expansion: () => Move | null;
  readonly jump: () => Move | null;
};

export type EyeMove = {
  point: PointState;
  createsLife: boolean;
};

export type BoardState = {
  board: Board;
  previousPlayer: GoColor | null;
  /** The previous board positions as a SimpleBoard */
  previousBoards: string[];
  ai: GoOpponent;
  passCount: number;
  cheatCount: number;
  cheatCountForWhite: number;
  komiOverride: number | null;
  highlightedPoints: (PointHighlight | null)[][];
};

export type PointState = {
  color: GoColor;
  chain: string;
  liberties: (PointState | null)[] | null;
  x: number;
  y: number;
};

export type Play =
  | {
      type: GoPlayType.move;
      x: number;
      y: number;
    }
  | {
      type: GoPlayType.gameOver | GoPlayType.pass;
      x: null;
      y: null;
    };

export type Neighbor = {
  north: PointState | null;
  east: PointState | null;
  south: PointState | null;
  west: PointState | null;
};

export type GoScore = {
  White: { pieces: number; territory: number; komi: number; sum: number };
  Black: { pieces: number; territory: number; komi: number; sum: number };
};

export type OpponentStats = {
  wins: number;
  losses: number;
  nodes: number;
  nodePower: number;
  winStreak: number;
  oldWinStreak: number;
  highestWinStreak: number;
  rep: number;
};

export type SimpleOpponentStats = {
  wins: number;
  losses: number;
  winStreak: number;
  highestWinStreak: number;
  rep: number;
  bonusPercent: number;
  bonusDescription: string;
};

export type PointHighlight = {
  color: string;
  text: string;
};
