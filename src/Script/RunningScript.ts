/**
 * Class representing a Script instance that is actively running.
 * A Script can have multiple active instances
 */
import type React from "react";
import { Script } from "./Script";
import { ScriptURL } from "./LoadedModule";
import { Settings } from "../Settings/Settings";
import { Terminal } from "../Terminal";

import { Generic_fromJSON, Generic_toJSON, IReviverValue, constructorsForReviver } from "../utils/JSONReviver";
import { formatTime } from "../utils/helpers/formatTime";
import { ScriptArg } from "@nsdefs";
import { RamCostConstants } from "../Netscript/RamCostGenerator";
import { PositiveInteger } from "../types";
import { getKeyList } from "../utils/helpers/getKeyList";
import { ScriptFilePath } from "../Paths/ScriptFilePath";

import type { LogBoxProperties } from "../ui/React/LogBoxManager";

export class RunningScript {
  // Script arguments
  args: ScriptArg[] = [];

  // Map of [key: hostname] -> Hacking data. Used for offline progress calculations.
  // Hacking data format: [MoneyStolen, NumTimesHacked, NumTimesGrown, NumTimesWeaken]
  dataMap: Map<string, number[]> = new Map();

  // Script filename
  filename = "default.js" as ScriptFilePath;

  // This script's logs. An array of log entries
  logs: React.ReactNode[] = [];

  // Flag indicating whether the logs have been updated since
  // the last time the UI was updated
  logUpd = false;

  // Total amount of hacking experience earned from this script when offline
  offlineExpGained = 0;

  // Total amount of money made by this script when offline
  offlineMoneyMade = 0;

  // Number of seconds that the script has been running offline
  offlineRunningTime = 0.01;

  // Total amount of hacking experience earned from this script when online
  onlineExpGained = 0;

  // Total amount of money made by this script when online
  onlineMoneyMade = 0;

  // Number of seconds that this script has been running online
  onlineRunningTime = 0.01;

  // Process ID. Must be an integer and equals the PID of corresponding WorkerScript
  pid = -1;

  // Process ID of the parent process. 0 indicates no parent (such as run from terminal).
  parent = 0;

  // How much RAM this script uses for ONE thread
  ramUsage: number = RamCostConstants.Base;

  // hostname of the server on which this script is running
  server = "";

  // Access to properties of the tail window. Can be used to get/set size, position, etc.
  tailProps = null as LogBoxProperties | null;

  // Backing store for the title. Null means "use the default", generated lazily by the
  // title getter so we don't store a title for every script up-front. A React element
  // title (only set by the user) is not persisted, and is restored to default on load.
  title_ = null as string | React.ReactElement | null;

  // The title shown in the script's log box, defaulting to "filename args".
  get title(): string | React.ReactElement {
    return (this.title_ ??= this.getDefaultTitle());
  }
  set title(value: string | React.ReactElement) {
    this.title_ = value;
  }

  // Number of threads that this script is running with
  threads = 1 as PositiveInteger;

  // Whether this RunningScript is excluded from saves
  temporary = false;

  // Script urls for the current running script for translating urls back to file names in errors
  dependencies = new Map<ScriptURL, Script>();

  constructor(script?: Script, ramUsage?: number, args: ScriptArg[] = []) {
    if (!script) return;
    if (!ramUsage) throw new Error("Must provide a ramUsage for RunningScript initialization.");
    this.filename = script.filename;
    this.args = args;
    this.server = script.server;
    this.ramUsage = ramUsage;
    this.dependencies = script.dependencies;
  }

  getDefaultTitle(): string {
    return `${this.filename} ${this.args.join(" ")}`;
  }

  log(txt: React.ReactNode): void {
    if (this.logs.length > Settings.MaxLogCapacity) {
      this.logs.shift();
    }

    let logEntry = txt;
    if (Settings.TimestampsFormat && typeof txt === "string") {
      logEntry = `[${formatTime(Settings.TimestampsFormat)}] ${txt}`;
    }

    this.logs.push(logEntry);
    this.logUpd = true;
  }

  displayLog(): void {
    for (const log of this.logs) {
      if (typeof log === "string") {
        Terminal.print(log);
      } else {
        Terminal.printRaw(log);
      }
    }
  }

  clearLog(): void {
    this.logs.length = 0;
  }

  // Update the moneyStolen and numTimesHack maps when hacking
  recordHack(hostname: string, moneyGained: number, n = 1): void {
    this.initDataMapIfNeeded(hostname);
    const [hackMoney, hackCount, growCount, weakenCount] = this.dataMap.get(hostname) ?? [];
    this.dataMap.set(hostname, [hackMoney + moneyGained, hackCount + n, growCount, weakenCount]);
  }

  // Update the grow map when calling grow()
  recordGrow(hostname: string, n = 1): void {
    this.initDataMapIfNeeded(hostname);
    const [hackMoney, hackCount, growCount, weakenCount] = this.dataMap.get(hostname) ?? [];
    this.dataMap.set(hostname, [hackMoney, hackCount, growCount + n, weakenCount]);
  }

  // Update the weaken map when calling weaken() {
  recordWeaken(hostname: string, n = 1): void {
    this.initDataMapIfNeeded(hostname);
    const [hackMoney, hackCount, growCount, weakenCount] = this.dataMap.get(hostname) ?? [];
    this.dataMap.set(hostname, [hackMoney, hackCount, growCount, weakenCount + n]);
  }

  // Serialize the current object to a JSON save state
  toJSON(): IReviverValue {
    // Save the title under its canonical name, reading the raw backing field so we don't
    // generate a default. Omit it when it's the default (null) or a ReactElement; both are
    // restored on load.
    return Generic_toJSON(
      "RunningScript",
      {
        ...this,
        dataMap: Object.fromEntries(this.dataMap.entries()),
        title: this.title_,
      },
      typeof this.title_ === "string" ? includedProperties : includedPropsNoTitle,
    );
  }

  // Initializes a RunningScript Object from a JSON save state
  static fromJSON(value: IReviverValue): RunningScript {
    const runningScript = Generic_fromJSON(RunningScript, value.data, includedProperties);
    const validEntries = Object.entries(runningScript.dataMap).filter(isValidDataMapEntry);
    runningScript.dataMap = new Map(validEntries);

    return runningScript;
  }

  initDataMapIfNeeded(hostname: string) {
    if (!this.dataMap.has(hostname)) {
      this.dataMap.set(hostname, [0, 0, 0, 0]);
    }
  }
}
const includedProperties = getKeyList(RunningScript, {
  removedKeys: ["logs", "dependencies", "logUpd", "pid", "parent", "tailProps"],
  // Persist the title under its canonical name, keeping its original key position.
}).map((key) => (key === "title_" ? "title" : key));
const includedPropsNoTitle = includedProperties.filter((x) => x !== "title");

function isValidDataMapEntry(entry: [string, unknown]): entry is [string, number[]] {
  const [, value] = entry;
  return Array.isArray(value) && value.length === 4 && value.every((v) => typeof v === "number");
}

constructorsForReviver.RunningScript = RunningScript;
