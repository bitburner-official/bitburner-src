
import { Myr as IMyrian } from "@nsdefs";
import { InternalAPI } from "src/Netscript/APIWrapper";
import { helpers } from "../Netscript/NetscriptHelpers";
import { Player as player } from "../Player";
import { SleeveMyrianWork } from "../PersonObjects/Sleeve/Work/SleeveMyrianWork";

export function NetscriptMyrian(): InternalAPI<IMyrian> {
    return {
        ianInteract:
            (ctx) =>
                (sleeveId, x, y) => { throw new Error("Unimplemented"); },
        ianMove:
            (ctx) =>
                (sleeveId, x, y) => { throw new Error("Unimplemented"); },
        ianGetTask:
            (ctx) =>
                (sleeveId) => { throw new Error("Unimplemented"); },
        ianCancelTask:
            (ctx) =>
                (sleeveId) => { throw new Error("Unimplemented"); },
        ianEnter:
            (ctx) =>
                (sleeveId?) => {
                    const id = sleeveId === undefined ? undefined : helpers.number(ctx, "sleeveId", sleeveId);
                    if (id === undefined) return false; // skip player handling for now.
                    // handle sleeve entering the myrian.
                    player.sleeves[id].startWork(new SleeveMyrianWork());
                    return true;
                },
        ianLeave:
            (ctx) =>
                (sleeveId?) => { throw new Error("Unimplemented"); },
        ianBuild:
            (ctx) =>
                (sleeveId, buildingId, x, y) => { throw new Error("Unimplemented"); },
        ianApplyPowerup:
            (ctx) =>
                (sleeveId, stat) => { throw new Error("Unimplemented"); },
    }
}