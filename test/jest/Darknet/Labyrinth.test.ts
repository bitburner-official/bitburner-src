import { generateMaze, getLabAugReward, getLabyrinthDetails, labData } from "../../../src/DarkNet/effects/labyrinth";
import { initGameEnvironment, setupBasicTestingEnvironment } from "../Utilities";
import { getDarkscapeNavigator } from "../../../src/DarkNet/effects/effects";
import { Player } from "@player";
import { DarknetState } from "../../../src/DarkNet/models/DarknetState";
import { populateDarknet } from "../../../src/DarkNet/controllers/NetworkGenerator";
import { SpecialServers } from "../../../src/Server/data/SpecialServers";
import { MAX_NET_DEPTH, NET_WIDTH } from "../../../src/DarkNet/Enums";
import type { DarknetServer } from "../../../src/Server/DarknetServer";
import { PlayerOwnedAugmentation } from "../../../src/Augmentation/PlayerOwnedAugmentation";
import { AugmentationName } from "@enums";

beforeAll(() => {
  initGameEnvironment();
  setupBasicTestingEnvironment({ purchasePServer: true, purchaseHacknetServer: true });
  getDarkscapeNavigator();
  Player.gainCharismaExp(1e100);
});

const setupBN15Environment = (labAugCount: number) => {
  Player.bitNodeN = 15;
  const augs = [
    AugmentationName.TheBrokenWings,
    AugmentationName.TheBoots,
    AugmentationName.TheHammer,
    AugmentationName.TheRedPill,
    AugmentationName.TheLaw,
    AugmentationName.TheSword,
    AugmentationName.NeuroFluxGovernor,
  ];

  Player.augmentations = augs.slice(0, labAugCount).map((aug) => new PlayerOwnedAugmentation(aug));

  DarknetState.Network = new Array(MAX_NET_DEPTH)
    .fill(null)
    .map(() => new Array<DarknetServer | null>(NET_WIDTH).fill(null));
  populateDarknet();
};

const setupNonBN15Environment = (labAugCount: number, hasSf15 = false, allowTRPInLab = true) => {
  Player.sourceFiles.set(15, hasSf15 ? 1 : 0);
  Player.bitNodeN = allowTRPInLab ? 1 : 8;
  const augs = [
    AugmentationName.TheBrokenWings,
    AugmentationName.TheBoots,
    AugmentationName.TheHammer,
    AugmentationName.TheLaw,
    AugmentationName.TheSword,
    AugmentationName.TheRedPill,
    AugmentationName.NeuroFluxGovernor,
  ];

  for (let i = 0; i < labAugCount; i++) {
    Player.augmentations.push(new PlayerOwnedAugmentation(augs[i]));
  }

  DarknetState.Network = new Array(MAX_NET_DEPTH)
    .fill(null)
    .map(() => new Array<DarknetServer | null>(NET_WIDTH).fill(null));
  populateDarknet();
};

describe("Labyrinth Tests", () => {
  it("should create a maze with the correct size", () => {
    const width = 30;
    const height = 20;
    const maze = generateMaze(width, height);

    // console.log(
    //   maze
    //     .map((row) =>
    //       row
    //         .split("")
    //         .map((x) => `${x}${x}`)
    //         .join(""),
    //     )
    //     .join("\n"),
    // );

    // console.log(getSurroundingsVisualized(maze, 1, 1));

    expect(maze).toHaveLength(height + 1);
    expect(maze[0]).toHaveLength(width - 1);
  });

  describe("non-bitnode 15 lab tests", () => {
    it("should not attach a lab if the player does not have SF15 access", () => {
      setupNonBN15Environment(0, false);
      const labDetails = getLabyrinthDetails();

      expect(labDetails.name).toEqual("");
      expect(labDetails.lab).toBeNull();
    });
    it("should attach normal lab if the player has SF15 access and no lab augs", () => {
      setupNonBN15Environment(0, true);
      const labDetails = getLabyrinthDetails();

      expect(labDetails.name).toEqual(SpecialServers.NormalLab);
      expect(labDetails.lab?.hostname).toEqual(SpecialServers.NormalLab);
      expect(labDetails.lab?.requiredCharismaSkill).toEqual(labData[SpecialServers.NormalLab].cha);
      expect(getLabAugReward()).toEqual(AugmentationName.TheBrokenWings);
    });
    it("should attach cruel lab if the player has SF15 access and normal lab aug", () => {
      setupNonBN15Environment(1, true);
      const labDetails = getLabyrinthDetails();

      expect(labDetails.name).toEqual(SpecialServers.CruelLab);
      expect(labDetails.lab?.hostname).toEqual(SpecialServers.CruelLab);
      expect(labDetails.lab?.requiredCharismaSkill).toEqual(labData[SpecialServers.CruelLab].cha);
      expect(getLabAugReward()).toEqual(AugmentationName.TheBoots);
    });
    it("should attach merciless lab if the player has SF15 access and cruel lab aug", () => {
      setupNonBN15Environment(2, true);
      const labDetails = getLabyrinthDetails();

      expect(labDetails.name).toEqual(SpecialServers.MercilessLab);
      expect(labDetails.lab?.hostname).toEqual(SpecialServers.MercilessLab);
      expect(labDetails.lab?.requiredCharismaSkill).toEqual(labData[SpecialServers.MercilessLab].cha);
      expect(getLabAugReward()).toEqual(AugmentationName.TheHammer);
    });
    it("should attach uber lab if the player has SF15 access and merciless lab aug", () => {
      setupNonBN15Environment(3, true);
      const labDetails = getLabyrinthDetails();

      expect(labDetails.name).toEqual(SpecialServers.UberLab);
      expect(labDetails.lab?.hostname).toEqual(SpecialServers.UberLab);
      expect(labDetails.lab?.requiredCharismaSkill).toEqual(labData[SpecialServers.UberLab].cha);
      expect(getLabAugReward()).toEqual(AugmentationName.TheLaw);
    });
    it("should attach eternal lab if the player has SF15 access and uber lab aug", () => {
      setupNonBN15Environment(4, true);
      const labDetails = getLabyrinthDetails();

      expect(labDetails.name).toEqual(SpecialServers.EternalLab);
      expect(labDetails.lab?.hostname).toEqual(SpecialServers.EternalLab);
      expect(labDetails.lab?.requiredCharismaSkill).toEqual(labData[SpecialServers.EternalLab].cha);
      expect(getLabAugReward()).toEqual(AugmentationName.TheSword);
    });
    it("should attach bonus lab, but not offer TRP, if the player has SF15 access and eternal lab aug, but the bitnode disables TRP in lab", () => {
      setupNonBN15Environment(5, true, false);
      const labDetails = getLabyrinthDetails();

      expect(labDetails.name).toEqual(SpecialServers.BonusLab);
      expect(labDetails.lab?.hostname).toEqual(SpecialServers.BonusLab);
      expect(labDetails.lab?.requiredCharismaSkill).toEqual(labData[SpecialServers.BonusLab].cha);
      expect(getLabAugReward()).toEqual(AugmentationName.NeuroFluxGovernor);
    });
    it("should attach bonus lab if the player has SF15 access and final lab aug", () => {
      setupNonBN15Environment(5, true, true);
      const labDetails = getLabyrinthDetails();

      expect(labDetails.name).toEqual(SpecialServers.FinalLab);
      expect(labDetails.lab?.hostname).toEqual(SpecialServers.FinalLab);
      expect(labDetails.lab?.requiredCharismaSkill).toEqual(labData[SpecialServers.FinalLab].cha);
      expect(getLabAugReward()).toEqual(AugmentationName.TheRedPill);
    });
    it("should attach bonus lab if the player has SF15 access and final lab aug", () => {
      setupNonBN15Environment(6, true, true);
      const labDetails = getLabyrinthDetails();

      expect(labDetails.name).toEqual(SpecialServers.BonusLab);
      expect(labDetails.lab?.hostname).toEqual(SpecialServers.BonusLab);
      expect(labDetails.lab?.requiredCharismaSkill).toEqual(labData[SpecialServers.BonusLab].cha);
      expect(getLabAugReward()).toEqual(AugmentationName.NeuroFluxGovernor);
    });
  });

  describe("bitnode 15 lab tests", () => {
    it("should attach normal lab if the player has SF15 access and no lab augs", () => {
      setupBN15Environment(0);
      const labDetails = getLabyrinthDetails();

      expect(labDetails.name).toEqual(SpecialServers.NormalLab);
      expect(labDetails.lab?.hostname).toEqual(SpecialServers.NormalLab);
      expect(labDetails.lab?.requiredCharismaSkill).toEqual(labData[SpecialServers.NormalLab].cha);
      expect(getLabAugReward()).toEqual(AugmentationName.TheBrokenWings);
    });
    it("should attach cruel lab if the player has SF15 access and normal lab aug", () => {
      setupBN15Environment(1);
      const labDetails = getLabyrinthDetails();

      expect(labDetails.name).toEqual(SpecialServers.CruelLab);
      expect(labDetails.lab?.hostname).toEqual(SpecialServers.CruelLab);
      expect(labDetails.lab?.requiredCharismaSkill).toEqual(labData[SpecialServers.CruelLab].cha);
      expect(getLabAugReward()).toEqual(AugmentationName.TheBoots);
    });
    it("should attach merciless lab if the player has SF15 access and cruel lab aug", () => {
      setupBN15Environment(2);
      const labDetails = getLabyrinthDetails();

      expect(labDetails.name).toEqual(SpecialServers.MercilessLab);
      expect(labDetails.lab?.hostname).toEqual(SpecialServers.MercilessLab);
      expect(labDetails.lab?.requiredCharismaSkill).toEqual(labData[SpecialServers.MercilessLab].cha);
      expect(getLabAugReward()).toEqual(AugmentationName.TheHammer);
    });
    it("should attach uber lab if the player has SF15 access and merciless lab aug", () => {
      setupBN15Environment(3);
      const labDetails = getLabyrinthDetails();

      expect(labDetails.name).toEqual(SpecialServers.UberLab);
      expect(labDetails.lab?.hostname).toEqual(SpecialServers.UberLab);
      expect(labDetails.lab?.requiredCharismaSkill).toEqual(labData[SpecialServers.UberLab].cha);
      expect(getLabAugReward()).toEqual(AugmentationName.TheRedPill);
    });
    it("should attach eternal lab if the player has SF15 access and uber lab aug", () => {
      setupBN15Environment(4);
      const labDetails = getLabyrinthDetails();

      expect(labDetails.name).toEqual(SpecialServers.EternalLab);
      expect(labDetails.lab?.hostname).toEqual(SpecialServers.EternalLab);
      expect(labDetails.lab?.requiredCharismaSkill).toEqual(labData[SpecialServers.EternalLab].cha);
      expect(getLabAugReward()).toEqual(AugmentationName.TheLaw);
    });
    it("should attach final lab if the player has SF15 access and eternal lab aug", () => {
      setupBN15Environment(5);
      const labDetails = getLabyrinthDetails();

      expect(labDetails.name).toEqual(SpecialServers.FinalLab);
      expect(labDetails.lab?.hostname).toEqual(SpecialServers.FinalLab);
      expect(labDetails.lab?.requiredCharismaSkill).toEqual(labData[SpecialServers.FinalLab].cha);
      expect(getLabAugReward()).toEqual(AugmentationName.TheSword);
    });
    it("should attach bonus lab if the player has SF15 access and final lab aug", () => {
      setupBN15Environment(6);
      const labDetails = getLabyrinthDetails();

      expect(labDetails.name).toEqual(SpecialServers.BonusLab);
      expect(labDetails.lab?.hostname).toEqual(SpecialServers.BonusLab);
      expect(labDetails.lab?.requiredCharismaSkill).toEqual(labData[SpecialServers.BonusLab].cha);
      expect(getLabAugReward()).toEqual(AugmentationName.NeuroFluxGovernor);
    });
  });
});
