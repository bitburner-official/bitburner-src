import { helpers } from "../Netscript/NetscriptHelpers";
import { NetscriptContext } from "../Netscript/APIWrapper";
import { myrian } from "./Helpers";
import { MyrianSleeve } from "./Myrian";

const move = async (ctx: NetscriptContext, sleeve: MyrianSleeve, x: number, y: number) => {
  const dist = Math.abs(sleeve.x - x) + Math.abs(sleeve.y - y);
  if (dist > 1) throw new Error("Invalid move");
  if (myrian.world[y][x] !== " ") throw new Error("Invalid move");
  return helpers.netscriptDelay(ctx, 100).then(() => {
    sleeve.x = x;
    sleeve.y = y;
    return Promise.resolve();
  });
};

const drain = async (ctx: NetscriptContext, sleeve: MyrianSleeve, x: number, y: number) => {
  return helpers.netscriptDelay(ctx, 100).then(() => {
    return Promise.resolve();
  });
};

export const actions: Record<
  string,
  (ctx: NetscriptContext, sleeve: MyrianSleeve, x: number, y: number) => Promise<void>
> = {
  move: move,
  drain: drain,
};
