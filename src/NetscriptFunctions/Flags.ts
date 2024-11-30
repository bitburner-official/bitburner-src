import type { ScriptArg } from "@nsdefs";
import { toNative } from "./toNative";
import libarg from "arg";
import { NetscriptContext } from "../Netscript/APIWrapper";

export type Schema = [string, string | number | boolean | string[]][];
type FlagType = StringConstructor | NumberConstructor | BooleanConstructor | StringConstructor[];
type FlagsRet = Record<string, ScriptArg | string[]>;
export function Flags(ctx: NetscriptContext | string[]): (data: unknown) => FlagsRet {
  const vargs = Array.isArray(ctx) ? ctx : ctx.workerScript.args;
  return (schema: unknown): FlagsRet => {
    schema = toNative(schema);
    if (!Array.isArray(schema)) throw new Error("flags schema passed in is invalid.");
    const args: Record<string, FlagType> = {};

    for (const d of schema as Schema) {
      let t: FlagType = String;
      if (typeof d[1] === "number") {
        t = Number;
      } else if (typeof d[1] === "boolean") {
        t = Boolean;
      } else if (Array.isArray(d[1])) {
        t = [String];
      }
      const numDashes = d[0].length > 1 ? 2 : 1;
      args["-".repeat(numDashes) + d[0]] = t;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
    const ret: FlagsRet = libarg(args, { argv: vargs });
    for (const d of schema as Schema) {
      if (!Object.hasOwn(ret, "--" + d[0]) || !Object.hasOwn(ret, "-" + d[0])) ret[d[0]] = d[1];
    }
    for (const key of Object.keys(ret)) {
      if (!key.startsWith("-")) continue;
      const value = ret[key];
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete ret[key];
      const numDashes = key.length === 2 ? 1 : 2;
      ret[key.slice(numDashes)] = value;
    }
    return ret;
  };
}
