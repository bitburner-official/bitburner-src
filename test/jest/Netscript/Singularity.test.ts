import { installAugmentations } from "../../../src/Augmentation/AugmentationHelpers";
import { blackOpsArray } from "../../../src/Bladeburner/data/BlackOperations";
import { AugmentationName, CompanyName, FactionName, JobField, JobName } from "@enums";
import { Player } from "@player";
import { prestigeSourceFile } from "../../../src/Prestige";
import { GetServerOrThrow } from "../../../src/Server/AllServers";
import { SpecialServers } from "../../../src/Server/data/SpecialServers";
import { Factions } from "../../../src/Faction/Factions";
import { PlayerOwnedAugmentation } from "../../../src/Augmentation/PlayerOwnedAugmentation";
import { getNS, initGameEnvironment, setupBasicTestingEnvironment } from "./Utilities";
import { Terminal } from "../../../src/Terminal";
import type { NSFull } from "../../../src/NetscriptFunctions";
import { Companies } from "../../../src/Company/Companies";
import { CompanyPositions } from "../../../src/Company/CompanyPositions";

const nextBN = 3;

function setNumBlackOpsComplete(value: number): void {
  if (!Player.bladeburner) {
    throw new Error("Invalid Bladeburner data");
  }
  Player.bladeburner.numBlackOpsComplete = value;
}

function gainTonsOfExp() {
  Player.exp.hacking = 1e100;
  Player.exp.strength = 1e100;
  Player.exp.defense = 1e100;
  Player.exp.dexterity = 1e100;
  Player.exp.agility = 1e100;
  Player.exp.charisma = 1e100;
  Player.updateSkillLevels();
}

function resetExp() {
  Player.exp.hacking = 0;
  Player.exp.strength = 0;
  Player.exp.defense = 0;
  Player.exp.dexterity = 0;
  Player.exp.agility = 0;
  Player.exp.charisma = 0;
  Player.updateSkillLevels();
}

beforeAll(() => {
  initGameEnvironment();
});

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

describe("connect", () => {
  beforeEach(() => {
    setupBasicTestingEnvironment();
    Player.sourceFiles.set(9, 3);
    prestigeSourceFile(true);
    Player.money = 1e100;
  });

  describe("Success", () => {
    const expectConnectSuccessfully = (ns: NSFull, targetHostname: string) => {
      const currentServerBeforeConnecting = Player.getCurrentServer();
      expect(ns.singularity.connect(targetHostname)).toStrictEqual(true);
      expect(currentServerBeforeConnecting.isConnectedTo).toStrictEqual(false);

      const currentServerAfterConnecting = Player.getCurrentServer();
      expect(currentServerAfterConnecting.hostname).toStrictEqual(targetHostname);
      expect(currentServerAfterConnecting.isConnectedTo).toStrictEqual(true);
    };
    test("Built-in adjacent server", () => {
      expectConnectSuccessfully(getNS(), "n00dles");
    });
    test("Home", () => {
      Terminal.connectToServer(SpecialServers.DaedalusServer);
      expectConnectSuccessfully(getNS(), "home");
    });
    test("Private server", () => {
      const ns = getNS();
      ns.purchaseServer("pserver-0", 8);
      Terminal.connectToServer(SpecialServers.DaedalusServer);
      expectConnectSuccessfully(ns, "pserver-0");
    });
    test("Hacknet server", () => {
      const ns = getNS();
      ns.hacknet.purchaseNode();
      Terminal.connectToServer(SpecialServers.DaedalusServer);
      expectConnectSuccessfully(ns, "hacknet-server-0");
    });
    test("Backdoored server", () => {
      const ns = getNS();
      Terminal.connectToServer(SpecialServers.DaedalusServer);
      GetServerOrThrow("n00dles").backdoorInstalled = true;
      expectConnectSuccessfully(ns, "n00dles");
    });
  });

  describe("Failure", () => {
    test("Non-existent server", () => {
      const ns = getNS();
      expect(() => ns.singularity.connect("abc")).toThrow();
      expect(Player.getCurrentServer().hostname).not.toStrictEqual("abc");
    });
    test("Non-adjacent server", () => {
      const ns = getNS();
      expect(ns.singularity.connect(SpecialServers.DaedalusServer)).toStrictEqual(false);
      expect(Player.getCurrentServer().hostname).not.toStrictEqual(SpecialServers.DaedalusServer);
    });
  });
});

describe("applyToCompany", () => {
  beforeEach(() => {
    setupBasicTestingEnvironment();
    prestigeSourceFile(true);
    gainTonsOfExp();
  });

  describe("Success", () => {
    test("Apply to entry position", () => {
      const ns = getNS();
      Companies[CompanyName.MegaCorp].playerReputation = 0;
      expect(ns.singularity.applyToCompany(CompanyName.MegaCorp, JobField.software)).toStrictEqual(JobName.software0);
    });
    test("Apply and be promoted to next position", () => {
      const ns = getNS();
      const nextPosition = CompanyPositions["Junior Software Engineer"];
      Companies[CompanyName.MegaCorp].playerReputation = nextPosition.requiredReputation;
      expect(ns.singularity.applyToCompany(CompanyName.MegaCorp, JobField.software)).toStrictEqual(JobName.software1);
    });
    test("Apply and be promoted to highest position", () => {
      const ns = getNS();
      Companies[CompanyName.MegaCorp].playerReputation = 1e10;
      expect(ns.singularity.applyToCompany(CompanyName.MegaCorp, JobField.software)).toStrictEqual(JobName.software7);
    });
    test("Apply then apply again to be promoted to highest position", () => {
      const ns = getNS();
      Companies[CompanyName.MegaCorp].playerReputation = 0;
      expect(ns.singularity.applyToCompany(CompanyName.MegaCorp, JobField.software)).toStrictEqual(JobName.software0);
      Companies[CompanyName.MegaCorp].playerReputation = 1e10;
      expect(ns.singularity.applyToCompany(CompanyName.MegaCorp, JobField.software)).toStrictEqual(JobName.software7);
    });
  });

  describe("Failure", () => {
    test("Not qualified", () => {
      resetExp();
      const ns = getNS();
      expect(ns.singularity.applyToCompany(CompanyName.MegaCorp, JobField.software)).toStrictEqual(null);
    });
    test("Invalid field", () => {
      const ns = getNS();
      expect(ns.singularity.applyToCompany(CompanyName.MegaCorp, JobField.agent)).toStrictEqual(null);
    });
    test("Already at highest position", () => {
      const ns = getNS();
      Companies[CompanyName.MegaCorp].playerReputation = 1e10;
      expect(ns.singularity.applyToCompany(CompanyName.MegaCorp, JobField.software)).toStrictEqual(JobName.software7);
      expect(ns.singularity.applyToCompany(CompanyName.MegaCorp, JobField.software)).toStrictEqual(null);
    });
    test("Already at highest available position", () => {
      const ns = getNS();
      Companies[CompanyName.WatchdogSecurity].playerReputation = 1e10;
      // Watchdog Security only offers up to software5 (Head of Engineering).
      expect(ns.singularity.applyToCompany(CompanyName.WatchdogSecurity, JobField.software)).toStrictEqual(
        JobName.software5,
      );
      expect(ns.singularity.applyToCompany(CompanyName.WatchdogSecurity, JobField.software)).toStrictEqual(null);
    });
    test("Not qualified for promotion", () => {
      const ns = getNS();
      expect(ns.singularity.applyToCompany(CompanyName.MegaCorp, JobField.software)).toStrictEqual(JobName.software0);
      expect(ns.singularity.applyToCompany(CompanyName.MegaCorp, JobField.software)).toStrictEqual(null);
    });
  });
});
