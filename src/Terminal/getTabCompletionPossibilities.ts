import { Aliases, GlobalAliases, substituteAliases } from "../Alias";
import { DarkWebItems } from "../DarkWeb/DarkWebItems";
import { Player } from "@player";
import { GetAllServers } from "../Server/AllServers";
import { Server } from "../Server/Server";
import { ParseCommand, ParseCommands } from "./Parser";
import { HelpTexts } from "./HelpText";
import { compile } from "../NetscriptJSEvaluator";
import { Flags } from "../NetscriptFunctions/Flags";
import { AutocompleteData } from "@nsdefs";
import * as libarg from "arg";
import { root } from "../Paths/Directory";
import { resolveScriptFilePath } from "../Paths/ScriptFilePath";

// TODO: this shouldn't be hardcoded in two places with no typechecks to verify equivalence
// An array of all Terminal commands
const commands = [
  "alias",
  "analyze",
  "backdoor",
  "cat",
  "cd",
  "changelog",
  "check",
  "clear",
  "cls",
  "connect",
  "cp",
  "download",
  "expr",
  "free",
  "grow",
  "hack",
  "help",
  "home",
  "hostname",
  "ifconfig",
  "kill",
  "killall",
  "ls",
  "lscpu",
  "mem",
  "mv",
  "nano",
  "ps",
  "rm",
  "run",
  "scan-analyze",
  "scan",
  "scp",
  "sudov",
  "tail",
  "theme",
  "top",
  "vim",
  "weaken",
];

export async function getTabCompletionPossibilities(input: string, index: number, baseDir = root): Promise<string[]> {
  input = substituteAliases(input);
  const possibilities: string[] = [];
  possibilities.push(...Object.keys(GlobalAliases));
  const currServ = Player.getCurrentServer();
  const homeComputer = Player.getHomeComputer();

  function filterOutBaseDir(input: string): string | null {
    return input.startsWith(baseDir) ? input.substring(baseDir.length) : null;
  }

  function addAllCodingContracts(prefix = ""): void {
    if (baseDir !== root) return;
    for (const cct of currServ.contracts) possibilities.push(prefix + cct.fn);
  }

  function addMessages(types: { lit?: boolean; msg?: boolean }): void {
    if (baseDir !== root) return;
    for (const file of currServ.messages) {
      if ((file.endsWith(".msg") && types.msg) || (file.endsWith(".lit") && types.lit)) {
        possibilities.push(file);
      }
    }
  }

  function addAllPrograms(): void {
    // Can run programs from any server/folder, no need to adjust path
    for (const program of homeComputer.programs) possibilities.push(program);
  }

  function addAllScripts(prefix = ""): void {
    for (const scriptFilename of currServ.scripts.keys()) {
      const filteredName = filterOutBaseDir(scriptFilename);
      if (filteredName) possibilities.push(prefix + filteredName);
    }
  }

  function addAllTextFiles(): void {
    for (const textFilename of currServ.textFiles.keys()) {
      const filteredName = filterOutBaseDir(textFilename);
      if (filteredName) possibilities.push(filteredName);
    }
  }

  function addAllDirectories(): void {
    // todo
  }

  function isCommand(cmd: string): boolean {
    let t_cmd = cmd;
    if (!t_cmd.endsWith(" ")) {
      t_cmd += " ";
    }

    return input.startsWith(t_cmd);
  }

  // Autocomplete the command
  if (index === -1 && !input.startsWith("./")) {
    return commands.concat(Object.keys(Aliases)).concat(Object.keys(GlobalAliases));
  }

  // Since we're autocompleting an argument and not a command, the argument might
  // be a file/directory path. We have to account for that when autocompleting
  const commandArray = input.split(" ");
  if (commandArray.length === 0) {
    console.warn(`Tab autocompletion logic reached invalid branch`);
    return possibilities;
  }

  if (isCommand("buy")) {
    const options: string[] = [];
    for (const i of Object.keys(DarkWebItems)) {
      const item = DarkWebItems[i];
      options.push(item.program);
    }

    return options.concat(Object.keys(GlobalAliases));
  }

  if (isCommand("scp") && index === 1) {
    for (const server of GetAllServers()) {
      possibilities.push(server.hostname);
    }

    return possibilities;
  }

  if (isCommand("scp") && index === 0) {
    addAllScripts();
    addMessages({ lit: true });
    addAllTextFiles();
    addAllDirectories();

    return possibilities;
  }

  if (isCommand("cp") && index === 0) {
    addAllScripts();
    addAllTextFiles();
    addAllDirectories();
    return possibilities;
  }

  if (isCommand("connect")) {
    // All directly connected and backdoored servers are reachable
    return GetAllServers()
      .filter(
        (server) =>
          currServ.serversOnNetwork.includes(server.hostname) || (server instanceof Server && server.backdoorInstalled),
      )
      .map((server) => server.hostname);
  }

  if (isCommand("nano") || isCommand("vim")) {
    addAllScripts();
    addAllTextFiles();
    addAllDirectories();

    return possibilities;
  }

  if (isCommand("rm")) {
    addAllScripts();
    addAllPrograms();
    addMessages({ lit: true });
    addAllTextFiles();
    addAllCodingContracts();
    addAllDirectories();

    return possibilities;
  }

  async function scriptAutocomplete(): Promise<string[] | undefined> {
    if (!isCommand("run") && !isCommand("tail") && !isCommand("kill") && !input.startsWith("./")) return;
    let inputCopy = input;
    if (input.startsWith("./")) inputCopy = "run " + input.slice(2);
    const commands = ParseCommands(inputCopy);
    if (commands.length === 0) return;
    const command = ParseCommand(commands[commands.length - 1]);
    const filename = resolveScriptFilePath(command[1] + "", baseDir);
    if (!filename) return; // Not a script path.
    if (filename.endsWith(".script")) return; // Doesn't work with ns1.
    const script = currServ.scripts.get(filename);
    if (!script) return; // Doesn't exist.

    let loadedModule;
    try {
      //Will return the already compiled module if recompilation not needed.
      loadedModule = await compile(script, currServ.scripts);
    } catch (e) {
      //fail silently if the script fails to compile (e.g. syntax error)
      return;
    }
    if (!loadedModule || !loadedModule.autocomplete) return; // Doesn't have an autocomplete function.

    const runArgs = { "--tail": Boolean, "-t": Number };
    const flags = libarg(runArgs, {
      permissive: true,
      argv: command.slice(2),
    });
    const flagFunc = Flags(flags._);
    const autocompleteData: AutocompleteData = {
      servers: GetAllServers().map((server) => server.hostname),
      scripts: [...currServ.scripts.keys()],
      txts: [...currServ.textFiles.keys()],
      flags: (schema: unknown) => {
        if (!Array.isArray(schema)) throw new Error("flags require an array of array");
        pos2 = schema.map((f: unknown) => {
          if (!Array.isArray(f)) throw new Error("flags require an array of array");
          if (f[0].length === 1) return "-" + f[0];
          return "--" + f[0];
        });
        try {
          return flagFunc(schema);
        } catch (err) {
          return {};
        }
      },
    };
    let pos: string[] = [];
    let pos2: string[] = [];
    const options = loadedModule.autocomplete(autocompleteData, flags._);
    if (!Array.isArray(options)) throw new Error("autocomplete did not return list of strings");
    pos = pos.concat(options.map((x) => String(x)));
    return pos.concat(pos2);
  }

  const pos = await scriptAutocomplete();
  if (pos) return pos;

  // If input starts with './', essentially treat it as a slimmer
  // invocation of `run`.
  if (input.startsWith("./")) {
    addAllScripts("./");
    addAllPrograms();
    addAllCodingContracts("./");
    return possibilities;
  }

  if (isCommand("run")) {
    addAllScripts();
    addAllPrograms();
    addAllCodingContracts();
    addAllDirectories();
  }

  if (isCommand("kill") || isCommand("tail") || isCommand("mem") || isCommand("check")) {
    addAllScripts();
    addAllDirectories();

    return possibilities;
  }

  if (isCommand("cat")) {
    addMessages({ lit: true, msg: true });
    addAllTextFiles();
    addAllDirectories();
    addAllScripts();

    return possibilities;
  }

  if (isCommand("download") || isCommand("mv")) {
    addAllScripts();
    addAllTextFiles();
    addAllDirectories();

    return possibilities;
  }

  if (isCommand("cd")) {
    addAllDirectories();

    return possibilities;
  }

  if (isCommand("ls") && index === 0) {
    addAllDirectories();
  }

  if (isCommand("help")) {
    // Get names from here instead of commands array because some
    // undocumented/nonexistent commands are in the array
    return Object.keys(HelpTexts);
  }

  return possibilities;
}
