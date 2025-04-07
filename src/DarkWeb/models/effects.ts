import { Player } from "@player";
import { Person as IPerson } from "@nsdefs";
import { AugmentationName, CompletedProgramName, LiteratureName, ToastVariant } from "@enums";
import { CreateProgramWork } from "../../Work/CreateProgramWork";
import { SnackbarEvents } from "../../ui/React/Snackbar";
import { formatMoney, formatNumber } from "../../ui/formatNumber";
import { generateContract, tryGeneratingRandomContract } from "../../CodingContract/ContractGenerator";
import { BaseServer } from "../../Server/BaseServer";
import { FilePath, resolveFilePath } from "../../Paths/FilePath";
import { cachePrefixes, commonPasswordDictionary, passwordFileNames } from "./dictionaryData";
import { hintLiterature } from "./hintNotes";
import { TextFilePath } from "../../Paths/TextFilePath";
import { GetServer } from "../../Server/AllServers";
import { getAllAdjacentNeighbors } from "../controllers/DarknetNetworkMovement";
import { calculateIntelligenceBonus } from "../../PersonObjects/formulas/intelligence";
import { isDarknetServer } from "./DnetServerData";
import { SpecialServers } from "../../Server/data/SpecialServers";

export const handleSuccessfulAuth = (server: BaseServer, threads: number) => {
  if (!threads) return;

  Player.gainCharismaExp(calculatePasswordAttemptChaGain(server, threads, true));
  if (server.hasAdminRights) return;

  server.hasAdminRights = true;
  addClue(server);

  // TODO: balance coding contract chance
  if (Math.random() < 0.1) {
    generateContract({ server: server.hostname });
  }

  // TODO: balance cache chance
  const chance = 0.2 * 1.03 ** (server.darknetData?.difficulty ?? 1);
  if (Math.random() < chance) {
    addCacheToServer(server);
  }
};

export const handleFailedAuth = (server: BaseServer, threads: number) => {
  // TODO: chance to sever connection or crash script
  Player.gainCharismaExp(calculatePasswordAttemptChaGain(server, threads, false));
};

/**
 * Returns the time it takes to authenticate on a server in milliseconds
 * @param server - the target server to attempt a password on
 * @param person - the player's character
 * @param threads - the number of threads used for the password attempt (which speeds up the process)
 */
export const calculateAuthenticationTime = (server: BaseServer, person: IPerson, threads: number = 1) => {
  if (!isDarknetServer(server)) return 0;

  const chaRequired = server.hackDifficulty ?? 1;
  const difficulty = server.darknetData?.difficulty ?? 1;

  const baseDiff = (difficulty + 1) * 100;
  const diffFactor = 5;
  const baseTime = 500;

  const threadsFactor = 1 + 0.2 * (threads - 1);
  const skillFactor = (diffFactor * chaRequired + baseDiff) / (person.skills.charisma + 50);

  const time = (baseTime * skillFactor) / threadsFactor;

  return Math.max(time * calculateIntelligenceBonus(person.skills.intelligence, 0.25), 100);
};

export const hasCacheFileExtension = (path: string) => {
  return path.endsWith(".cache");
};

export const addCacheToServer = (server: BaseServer) => {
  const prefix = cachePrefixes[Math.floor(Math.random() * cachePrefixes.length)];
  const cacheFilename = resolveFilePath(`${prefix}_${Math.random().toString().substring(2, 5)}.cache` as FilePath);
  if (cacheFilename) {
    server.caches.push(cacheFilename);
  }
};

export const getRewardFromCache = (server: BaseServer, suppressToast = false): string => {
  Player.karma -= 30; // TODO: adjust karma balance
  if (server.hostname == SpecialServers.Labyrinth) {
    return getLabReward(server, suppressToast);
  }
  const rewards = [getMoneyReward, getXpReward, getNextPortOpener, getCCTReward];
  const reward = rewards[Math.floor(Math.random() * rewards.length)];
  return reward(server.darknetData?.difficulty ?? 1, suppressToast);
};

export const getCCTReward = (difficulty: number) => {
  const contractCount = Math.min((difficulty + 1) / 4, 4);
  tryGeneratingRandomContract(contractCount);
  return `New coding contracts are now available on the network`;
};

export const getMoneyReward = (difficulty: number) => {
  const reward = 1.2 ** difficulty * 1e7 * getMultiplierFromCharisma(4) * Player.mults.crime_money; // TODO: adjust balance
  Player.gainMoney(reward, "other");
  return `You have discovered a cache with ${formatMoney(reward)}`;
};

export const getXpReward = (difficulty: number) => {
  const augCount = Player.augmentations.length;
  const reward = 1.2 ** difficulty * 100 * 1.04 ** augCount * Player.mults.charisma_exp; // TODO: adjust balance
  Player.gainCharismaExp(reward);
  return `You have discovered a cache with ${formatNumber(reward, 0)} cha XP`;
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

export const getNextPortOpener = (difficulty: number, suppressToast = false) => {
  const currentPlayerWork = (Player.currentWork as CreateProgramWork)?.programName;
  const programs = [
    CompletedProgramName.serverProfiler,
    CompletedProgramName.bruteSsh,
    CompletedProgramName.deepScan1,
    CompletedProgramName.ftpCrack,
    CompletedProgramName.autoLink,
    CompletedProgramName.relaySmtp,
    CompletedProgramName.deepScan2,
    CompletedProgramName.httpWorm,
    CompletedProgramName.sqlInject,
    CompletedProgramName.formulas,
  ];

  for (const program of programs) {
    if (!Player.hasProgram(program) && currentPlayerWork !== program) {
      Player.getHomeComputer().pushProgram(program);
      const result = `You have discovered the program ${program}`;
      !suppressToast && SnackbarEvents.emit(`You have discovered the program ${program}`, ToastVariant.SUCCESS, 4000);
      return result;
    }
  }
  if (!Player.hasWseAccount) {
    Player.hasWseAccount = true;
    const result = `You have discovered a stolen WSE Account`;
    !suppressToast && SnackbarEvents.emit(result, ToastVariant.SUCCESS, 4000);
    return result;
  }
  if (!Player.hasTixApiAccess) {
    Player.hasTixApiAccess = true;
    const result = `You have discovered a stolen TIX API access point`;
    !suppressToast && SnackbarEvents.emit(result, ToastVariant.SUCCESS, 4000);
    return result;
  }
  if (!Player.has4SData) {
    Player.has4SData = true;
    const result = `You have discovered a cache of stolen 4S Data`;
    !suppressToast && SnackbarEvents.emit(result, ToastVariant.SUCCESS, 4000);
    return result;
  }

  return getXpReward(difficulty);
};

const getLabReward = (_server: BaseServer, suppressToast = false) => {
  // TODO: balance this (more augments first? only TRP on BN 15?)
  Player.queueAugmentation(AugmentationName.TheRedPill);
  const result = `You have discovered a cache with the Red Pill`;
  !suppressToast && SnackbarEvents.emit(result, ToastVariant.SUCCESS, 4000);
  return result;
}

// TODO: balance xp gain
export const calculatePasswordAttemptChaGain = (server: BaseServer, threads: number = 1, success = false) => {
  if (!server.darknetData || !threads) return 0;
  const baseXpGain = 3;
  const difficultyBase = 1.12;
  const xpGain = baseXpGain + difficultyBase ** server.darknetData.difficulty;
  const alreadyHackedMult = server.hasAdminRights ? 0.05 : 1;
  const successMult = success && !server.hasAdminRights ? 10 : 1;
  return xpGain * alreadyHackedMult * successMult * threads * Player.mults.charisma_exp;
};

// TODO: balance password clue spawn rate
const addClue = (server: BaseServer) => {
  if (!server.darknetData) return;

  // Basic mechanics hints
  if ((Math.random() < 0.7 && server.darknetData.difficulty <= 3) || Math.random() < 0.1) {
    const hint: LiteratureName = hintLiterature[Math.floor(Math.random() * hintLiterature.length)];
    if (hint) {
      server.messages.push(hint);
    }
  }

  // some entries from the common password dictionary
  if (Math.random() < 0.1) {
    const hintFileName = passwordFileNames[Math.floor(Math.random() * passwordFileNames.length)] + ".txt";
    const start = Math.floor(Math.random() * commonPasswordDictionary.length - 6);
    const commonPasswords = commonPasswordDictionary.slice(start, start + 6).join(", ");
    server.writeToTextFile(hintFileName as TextFilePath, `Some common passwords include ${commonPasswords}`);
    return;
  }

  // connected neighboring server's password (does not include server name)
  if (Math.random() < 0.1) {
    const passwordHintName = passwordFileNames[Math.floor(Math.random() * passwordFileNames.length)] + ".txt";
    const neighboringServerName = server.serversOnNetwork.find((s) => {
      const server = GetServer(s);
      return server && server?.darknetData && !server?.hasAdminRights && server.darknetData.password;
    });
    const neighboringServer = neighboringServerName ? GetServer(neighboringServerName) : null;
    if (neighboringServer) {
      server.writeToTextFile(
        passwordHintName as TextFilePath,
        `Remember this password: ${neighboringServer.darknetData?.password}`,
      );
      return;
    }
  }

  // non-connected nearby server's password (includes server name)
  if (Math.random() < 0.1) {
    const hintFileName = passwordFileNames[Math.floor(Math.random() * passwordFileNames.length)] + ".txt";
    const targetServer = getAllAdjacentNeighbors(server.darknetData.x, server.darknetData.y).find(
      (neighbor) =>
        neighbor &&
        neighbor?.darknetData &&
        !neighbor?.hasAdminRights &&
        neighbor.darknetData.password &&
        !server.serversOnNetwork.includes(neighbor.hostname),
    );

    if (targetServer) {
      server.writeToTextFile(
        hintFileName as TextFilePath,
        `Server: ${targetServer?.hostname} Password: ${targetServer?.darknetData?.password}`,
      );
    }
    return;
  }
};

export const hasDarknetAccess = () => {
  return true;

  //TODO: enable this later
  const hasSF15 = !!Player.sourceFiles.get(15);
  const isInBN15 = Player.bitNodeN == 15;

  return hasSF15 || isInBN15;
};
