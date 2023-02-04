import { getRamCost } from "./RamCostGenerator";
import type { WorkerScript } from "./WorkerScript";
import { helpers } from "./NetscriptHelpers";

/** Permissive type for the documented API functions */
type APIFn = (...args: any[]) => unknown;
/** Type for internal, unwrapped ctx function that produces an APIFunction */
type InternalFn<F extends APIFn> = (ctx: NetscriptContext) => ((...args: unknown[]) => ReturnType<F>) & F;
/** Type constraint for an API layer. They must all fit this "shape". */
type GenericAPI<T> = { [key in keyof T]: APIFn | GenericAPI<T[key]> };

// args, enums, and pid are excluded from the API for typing purposes via the definition of NSFull.
// They do in fact exist on the external API (but are absent on the internal API and ramcost tree)
export type InternalAPI<API> = {
  [key in keyof API]: API[key] extends APIFn ? InternalFn<API[key]> : InternalAPI<API[key]>;
};

export type NetscriptContext = {
  workerScript: WorkerScript;
  function: string;
  functionPath: string;
};

class NSProxyHandler<API extends GenericAPI<API>> {
  ns: API;
  ws: WorkerScript;
  tree: string[];
  additionalData: Record<string, unknown>;
  memoed: API = {} as API;

  constructor(ws: WorkerScript, ns: API, tree: string[], additionalData: Record<string, unknown>) {
    this.ns = ns;
    this.ws = ws;
    this.tree = tree;
    this.additionalData = additionalData;
    Object.assign(this.memoed, additionalData);
  }

  has(__target: unknown, key: string): boolean {
    return Reflect.has(this.ns, key) || Reflect.has(this.additionalData, key);
  }

  ownKeys(__target: unknown): (string | symbol)[] {
    return [...Reflect.ownKeys(this.ns), ...Reflect.ownKeys(this.additionalData)];
  }

  getOwnPropertyDescriptor(__target: unknown, key: keyof API & string): PropertyDescriptor | undefined {
    if (!this.has(__target, key)) return undefined;
    return { value: this.get(__target, key, this), configurable: true, enumerable: true, writable: false };
  }

  defineProperty(__target: unknown, __key: unknown, __attrs: unknown): boolean {
    throw new TypeError("ns instances are not modifiable!");
  }

  set(__target: unknown, __key: unknown, __attrs: unknown): boolean {
    // Redundant with defineProperty, but we'll be explicit
    throw new TypeError("ns instances are not modifiable!");
  }

  get(__target: unknown, key: keyof API & string, __receiver: any) {
    const ours = this.memoed[key];
    if (ours) return ours;

    const field = this.ns[key];
    if (!field) return field;

    if (typeof field === "function") {
      const arrayPath = [...this.tree, key];
      const functionPath = arrayPath.join(".");
      const ctx = { workerScript: this.ws, function: key, functionPath };
      // Only do the context-binding once, instead of each time the function
      // is called.
      const func: any = field(ctx);
      const wrappedFunction = function (...args: unknown[]): unknown {
        // What remains *must* be called every time.
        helpers.checkEnvFlags(ctx);
        helpers.updateDynamicRam(ctx, getRamCost(...arrayPath));
        return func(...args);
      };
      return ((this.memoed[key] as APIFn) = wrappedFunction);
    }
    if (typeof field === "object") {
      return ((this.memoed[key] as GenericAPI<API[keyof API]>) = NSProxy(
        this.ws,
        field as InternalAPI<GenericAPI<API[keyof API]>>,
        [...this.tree, key],
      ));
    }
    console.warn(`Unexpected data while wrapping API.`, "tree:", this.tree, "key:", key, "field:", field);
    throw new Error("Error while wrapping netscript API. See console.");
  }
}

export function NSProxy<API extends GenericAPI<API>>(
  ws: WorkerScript,
  ns: InternalAPI<API>,
  tree: string[],
  additionalData: Record<string, unknown> = {},
): API {
  const handler = new NSProxyHandler(ws, ns, tree, additionalData);
  // We target an empty Object, so that unproxied methods don't do anything.
  // We *can't* freeze the target, because it would break invariants on ownKeys.
  return new Proxy({}, handler) as API;
}

/** Specify when a function was removed from the game, and its replacement function. */
export function removedFunction(version: string, replacement: string, replaceMsg?: boolean) {
  return (ctx: NetscriptContext) => () => {
    throw helpers.makeRuntimeErrorMsg(
      ctx,
      `Function removed in ${version}. ${replaceMsg ? replacement : `Please use ${replacement} instead.`}`,
      "REMOVED FUNCTION",
    );
  };
}
