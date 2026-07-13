import { Player } from "@player";
import type { Person as IPerson, DarknetServerDetails } from "@nsdefs";
import { AugmentationName, CompletedProgramName, LiteratureName } from "@enums";
import {
  commonPasswordDictionary,
  notebookFileNames,
  packetSniffPhrases,
  passwordFileNames,
} from "../models/dictionaryData";
import { hintLiterature } from "../models/hintNotes";
import { resolveTextFilePath, type TextFilePath } from "../../Paths/TextFilePath";
import { moveDarknetServer } from "../controllers/NetworkMovement";
import { calculateIntelligenceBonus } from "../../PersonObjects/formulas/intelligence";
import { addSessionToServer, DarknetState, hasDarknetBonusTime } from "../models/DarknetState";
import { DarknetServer } from "../../Server/DarknetServer";
import { GenericResponseMessage, ModelIds, NET_WIDTH, ResponseCodeEnum } from "../Enums";
import { addCacheToServer } from "./cacheFiles";
import { populateDarknet } from "../controllers/NetworkGenerator";
import { type DarknetServerData, getDarknetServer } from "../utils/darknetServerUtils";
import {
  getAllMovableDarknetServers,
  getBackdooredDarknetServers,
  getNearbyNonEmptyPasswordServer,
  getStasisLinkServers,
} from "../utils/darknetNetworkUtils";
import { getTwoCharsInPassword } from "../utils/darknetAuthUtils";
import { getTorRouter } from "../../Server/ServerHelpers";
import { DarknetConstants } from "../Constants";
import { isLabyrinthServer } from "./labyrinth";
import { NetscriptContext } from "../../Netscript/APIWrapper";
import { helpers } from "../../Netscript/NetscriptHelpers";

export const handleSuccessfulAuth = (server: DarknetServer, threads: number, pid: number) => {
  Player.gainCharismaExp(calculatePasswordAttemptChaGain(server, threads, true));
  addSessionToServer(server, pid);

  if (server.hasAdminRights) return;

  server.hasAdminRights = true;
  addClue(server);

  const chance = 0.1 * 1.05 ** server?.difficulty;
  if (Math.random() < chance && !isLabyrinthServer(server.hostname) && server.maxRam) {
    addCacheToServer(server, false);
  }
};

export const handleFailedAuth = (server: DarknetServer, threads: number) => {
  Player.gainCharismaExp(calculatePasswordAttemptChaGain(server, threads, false));
};

/**
 * Returns the time it takes to authenticate on a server in milliseconds
 * @param darknetServerData - the target server to attempt a password on
 * @param person - the player's character
 * @param correctCharsInPassword - the number of correct characters in the password. Only used for TimingAttack servers, where it adds some small auth time delay per char
 * @param threads - the number of threads used for the password attempt (which speeds up the process)
 * @param linear - if true, the time scaling is linear with the number of threads instead of having diminishing returns
 */
export const calculateAuthenticationTime = (
  darknetServerData: DarknetServerData | DarknetServerDetails,
  person: IPerson = Player,
  threads = 1,
  correctCharsInPassword = 0,
  linear = false,
) => {
  const chaRequired = darknetServerData.requiredCharismaSkill;
  const difficulty = darknetServerData.difficulty;

  const baseDiff = (difficulty + 1) * 100;
  const diffFactor = 5;
  const baseTime = 850;

  const threadsFactor = 1 / (linear ? threads : 1 + 0.2 * (threads - 1));
  const skillFactor = (diffFactor * chaRequired + baseDiff) / (person.skills.charisma + 150);
  const backdoorFactor = getBackdoorAuthTimeDebuff();
  const applyUnderleveledFactor = person.skills.charisma <= chaRequired && darknetServerData.depth > 1;
  const underleveledFactor = applyUnderleveledFactor ? 1.5 + (chaRequired + 50) / (person.skills.charisma + 50) : 1;
  const hasBootsFactor = Player.hasAugmentation(AugmentationName.TheBoots) ? 0.8 : 1;
  const hasSf15_2Factor = Player.activeSourceFileLvl(15) > 2 ? 0.8 : 1;
  const intelligenceFactor = 1 / calculateIntelligenceBonus(person.skills.intelligence, 0.25);

  const time =
    baseTime *
    skillFactor *
    backdoorFactor *
    underleveledFactor *
    hasBootsFactor *
    hasSf15_2Factor *
    threadsFactor *
    intelligenceFactor;

  // Add extra time for timing attack server, per correct character
  const sharedChars = darknetServerData.modelId === ModelIds.TimingAttack ? correctCharsInPassword : 0;
  const sharedCharsExtraTime = sharedChars * 50 * threadsFactor;

  return time + sharedCharsExtraTime;
};

export const getBackdoorAuthTimeDebuff = () => {
  const backdooredServerCount = getBackdooredDarknetServers().length;
  const serverCount = getAllMovableDarknetServers().filter((s) => s.hasAdminRights).length;
  const safeBackdoors = Math.max(serverCount / (NET_WIDTH * 3), 2);
  const backdoorSurplus = Math.max(0, backdooredServerCount - safeBackdoors);

  return 1.07 ** backdoorSurplus;
};

/**
 * Returns a small multiplier based on charisma.
 * With scalar at 1 it gives ~1.2 at 2000 charisma and ~1.6 at 10000 charisma. Caps at 2.1 at infinite cha
 */
export const getMultiplierFromCharisma = (scalar = 1) => {
  const charisma = Player.skills.charisma;
  const growthRate = 0.0002; // Adjust this value to control the growth rate
  return (
    1 + (0.5 * (1 - Math.exp(-growthRate * charisma)) + 0.6 * (1 - Math.exp(-growthRate * 0.2 * charisma)) * scalar)
  );
};

export const calculatePasswordAttemptChaGain = (server: DarknetServerData, threads: number = 1, success = false) => {
  if (!server.maxRam) {
    return 0;
  }
  const baseXpGain = 2.5;
  const difficultyBase = 1.07;
  const xpGain = baseXpGain + difficultyBase ** server.difficulty;
  const alreadyHackedMult = server.hasAdminRights ? 0.2 : 1;
  const successMult = success && !server.hasAdminRights ? 10 : 1;
  const bonusTimeMult = hasDarknetBonusTime() ? 1.5 : 1;
  return xpGain * alreadyHackedMult * successMult * bonusTimeMult * threads * Player.mults.charisma_exp;
};

export const addClue = (server: DarknetServer): string[] => {
  if (!server.maxRam) {
    return [];
  }
  const files = [];
  // Basic mechanics hints
  if ((Math.random() < 0.7 && server.difficulty <= 3) || Math.random() < 0.1) {
    const hint: LiteratureName = hintLiterature[Math.floor(Math.random() * hintLiterature.length)];
    if (hint && !server.messages.includes(hint)) {
      server.messages.push(hint);
      files.push(hint);
    }
  }

  // some entries from the common password dictionary
  if (Math.random() < 0.1) {
    const length = 15;
    const hintFileName = getClueFileName(passwordFileNames);
    const start = Math.floor(Math.random() * (commonPasswordDictionary.length - length));
    const commonPasswords = commonPasswordDictionary.slice(start, start + length).join(", ");
    server.writeToTextFile(hintFileName, `Some common passwords include ${commonPasswords}`);
    files.push(hintFileName);
    return files;
  }

  // connected neighboring server's password (does not include server name)
  if (Math.random() < 0.1) {
    const passwordHintName = getClueFileName(passwordFileNames);
    const neighboringServerName = server.serversOnNetwork.find((s) => {
      const server = getDarknetServer(s);
      return server && !server.hasAdminRights && server.password;
    });
    const neighboringServer = neighboringServerName ? getDarknetServer(neighboringServerName) : null;
    if (neighboringServer) {
      server.writeToTextFile(passwordHintName, `Remember this password: ${neighboringServer.password}`);
      files.push(passwordHintName);
      return files;
    }
  }

  // non-connected nearby server's password (includes server name)
  if (Math.random() < 0.1) {
    const hintFileName = getClueFileName(passwordFileNames);
    const targetServer = getNearbyNonEmptyPasswordServer(server, true);
    if (targetServer) {
      const contents = `Server: ${targetServer.hostname} Password: "${targetServer.password}"`;
      server.writeToTextFile(hintFileName, contents);
      files.push(hintFileName);
      return files;
    }
  }

  if (Math.random() < 0.4) {
    const hintFileName = getClueFileName(notebookFileNames);
    const loreNote = packetSniffPhrases[Math.floor(Math.random() * packetSniffPhrases.length)];
    server.writeToTextFile(hintFileName, loreNote);
    files.push(hintFileName);
    return files;
  }

  if (Math.random() < 0.7) {
    const hintFileName = getClueFileName(passwordFileNames);
    const targetServer = getNearbyNonEmptyPasswordServer(server);
    if (targetServer) {
      const [containedChar1, containedChar2] = getTwoCharsInPassword(targetServer.password);
      const hint = `The password for ${targetServer.hostname} contains ${containedChar1} and ${containedChar2}`;
      server.writeToTextFile(hintFileName, hint);
      files.push(hintFileName);
      return files;
    }
  }
  return files;
};

export const getClueFileName = (fileNameList: readonly string[]): TextFilePath => {
  const filePath = resolveTextFilePath(
    fileNameList[Math.floor(Math.random() * fileNameList.length)] + DarknetConstants.DataFileSuffix,
  );
  if (!filePath) {
    throw new Error(`Invalid clue file name. fileNameList: ${fileNameList}`);
  }
  return filePath;
};

export const getDarknetVolatilityMult = (symbol: string) => {
  const charges = DarknetState.stockPromotions[symbol] ?? 0;
  const growthRate = 0.001;
  return 1 + (1 - Math.exp(-growthRate * charges) + 2 * (1 - Math.exp(-growthRate * 0.15 * charges)));
};

export const scaleDarknetVolatilityIncreases = (scalar: number) => {
  for (const symbol in DarknetState.stockPromotions) {
    if (DarknetState.stockPromotions[symbol] > 0) {
      DarknetState.stockPromotions[symbol] *= scalar;
    }
  }
};

export const getStasisLinkLimit = (): number => {
  const brokenWingLimitIncrease = Player.hasAugmentation(AugmentationName.TheBrokenWings) ? 1 : 0;
  const hammerLimitIncrease = Player.hasAugmentation(AugmentationName.TheHammer) ? 1 : 0;
  const staffLimitIncrease = Player.hasAugmentation(AugmentationName.TheStaff) ? 1 : 0;
  return 1 + brokenWingLimitIncrease + hammerLimitIncrease + staffLimitIncrease;
};

export const getSetStasisLinkDuration = (): number => {
  return (1000 / (Player.skills.charisma + 1000)) * 30_000;
};

export const setStasisLink = (ctx: NetscriptContext, server: DarknetServer, shouldLink: boolean) => {
  const stasisLinkCount = getStasisLinkServers().length;
  const stasisLinkLimit = getStasisLinkLimit();
  if (shouldLink && stasisLinkCount >= stasisLinkLimit) {
    helpers.log(ctx, () => `Stasis link limit reached. (${stasisLinkCount}/${stasisLinkLimit})`);
    return {
      success: false,
      code: ResponseCodeEnum.StasisLinkLimitReached,
      message: GenericResponseMessage.StasisLinkLimitReached,
    };
  }

  server.hasStasisLink = shouldLink;
  server.backdoorInstalled = shouldLink;
  const message = `Stasis link ${shouldLink ? "applied to" : "removed from"} server ${server.hostname}.`;
  helpers.log(ctx, () => `${message}. (${stasisLinkCount}/${stasisLinkLimit} links in use)`);
  return {
    success: true,
    code: ResponseCodeEnum.Success,
    message: GenericResponseMessage.Success,
  };
};

export const chargeServerMigration = (server: DarknetServer, threads = 1) => {
  const chargeIncrease = ((Player.skills.charisma + 500) / (server.difficulty * 200 + 1000)) * 0.01 * threads;
  const xpGained = Player.mults.charisma_exp * 5 * threads * server.difficulty;
  Player.gainCharismaExp(xpGained);
  const currentCharge = DarknetState.migrationInductionServers.get(server.hostname) ?? 0;
  const newCharge = Math.min(currentCharge + chargeIncrease, 1);
  DarknetState.migrationInductionServers.set(server.hostname, newCharge);
  const result = {
    chargeIncrease,
    newCharge: newCharge,
    xpGained: xpGained,
  };
  if (newCharge >= 1) {
    moveDarknetServer(server, 2, 4);
    DarknetState.migrationInductionServers.set(server.hostname, 0);
  }
  return result;
};

export const getDarkscapeNavigator = () => {
  if (!Player.hasTorRouter()) {
    getTorRouter();
  }
  const existingPrograms = Player.getHomeComputer().programs;
  if (!existingPrograms.includes(CompletedProgramName.darkscape)) {
    Player.getHomeComputer().pushProgram(CompletedProgramName.darkscape);
  }
  populateDarknet();
};

export const cctCooldownReached = () => {
  const timeSinceLastCCT = new Date().getTime() - DarknetState.lastCctRewardTime.getTime();
  return timeSinceLastCCT > 10 * 60 * 1000;
};

export const hasFullDarknetAccess = (): boolean => Player.bitNodeN === 15 || Player.activeSourceFileLvl(15) > 0;
