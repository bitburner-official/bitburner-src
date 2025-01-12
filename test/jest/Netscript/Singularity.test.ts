import { installAugmentations } from "../../../src/Augmentation/AugmentationHelpers";
import { blackOpsArray } from "../../../src/Bladeburner/data/BlackOperations";
import { AugmentationName } from "../../../src/Enums";
import { Player } from "../../../src/Player";
import { GetServerOrThrow } from "../../../src/Server/AllServers";
import { SpecialServers } from "../../../src/Server/data/SpecialServers";
import { getNS, initGameEnvironment, setupBasicTestingEnvironment } from "./Utilities";

function setNumBlackOpsComplete(value: number): void {
  if (!Player.bladeburner) {
    throw new Error("Invalid Bladeburner data");
  }
  Player.bladeburner.numBlackOpsComplete = value;
}

const nextBN = 3;

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
