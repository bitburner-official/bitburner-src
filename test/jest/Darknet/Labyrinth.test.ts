import {
  generateMaze,
  getLabAugReward,
  getLabMaze,
  getLabyrinthDetails,
  getSurroundingsVisualized,
  handleLabyrinthPassword,
  labData,
} from "../../../src/DarkNet/effects/labyrinth";
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
import { getAuthResult } from "../../../src/DarkNet/effects/authentication";
import { getMostRecentAuthLog } from "../../../src/DarkNet/models/packetSniffing";

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
    AugmentationName.TheStaff,
    AugmentationName.TheRedPill,
    AugmentationName.TheLaw,
    AugmentationName.TheSword,
    AugmentationName.TheThread,
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
    AugmentationName.TheStaff,
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

const isMazeSolvable = (maze: string[]): boolean => {
  const height = maze.length;
  const width = maze[0].length;
  const endX = width - 2;
  const endY = height - 2;
  const visited = Array.from({ length: height }, () => new Array<boolean>(width).fill(false));
  visited[1][1] = true;
  const roomQueue: Array<[number, number]> = [[1, 1]];
  const directions: Array<[number, number]> = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ];
  for (const [x, y] of roomQueue) {
    if (x === endX && y === endY) return true;
    for (const [dx, dy] of directions) {
      const newX = x + dx;
      const newY = y + dy;
      if (newX < 0 || newX >= width || newY < 0 || newY >= height) continue;
      if (visited[newY][newX]) continue;
      if (maze[newY][newX] !== " ") continue;
      visited[newY][newX] = true;
      roomQueue.push([newX, newY]);
    }
  }
  return false;
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

  it.each([
    [10, 10],
    [20, 14],
    [30, 20],
    [40, 26],
    [60, 40],
    [100, 80],
    [900, 800],
  ])("generates solvable %ix%i mazes with paths only on valid cells", (width, height) => {
    for (let trial = 0; trial < 10; trial++) {
      const maze = generateMaze(width, height);
      const hasInvalidPaths = maze.some((row, y) =>
        row.split("").some((cell, x) => cell === " " && x % 2 === 0 && y % 2 === 0),
      );
      expect(hasInvalidPaths).toBe(false);
      expect(isMazeSolvable(maze)).toBe(true);
    }
  });

  it("should grow the maze size with each additional Thread aug stack", () => {
    const sizesByLevel: Array<{ level: number; width: number; height: number }> = [];
    for (const level of [0, 1, 3, 7, 15, 21, 34]) {
      setupBN15Environment(7);
      if (level > 0) {
        const threadAug = new PlayerOwnedAugmentation(AugmentationName.TheThread);
        threadAug.level = level;
        Player.augmentations.push(threadAug);
      }
      DarknetState.labyrinth = null;
      DarknetState.labEndpoint = null;

      const maze = getLabMaze();
      sizesByLevel.push({ level, width: maze[0].length, height: maze.length });
    }

    for (let i = 1; i < sizesByLevel.length; i++) {
      expect(sizesByLevel[i].width).toBeGreaterThan(sizesByLevel[i - 1].width);
      expect(sizesByLevel[i].height).toBeGreaterThan(sizesByLevel[i - 1].height);
    }
  });

  it("should accept basic commands", () => {
    setupBN15Environment(0);
    const labDetails = getLabyrinthDetails();

    expect(labDetails.lab).not.toBeNull();
    if (labDetails.lab === null) return;

    const result = handleLabyrinthPassword("go north", labDetails.lab, -1);
    expect(result.message).toBe("You cannot go that way. You are still at 1,1.");

    const surroundings = result.data;
    const mazeData = getLabMaze();
    const mazeSurroundings = mazeData
      .slice(0, 3)
      .map((row) => row.slice(0, 3))
      .join("\n");
    // Add the player icon at (1,1)
    const expectedSurroundings = mazeSurroundings.slice(0, 5) + "@" + mazeSurroundings.slice(6, 11);
    expect(surroundings).toEqual(expectedSurroundings);
  });

  it("should give location for bad commands", () => {
    setupBN15Environment(0);
    const labDetails = getLabyrinthDetails();

    expect(labDetails.lab).not.toBeNull();
    if (labDetails.lab === null) return;

    const result = handleLabyrinthPassword("1234", labDetails.lab, -1);
    expect(result.message).toBe(`You don't know how to do that. Try a command such as "go north"`);

    const surroundings = result.data;
    const mazeData = getLabMaze();
    const mazeSurroundings = mazeData
      .slice(0, 3)
      .map((row) => row.slice(0, 3))
      .join("\n");
    // Add the player icon at (1,1)
    const expectedSurroundings = mazeSurroundings.slice(0, 5) + "@" + mazeSurroundings.slice(6, 11);
    expect(surroundings).toEqual(expectedSurroundings);
  });

  it("should give the new location after moving and log it", () => {
    setupBN15Environment(0);
    const labDetails = getLabyrinthDetails();

    expect(labDetails.lab).not.toBeNull();
    if (labDetails.lab === null) return;
    const mazeData = getLabMaze();
    const direction = mazeData[1][2] === " " ? "east" : "south";
    const [newX, newY] = direction === "east" ? [3, 1] : [1, 3];

    const result = getAuthResult(labDetails.lab, direction);
    expect(result.response.message).toBe(`You have moved to ${newX},${newY}.`);

    const surroundings = result.response.data;
    expect(surroundings).toEqual(getSurroundingsVisualized(mazeData, newX, newY, 1, true, true));

    const log = getMostRecentAuthLog(labDetails.name);
    expect(log).not.toBeNull();
    if (log === null) return;
    expect(log.message).toEqual(result.response.message);
    expect(log.data).toEqual(surroundings);
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
      expect(getLabAugReward()).toEqual(AugmentationName.TheStaff);
    });
    it("should attach eternal lab if the player has SF15 access and uber lab aug", () => {
      setupNonBN15Environment(4, true);
      const labDetails = getLabyrinthDetails();

      expect(labDetails.name).toEqual(SpecialServers.EternalLab);
      expect(labDetails.lab?.hostname).toEqual(SpecialServers.EternalLab);
      expect(labDetails.lab?.requiredCharismaSkill).toEqual(labData[SpecialServers.EternalLab].cha);
      expect(getLabAugReward()).toEqual(AugmentationName.TheLaw);
    });
    it("should attach endless lab if the player has SF15 access and endless lab aug", () => {
      setupNonBN15Environment(5, true);
      const labDetails = getLabyrinthDetails();

      expect(labDetails.name).toEqual(SpecialServers.EndlessLab);
      expect(labDetails.lab?.hostname).toEqual(SpecialServers.EndlessLab);
      expect(labDetails.lab?.requiredCharismaSkill).toEqual(labData[SpecialServers.EndlessLab].cha);
      expect(getLabAugReward()).toEqual(AugmentationName.TheSword);
    });
    it("should attach bonus lab, but not offer TRP, if the player has SF15 access and eternal lab aug, but the bitnode disables TRP in lab", () => {
      setupNonBN15Environment(6, true, false);
      const labDetails = getLabyrinthDetails();

      expect(labDetails.name).toEqual(SpecialServers.BonusLab);
      expect(labDetails.lab?.hostname).toEqual(SpecialServers.BonusLab);
      expect(labDetails.lab?.requiredCharismaSkill).toEqual(labData[SpecialServers.BonusLab].cha);
      expect(getLabAugReward()).toEqual(AugmentationName.NeuroFluxGovernor);
    });
    it("should attach bonus lab if the player has SF15 access and final lab aug", () => {
      setupNonBN15Environment(6, true, true);
      const labDetails = getLabyrinthDetails();

      expect(labDetails.name).toEqual(SpecialServers.FinalLab);
      expect(labDetails.lab?.hostname).toEqual(SpecialServers.FinalLab);
      expect(labDetails.lab?.requiredCharismaSkill).toEqual(labData[SpecialServers.FinalLab].cha);
      expect(getLabAugReward()).toEqual(AugmentationName.TheRedPill);
    });
    it("should attach bonus lab if the player has SF15 access and final lab aug", () => {
      setupNonBN15Environment(7, true, true);
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
      expect(getLabAugReward()).toEqual(AugmentationName.TheStaff);
    });
    it("should attach eternal lab if the player has SF15 access and uber lab aug", () => {
      setupBN15Environment(4);
      const labDetails = getLabyrinthDetails();

      expect(labDetails.name).toEqual(SpecialServers.EternalLab);
      expect(labDetails.lab?.hostname).toEqual(SpecialServers.EternalLab);
      expect(labDetails.lab?.requiredCharismaSkill).toEqual(labData[SpecialServers.EternalLab].cha);
      expect(getLabAugReward()).toEqual(AugmentationName.TheRedPill);
    });
    it("should attach endless lab if the player has SF15 access and endless lab aug", () => {
      setupBN15Environment(5);
      const labDetails = getLabyrinthDetails();

      expect(labDetails.name).toEqual(SpecialServers.EndlessLab);
      expect(labDetails.lab?.hostname).toEqual(SpecialServers.EndlessLab);
      expect(labDetails.lab?.requiredCharismaSkill).toEqual(labData[SpecialServers.EndlessLab].cha);
      expect(getLabAugReward()).toEqual(AugmentationName.TheLaw);
    });
    it("should attach final lab if the player has SF15 access and eternal lab aug", () => {
      setupBN15Environment(6);
      const labDetails = getLabyrinthDetails();

      expect(labDetails.name).toEqual(SpecialServers.FinalLab);
      expect(labDetails.lab?.hostname).toEqual(SpecialServers.FinalLab);
      expect(labDetails.lab?.requiredCharismaSkill).toEqual(labData[SpecialServers.FinalLab].cha);
      expect(getLabAugReward()).toEqual(AugmentationName.TheSword);
    });
    it("should attach bonus lab if the player has SF15 access and final lab aug", () => {
      setupBN15Environment(7);
      const labDetails = getLabyrinthDetails();

      expect(labDetails.name).toEqual(SpecialServers.BonusLab);
      expect(labDetails.lab?.hostname).toEqual(SpecialServers.BonusLab);
      expect(labDetails.lab?.requiredCharismaSkill).toEqual(labData[SpecialServers.BonusLab].cha);
      expect(getLabAugReward()).toEqual(AugmentationName.NeuroFluxGovernor);
    });
  });
});
