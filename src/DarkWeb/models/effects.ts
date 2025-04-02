import { Player } from "@player";
import { CompletedProgramName, LiteratureName, ToastVariant } from "@enums";
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

export const handleSuccessfulAuth = (server: BaseServer, threads: number) => {
  Player.gainCharismaExp(calculatePasswordAttemptChaGain(server, threads, true));
  server.hasAdminRights = true;

  // TODO: clue notes
  addClue(server);

  // TODO: balance coding contract chance
  if (Math.random() < 0.1) {
    generateContract({ server: server.hostname });
  }

  // TODO: balance cache chance
  const chance = 0.2 * 1.03 ** (server.darknetData?.difficulty ?? 1);
  if (Math.random() < chance) {
    const prefix = cachePrefixes[Math.floor(Math.random() * cachePrefixes.length)];
    const cacheFilename = resolveFilePath(`${prefix}_${Math.random().toString().substring(2, 5)}.cache` as FilePath);
    if (cacheFilename) {
      server.caches.push(cacheFilename);
    }
  }
};

export const handleFailedAuth = (server: BaseServer, threads: number) => {
  Player.gainCharismaExp(calculatePasswordAttemptChaGain(server, threads, false));
};

export const hasCacheFileExtension = (path: string) => {
  return path.endsWith(".cache");
};

export const getRewardFromCache = (server: BaseServer) => {
  Player.karma -= 10; // TODO: adjust karma balance
  const rewards = [getMoneyReward, getXpReward, getNextPortOpener, getCCTReward];
  const reward = rewards[Math.floor(Math.random() * rewards.length)];
  reward(server.darknetData?.difficulty ?? 1);
};

export const getCCTReward = (difficulty: number) => {
  const contractCount = Math.min((difficulty + 1) / 4, 4);
  tryGeneratingRandomContract(contractCount);
  SnackbarEvents.emit(`New coding contracts are now available on the network`, ToastVariant.SUCCESS, 4000);
};

export const getMoneyReward = (difficulty: number) => {
  const reward = 1.2 ** difficulty * 1e7 * getMultiplierFromCharisma(4) * Player.mults.crime_money; // TODO: adjust balance
  Player.gainMoney(reward, "other");
  SnackbarEvents.emit(`You have discovered a cache with ${formatMoney(reward)}`, ToastVariant.SUCCESS, 4000);
};

export const getXpReward = (difficulty: number) => {
  const augCount = Player.augmentations.length;
  const reward = 1.2 ** difficulty * 100 * 1.04 ** augCount * Player.mults.charisma_exp; // TODO: adjust balance
  Player.gainCharismaExp(reward);
  SnackbarEvents.emit(`You have discovered a cache with ${formatNumber(reward, 0)} cha XP`, ToastVariant.SUCCESS, 4000);
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

export const getNextPortOpener = (difficulty: number) => {
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
      SnackbarEvents.emit(`You have discovered the program ${program}`, ToastVariant.SUCCESS, 4000);
      return true;
    }
  }
  if (!Player.hasWseAccount) {
    Player.hasWseAccount = true;
    SnackbarEvents.emit(`You have discovered a stolen WSE Account`, ToastVariant.SUCCESS, 4000);
    return true;
  }
  if (!Player.hasTixApiAccess) {
    Player.hasTixApiAccess = true;
    SnackbarEvents.emit(`You have discovered a TIX API access exploit`, ToastVariant.SUCCESS, 4000);
    return true;
  }

  return getXpReward(difficulty);
};

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
  if ((Math.random() < 0.5 && server.darknetData.difficulty <= 3) || Math.random() < 0.05) {
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
