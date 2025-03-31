import { Player } from "@player";
import { CompletedProgramName, ToastVariant } from "@enums";
import { CreateProgramWork } from "../../Work/CreateProgramWork";
import { SnackbarEvents } from "../../ui/React/Snackbar";
import { formatMoney, formatNumber } from "../../ui/formatNumber";
import { generateContract, tryGeneratingRandomContract } from "../../CodingContract/ContractGenerator";
import { BaseServer } from "../../Server/BaseServer";
import { FilePath, resolveFilePath } from "../../Paths/FilePath";

export const handleSuccessfulAuth = (server: BaseServer) => {
  server.hasAdminRights = true;

  // TODO: clue notes


  // TODO: balance coding contract chance
  if (Math.random() < 0.1) {
    generateContract({ server: server.hostname })
  }

  // TODO: balance cache chance
  const chance =  0.2 * (1.03 ** (server.darkWebData?.difficulty ?? 1))
  if (Math.random() < chance) {
    const cacheFilename = resolveFilePath(`reward-${Math.random().toString().substring(2, 7)}.cache` as FilePath);
    if (cacheFilename) {
      server.caches.push(cacheFilename);
    }
  }
}

export const hasCacheFileExtension = (path: string) => {
  return path.endsWith(".cache");
}

export const getRewardFromCache = (server: BaseServer) => {
  Player.karma -= 10; // TODO: adjust karma balance
  const rewards = [getMoneyReward, getXpReward, getNextPortOpener, getCCTReward];
  const reward = rewards[Math.floor(Math.random() * rewards.length)];
  reward(server.darkWebData?.difficulty ?? 1);
}

export const getCCTReward = (difficulty: number) => {
  const contractCount = Math.min((difficulty + 1) / 4, 4);
  tryGeneratingRandomContract( contractCount );
  SnackbarEvents.emit(`New coding contracts are now available on the network`, ToastVariant.SUCCESS, 4000);
}

export const getMoneyReward = (difficulty: number) => {
  const reward = (1.2 ** difficulty) * 1e7 * getMultiplierFromCharisma(4) * Player.mults.crime_money; // TODO: adjust balance
  Player.gainMoney(reward, "other");
  SnackbarEvents.emit(`You have discovered a cache with ${formatMoney(reward)}`, ToastVariant.SUCCESS, 4000);
}

export const getXpReward = (difficulty: number) => {
  const augCount = Player.augmentations.length;
  const reward =  (1.2 ** difficulty) * 100 * (1.04 ** augCount) * Player.mults.charisma_exp; // TODO: adjust balance
  Player.gainCharismaExp(reward);
  SnackbarEvents.emit(`You have discovered a cache with ${formatNumber(reward, 0)} cha XP`, ToastVariant.SUCCESS, 4000);
}

/**
 * Returns a small multiplier based on charisma.
 * With scalar at 1 it gives ~1.2 at 2000 charisma and ~1.6 at 10000 charisma. Caps at 2.1 at infinite cha
 */
export const getMultiplierFromCharisma = (scalar = 1) => {
  const charisma = Player.skills.charisma;
  const growthRate = 0.0002; // Adjust this value to control the growth rate
  return 1 + ((0.5) * (1 - Math.exp(-growthRate* charisma)) + (0.6) * (1 - Math.exp(-growthRate * 0.2 * charisma)) * scalar);
}


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
    CompletedProgramName.formulas
  ];

  for (const program of programs) {
    if (!Player.hasProgram(program) && currentPlayerWork !== program) {
      Player.getHomeComputer().pushProgram(program);
      SnackbarEvents.emit(`You have discovered the program ${program}`, ToastVariant.SUCCESS, 4000);
      return true;
    }
  }

  return getXpReward(difficulty);
}