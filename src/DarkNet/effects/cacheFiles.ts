import { generateContract } from "../../CodingContract/ContractGenerator";
import { Player } from "@player";
import { formatMoney } from "../../ui/formatNumber";
import { getLabAugReward, isLabyrinthServer, LAB_CACHE_NAME } from "./labyrinth";
import { SnackbarEvents } from "../../ui/React/Snackbar";
import { AugmentationName, CompletedProgramName, StockSymbol, ToastVariant } from "@enums";
import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { CreateProgramWork } from "../../Work/CreateProgramWork";
import { initStockMarket, isStockMarketInitialized, StockMarket } from "../../StockMarket/StockMarket";
import { cachePrefixes } from "../models/dictionaryData";
import type { DarknetServer } from "../../Server/DarknetServer";
import { resolveCacheFilePath } from "../../Paths/CacheFilePath";
import type { CacheResult, CacheReward } from "@nsdefs";
import { addClue, cctCooldownReached } from "./effects";
import { getBitNodeMultipliers } from "../../BitNode/BitNode";
import { pluralize } from "../../utils/I18nUtils";

export const generateCacheFilename = (isPhishingCache: boolean, prefix?: string) => {
  const filenamePrefix = prefix ?? cachePrefixes[Math.floor(Math.random() * cachePrefixes.length)];
  const suffix = isPhishingCache ? ".d.cache" : ".cache";
  return resolveCacheFilePath(`${filenamePrefix}_${Math.random().toString().substring(2, 5)}${suffix}`);
};

export const addCacheToServer = (server: DarknetServer, isPhishingCache: boolean, prefix?: string) => {
  const cacheFilename = generateCacheFilename(isPhishingCache, prefix);
  if (!cacheFilename) {
    return { success: false, message: `Cannot generate path. prefix: ${prefix}` };
  }
  if (server.caches.includes(cacheFilename)) {
    return { success: false, message: `Duplicate cache file: ${cacheFilename}` };
  }
  server.caches.push(cacheFilename);
  return { success: true, cacheFilename };
};

type InternalCacheReward = Partial<Omit<CacheResult, "success">> & Pick<CacheResult, "message">;

const defaultReward: CacheReward = {
  karmaLoss: 0,
  wseAccount: false,
  tixApiAccess: false,
  fourSigmaData: false,
} as const;

export const getRewardFromCache = (server: DarknetServer, cacheName: string, suppressToast = false): CacheResult => {
  const difficulty = server.difficulty;
  const karmaLoss = difficulty + 1;
  Player.karma -= karmaLoss;
  if (isLabyrinthServer(server.hostname) && cacheName.includes(LAB_CACHE_NAME)) {
    const labReward = getLabReward();
    return {
      success: true,
      ...defaultReward,
      karmaLoss: -karmaLoss,
      ...labReward,
    };
  }

  const rewards = [getProgramAndStockMarketRelatedRewards, getStockReward, getDataFileReward];
  if (cacheName.endsWith(".d.cache")) {
    // only include ccts from caches generated from phishing attacks
    rewards.push(getCCTReward);
  }
  if (getBitNodeMultipliers(Player.bitNodeN, 1).DarknetMoneyMultiplier) {
    // only include money reward if it is not disabled by the bn mults
    rewards.push(getMoneyReward);
  }
  const reward = rewards[Math.floor(Math.random() * rewards.length)];
  const result = reward(difficulty, server);

  if (!suppressToast) {
    SnackbarEvents.emit(
      // Karma is only useful in relation to gangs, so we only show the karma loss if the player has started unlocking gang
      // content. This is to avoid cluttering the UI with unnecessary info, and confusion before players discover karma.
      result.message + (Player.isAwareOfGang() ? ` Gained -${karmaLoss} karma.` : ""),
      ToastVariant.SUCCESS,
      4000,
    );
  }
  return {
    success: true,
    ...defaultReward,
    karmaLoss: -karmaLoss,
    ...result,
  };
};

export const getCCTReward = (difficulty: number, server: DarknetServer): InternalCacheReward => {
  if (!cctCooldownReached()) {
    return getMoneyReward(difficulty);
  }
  const contractCount = Math.min(Math.floor(Math.min(20, difficulty) * 0.1 - 1.5 + Math.random() * 3), 3);
  if (contractCount < 1) {
    return getMoneyReward(difficulty);
  }
  const contractFilePaths = [];
  for (let i = 0; i < contractCount; i++) {
    const contractFilePath = generateContract({ server: server.hostname, rewardScaling: 1 / 2 });
    if (contractFilePath === null) {
      continue;
    }
    contractFilePaths.push(contractFilePath);
  }
  if (contractFilePaths.length === 0) {
    return getMoneyReward(difficulty);
  }
  return { message: `New coding contracts are now available on the network!`, contractFilePaths };
};

export const getMoneyReward = (difficulty: number): InternalCacheReward => {
  const sf15_3Factor = Player.activeSourceFileLvl(15) >= 3 ? 1.5 : 1;
  const reward =
    1.2 ** difficulty *
    1e7 *
    ((200 + Player.skills.charisma) / 200) *
    sf15_3Factor *
    Player.mults.crime_money *
    Player.mults.dnet_money *
    currentNodeMults.DarknetMoneyMultiplier; // TODO: adjust balance
  Player.gainMoney(reward, "darknet");
  return { message: `You have discovered a cache with ${formatMoney(reward)}.`, money: reward };
};

export const getStockReward = (difficulty: number): InternalCacheReward => {
  if (!isStockMarketInitialized()) {
    initStockMarket();
  }
  const stockSymbols = Object.keys(StockSymbol);
  const stock = StockMarket[stockSymbols[Math.floor(Math.random() * stockSymbols.length)]];
  const maxNewShares = stock.maxShares - stock.playerShares - stock.playerShortShares;
  if (maxNewShares <= 0) {
    return getMoneyReward(difficulty);
  }
  const shares = Math.min(Math.floor(1 + difficulty * 5 + Math.random() * 10), maxNewShares);
  stock.playerShares += shares;
  return {
    message: `You have discovered a stock option cache containing ${shares} shares of ${stock.symbol}!`,
    stockSymbol: stock.symbol,
    stockShares: shares,
  };
};

export const getDataFileReward = (difficulty: number, server: DarknetServer): InternalCacheReward => {
  const dataFiles = [...new Set([...addClue(server), ...addClue(server)])];
  if (dataFiles.length === 0) {
    return getMoneyReward(difficulty);
  }
  return {
    message: `You have discovered ${pluralize(dataFiles.length, "data file cache")}: ${dataFiles.join(", ")}.`,
    dataFilePaths: dataFiles,
  };
};

export const getProgramAndStockMarketRelatedRewards = (difficulty: number): InternalCacheReward => {
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
      return { message: `You have discovered the program ${program}.`, programName: program };
    }
  }
  if (!Player.hasWseAccount) {
    Player.hasWseAccount = true;
    if (!isStockMarketInitialized()) {
      initStockMarket();
    }
    return { message: `You have discovered a stolen WSE Account!`, wseAccount: true };
  }
  if (!Player.hasTixApiAccess) {
    Player.hasTixApiAccess = true;
    if (!isStockMarketInitialized()) {
      initStockMarket();
    }
    return { message: `You have discovered a stolen TIX API access point!`, tixApiAccess: true };
  }
  if (!Player.has4SData && Player.bitNodeN !== 8 && !Player.bitNodeOptions.disable4SData) {
    Player.has4SData = true;
    return { message: `You have discovered a cache of stolen 4S Data!`, fourSigmaData: true };
  }

  return getMoneyReward(difficulty);
};

const getLabReward = (): InternalCacheReward => {
  let reward = getLabAugReward();
  if (!reward || Player.hasAugmentation(reward)) {
    reward = AugmentationName.NeuroFluxGovernor;
  }
  Player.queueAugmentation(reward);
  return {
    message: `You have discovered a cache with the augmentation ${reward}!`,
    augmentationName: reward,
  };
};
