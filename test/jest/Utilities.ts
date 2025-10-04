import { WorkerScript } from "../../src/Netscript/WorkerScript";
import { NetscriptFunctions, type NSFull } from "../../src/NetscriptFunctions";
import type { ScriptFilePath } from "../../src/Paths/ScriptFilePath";
import { PlayerObject } from "../../src/PersonObjects/Player/PlayerObject";
import { Player, setPlayer } from "../../src/Player";
import { RunningScript } from "../../src/Script/RunningScript";
import { GetServerOrThrow, initForeignServers, prestigeAllServers } from "../../src/Server/AllServers";
import { SpecialServers } from "../../src/Server/data/SpecialServers";
import { initSourceFiles } from "../../src/SourceFile/SourceFiles";
import { FormatsNeedToChange } from "../../src/ui/formatNumber";
import { Router } from "../../src/ui/GameRoot";
import { config } from "../../src/NetscriptJSEvaluator";

declare const importActual: (typeof config)["doImport"];

export function fixDoImportIssue() {
  // Replace Blob/ObjectURL functions, because they don't work natively in Jest
  global.Blob = class extends Blob {
    code: string;
    constructor(blobParts?: BlobPart[], __options?: BlobPropertyBag) {
      super();
      this.code = String((blobParts ?? [])[0]);
    }
  };
  global.URL.revokeObjectURL = function () {};
  // Critical: We have to overwrite this, otherwise we get Jest's hooked
  // implementation, which will not work without passing special flags to Node,
  // and tends to crash even if you do.
  config.doImport = importActual;

  global.URL.createObjectURL = function (blob) {
    return "data:text/javascript," + encodeURIComponent((blob as unknown as { code: string }).code);
  };
}

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

export function getNS(): NSFull {
  const home = GetServerOrThrow(SpecialServers.Home);
  home.maxRam = 1024;
  const filePath = "test.js" as ScriptFilePath;
  home.writeToScriptFile(filePath, "");
  const script = home.scripts.get(filePath);
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
