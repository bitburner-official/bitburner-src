import * as React from "react";

export function trusted(f: () => void): (event: React.MouseEvent<HTMLElement>) => void {
  return function (event: React.MouseEvent<HTMLElement>): void {
    if (!event.isTrusted) return;
    f();
  };
}

export class PlayLockManager {
  lastPlay: number;
  delay: number;
  constructor(delay: number) {
    this.lastPlay = Date.now();
    this.delay = delay;
  }
  play() {
    this.lastPlay = Date.now();
  }
  isLocked(): boolean {
    return Date.now() - this.delay <= this.lastPlay;
  }
}
