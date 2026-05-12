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

function unwrapExpressionForMemberPath(node: acorn.Expression | acorn.Super): acorn.Expression | acorn.Super {
  let n: acorn.Node = node as acorn.Node;
  for (;;) {
    if (n.type === "ParenthesizedExpression") {
      n = (n as acorn.ParenthesizedExpression).expression as acorn.Node;
      continue;
    }
    if (n.type === "ChainExpression") {
      n = (n as acorn.ChainExpression).expression as acorn.Node;
      continue;
    }
    return n as acorn.Expression | acorn.Super;
  }
}

/**
 * Collects a.b.c from a non-computed member chain whose root is a simple Identifier,
 * ThisExpression, or Super. Returns null for dynamic roots (e.g. call results) or
 * computed access we can't statically resolve.
 */
function collectStaticMemberExpressionPath(node: acorn.MemberExpression): string[] | null {
  const parts: string[] = [];
  let current: acorn.MemberExpression = node;
  for (;;) {
    if (current.computed) {
      return null;
    }
    const prop = current.property;
    // PrivateIdentifier (e.g. `obj.#name`) is treated as a static name. Identifier is the common case.
    if (prop.type === "Identifier") {
      parts.unshift(prop.name);
    } else if (prop.type === "PrivateIdentifier") {
      parts.unshift("#" + prop.name);
    } else {
      return null;
    }
    const obj = unwrapExpressionForMemberPath(current.object as acorn.Expression);
    if (obj.type === "Identifier") {
      parts.unshift(obj.name);
      return parts;
    }
    if (obj.type === "ThisExpression") {
      parts.unshift("this");
      return parts;
    }
    if (obj.type === "Super") {
      parts.unshift("super");
      return parts;
    }
    if (obj.type === "MemberExpression") {
      current = obj;
      continue;
    }
    return null;
  }
}

/**
 * Maps a static access path to candidate RamCosts ref strings. RamCosts has no top-level
 * `ns` wrapper, so we strip a leading `ns` (and any receiver marker) before joining.
 *
 * The leaf is returned as a separate candidate only when `allowLeafFallback` is true. The
 * caller decides eligibility based on scope: typically true when the chain root is
 * `this`/`super` or a parameter visible in the current lexical scope (and not shadowed by
 * a local declaration). See `rootIsVisibleParam` and the MemberExpression visitor.
 *
 * Without the leaf fallback, identifiers like `readback.weaken` (issue #298) or
 * `test.run()` (issue #1894) are NOT attributed NS RAM. Dynamic roots like
 * `someCall().hack` never produce a path here at all, which fixes issue #875.
 *
 * The strict bare-lookup in `lookupRamCost` (top-level only) further ensures the leaf
 * candidate cannot pick up nested API names (e.g. `obj.codingcontract.attempt` won't
 * resolve to `codingcontract.attempt` via the bare leaf "attempt").
 */
function ramCostRefsFromStaticPath(path: string[], allowLeafFallback: boolean): string[] {
  let segments = path;
  if (segments[0] === "this" || segments[0] === "super") {
    segments = segments.slice(1);
  }
  if (segments[0] === "ns") {
    segments = segments.slice(1);
  }
  if (segments.length === 0) {
    return [];
  }
  const refs: string[] = [segments.join(".")];
  if (allowLeafFallback && segments.length > 1) {
    refs.push(segments[segments.length - 1]);
  }
  return refs;
}

/**
 * A lexical scope frame used to decide whether an identifier root in a static member
 * chain (e.g. the `X` in `X.hack`) is actually a function parameter visible at that
 * point — and thus a plausible alias for `ns`, eligible for a bare-leaf RamCosts
 * fallback — or is shadowed by a local declaration in the same scope.
 */
interface ScopeFrame {
  /** Identifier names bound as parameters when entering this function. */
  params: Set<string>;
  /** Identifier names declared in this scope (var/let/const, function decls, class decls, imports). */
  locals: Set<string>;
}

/** Collects every binding name introduced by a destructuring / param / catch pattern. */
function collectPatternNames(p: acorn.Pattern | null | undefined, out: Set<string>): void {
  if (!p) return;
  switch (p.type) {
    case "Identifier":
      out.add(p.name);
      return;
    case "AssignmentPattern":
      collectPatternNames(p.left, out);
      return;
    case "RestElement":
      collectPatternNames(p.argument, out);
      return;
    case "ObjectPattern":
      for (const prop of p.properties) {
        if (prop.type === "RestElement") {
          collectPatternNames(prop.argument, out);
        } else {
          collectPatternNames(prop.value, out);
        }
      }
      return;
    case "ArrayPattern":
      for (const elem of p.elements) {
        if (elem != null) collectPatternNames(elem, out);
      }
      return;
  }
}

/**
 * Scans `node` (a function body or program) for declarations that introduce names into the
 * same scope as the enclosing function's params. Does NOT descend into nested function
 * bodies — those open new scopes — but does descend through blocks, conditionals, loops,
 * try/catch, switch, labels, and export declarations.
 *
 * `var`/`let`/`const` are treated uniformly as function-scoped. This is a mild
 * over-approximation for block-scoped `let`/`const`, but the only consequence is that a
 * block-scoped local can still shadow an outer parameter — which matches the pessimistic
 * intent of the static RAM pass.
 */
function visitForLocals(node: acorn.Node | null | undefined, out: Set<string>): void {
  if (!node) return;
  switch (node.type) {
    case "Program":
      for (const stmt of (node as acorn.Program).body) visitForLocals(stmt, out);
      return;
    case "BlockStatement":
      for (const stmt of (node as acorn.BlockStatement).body) visitForLocals(stmt, out);
      return;
    case "VariableDeclaration":
      for (const decl of (node as acorn.VariableDeclaration).declarations) {
        collectPatternNames(decl.id, out);
      }
      return;
    case "FunctionDeclaration": {
      const id = (node as acorn.FunctionDeclaration).id;
      if (id) out.add(id.name);
      return;
    }
    case "ClassDeclaration": {
      const id = (node as acorn.ClassDeclaration).id;
      if (id) out.add(id.name);
      return;
    }
    case "ImportDeclaration":
      for (const spec of (node as acorn.ImportDeclaration).specifiers) {
        if (spec.local?.type === "Identifier") out.add(spec.local.name);
      }
      return;
    case "ExportNamedDeclaration": {
      const decl = (node as acorn.ExportNamedDeclaration).declaration;
      if (decl) visitForLocals(decl, out);
      return;
    }
    case "ExportDefaultDeclaration": {
      const decl = (node as acorn.ExportDefaultDeclaration).declaration;
      if (decl) visitForLocals(decl as acorn.Node, out);
      return;
    }
    case "IfStatement": {
      const n = node as acorn.IfStatement;
      visitForLocals(n.consequent, out);
      if (n.alternate) visitForLocals(n.alternate, out);
      return;
    }
    case "ForStatement": {
      const n = node as acorn.ForStatement;
      if (n.init && n.init.type === "VariableDeclaration") {
        for (const decl of n.init.declarations) collectPatternNames(decl.id, out);
      }
      visitForLocals(n.body, out);
      return;
    }
    case "ForInStatement":
    case "ForOfStatement": {
      const n = node as acorn.ForInStatement | acorn.ForOfStatement;
      if (n.left && n.left.type === "VariableDeclaration") {
        for (const decl of n.left.declarations) collectPatternNames(decl.id, out);
      }
      visitForLocals(n.body, out);
      return;
    }
    case "WhileStatement":
    case "DoWhileStatement":
      visitForLocals((node as acorn.WhileStatement).body, out);
      return;
    case "SwitchStatement":
      for (const c of (node as acorn.SwitchStatement).cases) {
        for (const stmt of c.consequent) visitForLocals(stmt, out);
      }
      return;
    case "TryStatement": {
      const n = node as acorn.TryStatement;
      visitForLocals(n.block, out);
      if (n.handler) {
        if (n.handler.param) collectPatternNames(n.handler.param, out);
        visitForLocals(n.handler.body, out);
      }
      if (n.finalizer) visitForLocals(n.finalizer, out);
      return;
    }
    case "LabeledStatement":
      visitForLocals((node as acorn.LabeledStatement).body, out);
      return;
  }
}

/** Builds a ScopeFrame for a function (or the module top-level). */
function buildScopeFrame(params: acorn.Pattern[], body: acorn.Node | null | undefined): ScopeFrame {
  const ps = new Set<string>();
  for (const p of params) collectPatternNames(p, ps);
  const locals = new Set<string>();
  visitForLocals(body, locals);
  return { params: ps, locals };
}

/**
 * Looks up `name` against the active scope chain. Walks innermost to outermost. The first
 * frame that declares `name` as a local shadows any outer params. Otherwise, the first
 * frame that lists `name` as a parameter signals an `ns`-alias-eligible identifier.
 */
function rootIsVisibleParam(name: string, scopes: ScopeFrame[]): boolean {
  for (let i = scopes.length - 1; i >= 0; i--) {
    if (scopes[i].locals.has(name)) return false;
    if (scopes[i].params.has(name)) return true;
  }
  return false;
}

/**
 * Resolves a dependency string against RamCosts. Dotted refs use strict path traversal; bare refs
 * only match top-level leaves so locals (e.g. `attempt`) do not pick up nested API keys (`codingcontract.attempt`).
 */
function lookupRamCost(ref: string): { func: (() => number) | number; refDetail: string } | undefined {
  if (!ref) {
    return undefined;
  }
  const costs = RamCosts as Record<string, unknown>;
  if (ref.includes(".")) {
    const segments = ref.split(".");
    let cur: unknown = costs;
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (seg === undefined || cur === null || typeof cur !== "object") {
        return undefined;
      }
      const next = (cur as Record<string, unknown>)[seg];
      if (i === segments.length - 1) {
        if (typeof next === "number" || typeof next === "function") {
          return { func: next as (() => number) | number, refDetail: ref };
        }
        return undefined;
      }
      cur = next;
    }
    return undefined;
  }
  const leaf = costs[ref];
  if (typeof leaf === "number" || typeof leaf === "function") {
    return { func: leaf as (() => number) | number, refDetail: ref };
  }
  return undefined;
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

      const details = lookupRamCost(ref);
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

  // The module's top-level scope frame. Its `params` is empty (the module is not a function);
  // its `locals` holds every top-level binding (var/let/const, function/class decl, imports).
  // The MemberExpression visitor walks the scope stack innermost-to-outermost to decide
  // whether a static chain like `X.hack` should get a bare-leaf RamCosts fallback. Locals
  // shadow outer params; this lets `var readback` in `main` shadow an unrelated `decode(readback)`
  // parameter elsewhere in the module (issue #298), without losing the renamed-`ns` behavior.
  const moduleFrame: ScopeFrame = { params: new Set(), locals: new Set() };
  visitForLocals(ast as acorn.Node, moduleFrame.locals);

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
    /** Active lexical scope chain, innermost frame last. */
    scopes: ScopeFrame[];
  }

  /**
   * Enters a function scope for the duration of `run`. Pushes a new frame computed from
   * `params` and `body`, then pops it. The scope chain is shared by reference through
   * State, so callers don't need to thread a fresh state object through.
   */
  function withFunctionScope(
    params: acorn.Pattern[],
    body: acorn.Node | null | undefined,
    st: State,
    run: () => void,
  ): void {
    const frame = buildScopeFrame(params, body);
    st.scopes.push(frame);
    try {
      run();
    } finally {
      st.scopes.pop();
    }
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
        const path = collectStaticMemberExpressionPath(node);
        if (path !== null && path.length >= 2) {
          const root = path[0];
          const allowLeafFallback = root === "this" || root === "super" || rootIsVisibleParam(root, st.scopes);
          for (const ref of ramCostRefsFromStaticPath(path, allowLeafFallback)) {
            addRef(st.key, ref);
          }
        }
        node.object && walkDeeper(node.object, st);
        // Only descend into the property for computed access (e.g. obj[expr]),
        // where the property expression can contain real identifier references.
        // A non-computed property name is just a static key (e.g. the `hack` in
        // `someCall().hack`) and must not be treated as an identifier reference
        // into RamCosts. Static API references are captured via the path collection above.
        if (node.computed && node.property) {
          walkDeeper(node.property, st);
        }
      },
      // Function-scope entry visitors. We push a ScopeFrame so nested member expressions
      // resolve identifier roots against the correct lexical scope. The walker still
      // descends into nested-function bodies and attributes their refs to the same
      // outer state.key (matching the existing pessimistic "outermost function" model).
      FunctionDeclaration: (
        node: acorn.FunctionDeclaration | acorn.AnonymousFunctionDeclaration,
        st: State,
        walkDeeper: walk.WalkerCallback<State>,
      ) => {
        withFunctionScope(node.params, node.body, st, () => {
          if (node.body) walkDeeper(node.body, st);
        });
      },
      FunctionExpression: (node: acorn.FunctionExpression, st: State, walkDeeper: walk.WalkerCallback<State>) => {
        withFunctionScope(node.params, node.body, st, () => {
          if (node.body) walkDeeper(node.body, st);
        });
      },
      ArrowFunctionExpression: (
        node: acorn.ArrowFunctionExpression,
        st: State,
        walkDeeper: walk.WalkerCallback<State>,
      ) => {
        withFunctionScope(node.params, node.body, st, () => {
          if (node.body) walkDeeper(node.body, st);
        });
      },
    };
  }

  walk.recursive<State>(
    ast as acorn.Node, // Pretend that ast is an acorn node
    { key: globalKey, scopes: [moduleFrame] },
    // commonVisitors first so the top-level handlers (FunctionDeclaration, etc.) below
    // override them at the outermost walk. The top-level FunctionDeclaration handler is
    // responsible for `checkRamOverride` and for opening a new dep-map key per function;
    // it then dispatches into commonVisitors for the body, where the scope-pushing
    // function visitors (FunctionExpression / ArrowFunctionExpression / nested
    // FunctionDeclaration) take over.
    Object.assign(commonVisitors(), {
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
        // Seed the scope chain with the module frame and this function's own frame. We walk
        // the body directly so the commonVisitors FunctionDeclaration handler doesn't fire
        // on this same node and double-push the frame.
        const ownFrame = buildScopeFrame(node.params, node.body);
        walk.recursive(node.body, { key, scopes: [moduleFrame, ownFrame] }, commonVisitors());
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
    }),
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
