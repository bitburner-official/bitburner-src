import type { Server as IServer } from "@nsdefs";
import { CodingContract } from "../CodingContracts";
import { RunningScript } from "../Script/RunningScript";
import { Script } from "../Script/Script";
import { isValidFilePath } from "../Terminal/DirectoryHelpers";
import { TextFile } from "../TextFile";
import { IReturnStatus } from "../types";

import { isScriptFilename } from "../Script/isScriptFilename";

import { createRandomIp } from "../utils/IPAddress";
import { compareArrays } from "../utils/helpers/compareArrays";
import { ScriptArg } from "../Netscript/ScriptArg";
import { JSONMap } from "../Types/Jsonable";
import { IPAddress, ScriptFilename, ServerName } from "../Types/strings";

interface IConstructorParams {
  adminRights?: boolean;
  hostname: string;
  ip?: IPAddress;
  isConnectedTo?: boolean;
  maxRam?: number;
  organizationName?: string;
}

interface writeResult {
  success: boolean;
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
  messages: string[] = [];

  // Name of company/faction/etc. that this server belongs to.
  // Optional, not applicable to all Servers
  organizationName = "";

  // Programs on this servers. Contains only the names of the programs
  programs: string[] = [];

  // RAM (GB) used. i.e. unavailable RAM
  ramUsed = 0;

  // RunningScript files on this server
  runningScripts: RunningScript[] = [];

  // Script files on this Server
  scripts: JSONMap<ScriptFilename, Script> = new JSONMap();

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
  textFiles: TextFile[] = [];

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

  /**
   * Find an actively running script on this server
   * @param scriptName - Filename of script to search for
   * @param scriptArgs - Arguments that script is being run with
   * @returns RunningScript for the specified active script
   *          Returns null if no such script can be found
   */
  getRunningScript(scriptName: string, scriptArgs: ScriptArg[]): RunningScript | null {
    for (const rs of this.runningScripts) {
      //compare file names without leading '/' to prevent running multiple script with the same name
      if (
        (rs.filename.charAt(0) == "/" ? rs.filename.slice(1) : rs.filename) ===
          (scriptName.charAt(0) == "/" ? scriptName.slice(1) : scriptName) &&
        compareArrays(rs.args, scriptArgs)
      ) {
        return rs;
      }
    }

    return null;
  }

  /**
   * Given the name of the script, returns the corresponding
   * Script object on the server (if it exists)
   */
  getScript(scriptName: string): Script | null {
    return this.scripts.get(scriptName) ?? null;
  }

  /** Returns boolean indicating whether the given script is running on this server */
  isRunning(fn: string): boolean {
    for (const runningScriptObj of this.runningScripts) {
      if (runningScriptObj.filename === fn) {
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
   * @param filename {string} Name of file to be deleted
   * @returns {IReturnStatus} Return status object indicating whether or not file was deleted
   */
  removeFile(filename: string): IReturnStatus {
    if (filename.endsWith(".exe") || filename.match(/^.+\.exe-\d+(?:\.\d*)?%-INC$/) != null) {
      for (let i = 0; i < this.programs.length; ++i) {
        if (this.programs[i] === filename) {
          this.programs.splice(i, 1);
          return { res: true };
        }
      }
    } else if (isScriptFilename(filename)) {
      const script = this.scripts.get(filename);
      if (!script) return { res: false, msg: `script ${filename} not found.` };
      if (this.isRunning(filename)) {
        return { res: false, msg: "Cannot delete a script that is currently running!" };
      }
      script.invalidateModule();
      this.scripts.delete(filename);
      return { res: true };
    } else if (filename.endsWith(".lit")) {
      for (let i = 0; i < this.messages.length; ++i) {
        const f = this.messages[i];
        if (typeof f === "string" && f === filename) {
          this.messages.splice(i, 1);
          return { res: true };
        }
      }
    } else if (filename.endsWith(".txt")) {
      for (let i = 0; i < this.textFiles.length; ++i) {
        if (this.textFiles[i].fn === filename) {
          this.textFiles.splice(i, 1);
          return { res: true };
        }
      }
    } else if (filename.endsWith(".cct")) {
      for (let i = 0; i < this.contracts.length; ++i) {
        if (this.contracts[i].fn === filename) {
          this.contracts.splice(i, 1);
          return { res: true };
        }
      }
    }

    return { res: false, msg: "No such file exists" };
  }

  /**
   * Called when a script is run on this server.
   * All this function does is add a RunningScript object to the
   * `runningScripts` array. It does NOT check whether the script actually can
   * be run.
   */
  runScript(script: RunningScript): void {
    this.runningScripts.push(script);
  }

  setMaxRam(ram: number): void {
    this.maxRam = ram;
  }

  updateRamUsed(ram: number): void {
    this.ramUsed = ram;
  }

  pushProgram(program: string): void {
    if (this.programs.includes(program)) return;

    // Remove partially created program if there is one
    const existingPartialExeIndex = this.programs.findIndex((p) => p.startsWith(program));
    // findIndex returns -1 if there is no match, we only want to splice on a match
    if (existingPartialExeIndex > -1) {
      this.programs.splice(existingPartialExeIndex, 1);
    }

    this.programs.push(program);
  }

  /**
   * Write to a script file
   * Overwrites existing files. Creates new files if the script does not exist.
   */
  writeToScriptFile(filename: string, code: string): writeResult {
    if (!isValidFilePath(filename) || !isScriptFilename(filename)) {
      return { success: false, overwritten: false };
    }

    // Check if the script already exists, and overwrite it if it does
    const script = this.scripts.get(filename);
    if (script) {
      script.invalidateModule();
      script.code = code;
      return { success: true, overwritten: true };
    }

    // Otherwise, create a new script
    const newScript = new Script(filename, code, this.hostname);
    this.scripts.set(filename, newScript);
    return { success: true, overwritten: false };
  }

  // Write to a text file
  // Overwrites existing files. Creates new files if the text file does not exist
  writeToTextFile(fn: string, txt: string): writeResult {
    const ret = { success: false, overwritten: false };
    if (!isValidFilePath(fn) || !fn.endsWith("txt")) {
      return ret;
    }

    // Check if the text file already exists, and overwrite if it does
    for (let i = 0; i < this.textFiles.length; ++i) {
      if (this.textFiles[i].fn === fn) {
        ret.overwritten = true;
        this.textFiles[i].text = txt;
        ret.success = true;
        return ret;
      }
    }

    // Otherwise create a new text file
    const newFile = new TextFile(fn, txt);
    this.textFiles.push(newFile);
    ret.success = true;
    return ret;
  }
}
