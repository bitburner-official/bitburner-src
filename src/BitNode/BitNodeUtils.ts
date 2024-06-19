import { Player } from "@player";
import { type BitNodeOptions } from "@nsdefs";
import { GetServer } from "../Server/AllServers";
import { Server } from "../Server/Server";
import { SpecialServers } from "../Server/data/SpecialServers";
import { JSONMap } from "../Types/Jsonable";

export const validBitNodes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

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
  return Player.bitNodeOptions.activeSourceFiles.size > 0;
}

export function getDefaultBitNodeOptions(): BitNodeOptions {
  return {
    activeSourceFiles: new Map(Player.sourceFiles),
    restrictHomePCUpgrade: false,
    disableGang: false,
    disableCorporation: false,
    disableBladeburner: false,
    disable4SData: false,
    disableHacknetServer: false,
    disableSleeveExpAndAugmentation: false,
  };
}

export function validateActiveSourceFiles(activeSourceFiles: Map<number, number>): {
  valid: boolean;
  message?: string;
} {
  for (const [sfNumber, sfLevel] of activeSourceFiles.entries()) {
    if (!validBitNodes.includes(sfNumber)) {
      return { valid: false, message: `Invalid BitNode: ${sfNumber}.` };
    }
    const maxSfLevel = Player.sourceFileLvl(sfNumber);
    if (sfLevel > maxSfLevel) {
      return { valid: false, message: `Invalid SF level: ${sfLevel}. Max level: ${maxSfLevel}.` };
    }
  }
  return { valid: true };
}

export function setBitNodeOptions(bitNodeOptions: BitNodeOptions): void {
  const validationResultForActiveSourceFiles = validateActiveSourceFiles(bitNodeOptions.activeSourceFiles);
  if (!validationResultForActiveSourceFiles.valid) {
    throw new Error(`activeSourceFiles is invalid. Reason: ${validationResultForActiveSourceFiles.message}`);
  }

  Player.bitNodeOptions.activeSourceFiles = new JSONMap(bitNodeOptions.activeSourceFiles);
  Player.bitNodeOptions.restrictHomePCUpgrade = bitNodeOptions.restrictHomePCUpgrade;
  Player.bitNodeOptions.disableGang = bitNodeOptions.disableGang;
  Player.bitNodeOptions.disableCorporation = bitNodeOptions.disableCorporation;
  Player.bitNodeOptions.disableBladeburner = bitNodeOptions.disableBladeburner;
  Player.bitNodeOptions.disable4SData = bitNodeOptions.disable4SData;
  Player.bitNodeOptions.disableHacknetServer = bitNodeOptions.disableHacknetServer;
  Player.bitNodeOptions.disableSleeveExpAndAugmentation = bitNodeOptions.disableSleeveExpAndAugmentation;
}
