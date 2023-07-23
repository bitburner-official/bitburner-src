import { Myr as IMyrian } from "@nsdefs";
import { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import { helpers } from "../Netscript/NetscriptHelpers";
import { Player as player } from "../Player";
import { myrian } from "../Myrian/Helpers";
import { MyrianActions } from "@enums";

const move = (ctx: NetscriptContext, id: number, x: number, y: number) => {
  if (!player.sleeves[id]) throw new Error(`No sleeve with index ${id}`);
  const myrSleeve = myrian.sleeves.find((s) => s.index === id);
  if (!myrSleeve) throw new Error("Invalid move");
  const dist = Math.abs(myrSleeve.x - x) + Math.abs(myrSleeve.y - y);
  if (dist > 1) throw new Error("Invalid move");
  return helpers.netscriptDelay(ctx, 100).then(function () {
    myrSleeve.x = x;
    myrSleeve.y = y;
    return Promise.resolve();
  });
};

export function NetscriptMyrian(): InternalAPI<IMyrian> {
  return {
    ianAct: (ctx) => (_action, _sleeveId, _x, _y) => {
      const action = helpers.string(ctx, "action", _action);
      const x = helpers.number(ctx, "x", _x);
      const y = helpers.number(ctx, "y", _y);
      const sleeveId = helpers.number(ctx, "sleeveId", _sleeveId);
      switch (action) {
        case MyrianActions.MOVE:
          return move(ctx, sleeveId, x, y);
      }
      return Promise.reject("Invalid action");
    },

    ianWorldSize: (ctx) => () => {
      return [myrian.world.length, myrian.world[0].length];
    },

    ianGetSleeve: (ctx) => (_sleeveId) => {
      const sleeveId = helpers.number(ctx, "sleeveId", _sleeveId);
      const sl = myrian.sleeves.find((s) => s.index === sleeveId);
      if (!sl) {
        return { inside: false, x: 0, y: 0 };
      }
      return { inside: true, x: sl.x, y: sl.y };
    },

    ianGetTile: (ctx) => (_x, _y) => {
      const x = helpers.number(ctx, "x", _x);
      const y = helpers.number(ctx, "y", _y);
      return {
        Content: myrian.world[y][x],
      };
    },
    ianGetTask: (ctx) => (_sleeveId) => {
      throw new Error("Unimplemented");
    },
    ianCancelTask: (ctx) => (_sleeveId) => {
      throw new Error("Unimplemented");
    },
    ianEnter: (ctx) => (sleeveId?) => {
      const id = sleeveId === undefined ? undefined : helpers.number(ctx, "sleeveId", sleeveId);
      if (id === undefined) return false; // skip player handling for now.
      // handle sleeve entering the myrian.
      if (!player.sleeves[id]) throw new Error(`No sleeve with index ${id}`);
      myrian.joinSleeve(id);
      return true;
    },
    ianLeave: (ctx) => (_sleeveId?) => {
      throw new Error("Unimplemented");
    },
    ianApplyPowerup: (ctx) => (_sleeveId, _stat) => {
      throw new Error("Unimplemented");
    },
  };
}
