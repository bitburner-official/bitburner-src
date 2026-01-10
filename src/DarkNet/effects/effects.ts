import { Player } from "@player";
import type { DarknetServerData, Person as IPerson } from "@nsdefs";
import { AugmentationName, CompletedProgramName, LiteratureName } from "@enums";
import { generateContract } from "../../CodingContract/ContractGenerator";
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
import { ModelIds, NET_WIDTH } from "../Enums";
import { addCacheToServer } from "./cacheFiles";
import { populateDarknet } from "../controllers/NetworkGenerator";
import { getDarknetServer } from "../utils/darknetServerUtils";
import {
  getAllMovableDarknetServers,
  getBackdooredDarkwebServers,
  getNearbyNonEmptyPasswordServer,
} from "../utils/darknetNetworkUtils";
import { getSharedChars, getTwoCharsInPassword } from "../utils/darknetAuthUtils";
import { getTorRouter } from "../../Server/ServerHelpers";
import { DarknetConstants } from "../Constants";
import { GetServer } from "../../Server/AllServers";
import { isLabyrinthServer } from "./labyrinth";
import { CONSTANTS } from "../../Constants";

export const handleSuccessfulAuth = (server: DarknetServer, threads: number, pid: number) => {
  Player.gainCharismaExp(calculatePasswordAttemptChaGain(server, threads, true));
  addSessionToServer(server, pid);

  if (server.hasAdminRights) return;

  server.hasAdminRights = true;
  addClue(server);

  // TODO: balance coding contract chance
  if (Math.random() < 0.1 && server.difficulty > 2) {
    generateContract({ server: server.hostname });
  }

  // TODO: balance cache chance
  const chance = 0.1 * 1.05 ** server?.difficulty;
  if (Math.random() < chance && !isLabyrinthServer(server.hostname)) {
    addCacheToServer(server);
  }
};

export const handleFailedAuth = (server: DarknetServer, threads: number) => {
  // TODO: chance to sever connection or crash script
  Player.gainCharismaExp(calculatePasswordAttemptChaGain(server, threads, false));
};

/**
 * Returns the time it takes to authenticate on a server in milliseconds
 * @param darknetServerData - the target server to attempt a password on
 * @param person - the player's character
 * @param attemptedPassword - the password being attempted
 * @param threads - the number of threads used for the password attempt (which speeds up the process)
 */
export const calculateAuthenticationTime = (
  darknetServerData: DarknetServerData,
  person: IPerson = Player,
  threads = 1,
  attemptedPassword = "",
) => {
  const chaRequired = darknetServerData.requiredCharismaSkill;
  const difficulty = darknetServerData.difficulty;

  const baseDiff = (difficulty + 1) * 100;
  const diffFactor = 5;
  const baseTime = 500;

  const threadsFactor = 1 / (1 + 0.2 * (threads - 1));
  const skillFactor = (diffFactor * chaRequired + baseDiff) / (person.skills.charisma + 100);
  const noobFactor = Math.min(0.5 + difficulty / 4, 1);
  const backdoorFactor = getBackdoorAuthTimeDebuff();
  const underleveledFactor =
    person.skills.charisma >= chaRequired ? 1 : 1.5 + (chaRequired + 50) / (person.skills.charisma + 50);
  const hasBootsFactor = Player.hasAugmentation(AugmentationName.TheBoots) ? 0.8 : 1;
  const hasSf15_2Factor = Player.activeSourceFileLvl(15) > 2 ? 0.8 : 1;
  const bonusTimeFactor = hasDarknetBonusTime() ? 0.75 : 1;

  const time =
    baseTime *
    skillFactor *
    noobFactor *
    backdoorFactor *
    underleveledFactor *
    hasBootsFactor *
    hasSf15_2Factor *
    bonusTimeFactor *
    threadsFactor;

  // We need to call GetServer and check if it's a dnet server later because this function can be called by formulas
  // APIs (darknetServerData.hostname may be an invalid hostname).
  const server = GetServer(darknetServerData.hostname);
  const password = server instanceof DarknetServer ? server.password : "";
  // Add extra time for timing attack server, per correct character
  const sharedChars =
    darknetServerData.modelId === ModelIds.TimingAttack ? getSharedChars(password, attemptedPassword) : 0;
  const sharedCharsExtraTime = sharedChars * 150;

  return time * calculateIntelligenceBonus(person.skills.intelligence, 0.25) + sharedCharsExtraTime;
};

export const getBackdoorAuthTimeDebuff = () => {
  const backdooredServerCount = getBackdooredDarkwebServers().length;
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

// TODO: balance xp gain
export const calculatePasswordAttemptChaGain = (server: DarknetServerData, threads: number = 1, success = false) => {
  const baseXpGain = 3;
  const difficultyBase = 1.12;
  const xpGain = baseXpGain + difficultyBase ** server.difficulty;
  const alreadyHackedMult = server.hasAdminRights ? 0.2 : 1;
  const successMult = success && !server.hasAdminRights ? 10 : 1;
  const bonusTimeMult = hasDarknetBonusTime() ? 1.5 : 1;
  return xpGain * alreadyHackedMult * successMult * bonusTimeMult * threads * Player.mults.charisma_exp;
};

// TODO: balance password clue spawn rate
export const addClue = (server: DarknetServer) => {
  // Basic mechanics hints
  if ((Math.random() < 0.7 && server.difficulty <= 3) || Math.random() < 0.1) {
    const hint: LiteratureName = hintLiterature[Math.floor(Math.random() * hintLiterature.length)];
    if (hint) {
      server.messages.push(hint);
    }
  }

  // some entries from the common password dictionary
  if (Math.random() < 0.1) {
    const length = 15;
    const hintFileName = getClueFileName(passwordFileNames);
    const start = Math.floor(Math.random() * (commonPasswordDictionary.length - length));
    const commonPasswords = commonPasswordDictionary.slice(start, start + length).join(", ");
    server.writeToTextFile(hintFileName, `Some common passwords include ${commonPasswords}`);
    return;
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
      return;
    }
  }

  // non-connected nearby server's password (includes server name)
  if (Math.random() < 0.1) {
    const hintFileName = getClueFileName(passwordFileNames);
    const targetServer = getNearbyNonEmptyPasswordServer(server, true);
    if (targetServer) {
      const contents = `Server: ${targetServer.hostname} Password: "${targetServer.password}"`;
      server.writeToTextFile(hintFileName, contents);
      return;
    }
  }

  if (Math.random() < 0.4) {
    const hintFileName = getClueFileName(notebookFileNames);
    const loreNote = packetSniffPhrases[Math.floor(Math.random() * packetSniffPhrases.length)];
    server.writeToTextFile(hintFileName, loreNote);
    return;
  }

  if (Math.random() < 0.7) {
    const hintFileName = getClueFileName(passwordFileNames);
    const targetServer = getNearbyNonEmptyPasswordServer(server);
    if (targetServer) {
      const [containedChar1, containedChar2] = getTwoCharsInPassword(targetServer.password);
      const hint = `The password for ${targetServer.hostname} contains ${containedChar1} and ${containedChar2}`;
      server.writeToTextFile(hintFileName, hint);
      return;
    }
  }
};

const getClueFileName = (fileNameList: string[]): TextFilePath => {
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
  return 1 + brokenWingLimitIncrease + hammerLimitIncrease;
};

export const getSetStasisLinkDuration = (): number => {
  if (!CONSTANTS.isInTestEnvironment) {
    return 0;
  }
  return (1000 / Player.skills.charisma + 1000) * 20_000 + 6_000;
};

export const chargeServerMigration = (server: DarknetServer, threads = 1) => {
  const chargeIncrease = ((Player.skills.charisma + 500) / (server.difficulty * 200 + 1000)) * 0.01 * threads;
  const xpGained = Player.mults.charisma_exp * 50 * ((200 + Player.skills.charisma) / 200) * threads;
  Player.gainCharismaExp(xpGained);
  DarknetState.migrationInductionServers[server.hostname] =
    (DarknetState.migrationInductionServers[server.hostname] ?? 0) + chargeIncrease;
  const result = {
    chargeIncrease,
    newCharge: Math.min(DarknetState.migrationInductionServers[server.hostname], 1),
    xpGained: xpGained,
  };
  if (DarknetState.migrationInductionServers[server.hostname] >= 1) {
    moveDarknetServer(server, -2, 4);
    DarknetState.migrationInductionServers[server.hostname] = 0;
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

export const hasFullDarknetAccess = (): boolean => Player.bitNodeN === 15 || Player.activeSourceFileLvl(15) > 0;
