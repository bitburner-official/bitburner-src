import { Player } from "@player";
import { PlayerObject } from "../../PersonObjects/Player/PlayerObject";

interface SpoilerCondition {
  title: string;
  isSpoiler(p: PlayerObject): boolean;
}
const spoilers: SpoilerCondition[] = [
  {
    title: "advance/bitnodes.md",
    isSpoiler: (p: PlayerObject): boolean => p.sourceFiles.size === 0,
  },
  {
    title: "advance/grafting.md",
    isSpoiler: (p: PlayerObject): boolean => p.sourceFileLvl(10) === 0 && p.bitNodeN != 10,
  },
  {
    title: "advance/intelligence.md",
    isSpoiler: (p: PlayerObject): boolean => p.skills.intelligence === 0,
  },
  {
    title: "advance/sleeves.md",
    isSpoiler: (p: PlayerObject): boolean => p.sleeves.length === 0,
  },
  {
    title: "advance/sourcefiles.md",
    isSpoiler: (p: PlayerObject): boolean => p.sourceFiles.size === 0,
  },
];

export const isSpoiler = (title: string): boolean =>
  spoilers.find((s) => s.title === title)?.isSpoiler(Player) ?? false;
