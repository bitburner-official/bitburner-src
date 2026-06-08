import { Output, Link, RawOutput } from "./OutputTypes";
import { Player } from "@player";
import type { BaseServer } from "../Server/BaseServer";
import { TerminalEvents, TerminalClearEvents } from "./TerminalEvents";
import { type TerminalAction, Cancellation } from "./TerminalAction";

import { TextFile } from "../TextFile";
import { Script } from "../Script/Script";
import { hasScriptExtension } from "../Paths/ScriptFilePath";
import { CONSTANTS } from "../Constants";
import { GetServer } from "../Server/AllServers";

import { checkIfConnectedToDarkweb } from "../DarkWeb/DarkWeb";
import { iTutorialNextStep, iTutorialSteps, ITutorial } from "../InteractiveTutorial";
import { parseCommand, parseCommands } from "./Parser";
import { Settings } from "../Settings/Settings";
import { createProgressBarText } from "../utils/helpers/createProgressBarText";
import { Directory, resolveDirectory, root } from "../Paths/Directory";
import { FilePath, isBasicFilePath, resolveFilePath } from "../Paths/FilePath";
import { hasTextExtension } from "../Paths/TextFilePath";
import { isIPAddress } from "../Types/strings";

import { alias } from "./commands/alias";
import { analyze } from "./commands/analyze";
import { backdoor } from "./commands/backdoor";
import { buy } from "./commands/buy";
import { cat } from "./commands/cat";
import { cd } from "./commands/cd";
import { check } from "./commands/check";
import { connect } from "./commands/connect";
import { cp } from "./commands/cp";
import { download } from "./commands/download";
import { upload } from "./commands/upload";
import { expr } from "./commands/expr";
import { free } from "./commands/free";
import { grep } from "./commands/grep";
import { grow } from "./commands/grow";
import { hack } from "./commands/hack";
import { help } from "./commands/help";
import { history } from "./commands/history";
import { home } from "./commands/home";
import { hostname } from "./commands/hostname";
import { ipaddr } from "./commands/ipaddr";
import { kill } from "./commands/kill";
import { killall } from "./commands/killall";
import { ls } from "./commands/ls";
import { lscpu } from "./commands/lscpu";
import { mem } from "./commands/mem";
import { mv } from "./commands/mv";
import { nano } from "./commands/nano";
import { ps } from "./commands/ps";
import { rm } from "./commands/rm";
import { run } from "./commands/run";
import { scan } from "./commands/scan";
import { scananalyze } from "./commands/scananalyze";
import { scp } from "./commands/scp";
import { sudov } from "./commands/sudov";
import { tail } from "./commands/tail";
import { top } from "./commands/top";
import { unalias } from "./commands/unalias";
import { vim } from "./commands/vim";
import { weaken } from "./commands/weaken";
import { wget } from "./commands/wget";
import { commitHash } from "../utils/helpers/commitHash";
import { apr1 } from "./commands/apr1";
import { changelog } from "./commands/changelog";
import { clear } from "./commands/clear";
import { mkdir } from "./commands/mkdir";

export const TerminalCommands: Record<
  string,
  (args: (string | number | boolean)[], server: BaseServer) => undefined | TerminalAction
> = {
  "scan-analyze": scananalyze,
  alias: alias,
  analyze: analyze,
  backdoor: backdoor,
  buy: buy,
  cat: cat,
  cd: cd,
  changelog: changelog,
  check: check,
  clear: clear,
  cls: clear,
  connect: connect,
  cp: cp,
  download: download,
  expr: expr,
  free: free,
  grep: grep,
  grow: grow,
  hack: hack,
  help: help,
  history: history,
  home: home,
  hostname: hostname,
  ipaddr: ipaddr,
  kill: kill,
  killall: killall,
  ls: ls,
  lscpu: lscpu,
  mem: mem,
  mkdir: mkdir,
  mv: mv,
  nano: nano,
  ps: ps,
  rm: rm,
  run: run,
  scan: scan,
  scp: scp,
  sudov: sudov,
  tail: tail,
  apr1: apr1,
  top: top,
  unalias: unalias,
  upload: upload,
  vim: vim,
  weaken: weaken,
  wget: wget,
};

// "mkdir" is a "hidden" command; i.e., it is not shown in help text or autocomplete.
export const supportedCommands = Object.keys(TerminalCommands).filter((command) => command !== "mkdir");

export class Terminal {
  // What the terminal is currently running (blocked by)
  action: TerminalAction | null = null;

  commandHistory: string[] = [];
  commandHistoryIndex = 0;

  outputHistory: (Output | Link | RawOutput)[] = [
    new Output(`Bitburner v${CONSTANTS.VersionString} (${commitHash()})`, "primary"),
  ];

  // True if a Coding Contract prompt is opened
  contractOpen = false;
  // True if a prompt is opened via the ns.prompt() API
  nsPromptApiOpen = false;

  // Path of current directory
  currDir = "" as Directory;

  append(item: Output | Link | RawOutput): void {
    this.outputHistory.push(item);
    if (this.outputHistory.length > Settings.MaxTerminalCapacity) {
      this.outputHistory.splice(0, this.outputHistory.length - Settings.MaxTerminalCapacity);
    }
    TerminalEvents.emit();
  }

  print(s: string): undefined {
    this.append(new Output(s, "primary"));
  }

  printRaw(node: React.ReactNode): undefined {
    this.append(new RawOutput(node));
  }

  error(s: string): undefined {
    this.append(new Output(s, "error"));
  }

  success(s: string): undefined {
    this.append(new Output(s, "success"));
  }

  info(s: string): undefined {
    this.append(new Output(s, "info"));
  }

  warn(s: string): undefined {
    this.append(new Output(s, "warn"));
  }

  timedAction(durationSec: number, name: string, onDone: () => void): TerminalAction {
    const start = performance.now();
    const progress = () =>
      createProgressBarText({
        progress: (performance.now() - start) / (durationSec * 1000),
        totalTicks: 50,
      });

    let cancel = () => {};
    const p = (async () => {
      let cancelled = false;
      try {
        await new Promise<void>((resolve, reject) => {
          setTimeout(resolve, durationSec * 1000);
          cancel = () => {
            cancelled = true;
            reject(new Cancellation(name));
          };
        });
      } finally {
        this.print(progress());
        if (cancelled) {
          this.print(`Cancelled ${name}`);
        }
      }
      onDone();
    })();

    return {
      cancel: cancel,
      finished: p,
      getProgressText: progress,
    };
  }

  getFile(filename: string): Script | TextFile | string | null {
    if (hasScriptExtension(filename)) return this.getScript(filename);
    if (hasTextExtension(filename)) return this.getTextFile(filename);
    if (filename.endsWith(".lit")) return this.getLitFile(filename);
    return null;
  }

  getFilepath(path: string, useAbsolute?: boolean): FilePath | null {
    // If path starts with a slash, consider it to be an absolute path
    if (useAbsolute || path.startsWith("/")) return resolveFilePath(path);
    // Otherwise, force path to be seen as relative to the current directory.
    path = "./" + path;
    return resolveFilePath(path, this.currDir);
  }

  getDirectory(path: string, useAbsolute?: boolean): Directory | null {
    // If path starts with a slash, consider it to be an absolute path
    if (useAbsolute || path.startsWith("/")) return resolveDirectory(path);
    // Otherwise, force path to be seen as relative to the current directory.
    path = "./" + path;
    return resolveDirectory(path, this.currDir);
  }

  getScript(filename: string): Script | null {
    const server = Player.getCurrentServer();
    const filepath = this.getFilepath(filename);
    if (!filepath || !hasScriptExtension(filepath)) return null;
    return server.scripts.get(filepath) ?? null;
  }

  getTextFile(filename: string): TextFile | null {
    const server = Player.getCurrentServer();
    const filepath = this.getFilepath(filename);
    if (!filepath || !hasTextExtension(filepath)) return null;
    return server.textFiles.get(filepath) ?? null;
  }

  getLitFile(filename: string): string | null {
    const s = Player.getCurrentServer();
    const filepath = this.getFilepath(filename);
    if (!filepath) return null;
    for (const lit of s.messages) {
      if (typeof lit === "string" && filepath === lit) {
        return lit;
      }
    }

    return null;
  }

  cwd(): Directory {
    return this.currDir;
  }

  setcwd(dir: Directory): void {
    this.currDir = dir;
    TerminalEvents.emit();
  }

  connectToServer(hostname: string, singularity = false): void {
    const server = GetServer(hostname);
    if (server === null) {
      this.error("Invalid server. Connection failed.");
      return;
    }
    Player.getCurrentServer().isConnectedTo = false;
    Player.currentServer = server.hostname;
    server.isConnectedTo = true;
    this.setcwd(root);
    if (!singularity) {
      this.print("Connected to " + `${isIPAddress(hostname) ? server.ip : server.hostname}`);
      if (Player.getCurrentServer().hostname === "darkweb") {
        checkIfConnectedToDarkweb(); // Posts a 'help' message if connecting to dark web
      }
    }
  }

  async executeCommands(commands: string): Promise<void> {
    // Handle Terminal History - multiple commands should be saved as one
    if (this.commandHistory[this.commandHistory.length - 1] != commands) {
      this.commandHistory.push(commands);
      if (this.commandHistory.length > 50) {
        this.commandHistory.splice(0, 1);
      }
      Player.terminalCommandHistory = this.commandHistory;
    }
    this.commandHistoryIndex = this.commandHistory.length;
    const allCommands = parseCommands(commands);
    try {
      for (const command of allCommands) {
        const result = this.executeCommand(command);
        if (result) {
          this.action = result;
          TerminalEvents.emit();
          await result.finished;
          this.action = null;
          TerminalEvents.emit();
        }
      }
    } catch (ex) {
      if (!(ex instanceof Cancellation)) {
        throw ex;
      }
    } finally {
      // If we throw for any reason, abort the current action.
      this.action?.cancel();
      this.action = null;
      TerminalEvents.emit();
    }
  }

  clear(): void {
    this.outputHistory = [new Output(`Bitburner v${CONSTANTS.VersionString} (${commitHash()})`, "primary")];
    TerminalEvents.emit();
    TerminalClearEvents.emit();
  }

  prestige(): void {
    this.action?.cancel();
    this.action = null;
    this.clear();
  }

  executeCommand(command: string): undefined | TerminalAction {
    if (this.action !== null) {
      throw new Error(`Cannot execute command (${command}) while an action is in progress`);
    }

    const commandArray = parseCommand(command);
    if (!commandArray.length) return;

    const currentServer = Player.getCurrentServer();
    /****************** Interactive Tutorial Terminal Commands ******************/
    if (ITutorial.isRunning) {
      const n00dlesServ = GetServer("n00dles");
      if (n00dlesServ == null) {
        throw new Error("Could not get n00dles server");
      }
      const errorMessageForBadCommand =
        "Bad command. Please follow the tutorial or click 'Exit Tutorial' if you'd like to skip it.";
      switch (ITutorial.currStep) {
        case iTutorialSteps.TerminalHelp:
          if (commandArray.length === 1 && commandArray[0] === "help") {
            iTutorialNextStep();
          } else {
            this.error(errorMessageForBadCommand);
            return;
          }
          break;
        case iTutorialSteps.TerminalLs:
          if (commandArray.length === 1 && commandArray[0] === "ls") {
            iTutorialNextStep();
          } else if (commandArray[0] === "1s") {
            this.error("Command '1s' not found. Did you mean 'ls' with a lowercase L?");
            return;
          } else {
            this.error(errorMessageForBadCommand);
            return;
          }
          break;
        case iTutorialSteps.TerminalScan:
          if (commandArray.length === 1 && commandArray[0] === "scan") {
            iTutorialNextStep();
          } else {
            this.error(errorMessageForBadCommand);
            return;
          }
          break;
        case iTutorialSteps.TerminalScanAnalyze1:
          if (commandArray.length === 1 && commandArray[0] === "scan-analyze") {
            iTutorialNextStep();
          } else {
            this.error(errorMessageForBadCommand);
            return;
          }
          break;
        case iTutorialSteps.TerminalScanAnalyze2:
          if (commandArray.length === 2 && commandArray[0] === "scan-analyze" && commandArray[1] === 2) {
            iTutorialNextStep();
          } else {
            this.error(errorMessageForBadCommand);
            return;
          }
          break;
        case iTutorialSteps.TerminalConnect:
          if (commandArray.length === 2) {
            if (
              commandArray[0] === "connect" &&
              (commandArray[1] === "n00dles" || commandArray[1] === n00dlesServ.hostname)
            ) {
              iTutorialNextStep();
            } else {
              this.error("Wrong command! Try again!");
              return;
            }
          } else {
            this.error(errorMessageForBadCommand);
            return;
          }
          break;
        case iTutorialSteps.TerminalAnalyze:
          if (commandArray.length === 1 && commandArray[0] === "analyze") {
            iTutorialNextStep();
          } else {
            this.error(errorMessageForBadCommand);
            return;
          }
          break;
        case iTutorialSteps.TerminalNuke:
          if (commandArray.length === 2 && commandArray[0] === "run" && commandArray[1] === "NUKE.exe") {
            iTutorialNextStep();
          } else {
            this.error(errorMessageForBadCommand);
            return;
          }
          break;
        case iTutorialSteps.TerminalManualHack:
          if (commandArray.length === 1 && commandArray[0] === "hack") {
            iTutorialNextStep();
          } else {
            this.error(errorMessageForBadCommand);
            return;
          }
          break;
        case iTutorialSteps.TerminalHackingMechanics:
          if (commandArray.length !== 1 || !["grow", "weaken", "hack"].includes(commandArray[0] + "")) {
            this.error(errorMessageForBadCommand);
            return;
          }
          break;
        case iTutorialSteps.TerminalGoHome:
          if (commandArray.length === 1 && commandArray[0] === "home") {
            iTutorialNextStep();
          } else {
            this.error(errorMessageForBadCommand);
            return;
          }
          break;
        case iTutorialSteps.TerminalCreateScript:
          if (commandArray.length === 2 && commandArray[0] === "nano" && commandArray[1] === "n00dles.js") {
            iTutorialNextStep();
          } else {
            this.error(errorMessageForBadCommand);
            return;
          }
          break;
        case iTutorialSteps.TerminalFree:
          if (commandArray.length === 1 && commandArray[0] === "free") {
            iTutorialNextStep();
          } else {
            this.error(errorMessageForBadCommand);
            return;
          }
          break;
        case iTutorialSteps.TerminalRunScript:
          if (commandArray.length === 2 && commandArray[0] === "run" && commandArray[1] === "n00dles.js") {
            iTutorialNextStep();
          } else {
            this.error(errorMessageForBadCommand);
            return;
          }
          break;
        case iTutorialSteps.ActiveScriptsToTerminal:
          if (commandArray.length === 2 && commandArray[0] === "tail" && commandArray[1] === "n00dles.js") {
            iTutorialNextStep();
          } else {
            this.error(errorMessageForBadCommand);
            return;
          }
          break;
        default:
          this.error("Please follow the tutorial or click 'Exit Tutorial' if you'd like to skip it");
          return;
      }
    }
    /****************** END INTERACTIVE TUTORIAL ******************/
    /* Command parser */

    const commandName = commandArray[0];
    if (typeof commandName !== "string") return this.error(`${commandName} is not a valid command.`);
    // run by path command
    if (isBasicFilePath(commandName)) return run(commandArray, currentServer);

    // Aside from the run-by-path command, we don't need the first entry once we've stored it in commandName.
    commandArray.shift();

    const f = TerminalCommands[commandName.toLowerCase()];
    if (!f) {
      const similarCommands = findSimilarCommands(commandName);
      const didYouMeanString = similarCommands.length ? ` Did you mean: ${similarCommands.join(" or ")}?` : "";
      return this.error(`Command ${commandName} not found.${didYouMeanString}`);
    }

    return f(commandArray, currentServer);
  }

  getProgressText(): string {
    if (this.action === null) throw new Error("trying to get the progress text when there's no action");
    return this.action.getProgressText();
  }
}

function findSimilarCommands(command: string): string[] {
  const offByOneLetter = supportedCommands.filter((c) => {
    if (c.length !== command.length) return false;
    let diff = 0;
    for (let i = 0; i < c.length; i++) {
      if (c[i] !== command[i]) diff++;
    }
    return diff === 1;
  });
  const subset = supportedCommands.filter((c) => c.includes(command)).sort((a, b) => a.length - b.length);
  return Array.from(new Set([...offByOneLetter, ...subset])).slice(0, 3);
}
