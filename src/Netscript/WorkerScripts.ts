import { WorkerScript } from "./WorkerScript";

/** Global pool of all active scripts (scripts that are currently running) */
export const workerScripts = new Map<number, WorkerScript>();
