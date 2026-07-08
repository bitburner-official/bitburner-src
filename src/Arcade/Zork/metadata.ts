import zork1Url from "./games/zork1.z3";
import zork2Url from "./games/zork2.z3";
import zork3Url from "./games/zork3.z3";

export interface ZorkGame {
  key: "zork1" | "zork2" | "zork3";
  title: string;
  url: string;
}

export const ZorkGames: ZorkGame[] = [
  { key: "zork1", title: "Zork I: The Great Underground Empire", url: zork1Url },
  { key: "zork2", title: "Zork II: The Wizard of Frobozz", url: zork2Url },
  { key: "zork3", title: "Zork III: The Dungeon Master", url: zork3Url },
];
