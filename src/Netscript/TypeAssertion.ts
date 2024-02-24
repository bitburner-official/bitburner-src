import type { NetscriptContext } from "./APIWrapper";
import { errorMessage } from "./ErrorMessages";

const userFriendlyString = (v: unknown): string => {
  const clip = (s: string): string => {
    if (s.length > 15) return s.slice(0, 12) + "...";
    return s;
  };
  if (typeof v === "number") return String(v);
  if (typeof v === "string") {
    if (v === "") return "empty string";
    return `'${clip(v)}'`;
  }
  const json = JSON.stringify(v);
  if (!json) return "???";
  return `'${clip(json)}'`;
};

export const debugType = (v: unknown): string => {
  if (v === null) return `Is null.`;
  if (v === undefined) return "Is undefined.";
  if (typeof v === "function") return "Is a function.";
  return `Is of type '${typeof v}', value: ${userFriendlyString(v)}`;
};

export function assertString(ctx: NetscriptContext, argName: string, v: unknown): asserts v is string {
  if (typeof v !== "string") throw errorMessage(ctx, `${argName} expected to be a string. ${debugType(v)}`, "TYPE");
}
