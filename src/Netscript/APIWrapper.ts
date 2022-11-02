import { getRamCost } from "./RamCostGenerator";
import type { WorkerScript } from "./WorkerScript";
import { helpers } from "./NetscriptHelpers";
import { ScriptArg } from "./ScriptArg";
import { NSFull } from "src/NetscriptFunctions";
import { cloneDeep } from "lodash";

type ExternalFunction = (...args: any[]) => void;

export type ExternalAPILayer = {
  [key: string]: ExternalAPILayer | ExternalFunction | ScriptArg[] | Record<string, Record<string, string>>;
};

// TODO: figure out how to include real type safety in wrapper
export type BasicObject = Record<string, any>;

type InternalFunction<F extends ExternalFunction> = (
  ctx: NetscriptContext,
) => ((...args: unknown[]) => ReturnType<F>) & F;

export type InternalAPI<API> = {
  [Property in keyof API]: API[Property] extends ExternalFunction
    ? InternalFunction<API[Property]>
    : API[Property] extends Record<string, Record<string, string>> | ScriptArg[] // Don't wrap enums or args
    ? API[Property]
    : API[Property] extends object
    ? InternalAPI<API[Property]>
    : never;
};

export type NetscriptContext = {
  workerScript: WorkerScript;
  function: string;
  functionPath: string;
};

function wrapFunction(
  externalLayer: ExternalAPILayer,
  workerScript: WorkerScript,
  func: (_ctx: NetscriptContext) => (...args: unknown[]) => unknown,
  tree: string[],
  key: string,
): void {
  const arrayPath = [...tree, key];
  const functionPath = arrayPath.join(".");
  const ctx = {
    workerScript,
    function: key,
    functionPath,
  };
  function wrappedFunction(...args: unknown[]): unknown {
    helpers.checkEnvFlags(ctx);
    helpers.updateDynamicRam(ctx, getRamCost(...tree, key));
    return func(ctx)(...args);
  }
  externalLayer[key] = wrappedFunction;
}

export function wrapAPI(workerScript: WorkerScript, internalAPI: BasicObject, args: ScriptArg[]): NSFull {
  const wrappedAPI = wrapAPILayer({ args }, workerScript, internalAPI);
  return wrappedAPI as unknown as NSFull;
}

export function wrapAPILayer(
  externalLayer: ExternalAPILayer,
  workerScript: WorkerScript,
  internalLayer: BasicObject,
  tree: string[] = [],
): ExternalAPILayer {
  for (const [key, value] of Object.entries(internalLayer)) {
    if (typeof value === "function") {
      wrapFunction(externalLayer, workerScript, value, tree, key);
    } else if (Array.isArray(value)) {
      continue; // We already added args in wrapAPI
    } else if (key === "enums") {
      externalLayer[key] = cloneDeep(internalLayer[key]);
    } else if (typeof value === "object") {
      wrapAPILayer((externalLayer[key] = {} as ExternalAPILayer), workerScript, value, [...tree, key]);
    } else {
      console.warn(`Unexpected data while wrapping API.`, "tree:", tree, "key:", key, "value:", value);
      throw new Error("Error while wrapping netscript API. See console.");
    }
  }
  return externalLayer;
}
