import { NSFull } from "../NetscriptFunctions";

/**
 * The environment in which a script runs. The environment holds
 * Netscript functions and arguments for that script.
 */
export class Environment {
  /** Whether or not the script that uses this Environment is stopped */
  stopFlag = false;

  /** The currently running function */
  runningFn = "";

  /** Environment variables (currently only Netscript functions) */
  vars: NSFull | null = null;
}
