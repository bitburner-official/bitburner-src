import { Player } from "@player";
import { type BitNodeOptions } from "@nsdefs";
import { GetServer } from "../Server/AllServers";
import { Server } from "../Server/Server";
import { SpecialServers } from "../Server/data/SpecialServers";
import { JSONMap } from "../Types/Jsonable";
import { validBitNodes } from "./Constants";

export function isBitNodeFinished(): boolean {
  const wd = GetServer(SpecialServers.WorldDaemon);
  if (!(wd instanceof Server)) {
    throw new Error("WorldDaemon is not a normal server. This is a bug. Please contact developers.");
  }
  return wd.backdoorInstalled;
}

export function canAccessBitNodeFeature(bitNode: number): boolean {
  return Player.bitNodeN === bitNode || Player.activeSourceFileLvl(bitNode) > 0;
}

export function knowAboutBitverse(): boolean {
  for (const sfActiveLevel of Player.activeSourceFiles.values()) {
    if (sfActiveLevel > 0) {
      return true;
    }
  }
  return false;
}

export function getDefaultBitNodeOptions(): BitNodeOptions {
  return {
    sourceFileOverrides: new JSONMap<number, number>(),
    intelligenceOverride: undefined,
    restrictHomePCUpgrade: false,
    disableGang: false,
    disableCorporation: false,
    disableBladeburner: false,
    disable4SData: false,
    disableHacknetServer: false,
    disableSleeveExpAndAugmentation: false,
  };
}

export function validateSourceFileOverrides(
  sourceFileOverrides: Map<number, number>,
  isDataFromPlayer: boolean,
): {
  valid: boolean;
  message?: string;
} {
  if (!isDataFromPlayer && !(sourceFileOverrides instanceof JSONMap)) {
    return { valid: false, message: `It must be a JSONMap.` };
  }
  for (const [sfNumber, sfLevel] of sourceFileOverrides.entries()) {
    if (!validBitNodes.includes(sfNumber)) {
      return { valid: false, message: `Invalid BitNode: ${sfNumber}.` };
    }
    if (!Number.isFinite(sfLevel)) {
      return { valid: false, message: `Invalid SF level: ${sfLevel}.` };
    }
    const maxSfLevel = Player.sourceFileLvl(sfNumber);
    if (sfLevel > maxSfLevel) {
      return { valid: false, message: `Invalid SF level: ${sfLevel}. Max level: ${maxSfLevel}.` };
    }
  }
  return { valid: true };
}

export function setBitNodeOptions(bitNodeOptions: BitNodeOptions): void {
  const validationResultForSourceFileOverrides = validateSourceFileOverrides(bitNodeOptions.sourceFileOverrides, false);
  if (!validationResultForSourceFileOverrides.valid) {
    throw new Error(`sourceFileOverrides is invalid. Reason: ${validationResultForSourceFileOverrides.message}`);
  }
  if (
    bitNodeOptions.intelligenceOverride !== undefined &&
    (!Number.isInteger(bitNodeOptions.intelligenceOverride) || bitNodeOptions.intelligenceOverride < 0)
  ) {
    throw new Error(`intelligenceOverride is invalid. It must be a non-negative integer.`);
  }

  Object.assign(Player.bitNodeOptions, bitNodeOptions);
}

/**
 * This function only sets the backdoorInstalled flag of the WD server. The caller must call Router.toPage() to route
 * the UI to the BitVerse page. Importing Router from src\ui\GameRoot.tsx brings too many unnecessary dependencies to
 * this utility file.
 */
export function finishBitNode() {
  const wd = GetServer(SpecialServers.WorldDaemon);
  if (!(wd instanceof Server)) {
    throw new Error("WorldDaemon is not a normal server. This is a bug. Please contact developers.");
  }
  wd.backdoorInstalled = true;
}
