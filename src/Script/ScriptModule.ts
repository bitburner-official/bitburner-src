import { NSFull } from "../NetscriptFunctions";
import { AutocompleteData } from "@nsdefs";

export interface ScriptModule {
  main?: (ns: NSFull) => unknown;
  autocomplete?: (data: AutocompleteData, flags: string[]) => unknown;
}
