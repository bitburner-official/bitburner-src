import { WorkerScript } from "../../../src/Netscript/WorkerScript";
import { NetscriptFunctions, type NSFull } from "../../../src/NetscriptFunctions";
import type { ScriptFilePath } from "../../../src/Paths/ScriptFilePath";
import { PlayerObject } from "../../../src/PersonObjects/Player/PlayerObject";
import { Player, setPlayer } from "../../../src/Player";
import { RunningScript } from "../../../src/Script/RunningScript";
import { GetServerOrThrow, prestigeAllServers } from "../../../src/Server/AllServers";
import { SpecialServers } from "../../../src/Server/data/SpecialServers";
import { initForeignServers } from "../../../src/Server/ServerHelpers";
import { initSourceFiles } from "../../../src/SourceFile/SourceFiles";
import { FormatsNeedToChange } from "../../../src/ui/formatNumber";
import { Router } from "../../../src/ui/GameRoot";

export function initGameEnvironment() {
  // We need to patch this function. Some APIs call it, but it only works properly after the main UI is loaded.
  Router.toPage = () => {};

  /**
   * In src\ui\formatNumber.ts, there are some variables that need to be initialized before other functions can be
   * called. We have to call FormatsNeedToChange.emit() to initialize those variables.
   */
  FormatsNeedToChange.emit();

  initSourceFiles();
}

export function setupBasicTestingEnvironment(): void {
  prestigeAllServers();
  setPlayer(new PlayerObject());
  Player.init();
  Player.sourceFiles.set(4, 3);
  initForeignServers(Player.getHomeComputer());
}

export function getNS(hostname: string = SpecialServers.Home): NSFull {
  const server = GetServerOrThrow(hostname);
  server.maxRam = 1024;
  const filePath = "test.js" as ScriptFilePath;
  server.writeToScriptFile(filePath, "");
  const script = server.scripts.get(filePath);
  if (!script) {
    throw new Error("Invalid script");
  }
  const runningScript = new RunningScript(script, 1024);
  const workerScript = new WorkerScript(runningScript, 1, NetscriptFunctions);
  const ns = workerScript.env.vars;
  if (!ns) {
    throw new Error("Invalid NS instance");
  }
  return ns;
}
