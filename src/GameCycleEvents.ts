import { EventEmitter } from "./utils/EventEmitter";

/** Emitted by the game engine after each processed game cycle (only while the game is visible). */
export const GameCycleEvents = new EventEmitter<[]>();
