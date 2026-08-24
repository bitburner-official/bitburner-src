import type { BaseServer } from "../Server/BaseServer";
import { calculateRamUsage, type RamUsageEntry } from "./RamCalculations";
import type { LoadedModule, ScriptURL } from "./LoadedModule";
import { Generic_fromJSON, Generic_toJSON, type IReviverValue, constructorsForReviver } from "../utils/JSONReviver";
import { roundToTwo } from "../utils/helpers/roundToTwo";
import { RamCostConstants } from "../Netscript/RamCostGenerator";
import type { ScriptFilePath } from "../Paths/ScriptFilePath";
import { ContentFile } from "../Paths/ContentFile";

/** A script file as a file on a server.
 * For the execution of a script, see RunningScript and WorkerScript */
export class Script extends ContentFile {
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
  /** Scripts directly imported by the RAM calculation graph. */
  private readonly ramDependencies = new Set<Script>();
  /** Scripts directly imported by the compiled module graph. */
  private readonly moduleDependencies = new Set<Script>();
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
  set content(newCode: string) {
    this.metadata.edit();
    if (this.code === newCode) return;
    this.code = newCode;
    this.invalidateModule();
  }

  constructor(filename = "default.js" as ScriptFilePath, code = "", server = "") {
    super();
    this.filename = filename;
    this.code = code;
    this.server = server; // hostname of server this script is on
  }

  /** Invalidates the current script module and related data, e.g. when modifying the file. */
  invalidateModule(): void {
    this.ramUsage = null;
    this.ramUsageEntries.length = 0;
    this.ramCalculationError = null;
    this.mod = null;
    // This will be mutated in compile(), but is immutable after that.
    // (No RunningScripts can access this copy before that point).
    this.dependencies = new Map();

    // Clear before recursing so circular dependency graphs terminate.
    const dependents = [...this.dependents];
    this.dependents.clear();
    this.detachFromDependencies();

    for (const dependent of dependents) dependent.invalidateModule();
  }

  /** Register one direct dependency discovered while compiling this script. */
  registerModuleDependency(dependency: Script): void {
    if (dependency === this) return;
    this.moduleDependencies.add(dependency);
    dependency.dependents.add(this);
  }

  /** Remove partially registered compile edges without disturbing a still-valid RAM graph. */
  clearModuleDependencies(): void {
    for (const dependency of this.moduleDependencies) {
      if (!this.ramDependencies.has(dependency)) dependency.dependents.delete(this);
    }
    this.moduleDependencies.clear();
  }

  /** Replace RAM dependency edges only after a complete calculation succeeds. */
  private replaceRamDependencies(dependencies: Set<Script>): void {
    dependencies.delete(this);
    for (const dependency of this.ramDependencies) {
      if (!dependencies.has(dependency) && !this.moduleDependencies.has(dependency)) {
        dependency.dependents.delete(this);
      }
    }
    this.ramDependencies.clear();
    for (const dependency of dependencies) {
      this.ramDependencies.add(dependency);
      dependency.dependents.add(this);
    }
  }

  /** Detach all outgoing graph edges when this Script object is invalidated or removed. */
  private detachFromDependencies(): void {
    for (const dependency of new Set([...this.ramDependencies, ...this.moduleDependencies])) {
      dependency.dependents.delete(this);
    }
    this.ramDependencies.clear();
    this.moduleDependencies.clear();
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
      const dependencyGraph = new Map<Script, Set<Script>>();
      for (const path of ramCalc.parsedModules) {
        const dependent = path === this.filename ? this : otherScripts.get(path);
        if (dependent) dependencyGraph.set(dependent, new Set());
      }
      for (const [dependentPath, dependencyPath] of ramCalc.dependencyEdges) {
        const dependent = dependentPath === this.filename ? this : otherScripts.get(dependentPath);
        const dependency = dependencyPath === this.filename ? this : otherScripts.get(dependencyPath);
        if (dependent && dependency && dependent !== dependency) {
          const dependencies = dependencyGraph.get(dependent) ?? new Set<Script>();
          dependencies.add(dependency);
          dependencyGraph.set(dependent, dependencies);
        }
      }
      for (const [dependent, dependencies] of dependencyGraph) dependent.replaceRamDependencies(dependencies);
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
