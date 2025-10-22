import { generateMaze, getLabyrinthDetails, labData } from "../../../src/DarkNet/effects/labyrinth";
import { initGameEnvironment, setupBasicTestingEnvironment } from "../Utilities";
import { getDarkscapeNavigator } from "../../../src/DarkNet/effects/effects";
import { Player } from "@player";
import { DarknetState } from "../../../src/DarkNet/models/DarknetState";
import { populateDarknet } from "../../../src/DarkNet/controllers/NetworkGenerator";
import { SpecialServers } from "../../../src/Server/data/SpecialServers";
import { MAX_NET_DEPTH, NET_WIDTH } from "../../../src/DarkNet/Enums";
import type { DarknetServer } from "../../../src/Server/DarknetServer";
import { PlayerOwnedAugmentation } from "../../../src/Augmentation/PlayerOwnedAugmentation";

beforeAll(() => {
  initGameEnvironment();
  setupBasicTestingEnvironment({ purchasePServer: true, purchaseHacknetServer: true });
  getDarkscapeNavigator();
  Player.gainCharismaExp(1e100);
});

const setupEnvironment = (labAugCount: number, hasSf15Access = true) => {
  Player.sourceFiles.set(15, hasSf15Access ? 1 : 0);
  const augs = [
    labData[SpecialServers.NormalLab].augReward,
    labData[SpecialServers.CruelLab].augReward,
    labData[SpecialServers.MercilessLab].augReward,
    labData[SpecialServers.UberLab].augReward,
    labData[SpecialServers.EternalLab].augReward,
    labData[SpecialServers.FinalLab].augReward,
    labData[SpecialServers.BonusLab].augReward,
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
  /**
   *   NormalLab: "th3_l4byr1nth",
   *   CruelLab: "cru3l_l4byr1nth",
   *   MercilessLab: "m3rc1l3ss_l4byr1nth",
   *   UberLab: "ub3r_l4byr1nth",
   *   EternalLab: "et3rn4l_l4byr1nth",
   *   FinalLab: "f1n4l_l4byr1nth",
   *   BonusLab: "b0nus_l4byr1nth",
   */
  it("should not attach a lab if the player does not have SF15 access", () => {
    setupEnvironment(0, false);

    const labDetails = getLabyrinthDetails();
    expect(labDetails.name).toEqual("");
    expect(labDetails.lab).toBeNull();
    expect(labDetails.augReward).toBeNull();
  });
  it("should attach normal lab if the player has SF15 access and no lab augs", () => {
    setupEnvironment(0);

    const labDetails = getLabyrinthDetails();
    expect(labDetails.name).toEqual(SpecialServers.NormalLab);
    expect(labDetails.lab?.hostname).toEqual(SpecialServers.NormalLab);
    expect(labDetails.lab?.requiredCharismaSkill).toEqual(labData[SpecialServers.NormalLab].cha);
    expect(labDetails.augReward).toEqual(labData[SpecialServers.NormalLab].augReward);
  });
  it("should attach cruel lab if the player has SF15 access and normal lab aug", () => {
    setupEnvironment(1);

    const labDetails = getLabyrinthDetails();
    expect(labDetails.name).toEqual(SpecialServers.CruelLab);
    expect(labDetails.lab?.hostname).toEqual(SpecialServers.CruelLab);
    expect(labDetails.lab?.requiredCharismaSkill).toEqual(labData[SpecialServers.CruelLab].cha);
    expect(labDetails.augReward).toEqual(labData[SpecialServers.CruelLab].augReward);
  });
  it("should attach merciless lab if the player has SF15 access and cruel lab aug", () => {
    setupEnvironment(2);

    const labDetails = getLabyrinthDetails();
    expect(labDetails.name).toEqual(SpecialServers.MercilessLab);
    expect(labDetails.lab?.hostname).toEqual(SpecialServers.MercilessLab);
    expect(labDetails.lab?.requiredCharismaSkill).toEqual(labData[SpecialServers.MercilessLab].cha);
    expect(labDetails.augReward).toEqual(labData[SpecialServers.MercilessLab].augReward);
  });
  it("should attach uber lab if the player has SF15 access and merciless lab aug", () => {
    setupEnvironment(3);

    const labDetails = getLabyrinthDetails();
    expect(labDetails.name).toEqual(SpecialServers.UberLab);
    expect(labDetails.lab?.hostname).toEqual(SpecialServers.UberLab);
    expect(labDetails.lab?.requiredCharismaSkill).toEqual(labData[SpecialServers.UberLab].cha);
    expect(labDetails.augReward).toEqual(labData[SpecialServers.UberLab].augReward);
  });
  it("should attach eternal lab if the player has SF15 access and uber lab aug", () => {
    setupEnvironment(4);

    const labDetails = getLabyrinthDetails();
    expect(labDetails.name).toEqual(SpecialServers.EternalLab);
    expect(labDetails.lab?.hostname).toEqual(SpecialServers.EternalLab);
    expect(labDetails.lab?.requiredCharismaSkill).toEqual(labData[SpecialServers.EternalLab].cha);
    expect(labDetails.augReward).toEqual(labData[SpecialServers.EternalLab].augReward);
  });
  it("should attach final lab if the player has SF15 access and eternal lab aug", () => {
    setupEnvironment(5);

    const labDetails = getLabyrinthDetails();
    expect(labDetails.name).toEqual(SpecialServers.FinalLab);
    expect(labDetails.lab?.hostname).toEqual(SpecialServers.FinalLab);
    expect(labDetails.lab?.requiredCharismaSkill).toEqual(labData[SpecialServers.FinalLab].cha);
    expect(labDetails.augReward).toEqual(labData[SpecialServers.FinalLab].augReward);
  });
  it("should attach bonus lab if the player has SF15 access and final lab aug", () => {
    setupEnvironment(6);

    const labDetails = getLabyrinthDetails();
    expect(labDetails.name).toEqual(SpecialServers.BonusLab);
    expect(labDetails.lab?.hostname).toEqual(SpecialServers.BonusLab);
    expect(labDetails.lab?.requiredCharismaSkill).toEqual(labData[SpecialServers.BonusLab].cha);
    expect(labDetails.augReward).toEqual(labData[SpecialServers.BonusLab].augReward);
  });
});
