import { helpers } from "../Netscript/NetscriptHelpers";
import { NetscriptContext } from "../Netscript/APIWrapper";
import { myrian } from "./Helpers";
import { MyrianSleeve } from "./Myrian";
import { MyrianActionTypes } from "./Enums";

const move = async (ctx: NetscriptContext, sleeve: MyrianSleeve, x: number, y: number) => {
  const dist = Math.abs(sleeve.x - x) + Math.abs(sleeve.y - y);
  if (dist > 1) throw new Error(`Invalid move, target must be 1 tile away, is ${dist}`);
  const tile = myrian.world[y][x];
  if (tile !== " ") throw new Error(`Invalid move, cannot enter tile [${x}, ${y}] because the content is ${tile}`);
  return helpers.netscriptDelay(ctx, 100).then(() => {
    sleeve.x = x;
    sleeve.y = y;
    return Promise.resolve();
  });
};

const drain = async (ctx: NetscriptContext, sleeve: MyrianSleeve, x: number, y: number) => {
  const tile = myrian.world[y][x];
  if (tile !== "b") throw new Error(`Invalid tile. Must be 'b' but is ${tile}`);
  return helpers.netscriptDelay(ctx, 100).then(() => {
    myrian.world[y][x] = "d";
    return Promise.resolve();
  });
};

export const actions: Record<
  string,
  (ctx: NetscriptContext, sleeve: MyrianSleeve, x: number, y: number) => Promise<void>
> = {
  [MyrianActionTypes.MOVE]: move,
  [MyrianActionTypes.DRAIN]: drain,
};
