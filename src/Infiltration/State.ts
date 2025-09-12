import { EventEmitter } from "../utils/EventEmitter";

// This is extremely minimal so we can set this global state without dependency cycles.
// We could do without the class, except you cannot assign to exports.
class InfilState<T> {
  value: T | null = null;
}

export const difficultyState = new InfilState<number>();
export const victoryState = new InfilState<{ sell: () => void; tradeToFaction: (faction: string) => void }>();
export const timerState = new InfilState<{ timer: number }>();
export const progressState = new InfilState<{ floors: number; currentFloor: number; progress: string }>();
export const stageState = new InfilState<() => object>();

export function getState(): object | null {
  const result = {};
  Object.assign(result, timerState.value, progressState.value, stageState.value?.());
  return result;
}

export function clearState(): void {
  difficultyState.value = null;
  victoryState.value = null;
  timerState.value = null;
  progressState.value = null;
  stageState.value = null;
}

export const InfiltrationKeyEvents = new EventEmitter<[string]>();
