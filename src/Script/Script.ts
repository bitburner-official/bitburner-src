import type { BaseServer } from "../Server/BaseServer";
import { calculateRamUsage, type RamUsageEntry } from "./RamCalculations";
import type { LoadedModule, ScriptURL } from "./LoadedModule";
import { Generic_fromJSON, Generic_toJSON, type IReviverValue, constructorsForReviver } from "../utils/JSONReviver";
import { roundToTwo } from "../utils/helpers/roundToTwo";
import { RamCostConstants } from "../Netscript/RamCostGenerator";
import type { ScriptFilePath } from "../Paths/ScriptFilePath";
import { ContentFile } from "../Paths/ContentFile";

//This caches script code for scripts with the same code but a different filename
interface ScriptCodeCacheEntry {
  code: string;
  refs: number;
}

const scriptCodeCache = new Map<string, ScriptCodeCacheEntry>();

function retainScriptCode(code: string): string {
  const entry = scriptCodeCache.get(code);
  if (entry) {
    entry.refs++;
    return entry.code;
  }
  scriptCodeCache.set(code, { code, refs: 1 });
  return code;
}

function releaseScriptCode(code: string): void {
  const entry = scriptCodeCache.get(code);
  if (!entry) return;
  entry.refs--;
  if (entry.refs <= 0) scriptCodeCache.delete(code);
}

/** A script file as a file on a server.
 * For the execution of a script, see RunningScript and WorkerScript */
export class Script extends ContentFile {
  private _code = "";
  private codeRefRetained = false;
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
    this.metadata.read();
    return this.code;
  }
  get code(): string {
    return this._code;
  }
  set content(newCode: string) {
    this.metadata.edit();
    if (this.code === newCode) return;
    this.code = newCode;
    this.invalidateModule();
  }
  set code(newCode: string) {
    if (this.codeRefRetained && this._code === newCode) return;
    if (this.codeRefRetained) releaseScriptCode(this._code);
    this._code = retainScriptCode(newCode);
    this.codeRefRetained = true;
  }
  constructor(filename = "default.js" as ScriptFilePath, code = "", server = "") {
    super();
    this.filename = filename;
    this.code = code;
    this.server = server; // hostname of server this script is on
  }
  dispose(): void {
    if (this.codeRefRetained) releaseScriptCode(this._code);
    this._code = "";
    this.codeRefRetained = false;
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
      this.ramUsageEntries = ramCalc.entries;
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
    this.dispose();
    return true;
  }

  /** The keys that are relevant in a save file */
  static savedKeys = ["code", "filename", "server", "metadata"] as const;

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
