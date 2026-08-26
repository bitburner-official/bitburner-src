import type { OpponentStats, SimpleBoard } from "./Types";

import { GoOpponent } from "@enums";

export const opponentDetails = {
  [GoOpponent.none]: {
    komi: 5.5,
    description: "练习棋盘",
    flavorText: "在一个由你亲自放置黑白双方路由器的子网上练习，或执白与你的 IPvGO 脚本对战。",
    bonusDescription: "",
    bonusPower: 0,
  },
  [GoOpponent.Netburners]: {
    komi: 1.5,
    description: "简单 AI",
    flavorText:
      "Netburners 派系是一群神秘的势力，对本方子网的控制极为薄弱。他们主要专注于 Hacknet 服务器的生意，IPvGO 并非其强项。",
    bonusDescription: "Hacknet 产量提升",
    bonusPower: 1.3,
  },
  [GoOpponent.SlumSnakes]: {
    komi: 3.5,
    description: "扩张型 AI",
    flavorText:
      "Slum Snakes 派系是一个小规模的街头帮派，后来借助自己的子网走上了有组织犯罪的道路。他们以横贯子网的绵长路由器链条包围地盘而闻名。",
    bonusDescription: "犯罪成功率",
    bonusPower: 1.2,
  },
  [GoOpponent.TheBlackHand]: {
    komi: 3.5,
    description: "激进型 AI",
    flavorText:
      "The Black Hand 派系是一个黑帽黑客组织，利用自己的子网发起定向 DDOS 攻击。他们以毫不留情的激进而闻名，会把对手试图建立的任何据点围困绞杀。",
    bonusDescription: "黑客资金收益",
    bonusPower: 0.9,
  },
  [GoOpponent.Tetrads]: {
    komi: 5.5,
    description: "好斗型 AI",
    flavorText:
      "名为 Tetrads 的派系喜欢近身缠斗。无论是在子网之内还是之外，他们的战斗风格都擅长迂回包抄、切割穿插对手的阵线。",
    bonusDescription: "力量、防御、灵巧与敏捷等级",
    bonusPower: 0.7,
  },
  [GoOpponent.Daedalus]: {
    komi: 5.5,
    description: "中等 AI",
    flavorText:
      "关于这个隐秘的派系所知甚少。他们不会轻易放弃控制的子网，据说还会向其他派系出租 IPvGO 运算周期以换取声望。",
    bonusDescription: "声望获取",
    bonusPower: 1.1,
  },
  [GoOpponent.Illuminati]: {
    komi: 7.5,
    description: "困难 AI",
    flavorText:
      "人们认为 Illuminati 只存在于神话之中。据说他们总会在 IPvGO 子网中预先布下防备严密的防御。招惹他们后果自负。",
    bonusDescription: "更快的 hack()、grow() 和 weaken()",
    bonusPower: 0.7,
  },
  [GoOpponent.w0r1d_d43m0n]: {
    komi: 9.5,
    description: "???",
    flavorText: "你所见的一切只是真相的影子。现在是时候走出洞穴了。",
    bonusDescription: "黑客等级",
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
    rep: 0,
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
