import type { Server as IServer } from "@nsdefs";
import { CodingContract } from "../CodingContracts";
import { RunningScript } from "../Script/RunningScript";
import { Script } from "../Script/Script";
import { TextFile } from "../TextFile";
import { IReturnStatus } from "../types";

import { ScriptFilePath, resolveScriptFilePath, hasScriptExtension } from "../Paths/ScriptFilePath";
import { Directory, resolveDirectory } from "../Paths/Directory";
import { TextFilePath, resolveTextFilePath, hasTextExtension } from "../Paths/TextFilePath";
import { Generic_toJSON, Generic_fromJSON, IReviverValue } from "../utils/JSONReviver";
import { matchScriptPathExact } from "../utils/helpers/scriptKey";

import { createRandomIp } from "../utils/IPAddress";
import { JSONMap } from "../Types/Jsonable";
import { IPAddress, ServerName } from "../Types/strings";
import { FilePath } from "../Paths/FilePath";
import { ContentFile, ContentFilePath } from "../Paths/ContentFile";
import { ProgramFilePath, hasProgramExtension } from "../Paths/ProgramFilePath";
import { MessageFilename } from "src/Message/MessageHelpers";
import { LiteratureName } from "src/Literature/data/LiteratureNames";
import { CompletedProgramName } from "src/Programs/Programs";
import { getKeyList } from "../utils/helpers/getKeyList";
import lodash from "lodash";
import { Settings } from "../Settings/Settings";

import type { ScriptKey } from "../utils/helpers/scriptKey";

interface IConstructorParams {
  adminRights?: boolean;
  hostname: string;
  ip?: IPAddress;
  isConnectedTo?: boolean;
  maxRam?: number;
  organizationName?: string;
}

interface writeResult {
  overwritten: boolean;
}

/** Abstract Base Class for any Server object */
export abstract class BaseServer implements IServer {
  // Coding Contract files on this server
  contracts: CodingContract[] = [];

  // How many CPU cores this server has. Maximum of 8.
  // Currently, this only affects hacking missions
  cpuCores = 1;

  // Flag indicating whether the FTP port is open
  ftpPortOpen = false;

  // Flag indicating whether player has admin/root access to this server
  hasAdminRights = false;

  // Hostname. Must be unique
  hostname: ServerName = "home";

  // Flag indicating whether HTTP Port is open
  httpPortOpen = false;

  // IP Address. Must be unique
  ip = "1.1.1.1" as IPAddress;

  // Flag indicating whether player is currently connected to this server
  isConnectedTo = false;

  // RAM (GB) available on this server
  maxRam = 0;

  // Message files AND Literature files on this Server
  messages: (MessageFilename | LiteratureName)[] = [];

  // Name of company/faction/etc. that this server belongs to.
  // Optional, not applicable to all Servers
  organizationName = "";

  // Programs on this servers. Contains only the names of the programs
  // CompletedProgramNames are all typechecked as valid paths in Program constructor
  programs: (ProgramFilePath | CompletedProgramName)[] = [];

  // RAM (GB) used. i.e. unavailable RAM
  ramUsed = 0;

  // RunningScript files on this server. Keyed first by name/args, then by PID.
  runningScriptMap = new Map<ScriptKey, Map<number, RunningScript>>();

  // RunningScript files loaded from the savegame. Only stored here temporarily,
  // this field is undef while the game is running.
  savedScripts: RunningScript[] | undefined = undefined;

  // Script files on this Server
  scripts = new JSONMap<ScriptFilePath, Script>();

  // Contains the hostnames of all servers that are immediately
  // reachable from this one
  serversOnNetwork: string[] = [];

  // Flag indicating whether SMTP Port is open
  smtpPortOpen = false;

  // Flag indicating whether SQL Port is open
  sqlPortOpen = false;

  // Flag indicating whether the SSH Port is open
  sshPortOpen = false;

  // Text files on this server
  textFiles = new JSONMap<TextFilePath, TextFile>();

  // Flag indicating whether this is a purchased server
  purchasedByPlayer = false;

  // Optional, listed just so they can be accessed on a BaseServer. These will be undefined for HacknetServers.
  backdoorInstalled?: boolean;
  baseDifficulty?: number;
  hackDifficulty?: number;
  minDifficulty?: number;
  moneyAvailable?: number;
  moneyMax?: number;
  numOpenPortsRequired?: number;
  openPortCount?: number;
  requiredHackingSkill?: number;
  serverGrowth?: number;

  constructor(params: IConstructorParams = { hostname: "", ip: createRandomIp() }) {
    this.ip = params.ip ? params.ip : createRandomIp();

    this.hostname = params.hostname;
    this.organizationName = params.organizationName != null ? params.organizationName : "";
    this.isConnectedTo = params.isConnectedTo != null ? params.isConnectedTo : false;

    //Access information
    this.hasAdminRights = params.adminRights != null ? params.adminRights : false;
  }

  addContract(contract: CodingContract): void {
    this.contracts.push(contract);
  }

  getContract(contractName: string): CodingContract | null {
    for (const contract of this.contracts) {
      if (contract.fn === contractName) {
        return contract;
      }
    }
    return null;
  }

  /** Get a TextFile or Script depending on the input path type. */
  getContentFile(path: ContentFilePath): ContentFile | null {
    return (hasTextExtension(path) ? this.textFiles.get(path) : this.scripts.get(path)) ?? null;
  }

  /** Returns boolean indicating whether the given script is running on this server */
  isRunning(path: ScriptFilePath): boolean {
    const pattern = matchScriptPathExact(lodash.escapeRegExp(path));
    for (const k of this.runningScriptMap.keys()) {
      if (pattern.test(k)) {
        return true;
      }
    }

    return false;
  }

  removeContract(contract: CodingContract | string): void {
    const index = this.contracts.findIndex((c) => c.fn === (typeof contract === "string" ? contract : contract.fn));
    if (index > -1) this.contracts.splice(index, 1);
  }

  /**
   * Remove a file from the server
   * @param path Name of file to be deleted
   * @returns {IReturnStatus} Return status object indicating whether or not file was deleted
   */
  removeFile(path: FilePath): IReturnStatus {
    if (hasTextExtension(path)) {
      const textFile = this.textFiles.get(path);
      if (!textFile) return { res: false, msg: `Text file ${path} not found.` };
      this.textFiles.delete(path);
      return { res: true };
    }
    if (hasScriptExtension(path)) {
      const script = this.scripts.get(path);
      if (!script) return { res: false, msg: `Script ${path} not found.` };
      if (this.isRunning(path)) return { res: false, msg: "Cannot delete a script that is currently running!" };
      script.invalidateModule();
      this.scripts.delete(path);
      return { res: true };
    }
    if (hasProgramExtension(path)) {
      const programIndex = this.programs.findIndex((program) => program === path);
      if (programIndex === -1) return { res: false, msg: `Program ${path} does not exist` };
      this.programs.splice(programIndex, 1);
      return { res: true };
    }
    if (path.endsWith(".lit")) {
      const litIndex = this.messages.findIndex((lit) => lit === path);
      if (litIndex === -1) return { res: false, msg: `Literature file ${path} does not exist` };
      this.messages.splice(litIndex, 1);
      return { res: true };
    }
    if (path.endsWith(".cct")) {
      const contractIndex = this.contracts.findIndex((program) => program);
      if (contractIndex === -1) return { res: false, msg: `Contract file ${path} does not exist` };
      this.contracts.splice(contractIndex, 1);
      return { res: true };
    }

    return { res: false, msg: `Unhandled file extension on file path ${path}` };
  }

  /**
   * Called when a script is run on this server.
   * All this function does is add a RunningScript object to the
   * `runningScripts` array. It does NOT check whether the script actually can
   * be run.
   */
  runScript(script: RunningScript): void {
    let byPid = this.runningScriptMap.get(script.scriptKey);
    if (!byPid) {
      byPid = new Map();
      this.runningScriptMap.set(script.scriptKey, byPid);
    }
    byPid.set(script.pid, script);
  }

  setMaxRam(ram: number): void {
    this.maxRam = ram;
  }

  updateRamUsed(ram: number): void {
    this.ramUsed = ram;
  }

  pushProgram(program: ProgramFilePath | CompletedProgramName): void {
    if (this.programs.includes(program)) return;

    // Remove partially created program if there is one
    const existingPartialExeIndex = this.programs.findIndex((p) => p.startsWith(program));
    // findIndex returns -1 if there is no match, we only want to splice on a match
    if (existingPartialExeIndex > -1) this.programs.splice(existingPartialExeIndex, 1);

    this.programs.push(program);
  }

  /**
   * Write to a script file
   * Overwrites existing files. Creates new files if the script does not exist.
   */
  writeToScriptFile(filename: ScriptFilePath, code: string): writeResult {
    // Check if the script already exists, and overwrite it if it does
    const script = this.scripts.get(filename);
    if (script) {
      // content setter handles module invalidation
      script.content = code;
      return { overwritten: true };
    }

    // Otherwise, create a new script
    const newScript = new Script(filename, code, this.hostname);
    this.scripts.set(filename, newScript);
    return { overwritten: false };
  }

  // Write to a text file
  // Overwrites existing files. Creates new files if the text file does not exist
  writeToTextFile(textPath: TextFilePath, txt: string): writeResult {
    // Check if the text file already exists, and overwrite if it does
    const existingFile = this.textFiles.get(textPath);
    // overWrite if already exists
    if (existingFile) {
      existingFile.text = txt;
      return { overwritten: true };
    }

    // Otherwise create a new text file
    const newFile = new TextFile(textPath, txt);
    this.textFiles.set(textPath, newFile);
    return { overwritten: false };
  }

  /** Write to a Script or TextFile */
  writeToContentFile(path: ContentFilePath, content: string): writeResult {
    if (hasTextExtension(path)) return this.writeToTextFile(path, content);
    return this.writeToScriptFile(path, content);
  }

  // Serialize the current object to a JSON save state
  // Called by subclasses, not stringify.
  toJSONBase(ctorName: string, keys: readonly (keyof this)[]): IReviverValue {
    // RunningScripts are stored as a simple array, both for backward compatibility,
    // compactness, and ease of filtering them here.
    const result = Generic_toJSON(ctorName, this, keys);
    if (Settings.ExcludeRunningScriptsFromSave) {
      result.data.runningScripts = [];
      return result;
    }

    const rsArray: RunningScript[] = [];
    for (const byPid of this.runningScriptMap.values()) {
      for (const rs of byPid.values()) {
        if (!rs.temporary) {
          rsArray.push(rs);
        }
      }
    }
    result.data.runningScripts = rsArray;
    return result;
  }

  // Initializes a Server Object from a JSON save state
  // Called by subclasses, not Reviver.
  static fromJSONBase<T extends BaseServer>(value: IReviverValue, ctor: new () => T, keys: readonly (keyof T)[]): T {
    const server = Generic_fromJSON(ctor, value.data, keys);
    server.savedScripts = value.data.runningScripts;
    // If textFiles is not an array, we've already done the 2.3 migration to textFiles and scripts as maps + path changes.
    if (!Array.isArray(server.textFiles)) return server;

    // Migrate to using maps for scripts and textfiles. This is done here, directly at load, instead of the
    // usual upgrade logic, for two reasons:
    // 1) Our utility functions depend on it, so the upgrade logic itself needs the data to be in maps, even the logic
    //    written earlier than 2.3!
    // 2) If the upgrade logic throws, and then you soft-reset at the recovery screen (or maybe don't even see the
    //    recovery screen), you can end up with a "migrated" save that still has arrays.
    const newDirectory = resolveDirectory("v2.3FileChanges/") as Directory;
    let invalidScriptCount = 0;
    // There was a brief dev window where Server.scripts was already a map but the filepath changes weren't in yet.
    // Thus, we can't skip this logic just because it's already a map.
    const oldScripts = Array.isArray(server.scripts) ? (server.scripts as Script[]) : [...server.scripts.values()];
    server.scripts = new JSONMap();
    // In case somehow there are previously valid filenames that can't be sanitized, they will go in a new directory with a note.
    for (const script of oldScripts) {
      // We're about to do type validation on the filename anyway.
      if (script.filename.endsWith(".ns")) script.filename = (script.filename + ".js") as any;
      let newFilePath = resolveScriptFilePath(script.filename);
      if (!newFilePath) {
        newFilePath = `${newDirectory}script${++invalidScriptCount}.js` as ScriptFilePath;
        script.content = `// Original path: ${script.filename}. Path was no longer valid\n` + script.content;
      }
      script.filename = newFilePath;
      server.scripts.set(newFilePath, script);
    }
    let invalidTextCount = 0;

    const oldTextFiles = server.textFiles as (TextFile & { fn?: string })[];
    server.textFiles = new JSONMap();
    for (const textFile of oldTextFiles) {
      const oldName = textFile.fn ?? textFile.filename;
      delete textFile.fn;

      let newFilePath = resolveTextFilePath(oldName);
      if (!newFilePath) {
        newFilePath = `${newDirectory}text${++invalidTextCount}.txt` as TextFilePath;
        textFile.content = `// Original path: ${textFile.filename}. Path was no longer valid\n` + textFile.content;
      }
      textFile.filename = newFilePath;
      server.textFiles.set(newFilePath, textFile);
    }
    if (invalidScriptCount || invalidTextCount) {
      // If we had to migrate names, don't run scripts for this server.
      server.savedScripts = [];
    }
    return server;
  }

  // Customize a prune list for a subclass.
  static getIncludedKeys<T extends BaseServer>(ctor: new () => T): readonly (keyof T)[] {
    return getKeyList(ctor, { removedKeys: ["runningScriptMap", "savedScripts", "ramUsed"] });
  }
}
