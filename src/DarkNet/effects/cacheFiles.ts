import { tryGeneratingRandomContract } from "../../CodingContract/ContractGenerator";
import { Player } from "@player";
import { formatMoney, formatNumber } from "../../ui/formatNumber";
import { getLabAugReward, isLabyrinthServer, LAB_CACHE_NAME } from "./labyrinth";
import { SnackbarEvents } from "../../ui/React/Snackbar";
import { AugmentationName, CompletedProgramName, ToastVariant } from "@enums";
import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { CreateProgramWork } from "../../Work/CreateProgramWork";
import { initStockMarket, isStockMarketInitialized } from "../../StockMarket/StockMarket";
import { cachePrefixes } from "../models/dictionaryData";
import type { Result } from "../../types";
import type { DarknetServer } from "../../Server/DarknetServer";
import { type CacheFilePath, resolveCacheFilePath } from "../../Paths/CacheFilePath";
import type { CacheResult } from "@nsdefs";

export const addCacheToServer: (
  server: DarknetServer,
  filename?: string,
) => Result<{ cacheFilename: CacheFilePath }> = (server, filename) => {
  const prefix = filename ?? cachePrefixes[Math.floor(Math.random() * cachePrefixes.length)];
  const cacheFilename = resolveCacheFilePath(`${prefix}_${Math.random().toString().substring(2, 5)}.cache`);
  if (!cacheFilename) {
    return { success: false, message: `Cannot generate path. filename: ${filename}` };
  }
  server.caches.push(cacheFilename);
  return { success: true, cacheFilename };
};

export const getRewardFromCache = (server: DarknetServer, cacheName: string, suppressToast = false): CacheResult => {
  const difficulty = server.difficulty;
  const karmaLoss = difficulty + 1;
  Player.karma -= karmaLoss;
  if (isLabyrinthServer(server.hostname) && cacheName.includes(LAB_CACHE_NAME)) {
    const labReward = getLabReward();
    return {
      success: true,
      message: labReward,
      karmaLoss: -karmaLoss,
    };
  }

  const rewards = [getMoneyReward, getXpReward, getProgramAndStockMarketRelatedRewards, getCCTReward];
  const reward = rewards[Math.floor(Math.random() * rewards.length)];
  const result = reward(difficulty);

  if (!suppressToast) {
    SnackbarEvents.emit(
      // Karma is only useful in relation to gangs, so we only show the karma loss if the player has started unlocking gang
      // content. This is to avoid cluttering the UI with unnecessary info, and confusion before players discover karma.
      result + (Player.isAwareOfGang() ? ` Gained -${karmaLoss} karma.` : ""),
      ToastVariant.SUCCESS,
      4000,
    );
  }
  return {
    success: true,
    message: result,
    karmaLoss: -karmaLoss,
  };
};

export const getCCTReward = (): string => {
  const contractCount = [2, 3, 4][Math.floor(Math.random() * 3)];
  tryGeneratingRandomContract(contractCount);
  return `New coding contracts are now available on the network!`;
};

export const getMoneyReward = (difficulty: number): string => {
  const sf15_3Factor = Player.activeSourceFileLvl(15) > 3 ? 1.5 : 1;
  const reward =
    1.2 ** difficulty *
    1e7 *
    ((200 + Player.skills.charisma) / 200) *
    sf15_3Factor *
    Player.mults.crime_money *
    currentNodeMults.DarknetMoneyMultiplier; // TODO: adjust balance
  Player.gainMoney(reward, "darknet");
  return `You have discovered a cache with ${formatMoney(reward)}.`;
};

export const getXpReward = (difficulty: number): string => {
  const sf15_3Factor = Player.activeSourceFileLvl(15) > 3 ? 1.5 : 1;
  const reward = 1.2 ** difficulty * 500 * sf15_3Factor * Player.mults.charisma_exp; // TODO: adjust balance
  Player.gainCharismaExp(reward);
  return `You have discovered a cache with ${formatNumber(reward, 0)} cha XP.`;
};

export const getProgramAndStockMarketRelatedRewards = (difficulty: number): string => {
  const creatingProgram = Player.currentWork instanceof CreateProgramWork ? Player.currentWork.programName : null;
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
    if (!Player.hasProgram(program) && creatingProgram !== program) {
      Player.getHomeComputer().pushProgram(program);
      return `You have discovered the program ${program}.`;
    }
  }
  if (!Player.hasWseAccount) {
    Player.hasWseAccount = true;
    if (!isStockMarketInitialized()) {
      initStockMarket();
    }
    return `You have discovered a stolen WSE Account!`;
  }
  if (!Player.hasTixApiAccess) {
    Player.hasTixApiAccess = true;
    if (!isStockMarketInitialized()) {
      initStockMarket();
    }
    return `You have discovered a stolen TIX API access point!`;
  }
  if (!Player.has4SData && Player.bitNodeN !== 8 && !Player.bitNodeOptions.disable4SData) {
    Player.has4SData = true;
    return `You have discovered a cache of stolen 4S Data!`;
  }

  return getXpReward(difficulty);
};

const getLabReward = (): string => {
  let reward = getLabAugReward();
  if (!reward || Player.hasAugmentation(reward)) {
    reward = AugmentationName.NeuroFluxGovernor;
  }
  Player.queueAugmentation(reward);
  return `You have discovered a cache with the augmentation ${reward}!`;
};
