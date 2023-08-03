import { Myr as IMyrian } from "@nsdefs";
import { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import { helpers } from "../Netscript/NetscriptHelpers";
import { Player as player } from "../Player";
import { myrian } from "../Myrian/Helpers";
import { MyrianActionTypes } from "@enums";
import { MyrianSleeve } from "../Myrian/Myrian";
import { actions } from "../Myrian/actions";

export function NetscriptMyrian(): InternalAPI<IMyrian> {
  return {
    ianAct: (ctx) => (_action, _sleeveId, _x, _y) => {
      const action = helpers.string(ctx, "action", _action);
      const x = helpers.number(ctx, "x", _x);
      const y = helpers.number(ctx, "y", _y);
      const sleeveId = helpers.number(ctx, "sleeveId", _sleeveId);
      if (!player.sleeves[sleeveId]) throw new Error(`No sleeve with index ${sleeveId}`);
      const myrSleeve = myrian.sleeves.find((s) => s.index === sleeveId);
      if (!myrSleeve) throw new Error(`Sleeve ${sleeveId} is not in The Myrian`);
      const f = actions[action];
      if (f) return f(ctx, myrSleeve, x, y);
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
      return myrian.getTile(x, y);
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
