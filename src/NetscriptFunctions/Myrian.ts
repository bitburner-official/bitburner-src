import { Myr as IMyrian } from "@nsdefs";
import { InternalAPI } from "src/Netscript/APIWrapper";
import { helpers } from "../Netscript/NetscriptHelpers";
import { Player as player } from "../Player";
import { myrian } from "../Myrian/Helpers";

export function NetscriptMyrian(): InternalAPI<IMyrian> {
  return {
    ianUse: (ctx) => (_sleeveId, _x, _y) => {
      throw new Error("Unimplemented");
    },
    ianMove: (ctx) => async (_sleeveId, _x, _y) => {
      const id = helpers.number(ctx, "sleeveId", _sleeveId);
      const x = helpers.number(ctx, "x", _x);
      const y = helpers.number(ctx, "y", _y);
      if (!player.sleeves[id]) throw new Error(`No sleeve with index ${id}`);
      const myrSleeve = myrian.sleeves.find((s) => s.index === id);
      if (!myrSleeve) return Promise.resolve();
      const dist = Math.abs(myrSleeve.x - x) + Math.abs(myrSleeve.y - y);
      if (dist > 1) return Promise.resolve();
      return helpers.netscriptDelay(ctx, 1000).then(function () {
        myrSleeve.x = x;
        myrSleeve.y = y;
        return Promise.resolve();
      });
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
    ianDeploy: (ctx) => (_sleeveId, _deploymentId, _x, _y) => {
      throw new Error("Unimplemented");
    },
    ianApplyPowerup: (ctx) => (_sleeveId, _stat) => {
      throw new Error("Unimplemented");
    },
  };
}
