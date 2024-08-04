import type { OpponentStats, SimpleBoard } from "./Types";

import { GoOpponent } from "@enums";

export const opponentDetails = {
  [GoOpponent.none]: {
    komi: 5.5,
    description: "Practice Board",
    flavorText:
      "Practice on a subnet where you place both colors of routers, or play as white against your IPvGO script.",
    bonusDescription: "",
    bonusPower: 0,
  },
  [GoOpponent.Netburners]: {
    komi: 1.5,
    description: "Easy AI",
    flavorText:
      "The Netburners faction are a mysterious group with only the most tenuous control over their subnets. Concentrating mainly on their hacknet server business, IPvGO is not their main strength.",
    bonusDescription: "increased hacknet production",
    bonusPower: 1.3,
  },
  [GoOpponent.SlumSnakes]: {
    komi: 3.5,
    description: "Spread AI",
    flavorText:
      "The Slum Snakes faction are a small-time street gang who turned to organized crime using their subnets. They are known to use long router chains snaking across the subnet to encircle territory.",
    bonusDescription: "crime success rate",
    bonusPower: 1.2,
  },
  [GoOpponent.TheBlackHand]: {
    komi: 3.5,
    description: "Aggro AI",
    flavorText:
      "The Black Hand faction is a black-hat hacking group who uses their subnets to launch targeted DDOS attacks. They are famous for their unrelenting aggression, surrounding and strangling any foothold their opponents try to establish.",
    bonusDescription: "hacking money",
    bonusPower: 0.9,
  },
  [GoOpponent.Tetrads]: {
    komi: 5.5,
    description: "Martial AI",
    flavorText:
      "The faction known as Tetrads prefers to get up close and personal. Their combat style excels at circling around and cutting through their opponents, both on and off of the subnets.",
    bonusDescription: "strength, defense, dexterity, and agility levels",
    bonusPower: 0.7,
  },
  [GoOpponent.Daedalus]: {
    komi: 5.5,
    description: "Mid AI",
    flavorText:
      "Not much is known about this shadowy faction. They do not easily let go of subnets that they control, and are known to lease IPvGO cycles in exchange for reputation among other factions.",
    bonusDescription: "reputation gain",
    bonusPower: 1.1,
  },
  [GoOpponent.Illuminati]: {
    komi: 7.5,
    description: "Hard AI",
    flavorText:
      "The Illuminati are thought to only exist in myth. Said to always have prepared defenses in their IPvGO subnets. Provoke them at your own risk.",
    bonusDescription: "faster hack(), grow(), and weaken()",
    bonusPower: 0.7,
  },
  [GoOpponent.w0r1d_d43m0n]: {
    komi: 9.5,
    description: "???",
    flavorText: "What you have seen is only the shadow of the truth. It's time to leave the cave.",
    bonusDescription: "hacking level",
    bonusPower: 2,
  },
};

export const boardSizes = [5, 7, 9, 13, 19];

export const columnIndexes = "ABCDEFGHJKLMNOPQRSTUVWXYZ";

export function newOpponentStats(): OpponentStats {
  return {
    wins: 0,
    losses: 0,
    nodes: 0,
    nodePower: 0,
    winStreak: 0,
    oldWinStreak: 0,
    highestWinStreak: 0,
    favor: 0,
  };
}

export const bitverseBoardShape: SimpleBoard = [
  "########...########",
  "######.#...#.######",
  "###.#..#...#..#.###",
  ".#..#..#...#..#..#.",
  ".#.....#...#.....#.",
  "...................",
  "...................",
  "...................",
  "...................",
  ".....##.....##.....",
  "....###.....###....",
  "....##.......##....",
  "....#.........#....",
  ".........#.........",
  "#........#........#",
  "##.......#.......##",
  "##.......#.......##",
  "###.............###",
  "####...........####",
];
