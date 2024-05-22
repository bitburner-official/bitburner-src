import type { ScriptArg } from "@nsdefs";

//This was previously in INetscriptHelper.ts, may move to its own file or a generic types file.
export type ScriptIdentifier =
  | number
  | {
      scriptname: string;
      hostname: string;
      args: ScriptArg[];
    };
