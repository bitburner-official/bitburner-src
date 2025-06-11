import { tryGeneratingRandomContract } from "../../CodingContract/ContractGenerator";
import { Player } from "@player";
import { formatMoney, formatNumber } from "../../ui/formatNumber";
import { BaseServer } from "../../Server/BaseServer";
import { getLabyrinthDetails, isLabyrinthServer } from "./labyrinth";
import { SnackbarEvents } from "../../ui/React/Snackbar";
import { CompletedProgramName, ToastVariant } from "@enums";
import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { CreateProgramWork } from "../../Work/CreateProgramWork";
import { initStockMarket } from "../../StockMarket/StockMarket";
import { cachePrefixes } from "../models/dictionaryData";
import { FilePath, resolveFilePath } from "../../Paths/FilePath";
import { getDarknetData } from "./effects";

export const hasCacheFileExtension = (path: string) => {
  return path.endsWith(".cache");
};

export const addCacheToServer = (server: BaseServer, filename?: string) => {
  const prefix = filename ?? cachePrefixes[Math.floor(Math.random() * cachePrefixes.length)];
  const cacheFilename = resolveFilePath(`${prefix}_${Math.random().toString().substring(2, 5)}.cache` as FilePath);
  if (cacheFilename) {
    server.caches.push(cacheFilename);
  }
};

export const getRewardFromCache = (server: BaseServer, suppressToast = false): string => {
  const darknetData = getDarknetData(server);
  const difficulty = darknetData?.difficulty ?? 1;
  Player.karma -= (difficulty + 1) * 2; // TODO: adjust karma balance
  if (isLabyrinthServer(server.hostname)) {
    return getLabReward(server, suppressToast);
  }
  const rewards = [getMoneyReward, getXpReward, getNextPortOpener, getCCTReward];
  const reward = rewards[Math.floor(Math.random() * rewards.length)];
  return reward(difficulty, suppressToast);
};

export const getCCTReward = () => {
  const contractCount = [2, 3, 4][Math.floor(Math.random() * 3)];
  tryGeneratingRandomContract(contractCount);
  return `New coding contracts are now available on the network!`;
};

export const getMoneyReward = (difficulty: number) => {
  const sf15_3Factor = Player.sourceFileLvl(15) > 3 ? 1.5 : 1;
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

export const getXpReward = (difficulty: number) => {
  const sf15_3Factor = Player.sourceFileLvl(15) > 3 ? 1.5 : 1;
  const reward = 1.2 ** difficulty * 500 * sf15_3Factor * Player.mults.charisma_exp; // TODO: adjust balance
  Player.gainCharismaExp(reward);
  return `You have discovered a cache with ${formatNumber(reward, 0)} cha XP.`;
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
      !suppressToast && SnackbarEvents.emit(`You have discovered the program ${program}!`, ToastVariant.SUCCESS, 4000);
      return result;
    }
  }
  if (!Player.hasWseAccount) {
    Player.hasWseAccount = true;
    initStockMarket();
    const result = `You have discovered a stolen WSE Account!`;
    !suppressToast && SnackbarEvents.emit(result, ToastVariant.SUCCESS, 4000);
    return result;
  }
  if (!Player.hasTixApiAccess) {
    Player.hasTixApiAccess = true;
    const result = `You have discovered a stolen TIX API access point!`;
    !suppressToast && SnackbarEvents.emit(result, ToastVariant.SUCCESS, 4000);
    return result;
  }
  if (!Player.has4SData && Player.bitNodeN !== 8) {
    Player.has4SData = true;
    const result = `You have discovered a cache of stolen 4S Data!`;
    !suppressToast && SnackbarEvents.emit(result, ToastVariant.SUCCESS, 4000);
    return result;
  }

  return getXpReward(difficulty);
};

const getLabReward = (server: BaseServer, suppressToast = false) => {
  const labDetails = getLabyrinthDetails();
  if (!labDetails.augReward) {
    getRewardFromCache(server, suppressToast);
    return "You have discovered all of the secrets of the lab.";
  }
  Player.queueAugmentation(labDetails.augReward);
  const result = `You have discovered a cache with the augmentation ${labDetails.augReward}!`;
  !suppressToast && SnackbarEvents.emit(result, ToastVariant.SUCCESS, 4000);
  return result;
};
