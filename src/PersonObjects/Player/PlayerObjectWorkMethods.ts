import { Work } from "../../Work/Work";

import type { PlayerObject } from "./PlayerObject";

export function startWork(this: PlayerObject, w: Work): void {
  if (this.currentWork !== null) {
    this.currentWork.finish(true);
  }
  this.currentWork = w;
}
export function processWork(this: PlayerObject, cycles = 1): void {
  if (this.currentWork === null) return;
  const finished = this.currentWork.process(cycles);
  if (finished) {
    this.finishWork(false);
  }
}
export function finishWork(this: PlayerObject, cancelled: boolean, suppressDialog?: boolean): void {
  if (this.currentWork === null) return;
  this.currentWork.finish(cancelled, !!suppressDialog);
  this.currentWork = null;
  this.focus = false;
}
