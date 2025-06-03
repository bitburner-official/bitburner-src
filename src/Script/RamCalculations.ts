/**
 * Implements RAM Calculation functionality.
 *
 * Uses acorn-walk to recursively walk through the AST, calculating RAM usage along the way.
 */
import * as walk from "acorn-walk";
import type * as acorn from "acorn";
import { extendAcornWalkForTypeScriptNodes } from "../ThirdParty/acorn-typescript-walk";
import { extend as extendAcornWalkForJsxNodes } from "acorn-jsx-walk";

import { RamCalculationErrorCode } from "./RamCalculationErrorCodes";

import { RamCosts, RamCostConstants } from "../Netscript/RamCostGenerator";
import type { Script } from "./Script";
import type { ScriptFilePath } from "../Paths/ScriptFilePath";
import type { ServerName } from "../Types/strings";
import { roundToTwo } from "../utils/helpers/roundToTwo";
import {
  type AST,
  type FileTypeFeature,
  getFileType,
  getFileTypeFeature,
  getModuleScript,
  parseAST,
  ModuleResolutionError,
} from "../utils/ScriptTransformer";

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

// Extend acorn-walk to support TypeScript nodes.
extendAcornWalkForTypeScriptNodes(walk.base);

// Extend acorn-walk to support JSX nodes.
extendAcornWalkForJsxNodes(walk.base);

// These special strings are used to reference the presence of a given logical
// construct within a user script.
const specialReferenceIF = "__SPECIAL_referenceIf";
const specialReferenceFOR = "__SPECIAL_referenceFor";
const specialReferenceWHILE = "__SPECIAL_referenceWhile";

// This special string is used to signal that RAM is being overriden for a script.
// It doesn't apply when importing that script.
// The nature of the name guarantees it can never be conflated with a valid identifier.
const specialReferenceRAM = ".^SPECIAL_ramOverride";

// The global scope of a script is registered under this key during parsing.
const memCheckGlobalKey = ".__GLOBAL__";

/** Function for getting a function's ram cost, either from the ramcost function (singularity) or the static cost */
function getNumericCost(cost: number | (() => number)): number {
  return typeof cost === "function" ? cost() : cost;
}

/**
 * Parses code into an AST and walks through it recursively to calculate
 * RAM usage. Also accounts for imported modules.
 * @param ast - AST of the code being parsed
 * @param scriptName - The name of the script that ram needs to be added to
 * @param server - Servername of the scripts for Error Message
 * @param fileTypeFeature
 * @param otherScripts - All other scripts on the server. Used to account for imported scripts
 * */
function parseOnlyRamCalculate(
  ast: AST,
  scriptName: ScriptFilePath,
  server: ServerName,
  fileTypeFeature: FileTypeFeature,
  otherScripts: Map<ScriptFilePath, Script>,
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
  let dependencyMap: Record<string, Set<string>> = {};

  // Scripts we've parsed.
  const completedParses = new Set();

  // Scripts we've discovered that need to be parsed.
  const parseQueue: ScriptFilePath[] = [];
  // Parses a chunk of code with a given module name, and updates parseQueue and dependencyMap.
  function parseCode(ast: AST, moduleName: ScriptFilePath, fileTypeFeatureOfModule: FileTypeFeature): void {
    const result = parseOnlyCalculateDeps(ast, moduleName, fileTypeFeatureOfModule, otherScripts);
    completedParses.add(moduleName);

    // Add any additional modules to the parse queue;
    for (const additionalModule of result.additionalModules) {
      if (!completedParses.has(additionalModule) && !parseQueue.includes(additionalModule)) {
        parseQueue.push(additionalModule);
      }
    }

    // Splice all the references in
    dependencyMap = Object.assign(dependencyMap, result.dependencyMap);
  }

  // Parse the initial module, which is the "main" script that is being run
  const initialModule = scriptName;
  parseCode(ast, initialModule, fileTypeFeature);

  // Process additional modules, which occurs if the "main" script has any imports
  while (parseQueue.length > 0) {
    const nextModule = parseQueue.shift();

    if (nextModule === undefined) {
      throw new Error("nextModule should not be undefined");
    }
    if (nextModule.startsWith("https://") || nextModule.startsWith("http://")) {
      continue;
    }

    const script = otherScripts.get(nextModule);
    if (!script) {
      return {
        errorCode: RamCalculationErrorCode.ImportError,
        errorMessage: `"${nextModule}" does not exist on server: ${server}`,
      };
    }
    const scriptFileType = getFileType(script.filename);
    let moduleAST;
    try {
      moduleAST = parseAST(script.filename, script.server, script.code, scriptFileType);
    } catch (error) {
      return {
        errorCode: RamCalculationErrorCode.ImportError,
        errorMessage: `Cannot parse module: ${nextModule}. Filename: ${script.filename}. Reason: ${
          error instanceof Error ? error.message : String(error)
        }.`,
      };
    }
    parseCode(moduleAST, nextModule, getFileTypeFeature(scriptFileType));
  }

  // Finally, walk the reference map and generate a ram cost. The initial set of keys to scan
  // are those that start with the name of the main script.
  let ram: number = RamCostConstants.Base;
  const detailedCosts: RamUsageEntry[] = [{ type: "misc", name: "baseCost", cost: RamCostConstants.Base }];
  const unresolvedRefs = Object.keys(dependencyMap).filter((s) => s.startsWith(initialModule));
  const resolvedRefs = new Set();
  const loadedFns: Record<string, boolean> = {};
  while (unresolvedRefs.length > 0) {
    const ref = unresolvedRefs.shift();
    if (ref === undefined) {
      throw new Error("ref should not be undefined");
    }

    if (ref.endsWith(specialReferenceRAM)) {
      if (ref !== initialModule + specialReferenceRAM) {
        // All RAM override tokens that *aren't* for the main module should be discarded.
        continue;
      }
      // This is a RAM override for the main module. We can end ram calculation immediately.
      const [first] = dependencyMap[ref];
      const override = Number(first);
      return { cost: override, entries: [{ type: "misc", name: "override", cost: override }] };
    }
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
          if (!resolvedRefs.has(dep)) {
            unresolvedRefs.push(dep);
          }
        }
      }
    } else {
      // An exact reference. Add all dependencies of this ref.
      for (const dep of dependencyMap[ref] || []) {
        if (!resolvedRefs.has(dep)) {
          unresolvedRefs.push(dep);
        }
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
      ): { func: (() => number) | number; refDetail: string } | undefined => {
        if (!obj) {
          return;
        }
        const elem = Object.entries(obj).find(([key]) => key === ref);
        if (elem !== undefined && (typeof elem[1] === "function" || typeof elem[1] === "number")) {
          return { func: elem[1] as (() => number) | number, refDetail: `${prefix}${ref}` };
        }
        for (const [key, value] of Object.entries(obj)) {
          const found = findFunc(`${key}.`, value as object, ref);
          if (found) {
            return found;
          }
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

export function checkInfiniteLoop(ast: AST, code: string): number[] {
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
    ast as acorn.Node, // Pretend that ast is an acorn node
    {},
    {
      WhileStatement: (node: acorn.WhileStatement, st: unknown, walkDeeper: walk.WalkerCallback<any>) => {
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
function parseOnlyCalculateDeps(
  ast: AST,
  currentModule: ScriptFilePath,
  fileTypeFeature: FileTypeFeature,
  otherScripts: Map<ScriptFilePath, Script>,
): ParseDepsResult {
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

  function checkRamOverride(node: acorn.BlockStatement) {
    // To trigger a syntactic RAM override, the first statement must be a call
    // to ns.ramOverride() (or something that looks similar).
    if (!node.body || !node.body.length) return;
    const statement = node.body[0];
    if (statement.type !== "ExpressionStatement") return;
    const expr = statement.expression;
    if (expr.type !== "CallExpression") return;
    if (!expr.arguments || expr.arguments.length !== 1) return;

    /**
     * This function is called with expr.callee. expr.callee can be Expression or Super. In its implementation, the
     * "node" parameter can be reassigned to node.property if "node" is MemberExpression. node.property may be
     * PrivateIdentifier, so we need to add that type to the type list of "node".
     */
    function findIdentifier(node: acorn.Expression | acorn.Super | acorn.PrivateIdentifier) {
      for (;;) {
        // Find the identifier node attached to the call
        switch (node.type) {
          case "ParenthesizedExpression":
          case "ChainExpression":
            node = node.expression;
            break;
          case "MemberExpression":
            node = node.property;
            break;
          default:
            return node;
        }
      }
    }
    const idNode = findIdentifier(expr.callee);
    if (idNode.type !== "Identifier" || idNode.name !== "ramOverride") return;

    // For the time being, we only handle simple literals for the argument.
    // If needed, this could be extended to simple constant expressions.
    const literal = expr.arguments[0];
    if (literal.type !== "Literal") return;
    const value = literal.value;
    if (typeof value !== "number") return;

    // Finally, we know the syntax checks out for applying the RAM override.
    // But the value might be illegal.
    if (!isFinite(value) || value < RamCostConstants.Base) return;

    // This is an unusual arrangement; the "function name" here is our special
    // case, and it is "depending on" the stringified value of our ram override
    // (which is not any kind of identifier).
    dependencyMap[currentModule + specialReferenceRAM] = new Set([roundToTwo(value).toString()]);
  }

  // If we discover a dependency identifier, state.key is the dependent identifier.
  // walkDeeper is for doing recursive walks of expressions in composites that we handle.
  function commonVisitors(): walk.RecursiveVisitors<State> {
    return {
      Identifier: (node: acorn.Identifier, st: State) => {
        if (objectPrototypeProperties.includes(node.name)) {
          return;
        }
        addRef(st.key, node.name);
      },
      WhileStatement: (node: acorn.WhileStatement, st: State, walkDeeper: walk.WalkerCallback<State>) => {
        addRef(st.key, specialReferenceWHILE);
        node.test && walkDeeper(node.test, st);
        node.body && walkDeeper(node.body, st);
      },
      DoWhileStatement: (node: acorn.DoWhileStatement, st: State, walkDeeper: walk.WalkerCallback<State>) => {
        addRef(st.key, specialReferenceWHILE);
        node.test && walkDeeper(node.test, st);
        node.body && walkDeeper(node.body, st);
      },
      ForStatement: (node: acorn.ForStatement, st: State, walkDeeper: walk.WalkerCallback<State>) => {
        addRef(st.key, specialReferenceFOR);
        node.init && walkDeeper(node.init, st);
        node.test && walkDeeper(node.test, st);
        node.update && walkDeeper(node.update, st);
        node.body && walkDeeper(node.body, st);
      },
      IfStatement: (node: acorn.IfStatement, st: State, walkDeeper: walk.WalkerCallback<State>) => {
        addRef(st.key, specialReferenceIF);
        node.test && walkDeeper(node.test, st);
        node.consequent && walkDeeper(node.consequent, st);
        node.alternate && walkDeeper(node.alternate, st);
      },
      MemberExpression: (node: acorn.MemberExpression, st: State, walkDeeper: walk.WalkerCallback<State>) => {
        node.object && walkDeeper(node.object, st);
        node.property && walkDeeper(node.property, st);
      },
    };
  }

  walk.recursive<State>(
    ast as acorn.Node, // Pretend that ast is an acorn node
    { key: globalKey },
    Object.assign(
      {
        ImportDeclaration: (node: acorn.ImportDeclaration, st: State) => {
          const rawImportModuleName = node.source.value;
          if (typeof rawImportModuleName !== "string") {
            console.error("Invalid node when walking ImportDeclaration in parseOnlyCalculateDeps. node:", node);
            return;
          }
          // Skip these modules. They are popular path aliases of NetscriptDefinitions.d.ts.
          if (fileTypeFeature.isTypeScript && (rawImportModuleName === "@nsdefs" || rawImportModuleName === "@ns")) {
            return;
          }
          const importModuleName = getModuleScript(rawImportModuleName, currentModule, otherScripts).filename;
          additionalModules.push(importModuleName);

          // This module's global scope refers to that module's global scope, no matter how we
          // import it.
          const set = dependencyMap[st.key];
          if (set === undefined) throw new Error("set should not be undefined");
          set.add(importModuleName + memCheckGlobalKey);

          for (let i = 0; i < node.specifiers.length; ++i) {
            const spec = node.specifiers[i];
            /**
             * spec can be ImportSpecifier, ImportDefaultSpecifier, or ImportNamespaceSpecifier. "imported" only exists
             * in ImportSpecifier. "imported" can be Identifier or Literal. imported.name only exists in Identifier.
             */
            if (spec.type === "ImportSpecifier" && spec.imported.type === "Identifier" && spec.local !== undefined) {
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
        FunctionDeclaration: (node: acorn.FunctionDeclaration) => {
          if (node.id?.name === "main") {
            checkRamOverride(node.body);
          }
          // node.id will be null when using 'export default'. Add a module name indicating the default export.
          const key = currentModule + "." + (node.id === null ? "__SPECIAL_DEFAULT_EXPORT__" : node.id.name);
          walk.recursive(node, { key: key }, commonVisitors());
        },
        ExportNamedDeclaration: (
          node: acorn.ExportNamedDeclaration,
          st: State,
          walkDeeper: walk.WalkerCallback<State>,
        ) => {
          if (node.declaration != null) {
            // if this is true, the statement is not a named export, but rather a exported function/variable
            walkDeeper(node.declaration, st);
            return;
          }

          for (const specifier of node.specifiers) {
            /**
             * specifier.exported can be Identifier or Literal. specifier.exported.name only exists in Identifier.
             */
            if (specifier.exported.type === "Literal") {
              continue;
            }
            const exportedDepName = currentModule + "." + specifier.exported.name;
            /**
             * We need to use specifier.local.name and node.source.value. Before doing that, we need to check if they
             * exist. local.name only exists in Identifier.
             */
            if (node.source != null && typeof node.source.value === "string" && specifier.local.type === "Identifier") {
              // if this is true, we are re-exporting something
              addRef(exportedDepName, specifier.local.name, node.source.value as ScriptFilePath);
              additionalModules.push(node.source.value as ScriptFilePath);
            } else if (specifier.local.type === "Identifier" && specifier.exported.name !== specifier.local.name) {
              // this makes sure we are not referring to ourselves
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
 * Calculate RAM usage of a script
 *
 * @param input - Code's AST or code of the script
 * @param scriptName - The script's name. Used to resolve relative paths
 * @param server - Servername of the scripts for Error Message
 * @param otherScripts - Other scripts on the server
 * @returns
 */
export function calculateRamUsage(
  input: AST | string,
  scriptName: ScriptFilePath,
  server: ServerName,
  otherScripts: Map<ScriptFilePath, Script>,
): RamCalculation {
  try {
    const fileType = getFileType(scriptName);
    const ast = typeof input === "string" ? parseAST(scriptName, server, input, fileType) : input;
    return parseOnlyRamCalculate(ast, scriptName, server, getFileTypeFeature(fileType), otherScripts);
  } catch (error) {
    return {
      errorCode:
        error instanceof ModuleResolutionError
          ? RamCalculationErrorCode.ImportError
          : RamCalculationErrorCode.SyntaxError,
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }
}
