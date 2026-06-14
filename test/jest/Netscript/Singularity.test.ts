import { installAugmentations } from "../../../src/Augmentation/AugmentationHelpers";
import {
  AugmentationName,
  BladeburnerContractName,
  BladeburnerGeneralActionName,
  CityName,
  CompanyName,
  CompletedProgramName,
  CrimeType,
  FactionName,
  FactionWorkType,
  GymType,
  JobField,
  JobName,
  LocationName,
  SpecialBladeburnerActionTypeForSleeve,
  UniversityClassType,
} from "@enums";
import { Player } from "@player";
import { prestigeSourceFile } from "../../../src/Prestige";
import { disconnectServers, GetServerOrThrow } from "../../../src/Server/AllServers";
import { SpecialServers } from "../../../src/Server/data/SpecialServers";
import { Factions } from "../../../src/Faction/Factions";
import { PlayerOwnedAugmentation } from "../../../src/Augmentation/PlayerOwnedAugmentation";
import { getNS, initGameEnvironment, setupBasicTestingEnvironment } from "../Utilities";
import { Terminal } from "../../../src/Terminal";
import type { NSFull } from "../../../src/NetscriptFunctions";
import { Companies } from "../../../src/Company/Companies";
import { CompanyPositions } from "../../../src/Company/CompanyPositions";
import { getTorRouter } from "../../../src/Server/ServerHelpers";
import * as exceptionAlertModule from "../../../src/utils/helpers/exceptionAlert";
import { numberOfBlackOperations } from "../../../src/Bladeburner/data/BlackOperations";
import type { SleeveTask, Task } from "@nsdefs";
import { Router } from "../../../src/ui/GameRoot";
import { Page } from "../../../src/ui/Router";
import { getDefaultBitNodeOptions } from "../../../src/BitNode/BitNodeUtils";

const nextBN = 4;

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

function testIntelligenceOverride(
  ns: NSFull,
  prestigeAPI: "b1tflum3" | "destroyW0r1dD43m0n",
  expectSuccessPrestige: () => void,
  setUpBeforePrestige = () => {},
): void {
  Player.sourceFiles.set(5, 1);
  // The intelligence skill level starts at 0.
  expect(Player.skills.intelligence).toStrictEqual(0);
  prestigeSourceFile(true);
  // Start without exp.
  expect(Player.exp.intelligence).toStrictEqual(0);
  // When having SF5 and the skill level is 0, it's set to 1.
  expect(Player.skills.intelligence).toStrictEqual(1);
  expect(Player.persistentIntelligenceData.exp).toStrictEqual(0);
  // Gain 1e6 exp (skill = 242).
  Player.gainIntelligenceExp(1e6);
  expect(Player.exp.intelligence).toStrictEqual(1e6);
  expect(Player.skills.intelligence).toStrictEqual(242);
  expect(Player.persistentIntelligenceData.exp).toStrictEqual(1e6);

  // Prestige and check if intelligenceOverride works (exp is set to 11255, skill = 100, and
  // persistentIntelligenceData.exp is still 1e6).
  const intelligenceExpGainOnPrestige = prestigeAPI === "destroyW0r1dD43m0n" ? 300 : 0;
  setUpBeforePrestige();
  ns.singularity[prestigeAPI](nextBN, undefined, {
    ...ns.getResetInfo().bitNodeOptions,
    intelligenceOverride: 100,
  });
  expectSuccessPrestige();
  expect(Player.bitNodeOptions.intelligenceOverride).toStrictEqual(100);
  expect(Player.exp.intelligence).toStrictEqual(11255.317546552918 + intelligenceExpGainOnPrestige);
  expect(Player.skills.intelligence).toStrictEqual(100);
  expect(Player.persistentIntelligenceData.exp).toStrictEqual(1e6 + intelligenceExpGainOnPrestige);

  // Gain 500e3 exp.
  const intExpGain = 500e3;
  Player.gainIntelligenceExp(intExpGain);
  // Check if int gain is accumulated correctly in both Player.exp.intelligence and
  // Player.persistentIntelligenceData.exp.
  expect(Player.exp.intelligence).toStrictEqual(11255.317546552918 + intelligenceExpGainOnPrestige + intExpGain);
  expect(Player.skills.intelligence).toStrictEqual(220);
  expect(Player.persistentIntelligenceData.exp).toStrictEqual(1e6 + intelligenceExpGainOnPrestige + intExpGain);

  // Prestige and check if int gain is still retained correctly.
  setUpBeforePrestige();
  ns.singularity[prestigeAPI](nextBN, undefined, {
    ...ns.getResetInfo().bitNodeOptions,
    intelligenceOverride: undefined,
  });
  expectSuccessPrestige();
  expect(Player.bitNodeOptions.intelligenceOverride).toStrictEqual(undefined);
  expect(Player.exp.intelligence).toStrictEqual(1e6 + intelligenceExpGainOnPrestige * 2 + intExpGain);
  expect(Player.skills.intelligence).toStrictEqual(255);
  expect(Player.persistentIntelligenceData.exp).toStrictEqual(1e6 + intelligenceExpGainOnPrestige * 2 + intExpGain);

  // Prestige with intelligenceOverride set higher than the persistent int skill and check if the int skill is
  // incorrectly set to that value.
  setUpBeforePrestige();
  ns.singularity[prestigeAPI](nextBN, undefined, {
    ...ns.getResetInfo().bitNodeOptions,
    intelligenceOverride: 1000,
  });
  expectSuccessPrestige();
  expect(Player.bitNodeOptions.intelligenceOverride).toStrictEqual(1000);
  expect(Player.exp.intelligence).toStrictEqual(1e6 + intelligenceExpGainOnPrestige * 3 + intExpGain);
  expect(Player.skills.intelligence).toStrictEqual(255);
  expect(Player.persistentIntelligenceData.exp).toStrictEqual(1e6 + intelligenceExpGainOnPrestige * 3 + intExpGain);

  // Start testing another scenario.
  // Set the initial state (int exp = 1e6, skill = 242) and bitflume.
  Player.exp.intelligence = 1e6;
  Player.skills.intelligence = 242;
  Player.persistentIntelligenceData.exp = 1e6;
  ns.singularity.b1tflum3(nextBN, undefined, {
    ...ns.getResetInfo().bitNodeOptions,
    intelligenceOverride: undefined,
  });

  // Double-check the initial state.
  expect(Player.exp.intelligence).toStrictEqual(1e6);
  expect(Player.skills.intelligence).toStrictEqual(242);
  expect(Player.persistentIntelligenceData.exp).toStrictEqual(1e6);
  expect(Player.bitNodeOptions.intelligenceOverride).toStrictEqual(undefined);

  // Limit int skill to 100.
  setUpBeforePrestige();
  ns.singularity[prestigeAPI](nextBN, undefined, {
    ...ns.getResetInfo().bitNodeOptions,
    intelligenceOverride: 100,
  });
  expectSuccessPrestige();

  // Check if int is overridden correctly.
  expect(Player.bitNodeOptions.intelligenceOverride).toStrictEqual(100);
  expect(Player.exp.intelligence).toStrictEqual(11255.317546552918 + intelligenceExpGainOnPrestige);
  expect(Player.skills.intelligence).toStrictEqual(100);
  expect(Player.persistentIntelligenceData.exp).toStrictEqual(1e6 + intelligenceExpGainOnPrestige);

  // Limit int skill to 1000.
  setUpBeforePrestige();
  ns.singularity[prestigeAPI](nextBN, undefined, {
    ...ns.getResetInfo().bitNodeOptions,
    intelligenceOverride: 1000,
  });
  expectSuccessPrestige();

  // The limit is higher than the persistent int skill, so it's not applied. Exp and skill are reset back to the initial
  // state, plus the int exp gained from prestige.
  expect(Player.bitNodeOptions.intelligenceOverride).toStrictEqual(1000);
  expect(Player.exp.intelligence).toStrictEqual(1e6 + intelligenceExpGainOnPrestige * 2);
  expect(Player.skills.intelligence).toStrictEqual(242);
  expect(Player.persistentIntelligenceData.exp).toStrictEqual(1e6 + intelligenceExpGainOnPrestige * 2);
}

/** Sets intelligence exp while bypassing the requirements (SF5 or being in BN5). */
function manuallySetIntelligenceExp(exp: number): void {
  Player.exp.intelligence = exp;
  Player.skills.intelligence = Math.floor(Player.calculateSkill(Player.exp.intelligence, 1));
  Player.persistentIntelligenceData.exp = exp;
}

function expectIntelligenceExp(exp: number): void {
  expect(Player.exp.intelligence).toStrictEqual(exp);
  expect(Player.skills.intelligence).toStrictEqual(Math.floor(Player.calculateSkill(exp, 1)));
  expect(Player.persistentIntelligenceData.exp).toStrictEqual(exp);
}

/**
 * This function is not equivalent to expectIntelligenceExp(0). The intelligence skill level starts at 0, not 1 like
 * other stats. This function specifically verifies the initial state of intelligence data (before entering BN5).
 */
function expectInitialIntelligenceData(): void {
  expect(Player.exp.intelligence).toStrictEqual(0);
  // The intelligence skill level starts at 0.
  expect(Player.skills.intelligence).toStrictEqual(0);
  expect(Player.persistentIntelligenceData.exp).toStrictEqual(0);
}

function setUpBeforeDestroyingWD(): void {
  Player.queueAugmentation(AugmentationName.TheRedPill);
  installAugmentations();
  Player.gainHackingExp(1e100);
  const wdServer = GetServerOrThrow(SpecialServers.WorldDaemon);
  wdServer.hasAdminRights = true;
  Player.startBladeburner();
  setNumBlackOpsComplete(numberOfBlackOperations);
}

describe("b1tflum3", () => {
  beforeEach(() => {
    setupBasicTestingEnvironment();
    Player.queueAugmentation(AugmentationName.Targeting1);
    installAugmentations();
    Player.gainHackingExp(1e100);
  });
  // Make sure that the player is in the next BN without SF rewards.
  const expectSucceedInB1tflum3 = () => {
    expect(Player.bitNodeN).toStrictEqual(nextBN);
    expect(Player.augmentations.length).toStrictEqual(0);
    expect(Player.exp.hacking).toStrictEqual(0);
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
    test("intelligenceOverride", () => {
      testIntelligenceOverride(getNS(), "b1tflum3", expectSucceedInB1tflum3);
    });
  });

  // Make sure that the player is still in the same BN without SF rewards.
  const expectFailToB1tflum3 = () => {
    expect(Player.bitNodeN).toStrictEqual(1);
    expect(Player.augmentations.length).toStrictEqual(1);
    expect(Player.augmentations[0].name).toStrictEqual(AugmentationName.Targeting1);
    expect(Player.exp.hacking).toStrictEqual(1e100);
    expect(Player.sourceFileLvl(1)).toStrictEqual(0);
  };
  describe("Failure", () => {
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
    test("Invalid nextBN", () => {
      const ns = getNS();
      expect(() => ns.singularity.b1tflum3(-1)).toThrow("Invalid BitNode");
    });
  });
});

// Make sure that the player is in the next BN and received SF rewards.
const expectSucceedInJumpingToNextBN = () => {
  expect(Player.bitNodeN).toStrictEqual(nextBN);
  expect(Player.augmentations.length).toStrictEqual(0);
  expect(Player.sourceFileLvl(1)).toStrictEqual(1);
};

// Make sure that the player is still in the same BN without SF rewards.
const expectFailToJumpToNextBN = (expectedWDBackdoorStatus = false) => {
  expect(Player.bitNodeN).toStrictEqual(1);
  expect(Player.augmentations.length).toStrictEqual(1);
  expect(Player.sourceFileLvl(1)).toStrictEqual(0);
  expect(GetServerOrThrow(SpecialServers.WorldDaemon).backdoorInstalled).toBe(expectedWDBackdoorStatus);
};

describe("destroyW0r1dD43m0n", () => {
  beforeEach(() => {
    setupBasicTestingEnvironment();
    setUpBeforeDestroyingWD();
  });

  describe("Success", () => {
    test("Hacking route", () => {
      setNumBlackOpsComplete(0);
      const ns = getNS();
      ns.singularity.destroyW0r1dD43m0n(nextBN);
      expectSucceedInJumpingToNextBN();
    });
    test("Hacking route with BN options", () => {
      setNumBlackOpsComplete(0);
      const ns = getNS();
      ns.singularity.destroyW0r1dD43m0n(nextBN, undefined, {
        ...ns.getResetInfo().bitNodeOptions,
        sourceFileOverrides: new Map(),
        intelligenceOverride: 1,
      });
      expectSucceedInJumpingToNextBN();
    });
    test("Bladeburner route", () => {
      Player.skills.hacking = 0;
      const ns = getNS();
      ns.singularity.destroyW0r1dD43m0n(nextBN);
      expectSucceedInJumpingToNextBN();
    });
    test("Bladeburner route with BN options", () => {
      Player.skills.hacking = 0;
      const ns = getNS();
      ns.singularity.destroyW0r1dD43m0n(nextBN, undefined, {
        ...ns.getResetInfo().bitNodeOptions,
        sourceFileOverrides: new Map(),
        intelligenceOverride: 1,
      });
      expectSucceedInJumpingToNextBN();
    });
    test("intelligenceOverride", () => {
      testIntelligenceOverride(getNS(), "destroyW0r1dD43m0n", expectSucceedInJumpingToNextBN, setUpBeforeDestroyingWD);
    });
    test("nullish nextBN", () => {
      setNumBlackOpsComplete(0);
      const ns = getNS();
      const spiedRouterToPage = jest.spyOn(Router, "toPage");
      ns.singularity.destroyW0r1dD43m0n(undefined);

      expectFailToJumpToNextBN(true);
      expect(spiedRouterToPage).toHaveBeenCalledWith(Page.BitVerse, { flume: false, quick: false });
      spiedRouterToPage.mockRestore();
    });
  });

  describe("Failure", () => {
    test("Do not have enough hacking level and numBlackOpsComplete", () => {
      Player.skills.hacking = 0;
      setNumBlackOpsComplete(0);
      const ns = getNS();
      ns.singularity.destroyW0r1dD43m0n(nextBN);
      expectFailToJumpToNextBN();
    });
    test("Do not have admin rights on WD and do not have enough numBlackOpsComplete", () => {
      const wdServer = GetServerOrThrow(SpecialServers.WorldDaemon);
      wdServer.hasAdminRights = false;
      setNumBlackOpsComplete(0);
      const ns = getNS();
      ns.singularity.destroyW0r1dD43m0n(nextBN);
      expectFailToJumpToNextBN();
    });
    test("Invalid intelligenceOverride", () => {
      const ns = getNS();
      expect(() => {
        ns.singularity.destroyW0r1dD43m0n(nextBN, undefined, {
          ...ns.getResetInfo().bitNodeOptions,
          intelligenceOverride: -1,
        });
      }).toThrow();
      expectFailToJumpToNextBN();
    });
    test("Invalid sourceFileOverrides", () => {
      const ns = getNS();
      expect(() => {
        ns.singularity.destroyW0r1dD43m0n(nextBN, undefined, {
          ...ns.getResetInfo().bitNodeOptions,
          sourceFileOverrides: [] as unknown as Map<number, number>,
        });
      }).toThrow();
      expectFailToJumpToNextBN();
    });
    test("Invalid nextBN", () => {
      const ns = getNS();
      expect(() => ns.singularity.destroyW0r1dD43m0n(0)).toThrow("Invalid BitNode");
      expect(() => ns.singularity.destroyW0r1dD43m0n(-1)).toThrow("Invalid BitNode");
    });
    test.each([
      ["1", undefined, getDefaultBitNodeOptions()],
      ["2", "test.js", undefined],
      ["3", "test.js", getDefaultBitNodeOptions()],
    ])("nextBN is nullish but other parameters are not - %s", (__, callbackScript, bitNodeOptions) => {
      setNumBlackOpsComplete(0);
      const ns = getNS();
      const spiedRouterToPage = jest.spyOn(Router, "toPage");
      expect(() => ns.singularity.destroyW0r1dD43m0n(undefined, callbackScript, bitNodeOptions)).toThrow(
        "When nextBN is nullish, other parameters must be nullish.",
      );

      expectFailToJumpToNextBN();
      expect(spiedRouterToPage).not.toHaveBeenCalled();
      spiedRouterToPage.mockRestore();
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
      ns.cloud.purchaseServer("cloud-server-0", 8);
      Terminal.connectToServer(SpecialServers.DaedalusServer);
      expectConnectSuccessfully(ns, "cloud-server-0");
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

describe("purchaseProgram", () => {
  beforeEach(() => {
    setupBasicTestingEnvironment();
    prestigeSourceFile(true);
    Player.money = 1e15;
    getTorRouter();
  });

  describe("Success", () => {
    beforeEach(() => {
      const ns = getNS();
      expect(ns.singularity.purchaseTor()).toStrictEqual(true);
    });
    test("return true if already bought", () => {
      const ns = getNS();
      expect(Player.hasProgram(CompletedProgramName.bruteSsh)).toStrictEqual(false);
      Player.getHomeComputer().pushProgram(CompletedProgramName.bruteSsh);
      expect(Player.hasProgram(CompletedProgramName.bruteSsh)).toStrictEqual(true);
      expect(ns.singularity.purchaseProgram(CompletedProgramName.bruteSsh)).toStrictEqual(true);
      expect(Player.hasProgram(CompletedProgramName.bruteSsh)).toStrictEqual(true);
    });
    test("bruteSsh", () => {
      const ns = getNS();
      expect(Player.hasProgram(CompletedProgramName.bruteSsh)).toStrictEqual(false);
      expect(ns.singularity.purchaseProgram(CompletedProgramName.bruteSsh)).toStrictEqual(true);
      expect(Player.hasProgram(CompletedProgramName.bruteSsh)).toStrictEqual(true);
    });
    test("darkscape", () => {
      const spiedExceptionAlert = jest.spyOn(exceptionAlertModule, "exceptionAlert");
      const ns = getNS();
      expect(Player.hasProgram(CompletedProgramName.darkscape)).toStrictEqual(false);
      expect(ns.singularity.purchaseProgram(CompletedProgramName.darkscape)).toStrictEqual(true);
      expect(Player.hasProgram(CompletedProgramName.darkscape)).toStrictEqual(true);
      expect(spiedExceptionAlert).not.toHaveBeenCalled();
    });
    test("darkscape with lowercase program name", () => {
      const spiedExceptionAlert = jest.spyOn(exceptionAlertModule, "exceptionAlert");
      const ns = getNS();
      expect(Player.hasProgram(CompletedProgramName.darkscape)).toStrictEqual(false);
      // @ts-expect-error - Intentionally use lowercase program name
      expect(ns.singularity.purchaseProgram(CompletedProgramName.darkscape.toLowerCase())).toStrictEqual(true);
      expect(Player.hasProgram(CompletedProgramName.darkscape)).toStrictEqual(true);
      expect(spiedExceptionAlert).not.toHaveBeenCalled();
    });
  });

  describe("Failure", () => {
    test("No TOR", () => {
      // Remove TOR router
      disconnectServers(Player.getHomeComputer(), GetServerOrThrow(SpecialServers.DarkWeb));

      const ns = getNS();
      expect(Player.hasTorRouter()).toStrictEqual(false);
      expect(Player.hasProgram(CompletedProgramName.bruteSsh)).toStrictEqual(false);
      expect(ns.singularity.purchaseProgram(CompletedProgramName.bruteSsh)).toStrictEqual(false);
      expect(Player.hasProgram(CompletedProgramName.bruteSsh)).toStrictEqual(false);
    });
    test("Invalid program name", () => {
      const ns = getNS();
      // @ts-expect-error - Intentionally use invalid program name
      expect(ns.singularity.purchaseProgram("InvalidProgram.exe")).toStrictEqual(false);
    });
    test("Not enough money", () => {
      const ns = getNS();
      Player.money = 0;
      expect(Player.hasProgram(CompletedProgramName.bruteSsh)).toStrictEqual(false);
      expect(ns.singularity.purchaseProgram(CompletedProgramName.bruteSsh)).toStrictEqual(false);
      expect(Player.hasProgram(CompletedProgramName.bruteSsh)).toStrictEqual(false);
    });
  });
});

describe("Intelligence", () => {
  beforeEach(() => {
    setupBasicTestingEnvironment();
    expect(Player.bitNodeN).toStrictEqual(1);
    expect(Player.sourceFileLvl(5)).toStrictEqual(0);
    expectInitialIntelligenceData();
  });
  test("Get SF5", () => {
    // This is the most common scenario. Some checks in this test will be repeated in other tests.
    const ns = getNS();
    ns.singularity.b1tflum3(5);
    expectIntelligenceExp(0);

    Player.gainIntelligenceExp(1000);
    expectIntelligenceExp(1000);

    setUpBeforeDestroyingWD();
    ns.singularity.destroyW0r1dD43m0n(5);
    expectIntelligenceExp(1300);
    expect(Player.sourceFileLvl(5)).toStrictEqual(1);

    setUpBeforeDestroyingWD();
    ns.singularity.destroyW0r1dD43m0n(5);
    expectIntelligenceExp(1600);
    expect(Player.sourceFileLvl(5)).toStrictEqual(2);

    setUpBeforeDestroyingWD();
    ns.singularity.destroyW0r1dD43m0n(1);
    expectIntelligenceExp(1900);
    expect(Player.sourceFileLvl(5)).toStrictEqual(3);
  });
  test("Can gain intelligence exp with SF5", () => {
    Player.sourceFiles.set(5, 1);
    const ns = getNS();
    ns.singularity.b1tflum3(1);
    expectIntelligenceExp(0);

    Player.gainIntelligenceExp(1000);
    expectIntelligenceExp(1000);

    ns.singularity.b1tflum3(1);
    expectIntelligenceExp(1000);

    setUpBeforeDestroyingWD();
    ns.singularity.destroyW0r1dD43m0n(1);
    expectIntelligenceExp(1300);
  });
  test("Can gain intelligence exp in BN5", () => {
    const ns = getNS();
    ns.singularity.b1tflum3(5);
    expectIntelligenceExp(0);

    Player.gainIntelligenceExp(1000);
    expectIntelligenceExp(1000);
  });
  describe("Reset intelligence data", () => {
    test("Install augmentations", () => {
      manuallySetIntelligenceExp(50);
      expectIntelligenceExp(50);
      Player.queueAugmentation(AugmentationName.Targeting1);
      expect(installAugmentations()).toStrictEqual(true);
      expectInitialIntelligenceData();
    });
    test("Bitflume", () => {
      const ns = getNS();

      // Bitflume from non-BN5 to non-BN5.
      expect(Player.bitNodeN).toStrictEqual(1);
      manuallySetIntelligenceExp(50);
      expectIntelligenceExp(50);
      ns.singularity.b1tflum3(1);
      // Reset intelligence data
      expectInitialIntelligenceData();

      // We intentionally skip this scenario.
      // For more information, please check https://github.com/bitburner-official/bitburner-src/pull/2666
      // // Bitflume from non-BN5 to BN5.
      // expect(Player.bitNodeN).toStrictEqual(1);
      // manuallySetIntelligenceExp(50);
      // expectIntelligenceExp(50);
      // ns.singularity.b1tflum3(5);
      // // Reset intelligence data and skill = 1
      // expectIntelligenceExp(0);

      // Bitflume from non-BN5 to BN5.
      ns.singularity.b1tflum3(5);
      // Check if skill is set to 1.
      expectIntelligenceExp(0);

      // Bitflume from BN5 to BN5.
      expect(Player.bitNodeN).toStrictEqual(5);
      Player.gainIntelligenceExp(50);
      expectIntelligenceExp(50);
      // Bitflume to BN5 again.
      ns.singularity.b1tflum3(5);
      // Not lose exp when bitfluming from BN5 to BN5.
      expectIntelligenceExp(50);

      // Bitflume from BN5 to non-BN5.
      expect(Player.bitNodeN).toStrictEqual(5);
      Player.gainIntelligenceExp(50);
      // 50 exp from the previous scenario + 50 exp from this scenario.
      expectIntelligenceExp(100);
      ns.singularity.b1tflum3(1);
      // Reset intelligence data
      expectInitialIntelligenceData();
    });
    test("Destroy WD", () => {
      const ns = getNS();

      // Destroy WD of non-BN5 and jump to non-BN5.
      expect(Player.bitNodeN).toStrictEqual(1);
      manuallySetIntelligenceExp(50);
      expectIntelligenceExp(50);
      setUpBeforeDestroyingWD();
      ns.singularity.destroyW0r1dD43m0n(1);
      // Reset intelligence data
      expectInitialIntelligenceData();

      // We intentionally skip this scenario.
      // For more information, please check https://github.com/bitburner-official/bitburner-src/pull/2666
      // // Destroy WD of non-BN5 and jump to BN5.
      // expect(Player.bitNodeN).toStrictEqual(1);
      // manuallySetIntelligenceExp(50);
      // expectIntelligenceExp(50);
      // setUpBeforeDestroyingWD();
      // ns.singularity.destroyW0r1dD43m0n(5);
      // // Reset intelligence data and skill = 1
      // expectIntelligenceExp(0);

      // Destroy WD of BN5 and jump to BN5.
      ns.singularity.b1tflum3(5);
      // Check the initial state that we want to test: in BN5 and do not have SF5.
      expect(Player.bitNodeN).toStrictEqual(5);
      expect(Player.sourceFileLvl(5)).toStrictEqual(0);
      // Check if skill is set to 1.
      expectIntelligenceExp(0);
      Player.gainIntelligenceExp(50);
      expectIntelligenceExp(50);
      setUpBeforeDestroyingWD();
      ns.singularity.destroyW0r1dD43m0n(5);
      // 50 exp from Player.gainIntelligenceExp() + 300 exp reward of destroying WD.
      expectIntelligenceExp(350);

      // Destroy WD of BN5 and jump to non-BN5.
      Player.gainIntelligenceExp(50);
      // 350 exp from the previous scenario + 50 exp from Player.gainIntelligenceExp().
      expectIntelligenceExp(400);
      setUpBeforeDestroyingWD();
      ns.singularity.destroyW0r1dD43m0n(1);
      expectIntelligenceExp(700);
    });
  });
  test("Cannot gain intelligence exp without SF5 or being in BN5", () => {
    const ns = getNS();
    Player.gainIntelligenceExp(1000);
    expectInitialIntelligenceData();

    ns.singularity.b1tflum3(1);
    expectInitialIntelligenceData();

    setUpBeforeDestroyingWD();
    ns.singularity.destroyW0r1dD43m0n(1);
    expectInitialIntelligenceData();
  });
  test("Cannot gain intelligence exp even with intelligence skill > 0", () => {
    manuallySetIntelligenceExp(50);
    expectIntelligenceExp(50);

    Player.gainIntelligenceExp(1000);
    expectIntelligenceExp(50);
  });
});

const nextCompletionTestCases = [
  {
    action: () =>
      expect(
        getNS().singularity.universityCourse(LocationName.Sector12RothmanUniversity, UniversityClassType.algorithms),
      ).toStrictEqual(true),
    taskType: "CLASS",
    isPlayerTask: true,
  },
  {
    action: () =>
      expect(getNS().singularity.gymWorkout(LocationName.Sector12PowerhouseGym, GymType.strength)).toStrictEqual(true),
    taskType: "CLASS",
    isPlayerTask: true,
  },
  {
    action: () => {
      const ns = getNS();
      ns.singularity.applyToCompany(LocationName.Sector12JoesGuns, JobField.employee);
      expect(ns.singularity.workForCompany(LocationName.Sector12JoesGuns)).toStrictEqual(true);
    },
    taskType: "COMPANY",
    isPlayerTask: true,
  },
  {
    action: () => expect(getNS().singularity.createProgram(CompletedProgramName.bruteSsh)).toStrictEqual(true),
    taskType: "CREATE_PROGRAM",
    isPlayerTask: true,
  },
  {
    action: () => {
      const ns = getNS();
      ns.singularity.commitCrime(CrimeType.mug);
      expect(ns.singularity.getCurrentWork()?.type === "CRIME").toStrictEqual(true);
    },
    taskType: "CRIME",
    isPlayerTask: true,
  },
  {
    action: () =>
      expect(getNS().singularity.workForFaction(FactionName.Sector12, FactionWorkType.hacking)).toStrictEqual(true),
    taskType: "FACTION",
    isPlayerTask: true,
  },
  {
    action: () => {
      const ns = getNS();
      ns.singularity.travelToCity(CityName.NewTokyo);
      expect(ns.grafting.graftAugmentation(AugmentationName.Targeting1)).toStrictEqual(true);
    },
    taskType: "GRAFTING",
    isPlayerTask: true,
  },
  {
    action: () =>
      expect(
        getNS().sleeve.setToUniversityCourse(0, LocationName.Sector12RothmanUniversity, UniversityClassType.algorithms),
      ).toStrictEqual(true),
    taskType: "CLASS",
    isPlayerTask: false,
  },
  {
    action: () =>
      expect(getNS().sleeve.setToGymWorkout(0, LocationName.Sector12PowerhouseGym, GymType.strength)).toStrictEqual(
        true,
      ),
    taskType: "CLASS",
    isPlayerTask: false,
  },
  {
    action: () => {
      const ns = getNS();
      ns.singularity.applyToCompany(LocationName.Sector12JoesGuns, JobField.employee);
      expect(ns.sleeve.setToCompanyWork(0, LocationName.Sector12JoesGuns)).toStrictEqual(true);
    },
    taskType: "COMPANY",
    isPlayerTask: false,
  },
  {
    action: () => expect(getNS().sleeve.setToCommitCrime(0, CrimeType.mug)).toStrictEqual(true),
    taskType: "CRIME",
    isPlayerTask: false,
  },
  {
    action: () =>
      expect(getNS().sleeve.setToFactionWork(0, FactionName.Sector12, FactionWorkType.hacking)).toStrictEqual(true),
    taskType: "FACTION",
    isPlayerTask: false,
  },
  {
    action: () => expect(getNS().sleeve.setToShockRecovery(0)).toStrictEqual(true),
    taskType: "RECOVERY",
    isPlayerTask: false,
  },
  {
    action: () => expect(getNS().sleeve.setToSynchronize(0)).toStrictEqual(true),
    taskType: "SYNCHRO",
    isPlayerTask: false,
  },
  {
    action: () =>
      expect(getNS().sleeve.setToBladeburnerAction(0, BladeburnerGeneralActionName.Training)).toStrictEqual(true),
    taskType: "BLADEBURNER",
    isPlayerTask: false,
  },
  {
    action: () =>
      expect(
        getNS().sleeve.setToBladeburnerAction(0, SpecialBladeburnerActionTypeForSleeve.InfiltrateSynthoids),
      ).toStrictEqual(true),
    taskType: "INFILTRATE",
    isPlayerTask: false,
  },
  {
    action: () =>
      expect(
        getNS().sleeve.setToBladeburnerAction(0, SpecialBladeburnerActionTypeForSleeve.SupportMainSleeve),
      ).toStrictEqual(true),
    taskType: "SUPPORT",
    isPlayerTask: false,
  },
  {
    action: () =>
      expect(
        getNS().sleeve.setToBladeburnerAction(
          0,
          SpecialBladeburnerActionTypeForSleeve.TakeOnContracts,
          BladeburnerContractName.Tracking,
        ),
      ).toStrictEqual(true),
    taskType: "BLADEBURNER",
    isPlayerTask: false,
  },
] as const;

function assertNoCurrentTask(): void {
  expect(Player.currentWork).toBeNull();
  expect(Player.sleeves[0].currentWork).toBeNull();
}

async function testNextCompletion(
  action: () => void,
  taskType: Task["type"] | SleeveTask["type"],
  isPlayerTask: boolean,
): Promise<void> {
  const ns = getNS();
  let isCompletable;
  let isRepeatable = false;
  switch (taskType) {
    case "CLASS":
      isCompletable = false;
      break;
    case "COMPANY":
      isCompletable = false;
      break;
    case "CREATE_PROGRAM":
      isCompletable = true;
      break;
    case "CRIME":
      isCompletable = true;
      isRepeatable = true;
      break;
    case "FACTION":
      isCompletable = false;
      break;
    case "GRAFTING":
      isCompletable = true;
      break;
    case "BLADEBURNER":
      isCompletable = true;
      isRepeatable = true;
      break;
    case "INFILTRATE":
      isCompletable = true;
      isRepeatable = true;
      break;
    case "RECOVERY":
      isCompletable = false;
      break;
    case "SUPPORT":
      isCompletable = false;
      break;
    case "SYNCHRO":
      isCompletable = false;
      break;
    default: {
      // Verify type switch statement is exhaustive
      const __a: never = taskType;
      throw new Error(`Invalid taskType: ${taskType}`);
    }
  }

  const processTask = async (cycles: number) => {
    if (isPlayerTask) {
      Player.processWork(cycles);
    } else {
      Player.sleeves[0].currentWork?.process(Player.sleeves[0], cycles);
    }
    // Yield to the microtask queue.
    await Promise.resolve();
  };

  const cancelTask = async () => {
    if (isPlayerTask) {
      ns.singularity.stopAction();
    } else {
      ns.sleeve.setToIdle(0);
    }
    // Yield to the microtask queue.
    await Promise.resolve();
  };

  const assertCurrentTask = () => {
    if (isPlayerTask) {
      expect(Player.currentWork).not.toBeNull();
    } else {
      expect(Player.sleeves[0].currentWork).not.toBeNull();
    }
  };

  let isResolved = false;
  const setUpNextCompletionPromise = () => {
    if (isPlayerTask) {
      void ns.singularity.getCurrentWork()?.nextCompletion.then(() => (isResolved = true));
    } else {
      void ns.sleeve.getTask(0)?.nextCompletion.then(() => (isResolved = true));
    }
  };

  assertNoCurrentTask();
  action();
  setUpNextCompletionPromise();
  expect(isResolved).toStrictEqual(false);

  // The current task should remain incomplete after 1 cycle.
  await processTask(1);
  assertCurrentTask();
  expect(isResolved).toStrictEqual(false);

  // Run many cycles to ensure all completable tasks are completed.
  await processTask(1e4);

  if (isCompletable) {
    // The nextCompletion promise should be resolved now.
    expect(isResolved).toStrictEqual(true);
    if (isRepeatable) {
      assertCurrentTask();
      // Create the promise again to verify cancellation.
      isResolved = false;
      setUpNextCompletionPromise();
    } else {
      assertNoCurrentTask();
      // Run the action again. We will cancel it later to verify cancellation.
      if (taskType !== "GRAFTING") {
        // Delete the completed program before creating it again.
        if (taskType === "CREATE_PROGRAM") {
          ns.rm(CompletedProgramName.bruteSsh);
        }
        action();
      } else {
        // Graft a different augmentation.
        ns.grafting.graftAugmentation(AugmentationName.BitWire);
      }
      // Create the promise again to verify cancellation.
      isResolved = false;
      setUpNextCompletionPromise();
    }
  }
  expect(isResolved).toStrictEqual(false);
  // Verify cancellation.
  await cancelTask();
  assertNoCurrentTask();
  expect(isResolved).toStrictEqual(true);
}

describe("nextCompletion", () => {
  beforeEach(() => {
    setupBasicTestingEnvironment();
    Player.sourceFiles.set(7, 3);
    Player.sourceFiles.set(10, 3);
    prestigeSourceFile(true);
    Player.money = 1e15;
    gainTonsOfExp();
    const ns = getNS();
    expect(ns.bladeburner.joinBladeburnerDivision()).toStrictEqual(true);
    if (!Player.bladeburner) {
      throw new Error("Bladeburner was not initialized");
    }
    Player.bladeburner.contracts[BladeburnerContractName.Tracking].count = 1e6;
    ns.singularity.checkFactionInvitations();
    expect(ns.singularity.joinFaction(FactionName.Sector12)).toStrictEqual(true);
    ns.sleeve.setToIdle(0);
  });
  test.each(nextCompletionTestCases)(
    "Task type: $taskType - Is player task: $isPlayerTask",
    async ({ action, taskType, isPlayerTask }) => {
      await testNextCompletion(action, taskType, isPlayerTask);
    },
  );
});
