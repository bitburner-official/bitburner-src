import { EventEmitter } from "../utils/EventEmitter";

// This is extremely minimal so we can set this global state without dependency cycles.
class InfilState<T> {
  value: T | null = null;

  // This is designed to be used from within useEffect.
  set(x: T): () => void {
    this.value = x;
    return () => (this.value = null);
  }
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

export const InfiltrationKeyEvents = new EventEmitter<[string]>();
