import { installAugmentations } from "../../../src/Augmentation/AugmentationHelpers";
import { blackOpsArray } from "../../../src/Bladeburner/data/BlackOperations";
import { AugmentationName, FactionName } from "@enums";
import { WorkerScript } from "../../../src/Netscript/WorkerScript";
import { NetscriptFunctions, type NSFull } from "../../../src/NetscriptFunctions";
import type { ScriptFilePath } from "../../../src/Paths/ScriptFilePath";
import { PlayerObject } from "../../../src/PersonObjects/Player/PlayerObject";
import { Player, setPlayer } from "@player";
import { prestigeSourceFile } from "../../../src/Prestige";
import { RunningScript } from "../../../src/Script/RunningScript";
import { GetServerOrThrow, initForeignServers, prestigeAllServers } from "../../../src/Server/AllServers";
import { SpecialServers } from "../../../src/Server/data/SpecialServers";
import { initSourceFiles } from "../../../src/SourceFile/SourceFiles";
import { FormatsNeedToChange } from "../../../src/ui/formatNumber";
import { Router } from "../../../src/ui/GameRoot";
import { Factions } from "../../../src/Faction/Factions";
import { PlayerOwnedAugmentation } from "../../../src/Augmentation/PlayerOwnedAugmentation";

function setupBasicTestingEnvironment(): void {
  prestigeAllServers();
  setPlayer(new PlayerObject());
  Player.init();
  Player.sourceFiles.set(4, 3);
  initForeignServers(Player.getHomeComputer());
}

function setNumBlackOpsComplete(value: number): void {
  if (!Player.bladeburner) {
    throw new Error("Invalid Bladeburner data");
  }
  Player.bladeburner.numBlackOpsComplete = value;
}

function getNS(): NSFull {
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

// We need to patch this function. Some APIs call it, but it only works properly after the main UI is loaded.
Router.toPage = () => {};

/**
 * In src\ui\formatNumber.ts, there are some variables that need to be initialized before other functions can be
 * called. We have to call FormatsNeedToChange.emit() to initialize those variables.
 */
FormatsNeedToChange.emit();

initSourceFiles();

const nextBN = 3;

describe("b1tflum3", () => {
  beforeEach(() => {
    setupBasicTestingEnvironment();
    Player.queueAugmentation(AugmentationName.TheRedPill);
    installAugmentations();
    Player.gainHackingExp(1e100);
    const wdServer = GetServerOrThrow(SpecialServers.WorldDaemon);
    wdServer.hasAdminRights = true;
  });
  // Make sure that the player is in the next BN without SF rewards.
  const expectSucceedInB1tflum3 = () => {
    expect(Player.bitNodeN).toStrictEqual(nextBN);
    expect(Player.augmentations.length).toStrictEqual(0);
    expect(Player.sourceFileLvl(1)).toStrictEqual(0);
  };

  describe("Success", () => {
    test("Without BN options", () => {
      const ns = getNS();
      ns.singularity.b1tflum3(nextBN);
      expectSucceedInB1tflum3();
    });
    test("With BN options", () => {
      const ns = getNS();
      ns.singularity.b1tflum3(nextBN, undefined, {
        ...ns.getResetInfo().bitNodeOptions,
        sourceFileOverrides: new Map(),
        intelligenceOverride: 1,
      });
      expectSucceedInB1tflum3();
    });
  });

  describe("Failure", () => {
    // Make sure that the player is still in the same BN without SF rewards.
    const expectFailToB1tflum3 = () => {
      expect(Player.bitNodeN).toStrictEqual(1);
      expect(Player.augmentations.length).toStrictEqual(1);
      expect(Player.sourceFileLvl(1)).toStrictEqual(0);
    };
    test("Invalid intelligenceOverride", () => {
      const ns = getNS();
      expect(() => {
        ns.singularity.b1tflum3(nextBN, undefined, {
          ...ns.getResetInfo().bitNodeOptions,
          intelligenceOverride: -1,
        });
      }).toThrow();
      expectFailToB1tflum3();
    });
    test("Invalid sourceFileOverrides", () => {
      const ns = getNS();
      expect(() => {
        ns.singularity.b1tflum3(nextBN, undefined, {
          ...ns.getResetInfo().bitNodeOptions,
          sourceFileOverrides: [] as unknown as Map<number, number>,
        });
      }).toThrow();
      expectFailToB1tflum3();
    });
  });
});

describe("destroyW0r1dD43m0n", () => {
  beforeEach(() => {
    setupBasicTestingEnvironment();
    Player.queueAugmentation(AugmentationName.TheRedPill);
    installAugmentations();
    Player.gainHackingExp(1e100);
    const wdServer = GetServerOrThrow(SpecialServers.WorldDaemon);
    wdServer.hasAdminRights = true;
    Player.startBladeburner();
    setNumBlackOpsComplete(blackOpsArray.length);
  });

  describe("Success", () => {
    // Make sure that the player is in the next BN and received SF rewards.
    const expectSucceedInDestroyingWD = () => {
      expect(Player.bitNodeN).toStrictEqual(nextBN);
      expect(Player.augmentations.length).toStrictEqual(0);
      expect(Player.sourceFileLvl(1)).toStrictEqual(1);
    };
    test("Hacking route", () => {
      setNumBlackOpsComplete(0);
      const ns = getNS();
      ns.singularity.destroyW0r1dD43m0n(nextBN);
      expectSucceedInDestroyingWD();
    });
    test("Hacking route with BN options", () => {
      setNumBlackOpsComplete(0);
      const ns = getNS();
      ns.singularity.destroyW0r1dD43m0n(nextBN, undefined, {
        ...ns.getResetInfo().bitNodeOptions,
        sourceFileOverrides: new Map(),
        intelligenceOverride: 1,
      });
      expectSucceedInDestroyingWD();
    });
    test("Bladeburner route", () => {
      Player.skills.hacking = 0;
      const ns = getNS();
      ns.singularity.destroyW0r1dD43m0n(nextBN);
      expectSucceedInDestroyingWD();
    });
    test("Bladeburner route with BN options", () => {
      Player.skills.hacking = 0;
      const ns = getNS();
      ns.singularity.destroyW0r1dD43m0n(nextBN, undefined, {
        ...ns.getResetInfo().bitNodeOptions,
        sourceFileOverrides: new Map(),
        intelligenceOverride: 1,
      });
      expectSucceedInDestroyingWD();
    });
  });

  describe("Failure", () => {
    // Make sure that the player is still in the same BN without SF rewards.
    const expectFailToDestroyWD = () => {
      expect(Player.bitNodeN).toStrictEqual(1);
      expect(Player.augmentations.length).toStrictEqual(1);
      expect(Player.sourceFileLvl(1)).toStrictEqual(0);
    };
    test("Do not have enough hacking level and numBlackOpsComplete", () => {
      Player.skills.hacking = 0;
      setNumBlackOpsComplete(0);
      const ns = getNS();
      ns.singularity.destroyW0r1dD43m0n(nextBN);
      expectFailToDestroyWD();
    });
    test("Do not have admin rights on WD and do not have enough numBlackOpsComplete", () => {
      const wdServer = GetServerOrThrow(SpecialServers.WorldDaemon);
      wdServer.hasAdminRights = false;
      setNumBlackOpsComplete(0);
      const ns = getNS();
      ns.singularity.destroyW0r1dD43m0n(nextBN);
      expectFailToDestroyWD();
    });
    test("Invalid intelligenceOverride", () => {
      const ns = getNS();
      expect(() => {
        ns.singularity.destroyW0r1dD43m0n(nextBN, undefined, {
          ...ns.getResetInfo().bitNodeOptions,
          intelligenceOverride: -1,
        });
      }).toThrow();
      expectFailToDestroyWD();
    });
    test("Invalid sourceFileOverrides", () => {
      const ns = getNS();
      expect(() => {
        ns.singularity.destroyW0r1dD43m0n(nextBN, undefined, {
          ...ns.getResetInfo().bitNodeOptions,
          sourceFileOverrides: [] as unknown as Map<number, number>,
        });
      }).toThrow();
      expectFailToDestroyWD();
    });
  });
});

describe("purchaseAugmentation", () => {
  beforeEach(() => {
    setupBasicTestingEnvironment();
    prestigeSourceFile(true);
    Player.money = 1e100;
    Player.factions.push(FactionName.CyberSec);
    Factions[FactionName.CyberSec].playerReputation = 1e10;
    Player.factions.push(FactionName.Illuminati);
  });

  describe("Success", () => {
    const expectQueuedAugmentation = (augmentationName: AugmentationName, level: number) => {
      expect(
        Player.queuedAugmentations.find((augmentation) => augmentation.name === augmentationName)?.level,
      ).toStrictEqual(level);
    };
    test("NFG", () => {
      const ns = getNS();
      expect(
        ns.singularity.purchaseAugmentation(FactionName.CyberSec, AugmentationName.NeuroFluxGovernor),
      ).toStrictEqual(true);
      expectQueuedAugmentation(AugmentationName.NeuroFluxGovernor, 1);
    });
    // Check if the level of NFG is increased properly.
    test("Upgrade NFG", () => {
      Player.augmentations.push(new PlayerOwnedAugmentation(AugmentationName.NeuroFluxGovernor));
      const ns = getNS();
      expect(
        ns.singularity.purchaseAugmentation(FactionName.CyberSec, AugmentationName.NeuroFluxGovernor),
      ).toStrictEqual(true);
      expectQueuedAugmentation(AugmentationName.NeuroFluxGovernor, 2);
    });
    test("Normal augmentation", () => {
      const ns = getNS();
      expect(
        ns.singularity.purchaseAugmentation(FactionName.CyberSec, AugmentationName.CranialSignalProcessorsG1),
      ).toStrictEqual(true);
      expectQueuedAugmentation(AugmentationName.CranialSignalProcessorsG1, 1);
    });
    test("Normal augmentation with prerequisite", () => {
      Player.augmentations.push(new PlayerOwnedAugmentation(AugmentationName.CranialSignalProcessorsG1));
      const ns = getNS();
      expect(
        ns.singularity.purchaseAugmentation(FactionName.CyberSec, AugmentationName.CranialSignalProcessorsG2),
      ).toStrictEqual(true);
      expectQueuedAugmentation(AugmentationName.CranialSignalProcessorsG2, 1);
    });
    test("Buy 0-money-cost augmentation with negative money", () => {
      Player.money = -1000;
      Player.factions.push(FactionName.Daedalus);
      Factions[FactionName.Daedalus].playerReputation = 1e10;
      const ns = getNS();
      expect(ns.singularity.purchaseAugmentation(FactionName.Daedalus, AugmentationName.TheRedPill)).toStrictEqual(
        true,
      );
      expectQueuedAugmentation(AugmentationName.TheRedPill, 1);
    });
  });

  describe("Failure", () => {
    const expectNoQueuedAugmentation = (augmentationName: AugmentationName) => {
      expect(Player.queuedAugmentations.find((augmentation) => augmentation.name === augmentationName)).toStrictEqual(
        undefined,
      );
    };
    test("Not a member of specified faction", () => {
      const ns = getNS();
      expect(
        ns.singularity.purchaseAugmentation(FactionName.Daedalus, AugmentationName.NeuroFluxGovernor),
      ).toStrictEqual(false);
      expectNoQueuedAugmentation(AugmentationName.NeuroFluxGovernor);
    });
    test("Faction does not have specified augmentation", () => {
      const ns = getNS();
      expect(ns.singularity.purchaseAugmentation(FactionName.CyberSec, AugmentationName.QLink)).toStrictEqual(false);
      expectNoQueuedAugmentation(AugmentationName.QLink);
    });
    test("Purchase installed augmentation", () => {
      Player.augmentations.push(new PlayerOwnedAugmentation(AugmentationName.CranialSignalProcessorsG1));
      const ns = getNS();
      expect(
        ns.singularity.purchaseAugmentation(FactionName.CyberSec, AugmentationName.CranialSignalProcessorsG1),
      ).toStrictEqual(false);
      expectNoQueuedAugmentation(AugmentationName.CranialSignalProcessorsG1);
    });
    test("Purchase queued augmentation", () => {
      Player.queuedAugmentations.push(new PlayerOwnedAugmentation(AugmentationName.CranialSignalProcessorsG1));
      const ns = getNS();
      expect(
        ns.singularity.purchaseAugmentation(FactionName.CyberSec, AugmentationName.CranialSignalProcessorsG1),
      ).toStrictEqual(false);
    });
    test("Not have prerequisite augmentation", () => {
      const ns = getNS();
      expect(
        ns.singularity.purchaseAugmentation(FactionName.CyberSec, AugmentationName.CranialSignalProcessorsG2),
      ).toStrictEqual(false);
      expectNoQueuedAugmentation(AugmentationName.CranialSignalProcessorsG2);
    });
    test("Not enough money", () => {
      Player.money = 1000;
      const ns = getNS();
      expect(
        ns.singularity.purchaseAugmentation(FactionName.CyberSec, AugmentationName.CranialSignalProcessorsG1),
      ).toStrictEqual(false);
      expectNoQueuedAugmentation(AugmentationName.CranialSignalProcessorsG1);
    });
    test("Not enough reputation", () => {
      const ns = getNS();
      expect(ns.singularity.purchaseAugmentation(FactionName.Illuminati, AugmentationName.QLink)).toStrictEqual(false);
      expectNoQueuedAugmentation(AugmentationName.QLink);
    });
  });
});
