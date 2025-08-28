import { Player } from "@player";
import { useEffect, useRef, useState } from "react";
import { PlayerObject } from "src/PersonObjects/Player/PlayerObject";

const trieq = <T>(a: T, b: T): boolean => a === b;

export const arrayShallowEquals = <T>(a: T[], b: T[]): boolean => {
  if (a.length != b.length) return false;
  return a.every((v, i) => b[i] === v);
};

export const runSelectors = (): void => {
  for (const sub of subscriptions) sub(Player);
};

const subscriptions: ((g: PlayerObject) => void)[] = [];

const subscribe = (check: (g: PlayerObject) => void): void => {
  subscriptions.push(check);
};

const unsubscribe = (check: (g: PlayerObject) => void) => {
  return (): void => {
    let found = -1;
    for (let i = 0; i < subscriptions.length; i++) {
      if (subscriptions[i] !== check) continue;
      found = i;
      break;
    }
    if (found === -1) return;
    subscriptions[found] = subscriptions[subscriptions.length - 1];
    subscriptions.length -= 1;
  };
};

const incr = (n: number): number => n + 1;

export const usePlayerSelector = <T>(f: (g: PlayerObject) => T, eq: (a: T, b: T) => boolean = trieq): T => {
  const [, setValue] = useState(0);
  const ref = useRef(f(Player));
  useEffect(() => {
    const check = (g: PlayerObject): void => {
      const next = f(g);
      if (eq(ref.current, next)) return;
      ref.current = next;
      setValue(incr);
    };
    subscribe(check);
    return unsubscribe(check);
  }, [f, eq]);
  return ref.current;
};
