import { WorkerScript } from "./WorkerScript";

/**
 * Script death marker.
 *
 * This is thrown in various places when a script has been killed, as opposed to ending
 * normally. It can be thrown from exit() and spawn(), which inherently kill the script,
 * or from an await if the script is killed while waiting for a ns function, or directly
 * if the script is dead but running code is still trying to execute ns functions. By extending Error,
 * users with error handling in their scripts that end up catching this can
 * more easily detect this error type and ignore it (if desired) or get a stack
 * trace to help them identify the root cause (if the behaviour is unexpected).
 *
 * IMPORTANT: the game engine should not base any of it's decisions on the data
 * carried in a ScriptDeath instance.
 *
 * This is because ScriptDeath instances are thrown through player code when a
 * script is killed. Which grants the player access to the class and the ability
 * to construct new instances with arbitrary data.
 */
export class ScriptDeath extends Error {
  /** Process ID number. */
  pid: number;

  /** Filename of the script. */
  filename: string;

  /** IP Address on which the script was running */
  hostname: string;

  constructor(ws: WorkerScript) {
    // Invoke the Error constructor with a meaningful message
    const message = `NS instance has already been killed (${ws.name} running on ${ws.hostname} with pid ${ws.pid})`;
    super(message);
    // Setting the base Error.name property is important to facilitate easy
    // detection, since prototype.constructor.name might be minified for them.
    this.name = "ScriptDeath";

    // Set own properties
    this.pid = ws.pid;
    this.filename = ws.name;
    this.hostname = ws.hostname;

    Object.freeze(this);
  }
}

Object.freeze(ScriptDeath);
Object.freeze(ScriptDeath.prototype);
