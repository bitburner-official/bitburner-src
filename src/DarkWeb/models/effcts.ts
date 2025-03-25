import { Player } from "@player";
import { CompletedProgramName, ToastVariant } from "@enums";
import { CreateProgramWork } from "../../Work/CreateProgramWork";
import { SnackbarEvents } from "../../ui/React/Snackbar";
import { formatMoney, formatNumber } from "../../ui/formatNumber";
import { tryGeneratingRandomContract } from "../../CodingContract/ContractGenerator";

export const hasCacheFileExtension = (path: string) => {
  return path.endsWith(".cache");
}

export const getRewardFromCache = (difficulty: number = 1) => {
  Player.karma -= 5; // TODO: adjust balance
  const rewards = [getMoneyReward, getXpReward, getNextPortOpener, getCCTReward];
  const reward = rewards[Math.floor(Math.random() * rewards.length)];
  reward(difficulty);
}

export const getCCTReward = (difficulty: number) => {
  const contractCount = Math.min((difficulty + 1) / 4, 4);
  tryGeneratingRandomContract( contractCount );
  SnackbarEvents.emit(`New coding contracts are now available on the network`, ToastVariant.SUCCESS, 4000);
}

export const getMoneyReward = (difficulty: number) => {
  const augCount = Player.augmentations.length;
  const reward = (difficulty + 1) * 1e7 * (1.05 ** augCount) * Player.mults.crime_money; // TODO: adjust balance
  Player.gainMoney(reward, "other");
  SnackbarEvents.emit(`You have discovered a cache with ${formatMoney(reward)}`, ToastVariant.SUCCESS, 4000);
}

export const getXpReward = (difficulty: number) => {
  const augCount = Player.augmentations.length;
  const reward =  (difficulty + 1) * 100 * (1.04 ** augCount) * Player.mults.charisma_exp; // TODO: adjust balance
  Player.gainCharismaExp(reward);
  SnackbarEvents.emit(`You have discovered a cache with ${formatNumber(reward, 0)} cha XP`, ToastVariant.SUCCESS, 4000);
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

  return getRewardFromCache(difficulty);
}