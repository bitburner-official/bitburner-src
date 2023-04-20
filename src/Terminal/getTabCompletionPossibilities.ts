import { Aliases, GlobalAliases } from "../Alias";
import { DarkWebItems } from "../DarkWeb/DarkWebItems";
import { Player } from "@player";
import { GetAllServers } from "../Server/AllServers";
import { ParseCommand, ParseCommands } from "./Parser";
import { HelpTexts } from "./HelpText";
import { compile } from "../NetscriptJSEvaluator";
import { Flags } from "../NetscriptFunctions/Flags";
import { AutocompleteData } from "@nsdefs";
import * as libarg from "arg";
import { getAllDirectories, resolveDirectory, root } from "../Paths/Directory";
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

/** Suggest all completion possibilities for the last argument in the last command being typed
 * @param commandArray Array of texts that combine to create the current command
 * @param baseDir The current working directory.
 * @returns Array of possible string replacements for the current text being autocompleted.
 */
export async function getTabCompletionPossibilities(
  commandArray: readonly string[],
  baseDir = root,
): Promise<string[]> {
  /** How many separate strings make up the command, e.g. "run a" would result in 2 strings. */
  const commandLength = commandArray.length;

  /** The current text being autocompleted. */
  const currentArg = commandArray[commandLength - 1];

  // To prevent needing to convert currentArg to lowercase for every comparison
  const requiredMatch = currentArg.toLowerCase();

  // If a relative directory is included in the path, this will store what the absolute path needs to start with to be valid
  let pathingRequiredMatch = currentArg.toLowerCase();

  /** The directory portion of the current input */
  let relativeDir = "";
  const slashIndex = currentArg.lastIndexOf("/");

  if (slashIndex !== -1) {
    relativeDir = currentArg.substring(0, slashIndex + 1);
    const path = resolveDirectory(relativeDir, baseDir);
    // No valid terminal inputs contain a / that does not indicate a path
    if (path === null) return [];
    baseDir = path;
    pathingRequiredMatch = currentArg.replace(/.*(?<=\/)/, path).toLowerCase();
  }

  const possibilities: string[] = [];
  const currServ = Player.getCurrentServer();
  const homeComputer = Player.getHomeComputer();

  // --- Functions for adding different types of data ---

  interface AddAllGenericOptions {
    // The iterable to iterate through the data
    iterable: Iterable<string>;
    // Whether the item can be pathed to. Typically this is true for files (programs are an exception)
    usePathing: boolean;
  }
  function addGeneric({ iterable, usePathing }: AddAllGenericOptions) {
    const requiredStart = usePathing ? pathingRequiredMatch : requiredMatch;
    for (const member of iterable) {
      if (member.toLowerCase().startsWith(requiredStart)) {
        possibilities.push(usePathing && relativeDir ? relativeDir + member.substring(baseDir.length) : member);
      }
    }
  }

  const addAliases = () => addGeneric({ iterable: Object.keys(Aliases), usePathing: false });
  const addGlobalAliases = () => addGeneric({ iterable: Object.keys(GlobalAliases), usePathing: false });
  const addCommands = () => addGeneric({ iterable: commands, usePathing: false });
  const addScripts = () => addGeneric({ iterable: currServ.scripts.keys(), usePathing: true });
  const addTextFiles = () => addGeneric({ iterable: currServ.textFiles.keys(), usePathing: true });
  const addCodingContracts = () => {
    addGeneric({ iterable: currServ.contracts.map((contract) => contract.fn), usePathing: true });
  };

  const addLiterature = () => {
    addGeneric({ iterable: currServ.messages.filter((message) => message.endsWith(".lit")), usePathing: true });
  };

  const addMessages = () => {
    addGeneric({ iterable: currServ.messages.filter((message) => message.endsWith(".msg")), usePathing: true });
  };

  const addDarkwebItems = () => {
    addGeneric({ iterable: Object.values(DarkWebItems).map((item) => item.program), usePathing: false });
  };

  const addServerNames = () => {
    addGeneric({ iterable: GetAllServers().map((server) => server.hostname), usePathing: false });
  };

  const addReachableServerNames = () => {
    addGeneric({
      iterable: GetAllServers()
        .filter((server) => server.backdoorInstalled || currServ.serversOnNetwork.includes(server.hostname))
        .map((server) => server.hostname),
      usePathing: false,
    });
  };

  const addPrograms = () => {
    // At all times, programs can be accessed without pathing
    addGeneric({ iterable: homeComputer.programs, usePathing: false });
    // If we're on home and a path is being used, also include pathing results
    if (homeComputer.isConnectedTo && relativeDir) addGeneric({ iterable: homeComputer.programs, usePathing: true });
  };

  const addDirectories = () => addGeneric({ iterable: getAllDirectories(currServ), usePathing: true });

  // Just some booleans so the mismatch between command length and arg number are not as confusing.
  const onCommand = commandLength === 1;
  const onFirstCommandArg = commandLength === 2;
  const onSecondCommandArg = commandLength === 3;

  // These are always added.
  addGlobalAliases();

  // If we're using a relative path, always add directories
  if (relativeDir) addDirectories();

  // -- Handling different commands -- //
  // Command is what is being autocompleted
  if (onCommand) {
    addAliases();
    addCommands();
    // Allow any relative pathing with . to act like the ./ command
    if (currentArg.startsWith(".")) {
      addScripts();
      addPrograms();
      addCodingContracts();
    }
  }

  switch (commandArray[0]) {
    case "buy":
      addDarkwebItems();
      return possibilities;

    case "cat":
      addScripts();
      addTextFiles();
      addMessages();
      addLiterature();
      return possibilities;

    case "cd":
    case "ls":
      if (onFirstCommandArg && !relativeDir) addDirectories();
      return possibilities;

    case "check":
    case "kill":
    case "mem":
    case "tail":
      addScripts();
      return possibilities;

    case "connect":
      if (onFirstCommandArg) addReachableServerNames();
      return possibilities;

    case "cp":
      if (onFirstCommandArg) {
        // We're autocompleting a source content file
        addScripts();
        addTextFiles();
      }
      return possibilities;

    case "download":
    case "mv":
      // download only takes one arg, and for mv we only want to autocomplete the first one
      if (onFirstCommandArg) {
        addScripts();
        addTextFiles();
      }
      return possibilities;

    case "help":
      if (onFirstCommandArg) {
        addGeneric({ iterable: Object.keys(HelpTexts), usePathing: false });
      }
      return possibilities;

    case "nano":
    case "vim":
      addScripts();
      addTextFiles();
      return possibilities;

    case "scp":
      if (onFirstCommandArg) addServerNames();
      else if (onSecondCommandArg) {
        addScripts();
        addTextFiles();
        addLiterature();
      }
      return possibilities;

    case "rm":
      addScripts();
      addPrograms();
      addLiterature();
      addTextFiles();
      addCodingContracts();
      return possibilities;

    case "run":
      if (onFirstCommandArg) {
        addPrograms();
        addCodingContracts();
      }
    // Spill over into next cases
    case "check":
    case "tail":
    case "kill":
      if (onFirstCommandArg) addScripts();
      else {
        const options = await scriptAutocomplete();
        if (options) addGeneric({ iterable: options, usePathing: false });
      }
      return possibilities;

    default:
      return possibilities;
  }

  async function scriptAutocomplete(): Promise<string[] | undefined> {
    let inputCopy = commandArray.join(" ");
    if (commandLength === 1) inputCopy = "run " + inputCopy;
    const commands = ParseCommands(inputCopy);
    if (commands.length === 0) return;
    const command = ParseCommand(commands[commands.length - 1]);
    const filename = resolveScriptFilePath(String(command[1]), baseDir);
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
}
