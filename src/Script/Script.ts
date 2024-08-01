import type { BaseServer } from "../Server/BaseServer";
import { calculateRamUsage, RamUsageEntry } from "./RamCalculations";
import { LoadedModule, ScriptURL } from "./LoadedModule";
import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";
import { roundToTwo } from "../utils/helpers/roundToTwo";
import { RamCostConstants } from "../Netscript/RamCostGenerator";
import { ScriptFilePath } from "../Paths/ScriptFilePath";
import { ContentFile } from "../Paths/ContentFile";

/** A script file as a file on a server.
 * For the execution of a script, see RunningScript and WorkerScript */
export class Script implements ContentFile {
  code: string;
  filename: ScriptFilePath;
  server: string;

  // Ram calculation, only exists after first poll of ram cost after updating
  ramUsage: number | null = null;
  ramUsageEntries: RamUsageEntry[] = [];
  ramCalculationError: string | null = null;

  // Runtime data that only exists when the script has been initiated. Cleared when script or a dependency script is updated.
  mod: LoadedModule | null = null;
  /** Scripts that directly import this one. Stored so we can invalidate these dependent scripts when this one is invalidated. */
  dependents = new Set<Script>();
  /**
   * Scripts that we directly or indirectly import, including ourselves.
   * Stored only so RunningScript can use it, to translate urls in error messages.
   * Because RunningScript uses the reference directly (to reduce object copies), it must be immutable.
   */
  dependencies = new Map<ScriptURL, Script>();

  get content() {
    return this.code;
  }
  set content(newCode: string) {
    if (this.code === newCode) return;
    this.code = newCode;
    this.invalidateModule();
  }

  constructor(fn = "default.js" as ScriptFilePath, code = "", server = "") {
    this.filename = fn;
    this.code = code;
    this.server = server; // hostname of server this script is on
  }

  /** Invalidates the current script module and related data, e.g. when modifying the file. */
  invalidateModule(): void {
    // Always clear ram usage
    this.ramUsage = null;
    this.ramUsageEntries.length = 0;
    this.ramCalculationError = null;
    // Early return if there's already no URL
    if (!this.mod) return;
    this.mod = null;
    for (const dependent of this.dependents) dependent.invalidateModule();
    this.dependents.clear();
    // This will be mutated in compile(), but is immutable after that.
    // (No RunningScripts can access this copy before that point).
    this.dependencies = new Map();
  }

  /** Gets the ram usage, while also attempting to update it if it's currently null */
  getRamUsage(otherScripts: Map<ScriptFilePath, Script>): number | null {
    if (this.ramUsage) return this.ramUsage;
    this.updateRamUsage(otherScripts);
    return this.ramUsage;
  }

  /**
   * Calculates and updates the script's RAM usage based on its code
   * @param {Script[]} otherScripts - Other scripts on the server. Used to process imports
   */
  updateRamUsage(otherScripts: Map<ScriptFilePath, Script>): void {
    const ramCalc = calculateRamUsage(this.code, this.filename, this.server, otherScripts);
    if (ramCalc.cost && ramCalc.cost >= RamCostConstants.Base) {
      this.ramUsage = roundToTwo(ramCalc.cost);
      this.ramUsageEntries = ramCalc.entries as RamUsageEntry[];
      this.ramCalculationError = null;
      return;
    }

    this.ramUsage = null;
    this.ramCalculationError = ramCalc.errorMessage ?? null;
  }

  /** Remove script from server. Fails if the provided server isn't the server for this script. */
  deleteFromServer(server: BaseServer): boolean {
    if (this.server !== server.hostname || server.isRunning(this.filename)) return false;
    this.invalidateModule();
    server.scripts.delete(this.filename);
    return true;
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
}

constructorsForReviver.Script = Script;
