/**
 * Implements RAM Calculation functionality.
 *
 * Uses the acorn.js library to parse a script's code into an AST and
 * recursively walk through that AST, calculating RAM usage along
 * the way
 */
import * as walk from "acorn-walk";
import acorn, { parse } from "acorn";

import { RamCalculationErrorCode } from "./RamCalculationErrorCodes";

import { RamCosts, RamCostConstants } from "../Netscript/RamCostGenerator";
import { Script } from "./Script";
import { Node } from "../NetscriptJSEvaluator";
import { ScriptFilePath, resolveScriptFilePath } from "../Paths/ScriptFilePath";
import { ServerName } from "../Types/strings";

export interface RamUsageEntry {
  type: "ns" | "dom" | "fn" | "misc";
  name: string;
  cost: number;
}

export type RamCalculationSuccess = {
  cost: number;
  entries: RamUsageEntry[];
  errorCode?: never;
  errorMessage?: never;
};

export type RamCalculationFailure = {
  cost?: never;
  entries?: never;
  errorCode: RamCalculationErrorCode;
  errorMessage?: string;
};

export type RamCalculation = RamCalculationSuccess | RamCalculationFailure;

// These special strings are used to reference the presence of a given logical
// construct within a user script.
const specialReferenceIF = "__SPECIAL_referenceIf";
const specialReferenceFOR = "__SPECIAL_referenceFor";
const specialReferenceWHILE = "__SPECIAL_referenceWhile";

// The global scope of a script is registered under this key during parsing.
const memCheckGlobalKey = ".__GLOBAL__";

/** Function for getting a function's ram cost, either from the ramcost function (singularity) or the static cost */
function getNumericCost(cost: number | (() => number)): number {
  return typeof cost === "function" ? cost() : cost;
}

/**
 * Parses code into an AST and walks through it recursively to calculate
 * RAM usage. Also accounts for imported modules.
 * @param otherScripts - All other scripts on the server. Used to account for imported scripts
 * @param code - The code being parsed
 * @param scriptname - The name of the script that ram needs to be added to
 * @param server - Servername of the scripts for Error Message
 * */
function parseOnlyRamCalculate(
  otherScripts: Map<ScriptFilePath, Script>,
  code: string,
  scriptname: ScriptFilePath,
  server: ServerName,
  ns1?: boolean,
): RamCalculation {
  /**
   * Maps dependent identifiers to their dependencies.
   *
   * The initial identifier is <name of the main script>.__GLOBAL__.
   * It depends on all the functions declared in the module, all the global scopes
   * of its imports, and any identifiers referenced in this global scope. Each
   * function depends on all the identifiers referenced internally.
   * We walk the dependency graph to calculate RAM usage, given that some identifiers
   * reference Netscript functions which have a RAM cost.
   */
  let dependencyMap: Record<string, string[]> = {};

  // Scripts we've parsed.
  const completedParses = new Set();

  // Scripts we've discovered that need to be parsed.
  const parseQueue: ScriptFilePath[] = [];
  // Parses a chunk of code with a given module name, and updates parseQueue and dependencyMap.
  function parseCode(code: string, moduleName: ScriptFilePath): void {
    const result = parseOnlyCalculateDeps(code, moduleName, ns1);
    completedParses.add(moduleName);

    // Add any additional modules to the parse queue;
    for (let i = 0; i < result.additionalModules.length; ++i) {
      if (!completedParses.has(result.additionalModules[i])) {
        parseQueue.push(result.additionalModules[i]);
      }
    }

    // Splice all the references in
    dependencyMap = Object.assign(dependencyMap, result.dependencyMap);
  }

  // Parse the initial module, which is the "main" script that is being run
  const initialModule = scriptname;
  parseCode(code, initialModule);

  // Process additional modules, which occurs if the "main" script has any imports
  while (parseQueue.length > 0) {
    const nextModule = parseQueue.shift();
    if (nextModule === undefined) throw new Error("nextModule should not be undefined");
    if (nextModule.startsWith("https://") || nextModule.startsWith("http://")) continue;

    const script = otherScripts.get(nextModule);
    if (!script) {
      return {
        errorCode: RamCalculationErrorCode.ImportError,
        errorMessage: `File: "${nextModule}" not found on server: ${server}`,
      };
    }

    parseCode(script.code, nextModule);
  }

  // Finally, walk the reference map and generate a ram cost. The initial set of keys to scan
  // are those that start with the name of the main script.
  let ram = RamCostConstants.Base;
  const detailedCosts: RamUsageEntry[] = [{ type: "misc", name: "baseCost", cost: RamCostConstants.Base }];
  const unresolvedRefs = Object.keys(dependencyMap).filter((s) => s.startsWith(initialModule));
  const resolvedRefs = new Set();
  const loadedFns: Record<string, boolean> = {};
  while (unresolvedRefs.length > 0) {
    const ref = unresolvedRefs.shift();
    if (ref === undefined) throw new Error("ref should not be undefined");

    // Check if this is one of the special keys, and add the appropriate ram cost if so.
    if (ref === "hacknet" && !resolvedRefs.has("hacknet")) {
      ram += RamCostConstants.HacknetNodes;
      detailedCosts.push({ type: "ns", name: "hacknet", cost: RamCostConstants.HacknetNodes });
    }
    if (ref === "document" && !resolvedRefs.has("document")) {
      ram += RamCostConstants.Dom;
      detailedCosts.push({ type: "dom", name: "document", cost: RamCostConstants.Dom });
    }
    if (ref === "window" && !resolvedRefs.has("window")) {
      ram += RamCostConstants.Dom;
      detailedCosts.push({ type: "dom", name: "window", cost: RamCostConstants.Dom });
    }

    resolvedRefs.add(ref);

    if (ref.endsWith(".*")) {
      // A prefix reference. We need to find all matching identifiers.
      const prefix = ref.slice(0, ref.length - 2);
      for (const ident of Object.keys(dependencyMap).filter((k) => k.startsWith(prefix))) {
        for (const dep of dependencyMap[ident] || []) {
          if (!resolvedRefs.has(dep)) unresolvedRefs.push(dep);
        }
      }
    } else {
      // An exact reference. Add all dependencies of this ref.
      for (const dep of dependencyMap[ref] || []) {
        if (!resolvedRefs.has(dep)) unresolvedRefs.push(dep);
      }
    }

    // Check if this identifier is a function in the workerScript environment.
    // If it is, then we need to get its RAM cost.
    try {
      // Only count each function once
      if (loadedFns[ref]) {
        continue;
      }
      loadedFns[ref] = true;

      // This accounts for namespaces (Bladeburner, CodingContract, etc.)
      const findFunc = (
        prefix: string,
        obj: object,
        ref: string,
      ): { func: () => number | number; refDetail: string } | undefined => {
        if (!obj) return;
        const elem = Object.entries(obj).find(([key]) => key === ref);
        if (elem !== undefined && (typeof elem[1] === "function" || typeof elem[1] === "number")) {
          return { func: elem[1], refDetail: `${prefix}${ref}` };
        }
        for (const [key, value] of Object.entries(obj)) {
          const found = findFunc(`${key}.`, value, ref);
          if (found) return found;
        }
        return undefined;
      };

      const details = findFunc("", RamCosts, ref);
      const fnRam = getNumericCost(details?.func ?? 0);
      ram += fnRam;
      detailedCosts.push({ type: "fn", name: details?.refDetail ?? "", cost: fnRam });
    } catch (error) {
      console.error(error);
      continue;
    }
  }
  if (ram > RamCostConstants.Max) {
    ram = RamCostConstants.Max;
    detailedCosts.push({ type: "misc", name: "Max Ram Cap", cost: RamCostConstants.Max });
  }
  return { cost: ram, entries: detailedCosts.filter((e) => e.cost > 0) };
}

export function checkInfiniteLoop(code: string): number[] {
  let ast: acorn.Node;
  try {
    ast = parse(code, { sourceType: "module", ecmaVersion: "latest" });
  } catch (e) {
    // If code cannot be parsed, do not provide infinite loop detection warning
    return [];
  }
  function nodeHasTrueTest(node: acorn.Node): boolean {
    return node.type === "Literal" && "raw" in node && (node.raw === "true" || node.raw === "1");
  }

  function hasAwait(ast: acorn.Node): boolean {
    let hasAwait = false;
    walk.recursive(
      ast,
      {},
      {
        AwaitExpression: () => {
          hasAwait = true;
        },
      },
    );
    return hasAwait;
  }

  const possibleLines: number[] = [];
  walk.recursive(
    ast,
    {},
    {
      WhileStatement: (node: Node, st: unknown, walkDeeper: walk.WalkerCallback<any>) => {
        const previousLines = code.slice(0, node.start).trimEnd().split("\n");
        const lineNumber = previousLines.length + 1;
        if (previousLines[previousLines.length - 1].match(/^\s*\/\/\s*@ignore-infinite/)) {
          return;
        }
        if (nodeHasTrueTest(node.test) && !hasAwait(node)) {
          possibleLines.push(lineNumber);
        } else {
          node.body && walkDeeper(node.body, st);
        }
      },
    },
  );

  return possibleLines;
}

interface ParseDepsResult {
  dependencyMap: Record<string, Set<string> | undefined>;
  additionalModules: ScriptFilePath[];
}

/**
 * Helper function that parses a single script. It returns a map of all dependencies,
 * which are items in the code's AST that potentially need to be evaluated
 * for RAM usage calculations. It also returns an array of additional modules
 * that need to be parsed (i.e. are 'import'ed scripts).
 */
function parseOnlyCalculateDeps(code: string, currentModule: ScriptFilePath, ns1?: boolean): ParseDepsResult {
  const ast = parse(code, { sourceType: "module", ecmaVersion: "latest" });
  // Everything from the global scope goes in ".". Everything else goes in ".function", where only
  // the outermost layer of functions counts.
  const globalKey = currentModule + memCheckGlobalKey;
  const dependencyMap: Record<string, Set<string> | undefined> = {};
  dependencyMap[globalKey] = new Set<string>();

  // If we reference this internal name, we're really referencing that external name.
  // Filled when we import names from other modules.
  const internalToExternal: Record<string, string | undefined> = {};

  const additionalModules: ScriptFilePath[] = [];

  // References get added pessimistically. They are added for thisModule.name, name, and for
  // any aliases.
  function addRef(key: string, name: string, module = currentModule): void {
    const s = dependencyMap[key] || (dependencyMap[key] = new Set());
    const external = internalToExternal[name];
    if (external !== undefined) {
      s.add(external);
    }
    s.add(module + "." + name);
    s.add(name); // For builtins like hack.
  }

  //A list of identifiers that resolve to "native Javascript code"
  const objectPrototypeProperties = Object.getOwnPropertyNames(Object.prototype);

  interface State {
    key: string;
  }

  // If we discover a dependency identifier, state.key is the dependent identifier.
  // walkDeeper is for doing recursive walks of expressions in composites that we handle.
  function commonVisitors(): walk.RecursiveVisitors<State> {
    return {
      Identifier: (node: Node, st: State) => {
        if (objectPrototypeProperties.includes(node.name)) {
          return;
        }
        addRef(st.key, node.name);
      },
      WhileStatement: (node: Node, st: State, walkDeeper: walk.WalkerCallback<State>) => {
        addRef(st.key, specialReferenceWHILE);
        node.test && walkDeeper(node.test, st);
        node.body && walkDeeper(node.body, st);
      },
      DoWhileStatement: (node: Node, st: State, walkDeeper: walk.WalkerCallback<State>) => {
        addRef(st.key, specialReferenceWHILE);
        node.test && walkDeeper(node.test, st);
        node.body && walkDeeper(node.body, st);
      },
      ForStatement: (node: Node, st: State, walkDeeper: walk.WalkerCallback<State>) => {
        addRef(st.key, specialReferenceFOR);
        node.init && walkDeeper(node.init, st);
        node.test && walkDeeper(node.test, st);
        node.update && walkDeeper(node.update, st);
        node.body && walkDeeper(node.body, st);
      },
      IfStatement: (node: Node, st: State, walkDeeper: walk.WalkerCallback<State>) => {
        addRef(st.key, specialReferenceIF);
        node.test && walkDeeper(node.test, st);
        node.consequent && walkDeeper(node.consequent, st);
        node.alternate && walkDeeper(node.alternate, st);
      },
      MemberExpression: (node: Node, st: State, walkDeeper: walk.WalkerCallback<State>) => {
        node.object && walkDeeper(node.object, st);
        node.property && walkDeeper(node.property, st);
      },
    };
  }

  walk.recursive<State>(
    ast,
    { key: globalKey },
    Object.assign(
      {
        ImportDeclaration: (node: Node, st: State) => {
          const importModuleName = resolveScriptFilePath(node.source.value, currentModule, ns1 ? ".script" : ".js");
          if (!importModuleName)
            throw new Error(
              `ScriptFilePath couldnt be resolved in ImportDeclaration. Value: ${node.source.value}  ScriptFilePath: ${currentModule}`,
            );

          additionalModules.push(importModuleName);

          // This module's global scope refers to that module's global scope, no matter how we
          // import it.
          const set = dependencyMap[st.key];
          if (set === undefined) throw new Error("set should not be undefined");
          set.add(importModuleName + memCheckGlobalKey);

          for (let i = 0; i < node.specifiers.length; ++i) {
            const spec = node.specifiers[i];
            if (spec.imported !== undefined && spec.local !== undefined) {
              // We depend on specific things.
              internalToExternal[spec.local.name] = importModuleName + "." + spec.imported.name;
            } else {
              // We depend on everything.
              const set = dependencyMap[st.key];
              if (set === undefined) throw new Error("set should not be undefined");
              set.add(importModuleName + ".*");
            }
          }
        },
        FunctionDeclaration: (node: Node) => {
          // node.id will be null when using 'export default'. Add a module name indicating the default export.
          const key = currentModule + "." + (node.id === null ? "__SPECIAL_DEFAULT_EXPORT__" : node.id.name);
          walk.recursive(node, { key: key }, commonVisitors());
        },
        ExportNamedDeclaration: (node: Node, st: State, walkDeeper: walk.WalkerCallback<State>) => {
          if (node.declaration !== null) {
            // if this is true, the statement is not a named export, but rather a exported function/variable
            walkDeeper(node.declaration, st);
            return;
          }

          for (const specifier of node.specifiers) {
            const exportedDepName = currentModule + "." + specifier.exported.name;

            if (node.source !== null) {
              // if this is true, we are re-exporting something
              addRef(exportedDepName, specifier.local.name, node.source.value);
              additionalModules.push(node.source.value);
            } else if (specifier.exported.name !== specifier.local.name) {
              // this makes sure we are not refering to ourselves
              // if this is not true, we don't need to add anything
              addRef(exportedDepName, specifier.local.name);
            }
          }
        },
      },
      commonVisitors(),
    ),
  );

  return { dependencyMap: dependencyMap, additionalModules: additionalModules };
}

/**
 * Calculate's a scripts RAM Usage
 * @param {string} code - The script's code
 * @param {ScriptFilePath} scriptname - The script's name. Used to resolve relative paths
 * @param {Script[]} otherScripts - All other scripts on the server.
 *                                  Used to account for imported scripts
 * @param {ServerName} server - Servername of the scripts for Error Message
 * @param {boolean} ns1 - Deprecated: is the fileExtension .script or .js
 */
export function calculateRamUsage(
  code: string,
  scriptname: ScriptFilePath,
  otherScripts: Map<ScriptFilePath, Script>,
  server: ServerName,
  ns1?: boolean,
): RamCalculation {
  try {
    return parseOnlyRamCalculate(otherScripts, code, scriptname, server, ns1);
  } catch (e) {
    return {
      errorCode: RamCalculationErrorCode.SyntaxError,
      errorMessage: e instanceof Error ? e.message : undefined,
    };
  }
}
