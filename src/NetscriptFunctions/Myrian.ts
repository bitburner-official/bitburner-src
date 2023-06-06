
import { Myr as IMyrian } from "@nsdefs";
import { InternalAPI } from "src/Netscript/APIWrapper";

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
                (sleeveId?) => { throw new Error("Unimplemented"); },
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