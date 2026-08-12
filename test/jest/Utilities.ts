import { WorkerScript } from "../../src/Netscript/WorkerScript";
import { NetscriptFunctions, type NSFull } from "../../src/NetscriptFunctions";
import type { ScriptFilePath } from "../../src/Paths/ScriptFilePath";
import { PlayerObject } from "../../src/PersonObjects/Player/PlayerObject";
import { Player, setPlayer } from "../../src/Player";
import { RunningScript } from "../../src/Script/RunningScript";
import { GetServerOrThrow, prestigeAllServers } from "../../src/Server/AllServers";
import { SpecialServers } from "../../src/Server/data/SpecialServers";
import { initSourceFiles } from "../../src/SourceFile/SourceFiles";
import { FormatsNeedToChange } from "../../src/ui/formatNumber";
import { Router } from "../../src/ui/GameRoot";
import { config } from "../../src/NetscriptJSEvaluator";
import type { NetscriptContext } from "../../src/Netscript/APIWrapper";
import { purchaseServer } from "../../src/Server/ServerPurchases";
import { purchaseHacknet } from "../../src/Hacknet/HacknetHelpers";
import { initForeignServers } from "../../src/Server/ServerHelpers";
import { generateNextPid } from "../../src/Netscript/Pid";
import { initBitNodeMultipliers } from "../../src/BitNode/BitNode";
import { resetGoPromises } from "../../src/Go/boardAnalysis/goAI";
import { enterBitNode } from "../../src/RedPill";
import { getDefaultBitNodeOptions } from "../../src/BitNode/BitNodeUtils";
import { addLowLevelServersIfNeeded } from "../../src/DarkNet/controllers/NetworkMovement";
import { getDarknetServerOrThrow } from "../../src/DarkNet/utils/darknetServerUtils";

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

export function setupBasicTestingEnvironment(
  { purchaseHacknetServer, purchasePServer } = { purchasePServer: false, purchaseHacknetServer: false },
): void {
  // We need to delete all servers before calling initForeignServers.
  prestigeAllServers();
  setPlayer(new PlayerObject());

  // Basic steps of initializing a new save file. These are the steps that we do in Engine.load() when there is no save
  // data.
  initBitNodeMultipliers();
  Player.init();
  initForeignServers(Player.getHomeComputer());
  Player.reapplyAllAugmentations();
  resetGoPromises();

  // Grant SF4 for conveniently using Singularity APIs in tests.
  Player.sourceFiles.set(4, 3);
  // Simulate bitflume. This step is very important. It ensures all global states (e.g., Factions, Companies, BN mults)
  // are reset.
  enterBitNode(true, Player.bitNodeN, 1, getDefaultBitNodeOptions());
  // Get some money.
  Player.money = 1e15;

  if (purchasePServer) {
    purchaseServer("test-server-1", 2);
  }
  if (purchaseHacknetServer) {
    Player.sourceFiles.set(9, 3);
    purchaseHacknet();
  }
}

export function getWorkerScriptAndNS(hostname: string = SpecialServers.Home): {
  ws: WorkerScript;
  ns: NSFull;
} {
  const home = GetServerOrThrow(hostname);
  home.maxRam = 1024;
  const filePath = "test.js" as ScriptFilePath;
  home.writeToScriptFile(filePath, "");
  const script = home.scripts.get(filePath);
  if (!script) {
    throw new Error("Invalid script");
  }
  const runningScript = new RunningScript(script, 1024);
  const workerScript = new WorkerScript(runningScript, generateNextPid(), NetscriptFunctions);
  const ns = workerScript.vars;
  if (!ns) {
    throw new Error("Invalid NS instance");
  }
  return {
    ws: workerScript,
    ns,
  };
}

export function getNS(hostname: string = SpecialServers.Home): NSFull {
  return getWorkerScriptAndNS(hostname).ns;
}

export function getMockedNetscriptContext(
  workerScriptLogFunction: (func: string, txt: () => string) => void = () => {},
): NetscriptContext {
  return {
    function: "",
    functionPath: "",
    workerScript: {
      log: workerScriptLogFunction,
      scriptRef: {
        dependencies: [],
      },
    } as unknown as WorkerScript,
  };
}

// WIP: Improve this function to get a better stack trace or use jest-expect-message
export function expectWithMessage(actual: unknown, expected: unknown, customMessage: string) {
  try {
    expect(actual).toStrictEqual(expected);
  } catch (error) {
    throw new Error(customMessage, { cause: error });
  }
}

export function getFirstDarknetServerAdjacentToDarkWeb() {
  addLowLevelServersIfNeeded();
  const darkweb = getDarknetServerOrThrow(SpecialServers.DarkWeb);
  const result = darkweb.serversOnNetwork.filter((hostname) => hostname !== SpecialServers.Home)[0];
  if (!result) {
    throw new Error("No darknet server adjacent to darkweb found");
  }
  return result;
}
