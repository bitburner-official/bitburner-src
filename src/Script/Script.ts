/**
 * Class representing a script file.
 *
 * This does NOT represent a script that is actively running and
 * being evaluated. See RunningScript for that
 */
import { calculateRamUsage, RamUsageEntry } from "./RamCalculations";

import { Generic_fromJSON, Generic_toJSON, IReviverValue, Reviver } from "../utils/JSONReviver";
import { roundToTwo } from "../utils/helpers/roundToTwo";
import { ScriptModule } from "./ScriptModule";
import { RamCostConstants } from "../Netscript/RamCostGenerator";

export type ScriptURL = string;

export class Script {
  code = "";
  filename = "default.js";
  server = "home";

  // Ram calculation, only exists after first poll of ram cost after updating
  ramUsage?: number;
  ramUsageEntries?: RamUsageEntry[];

  // Runtime data that only exists when the script has been initiated. Cleared when script or a dependency script is updated.
  module?: Promise<ScriptModule>;
  url?: ScriptURL;
  /** Scripts that import this one, either directly or through an import chain */
  dependents: Set<Script> = new Set();
  /** Scripts that are imported by this one, either directly or through an import chain */
  dependencies: Map<ScriptURL, Script> = new Map();

  constructor(fn = "", code = "", server = "") {
    this.filename = fn;
    this.code = code;
    this.server = server; // hostname of server this script is on
  }

  /** Download the script as a file */
  download(): void {
    const filename = this.filename;
    const file = new Blob([this.code], { type: "text/plain" });
    const a = document.createElement("a"),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }

  /** Invalidates the current script module and related data, e.g. when modifying the file. */
  invalidateModule(): void {
    delete this.module;
    if (this.url) URL.revokeObjectURL(this.url);
    delete this.url;
    delete this.ramUsage;
    delete this.ramUsageEntries;
    for (const dependency of this.dependencies.values()) dependency.dependents.delete(this);
    this.dependencies.clear();
    for (const dependent of this.dependents) dependent.invalidateModule();
  }

  /**
   * Save a script from the script editor
   * @param {string} code - The new contents of the script
   * @param {Script[]} otherScripts - Other scripts on the server. Used to process imports
   */
  saveScript(filename: string, code: string, hostname: string): void {
    this.invalidateModule();
    this.code = Script.formatCode(code);
    this.filename = filename;
    this.server = hostname;
  }

  /** Gets the ram usage, while also attempting to update it if it's currently null */
  getRamUsage(otherScripts: Script[]): number | null {
    if (this.ramUsage) return this.ramUsage;
    this.updateRamUsage(otherScripts);
    return this.ramUsage ?? null;
  }

  /**
   * Calculates and updates the script's RAM usage based on its code
   * @param {Script[]} otherScripts - Other scripts on the server. Used to process imports
   */
  updateRamUsage(otherScripts: Script[]): void {
    const ramCalc = calculateRamUsage(this.code, otherScripts);
    if (ramCalc.cost >= RamCostConstants.Base) {
      this.ramUsage = roundToTwo(ramCalc.cost);
      this.ramUsageEntries = ramCalc.entries;
    } else delete this.ramUsage;
  }

  imports(): string[] {
    return [];
  }

  /** The keys that are relevant in a save file */
  static savedKeys = ["code", "filename", "server"] as const;

  // Serialize the current object to a JSON save state
  toJSON(): IReviverValue {
    return Generic_toJSON("Script", this, Script.savedKeys);
  }

  // Initializes a Script Object from a JSON save state
  static fromJSON(value: IReviverValue): Script {
    return Generic_fromJSON(Script, value.data, Script.savedKeys);
  }

  /**
   * Formats code: Removes the starting & trailing whitespace
   * @param {string} code - The code to format
   * @returns The formatted code
   */
  static formatCode(code: string): string {
    return code.replace(/^\s+|\s+$/g, "");
  }
}

Reviver.constructors.Script = Script;
