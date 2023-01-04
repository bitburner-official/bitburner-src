import { getRamCost } from "./RamCostGenerator";
import type { WorkerScript } from "./WorkerScript";
import { helpers } from "./NetscriptHelpers";

/** Permissive type for the documented API functions */
type APIFn = (...args: any[]) => void;
/** Type for the actual wrapped function given to the player */
type WrappedFn = (...args: unknown[]) => unknown;
/** Type for internal, unwrapped ctx function that produces an APIFunction */
type InternalFn<F extends APIFn> = (ctx: NetscriptContext) => ((...args: unknown[]) => ReturnType<F>) & F;

// args, enums, and pid are excluded from the API for typing purposes via the definition of NSFull.
// They do in fact exist on the external API (but are absent on the internal API and ramcost tree)
export type ExternalAPI<API> = {
  [key in keyof API]: API[key] extends APIFn ? WrappedFn : ExternalAPI<API[key]>;
};

export type InternalAPI<API> = {
  [key in keyof API]: API[key] extends APIFn ? InternalFn<API[key]> : InternalAPI<API[key]>;
};

export type NetscriptContext = {
  workerScript: WorkerScript;
  function: string;
  functionPath: string;
};

export function NSProxy<API>(
  ws: WorkerScript,
  ns: InternalAPI<API>,
  tree: string[],
  additionalData?: Record<string, unknown>,
): ExternalAPI<API> {
  const memoed: ExternalAPI<API> = Object.assign({} as ExternalAPI<API>, additionalData ?? {});

  const handler = {
    has(__target: unknown, key: string) {
      return Reflect.has(ns, key);
    },
    ownKeys(__target: unknown) {
      return Reflect.ownKeys(ns);
    },
    getOwnPropertyDescriptor(__target: unknown, key: keyof API & string) {
      if (!Reflect.has(ns, key)) return undefined;
      return { value: this.get(__target, key, this), configurable: true, enumerable: true, writable: false };
    },
    defineProperty(__target: unknown, __key: unknown, __attrs: unknown) {
      throw new TypeError("ns instances are not modifiable!");
    },
    set(__target: unknown, __key: unknown, __attrs: unknown) {
      throw new TypeError("ns instances are not modifiable!");
    },
    get(__target: unknown, key: keyof API & string, __receiver: any) {
      const ours = memoed[key];
      if (ours) return ours;

      const field = ns[key];
      if (!field) return field;

      if (typeof field === "function") {
        const arrayPath = [...tree, key];
        const functionPath = arrayPath.join(".");
        const wrappedFunction = function (...args: unknown[]): unknown {
          const ctx = { workerScript: ws, function: key, functionPath };
          const func = field(ctx); //Allows throwing before ram check, for removedFunction
          helpers.checkEnvFlags(ctx);
          helpers.updateDynamicRam(ctx, getRamCost(...tree, key));
          return func(...args);
        };
        return ((memoed[key] as WrappedFn) = wrappedFunction);
      }
      if (typeof field === "object") {
        // TODO unplanned: Make this work generically
        return ((memoed[key] as ExternalAPI<API[keyof API]>) = NSProxy(ws, field as InternalAPI<API[keyof API]>, [
          ...tree,
          key,
        ]));
      }
      console.warn(`Unexpected data while wrapping API.`, "tree:", tree, "key:", key, "field:", field);
      throw new Error("Error while wrapping netscript API. See console.");
    },
  };

  // We target an empty Object, so that unproxied methods don't do anything.
  // We *can't* freeze the target, because it would break invariants on ownKeys.
  return new Proxy({}, handler) as ExternalAPI<API>;
}

/** Specify when a function was removed from the game, and its replacement function. */
export function removedFunction(version: string, replacement: string, replaceMsg?: boolean) {
  return (ctx: NetscriptContext) => {
    throw helpers.makeRuntimeErrorMsg(
      ctx,
      `Function removed in ${version}. ${replaceMsg ? replacement : `Please use ${replacement} instead.`}`,
      "REMOVED FUNCTION",
    );
  };
}
