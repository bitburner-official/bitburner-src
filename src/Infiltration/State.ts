import { EventEmitter } from "../utils/EventEmitter";

// This is extremely minimal so we can set this global state without dependency cycles.
export let getState: () => object | null = () => {
  return null;
};

export function setGetState(func: () => object | null): void {
  getState = func;
}

export const InfiltrationKeyEvents = new EventEmitter<[string]>();
