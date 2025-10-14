import { exampleDarknetServerData } from "../DarkNet/Enums";
import type { DarknetServerData } from "@nsdefs";
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

/**
 * This function should be used to assert strings provided by the player. It uses a specialized utility function that
 * provides a stack trace pointing to the player's invalid caller.
 */
export function assertStringWithNSContext(ctx: NetscriptContext, argName: string, v: unknown): asserts v is string {
  if (typeof v !== "string") throw errorMessage(ctx, `${argName} expected to be a string. ${debugType(v)}`, "TYPE");
}

export function assertFunctionWithNSContext(
  ctx: NetscriptContext,
  argName: string,
  v: unknown,
): asserts v is () => void {
  if (typeof v !== "function") throw errorMessage(ctx, `${argName} expected to be a function ${debugType(v)}`, "TYPE");
}

export function missingKey(expect: object, actual: unknown): string | false {
  if (typeof actual !== "object" || actual === null) {
    return `Expected to be an object, was ${actual === null ? "null" : typeof actual}.`;
  }
  for (const key in expect) {
    if (!(key in actual)) return `Property ${key} was expected but not present.`;
  }
  return false;
}

export function assertDarknetServerData(ctx: NetscriptContext, data: unknown): asserts data is DarknetServerData {
  const error = missingKey(exampleDarknetServerData, data);
  if (error) {
    throw errorMessage(ctx, `Invalid darknet server data.\n${error}`, "TYPE");
  }
}
