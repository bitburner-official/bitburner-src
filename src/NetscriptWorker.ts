/**
 * Functions for handling WorkerScripts, which are the underlying mechanism
 * that allows for scripts to run
 */
import { killWorkerScript } from "./Netscript/killWorkerScript";
import { ScriptDeath } from "./Netscript/ScriptDeath";
import { WorkerScript } from "./Netscript/WorkerScript";
import { workerScripts } from "./Netscript/WorkerScripts";
import { WorkerScriptStartStopEventEmitter } from "./Netscript/WorkerScriptStartStopEventEmitter";
import { generateNextPid } from "./Netscript/Pid";

import { CONSTANTS } from "./Constants";
import { Interpreter } from "./ThirdParty/JSInterpreter";
import { NetscriptFunctions } from "./NetscriptFunctions";
import { compile, Node } from "./NetscriptJSEvaluator";
import { Port, PortNumber } from "./NetscriptPort";
import { RunningScript } from "./Script/RunningScript";
import { scriptCalculateOfflineProduction } from "./Script/ScriptHelpers";
import { Script } from "./Script/Script";
import { GetAllServers } from "./Server/AllServers";
import { BaseServer } from "./Server/BaseServer";
import { Settings } from "./Settings/Settings";

import { generate } from "escodegen";

import { dialogBoxCreate } from "./ui/React/DialogBox";
import { arrayToString } from "./utils/helpers/arrayToString";
import { roundToTwo } from "./utils/helpers/roundToTwo";

import { parse } from "acorn";
import { simple as walksimple } from "acorn-walk";
import { areFilesEqual } from "./Terminal/DirectoryHelpers";
import { Terminal } from "./Terminal";
import { ScriptArg } from "@nsdefs";
import { handleUnknownError, CompleteRunOptions } from "./Netscript/NetscriptHelpers";

export const NetscriptPorts: Map<PortNumber, Port> = new Map();

export function prestigeWorkerScripts(): void {
  for (const ws of workerScripts.values()) {
    ws.env.stopFlag = true;
    killWorkerScript(ws);
  }

  NetscriptPorts.clear();

  WorkerScriptStartStopEventEmitter.emit();
  workerScripts.clear();
}

async function startNetscript2Script(workerScript: WorkerScript): Promise<void> {
  const scripts = workerScript.getServer().scripts;
  const script = workerScript.getScript();
  if (!script) throw "workerScript had no associated script. This is a bug.";
  const ns = workerScript.env.vars;
  if (!ns) throw `${script.filename} cannot be run because the NS object hasn't been constructed properly.`;

  const loadedModule = await compile(script, scripts);

  if (!loadedModule) throw `${script.filename} cannot be run because the script module won't load`;
  // TODO unplanned: Better error for "unexpected reserved word" when using await in non-async function?
  if (typeof loadedModule.main !== "function")
    throw `${script.filename} cannot be run because it does not have a main function.`;
  await loadedModule.main(ns);
}

async function startNetscript1Script(workerScript: WorkerScript): Promise<void> {
  const code = workerScript.code;
  let errorToThrow: unknown;

  //Process imports
  let codeWithImports, codeLineOffset;
  try {
    const importProcessingRes = processNetscript1Imports(code, workerScript);
    codeWithImports = importProcessingRes.code;
    codeLineOffset = importProcessingRes.lineOffset;
  } catch (e: unknown) {
    throw `Error processing Imports in ${workerScript.name}@${workerScript.hostname}:\n\n${e}`;
  }

  //TODO unplanned: Make NS1 wrapping type safe instead of using BasicObject.
  type BasicObject = Record<string, any>;
  const wrappedNS = NetscriptFunctions(workerScript);
  function wrapNS1Layer(int: Interpreter, intLayer: unknown, nsLayer = wrappedNS as BasicObject) {
    for (const [name, entry] of Object.entries(nsLayer)) {
      if (typeof entry === "function") {
        const wrapper = async (...args: unknown[]) => {
          try {
            // Sent a resolver function as an extra arg. See createAsyncFunction JSInterpreter.js:3209
            const callback = args.pop() as (value: unknown) => void;
            const result = await entry(...args.map((arg) => int.pseudoToNative(arg)));
            return callback(int.nativeToPseudo(result));
          } catch (e: unknown) {
            errorToThrow = e;
          }
        };
        int.setProperty(intLayer, name, int.createAsyncFunction(wrapper));
      } else if (Array.isArray(entry) || typeof entry !== "object") {
        // args, strings on enums, etc
        int.setProperty(intLayer, name, int.nativeToPseudo(entry));
      } else {
        // new object layer, e.g. bladeburner
        int.setProperty(intLayer, name, int.nativeToPseudo({}));
        wrapNS1Layer(int, (intLayer as BasicObject).properties[name], nsLayer[name]);
      }
    }
  }

  let interpreter: Interpreter;
  try {
    interpreter = new Interpreter(codeWithImports, wrapNS1Layer, codeLineOffset);
  } catch (e: unknown) {
    throw `Syntax ERROR in ${workerScript.name}@${workerScript.hostname}:\n\n${String(e)}`;
  }

  let more = true;
  while (more) {
    if (errorToThrow) throw errorToThrow;
    if (workerScript.env.stopFlag) return;
    for (let i = 0; more && i < 3; i++) more = interpreter.step();
    if (more) await new Promise((r) => setTimeout(r, Settings.CodeInstructionRunTime));
  }
}

/*  Since the JS Interpreter used for Netscript 1.0 only supports ES5, the keyword
    'import' throws an error. However, since we want to support import functionality
    we'll implement it ourselves by parsing the Nodes in the AST out.

    @param code - The script's code
    @returns {Object} {
        code: Newly-generated code with imported functions
        lineOffset: Net number of lines of code added/removed due to imported functions
                    Should typically be positive
    }
*/
function processNetscript1Imports(code: string, workerScript: WorkerScript): { code: string; lineOffset: number } {
  //allowReserved prevents 'import' from throwing error in ES5
  const ast: Node = parse(code, {
    ecmaVersion: 9,
    allowReserved: true,
    sourceType: "module",
  });

  const server = workerScript.getServer();
  if (server == null) {
    throw new Error("Failed to find underlying Server object for script");
  }

  function getScript(scriptName: string): Script | null {
    for (let i = 0; i < server.scripts.length; ++i) {
      if (server.scripts[i].filename === scriptName) {
        return server.scripts[i];
      }
    }
    return null;
  }

  let generatedCode = ""; // Generated Javascript Code
  let hasImports = false;

  // Walk over the tree and process ImportDeclaration nodes
  walksimple(ast, {
    ImportDeclaration: (node: Node) => {
      hasImports = true;
      let scriptName = node.source.value;
      if (scriptName.startsWith("./")) {
        scriptName = scriptName.slice(2);
      }
      const script = getScript(scriptName);
      if (script == null) {
        throw new Error("'Import' failed due to invalid script: " + scriptName);
      }
      const scriptAst = parse(script.code, {
        ecmaVersion: 9,
        allowReserved: true,
        sourceType: "module",
      });

      if (node.specifiers.length === 1 && node.specifiers[0].type === "ImportNamespaceSpecifier") {
        // import * as namespace from script
        const namespace = node.specifiers[0].local.name;
        const fnNames: string[] = []; //Names only
        const fnDeclarations: Node[] = []; //FunctionDeclaration Node objects
        walksimple(scriptAst, {
          FunctionDeclaration: (node: Node) => {
            fnNames.push(node.id.name);
            fnDeclarations.push(node);
          },
        });

        //Now we have to generate the code that would create the namespace
        generatedCode += `var ${namespace};\n(function (namespace) {\n`;

        //Add the function declarations
        fnDeclarations.forEach((fn: Node) => {
          generatedCode += generate(fn);
          generatedCode += "\n";
        });

        //Add functions to namespace
        fnNames.forEach((fnName) => {
          generatedCode += "namespace." + fnName + " = " + fnName;
          generatedCode += "\n";
        });

        //Finish
        generatedCode += `})(${namespace} || (" + namespace + " = {}));\n`;
      } else {
        //import {...} from script

        //Get array of all fns to import
        const fnsToImport: string[] = [];
        node.specifiers.forEach((e: Node) => {
          fnsToImport.push(e.local.name);
        });

        //Walk through script and get FunctionDeclaration code for all specified fns
        const fnDeclarations: Node[] = [];
        walksimple(scriptAst, {
          FunctionDeclaration: (node: Node) => {
            if (fnsToImport.includes(node.id.name)) {
              fnDeclarations.push(node);
            }
          },
        });

        //Convert FunctionDeclarations into code
        fnDeclarations.forEach((fn: Node) => {
          generatedCode += generate(fn);
          generatedCode += "\n";
        });
      }
    },
  });

  //If there are no imports, just return the original code
  if (!hasImports) {
    return { code: code, lineOffset: 0 };
  }

  //Remove ImportDeclarations from AST. These ImportDeclarations must be in top-level
  let linesRemoved = 0;
  if (ast.type !== "Program" || ast.body == null) {
    throw new Error("Code could not be properly parsed");
  }
  for (let i = ast.body.length - 1; i >= 0; --i) {
    if (ast.body[i].type === "ImportDeclaration") {
      ast.body.splice(i, 1);
      ++linesRemoved;
    }
  }

  //Calculated line offset
  const lineOffset = (generatedCode.match(/\n/g) || []).length - linesRemoved;

  //Convert the AST back into code
  code = generate(ast);

  //Add the imported code and re-generate in ES5 (JS Interpreter for NS1 only supports ES5);
  code = generatedCode + code;

  const res = {
    code: code,
    lineOffset: lineOffset,
  };
  return res;
}

/**
 * Used to start a RunningScript (by creating and starting its
 * corresponding WorkerScript), and add the RunningScript to the server on which
 * it is active
 */
export function startWorkerScript(runningScript: RunningScript, server: BaseServer, parent?: WorkerScript): number {
  if (createAndAddWorkerScript(runningScript, server, parent)) {
    // Push onto runningScripts.
    // This has to come after createAndAddWorkerScript() because that fn updates RAM usage
    server.runScript(runningScript);

    // Once the WorkerScript is constructed in createAndAddWorkerScript(), the RunningScript
    // object should have a PID assigned to it, so we return that
    return runningScript.pid;
  }

  return 0;
}

/**
 * Given a RunningScript object, constructs its corresponding WorkerScript,
 * adds it to the global 'workerScripts' pool, and begins executing it.
 * @param {RunningScript} runningScriptObj - Script that's being run
 * @param {Server} server - Server on which the script is to be run
 * returns {boolean} indicating whether or not the workerScript was successfully added
 */
function createAndAddWorkerScript(runningScriptObj: RunningScript, server: BaseServer, parent?: WorkerScript): boolean {
  const ramUsage = roundToTwo(runningScriptObj.ramUsage * runningScriptObj.threads);
  const ramAvailable = server.maxRam - server.ramUsed;
  // Check failure conditions before generating the workersScript and return false
  if (ramUsage > ramAvailable + 0.001) {
    dialogBoxCreate(
      `Not enough RAM to run script ${runningScriptObj.filename} with args ${arrayToString(runningScriptObj.args)}.\n` +
        `This can occur when you reload the game and the script's RAM usage has increased (either because of an update to the game or ` +
        `your changes to the script).\nThis can also occur if you have attempted to launch a script from a tail window with insufficient RAM. `,
    );
    return false;
  }

  // Get the pid
  const pid = generateNextPid();
  if (pid === -1) {
    dialogBoxCreate(
      `Failed to start script because could not find available PID. This is most ` +
        `because you have too many scripts running.`,
    );
    return false;
  }

  server.updateRamUsed(roundToTwo(server.ramUsed + ramUsage));

  // Create the WorkerScript. NOTE: WorkerScript ctor will set the underlying
  // RunningScript's PID as well
  const workerScript = new WorkerScript(runningScriptObj, pid, NetscriptFunctions);

  // Add the WorkerScript to the global pool
  workerScripts.set(pid, workerScript);
  WorkerScriptStartStopEventEmitter.emit();

  // Start the script's execution using the correct function for file type
  (workerScript.name.endsWith(".js") ? startNetscript2Script : startNetscript1Script)(workerScript)
    // Once the code finishes (either resolved or rejected, doesnt matter), set its
    // running status to false
    .then(function () {
      // On natural death, the earnings are transferred to the parent if it still exists.
      if (parent && !parent.env.stopFlag) {
        parent.scriptRef.onlineExpGained += runningScriptObj.onlineExpGained;
        parent.scriptRef.onlineMoneyMade += runningScriptObj.onlineMoneyMade;
      }
      killWorkerScript(workerScript);
      workerScript.log("", () => "Script finished running");
    })
    .catch(function (e) {
      handleUnknownError(e, workerScript);
      workerScript.log("", () => (e instanceof ScriptDeath ? "Script killed." : "Script crashed due to an error."));
      killWorkerScript(workerScript);
    });
  return true;
}

/** Updates the online running time stat of all running scripts */
export function updateOnlineScriptTimes(numCycles = 1): void {
  const time = (numCycles * CONSTANTS.MilliPerCycle) / 1000; //seconds
  for (const ws of workerScripts.values()) {
    ws.scriptRef.onlineRunningTime += time;
  }
}

/**
 * Called when the game is loaded. Loads all running scripts (from all servers)
 * into worker scripts so that they will start running
 */
export function loadAllRunningScripts(): void {
  const skipScriptLoad = window.location.href.toLowerCase().indexOf("?noscripts") !== -1;
  if (skipScriptLoad) {
    Terminal.warn("Skipped loading player scripts during startup");
    console.info("Skipping the load of any scripts during startup");
  }
  for (const server of GetAllServers()) {
    // Reset each server's RAM usage to 0
    server.ramUsed = 0;

    if (skipScriptLoad) {
      // Start game with no scripts
      server.runningScripts.length = 0;
      continue;
    }
    // Using backwards index iteration to avoid complications when removing elements during iteration.
    for (let i = server.runningScripts.length - 1; i >= 0; i--) {
      const runningScript = server.runningScripts[i];
      const success = createAndAddWorkerScript(runningScript, server);
      scriptCalculateOfflineProduction(runningScript);
      // Remove the RunningScript if the WorkerScript failed to start.
      if (!success) server.runningScripts.splice(i, 1);
    }
  }
}

/** Run a script from inside another script (run(), exec(), spawn(), etc.) */
export function runScriptFromScript(
  caller: string,
  host: BaseServer,
  scriptname: string,
  args: ScriptArg[],
  workerScript: WorkerScript,
  runOpts: CompleteRunOptions,
): number {
  /* Very inefficient, TODO change data structures so that finding script & checking if it's already running does
   * not require iterating through all scripts and comparing names/args. This is a big part of slowdown when
   * running a large number of scripts. */

  // Find the script, fail if it doesn't exist.
  const script = host.scripts.find((serverScript) => areFilesEqual(serverScript.filename, scriptname));
  if (!script) {
    workerScript.log(caller, () => `Could not find script '${scriptname}' on '${host.hostname}'`);
    return 0;
  }

  // Check if script is already running on server and fail if it is.
  if (host.getRunningScript(scriptname, args)) {
    workerScript.log(caller, () => `'${scriptname}' is already running on '${host.hostname}'`);
    return 0;
  }

  const singleRamUsage = runOpts.ramOverride ?? script.getRamUsage(host.scripts);
  if (!singleRamUsage) {
    workerScript.log(caller, () => `Ram usage could not be calculated for ${scriptname}`);
    return 0;
  }

  // Check if admin rights on host, fail if not.
  if (host.hasAdminRights == false) {
    workerScript.log(caller, () => `You do not have root access on '${host.hostname}'`);
    return 0;
  }

  // Calculate ram usage including thread count
  const ramUsage = singleRamUsage * runOpts.threads;

  // Check if there is enough ram to run the script, fail if not.
  const ramAvailable = host.maxRam - host.ramUsed;
  if (ramUsage > ramAvailable + 0.001) {
    workerScript.log(
      caller,
      () =>
        `Cannot run script '${scriptname}' (t=${runOpts.threads}) on '${host.hostname}' because there is not enough available RAM!`,
    );
    return 0;
  }
  // Able to run script
  workerScript.log(
    caller,
    () => `'${scriptname}' on '${host.hostname}' with ${runOpts.threads} threads and args: ${arrayToString(args)}.`,
  );
  const runningScriptObj = new RunningScript(script, singleRamUsage, args);
  runningScriptObj.threads = runOpts.threads;
  runningScriptObj.temporary = runOpts.temporary;

  return startWorkerScript(runningScriptObj, host, workerScript);
}
