import type { Script } from "../../../src/Script/Script";
import type { ScriptFilePath } from "../../../src/Paths/ScriptFilePath";
import { RunningScript } from "../../../src/Script/RunningScript";
import { CompletedProgramName } from "../../../src/Programs/Enums";
import { WorkerScript } from "../../../src/Netscript/WorkerScript";
import { NetscriptFunctions } from "../../../src/NetscriptFunctions";
import { initGameEnvironment, setupBasicTestingEnvironment } from "../Utilities";
import { Player } from "@player";

initGameEnvironment();

beforeEach(() => {
  setupBasicTestingEnvironment();
});

test("Edge cases of disableLog", function () {
  const server = Player.getHomeComputer();
  server.programs.push(CompletedProgramName.bruteSsh, CompletedProgramName.ftpCrack);
  // We don't need this script to be runnable, it just needs to exist so that
  // we can create a RunningScript and WorkerScript object.
  expect(server.writeToScriptFile("test.js" as ScriptFilePath, "")).toEqual({ overwritten: false });
  const script = server.scripts.get("test.js" as ScriptFilePath) as Script;

  const runningScript = new RunningScript(script, 2);
  const ws = new WorkerScript(runningScript, 1, NetscriptFunctions);

  const ns = ws.vars;
  if (!ns) {
    throw new Error("Invalid ws.vars");
  }

  // Generate logs in a specific pattern that checks edge cases in
  // disableLog. We want to check various combinations of things that
  // are/aren't disabled, as well as previously disabled.
  ns.brutessh("home");
  ns.ftpcrack("home");
  ns.print("before disableLog ALL");

  expect(() => ns.disableLog("all")).toThrow("Invalid argument: all.");
  ns.disableLog("ALL");

  ns.brutessh("home");
  ns.ftpcrack("home");
  ns.print("after disableLog ALL");

  ns.enableLog("brutessh");
  ns.brutessh("home");
  ns.ftpcrack("home");
  ns.print("after enableLog brutessh");

  ns.disableLog("brutessh");
  ns.enableLog("ftpcrack");
  ns.brutessh("home");
  ns.ftpcrack("home");
  ns.print("after enableLog ftpcrack");

  ns.enableLog("ftpcrack");
  ns.brutessh("home");
  ns.ftpcrack("home");

  ns.print("after redundant enable");
  ns.disableLog("ALL");
  ns.brutessh("home");
  ns.ftpcrack("home");
  ns.enableLog("ALL");
  ns.brutessh("home");
  ns.ftpcrack("home");
  ns.print("end");

  expect(runningScript.logs).toEqual([
    "brutessh: Executed BruteSSH.exe on 'home' to open SSH port (22).",
    "ftpcrack: Executed FTPCrack.exe on 'home' to open FTP port (21).",
    "before disableLog ALL",
    "disableLog: Invalid argument: all.",
    "after disableLog ALL",
    "brutessh: SSH Port (22) already opened on 'home'.",
    "after enableLog brutessh",
    "ftpcrack: FTP Port (21) already opened on 'home'.",
    "after enableLog ftpcrack",
    "ftpcrack: FTP Port (21) already opened on 'home'.",
    "after redundant enable",
    "enableLog: Enabled logging for all functions",
    "brutessh: SSH Port (22) already opened on 'home'.",
    "ftpcrack: FTP Port (21) already opened on 'home'.",
    "end",
  ]);
});
