import { Player } from "@player";
import { Person as IPerson } from "@nsdefs";
import { AugmentationName, CompletedProgramName, LiteratureName, ToastVariant } from "@enums";
import { CreateProgramWork } from "../../Work/CreateProgramWork";
import { SnackbarEvents } from "../../ui/React/Snackbar";
import { formatMoney, formatNumber } from "../../ui/formatNumber";
import { generateContract, tryGeneratingRandomContract } from "../../CodingContract/ContractGenerator";
import { BaseServer } from "../../Server/BaseServer";
import { FilePath, resolveFilePath } from "../../Paths/FilePath";
import {
  cachePrefixes,
  commonPasswordDictionary,
  notebookFileNames,
  packetSniffPhrases,
  passwordFileNames,
} from "./dictionaryData";
import { hintLiterature } from "./hintNotes";
import { TextFilePath } from "../../Paths/TextFilePath";
import {
  getAllAdjacentNeighbors,
  getBackdooredDarkwebServers,
  getDarknetServers,
  getDarknetServerSafely, moveServer,
} from "../controllers/DarknetNetworkMovement";
import { calculateIntelligenceBonus } from "../../PersonObjects/formulas/intelligence";
import { Minigames } from "../controllers/DarknetServerGenerator";
import { addSessionToServer, DarknetState, NET_WIDTH } from "./DarknetState";
import { initStockMarket } from "../../StockMarket/StockMarket";
import { clampNumber } from "../../utils/helpers/clampNumber";
import { getSharedChars } from "./authentication";
import { getLabyrinthDetails, isLabyrinthServer } from "./labyrinth";
import { currentNodeMults } from "../../BitNode/BitNodeMultipliers";
import { Server } from "../../Server/Server";
import { DarknetServer } from "../../Server/DarknetServer";
import { DnetServer } from "./DnetServerData";

export const handleSuccessfulAuth = (server: BaseServer, threads: number, pid: number = -1) => {
  if (!threads) return;

  Player.gainCharismaExp(calculatePasswordAttemptChaGain(server, threads, true));
  addSessionToServer(server, pid);

  if (server.hasAdminRights) return;

  server.hasAdminRights = true;
  addClue(server);
  const darknetData = getDarknetData(server);

  // TODO: balance coding contract chance
  if (Math.random() < 0.1 && (darknetData?.difficulty ?? 0) > 2) {
    generateContract({ server: server.hostname });
  }

  // TODO: balance cache chance
  const chance = 0.1 * 1.05 ** (darknetData?.difficulty ?? 1);
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
 * @param attemptedPassword - the password being attempted
 * @param threads - the number of threads used for the password attempt (which speeds up the process)
 */
export const calculateAuthenticationTime = (
  server: BaseServer,
  person: IPerson,
  threads: number = 1,
  attemptedPassword: string = "",
) => {
  if (!isDarknetServer(server)) return 0;
  const darknetData = getDarknetData(server);

  const chaRequired = server.requiredHackingSkill ?? 1;
  const difficulty = darknetData?.difficulty ?? 1;

  const baseDiff = (difficulty + 1) * 100;
  const diffFactor = 5;
  const baseTime = 500;

  const threadsFactor = 1 / (1 + 0.2 * (threads - 1));
  const skillFactor = (diffFactor * chaRequired + baseDiff) / (person.skills.charisma + 100);
  const noobFactor = Math.min(0.5 + difficulty / 4, 1);
  const backdoorFactor = getBackdoorAuthTimeDebuff();
  const underleveledFactor = person.skills.charisma >= chaRequired ? 1 : 1.5 + (chaRequired + 50) / (person.skills.charisma + 50);
  const hasBootsFactor = Player.hasAugmentation(AugmentationName.TheBoots) ? 0.8 : 1;
  const hasSf15_2Factor = Player.sourceFileLvl(15) > 2 ? 0.8 : 1;

  const time =
    baseTime *
    skillFactor *
    noobFactor *
    backdoorFactor *
    underleveledFactor *
    hasBootsFactor *
    hasSf15_2Factor *
    threadsFactor;

  // Add extra time for timing attack server, per correct character
  const sharedChars =
    darknetData?.minigameType === Minigames.TimingAttack
      ? getSharedChars(darknetData?.password ?? "", attemptedPassword)
      : 0;
  const sharedCharsExtraTime = sharedChars * 150;

  return time * calculateIntelligenceBonus(person.skills.intelligence, 0.25) + sharedCharsExtraTime;
};

export const getBackdoorAuthTimeDebuff = () => {
  const backdooredServerCount = getBackdooredDarkwebServers().length;
  const serverCount = getDarknetServers().filter((s) => s.hasAdminRights).length;
  const safeBackdoors = Math.max(serverCount / (NET_WIDTH * 3), 2);
  const backdoorSurplus = Math.max(0, backdooredServerCount - safeBackdoors);

  return 1.07 ** backdoorSurplus;
};

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

export const handleRamBlockClearedRewards = (server: BaseServer) => {
  addCacheToServer(server);
  if (Math.random() < 0.3) {
    addClue(server);
  }

  const stormSeedChance = 0.15;
  const timeSinceLastStorm = Date.now() - DarknetState.lastStormTime.getTime();
  const stormFileExists = getDarknetServers().some((s) => s.programs.includes(CompletedProgramName.stormSeed));
  if (timeSinceLastStorm > 30 * 60 * 1000 && !stormFileExists && Math.random() < stormSeedChance) {
    server.programs.push(CompletedProgramName.stormSeed);
  }
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
  if (!Player.has4SData) {
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

// TODO: balance xp gain
export const calculatePasswordAttemptChaGain = (server: BaseServer, threads: number = 1, success = false) => {
  if (!isDarknetServer(server) || !threads) return 0;
  const baseXpGain = 3;
  const difficultyBase = 1.12;
  const xpGain = baseXpGain + difficultyBase ** server.darknetData.difficulty;
  const alreadyHackedMult = server.hasAdminRights ? 0.2 : 1;
  const successMult = success && !server.hasAdminRights ? 10 : 1;
  return xpGain * alreadyHackedMult * successMult * threads * Player.mults.charisma_exp;
};

// TODO: balance password clue spawn rate
const addClue = (server: BaseServer) => {
  if (!isDarknetServer(server)) return;

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
    const start = Math.floor(Math.random() * (commonPasswordDictionary.length - 6));
    const commonPasswords = commonPasswordDictionary.slice(start, start + 6).join(", ");
    server.writeToTextFile(hintFileName as TextFilePath, `Some common passwords include ${commonPasswords}`);
    return;
  }

  // connected neighboring server's password (does not include server name)
  if (Math.random() < 0.1) {
    const passwordHintName = passwordFileNames[Math.floor(Math.random() * passwordFileNames.length)] + ".txt";
    const neighboringServerName = server.serversOnNetwork.find((s) => {
      const server = getDarknetServerSafely(s);
      return server && !server?.hasAdminRights && server.darknetData.password;
    });
    const neighboringServer = neighboringServerName ? getDarknetServerSafely(neighboringServerName) : null;
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
    const targetServer = getRandomNearbyServer(server, true);
    if (targetServer && isDarknetServer(targetServer)) {
      const contents = `Server: ${targetServer?.hostname} Password: "${targetServer?.darknetData?.password}"`;
      server.writeToTextFile(hintFileName as TextFilePath, contents);
      return;
    }
  }

  if (Math.random() < 0.4) {
    const hintFileName = notebookFileNames[Math.floor(Math.random() * notebookFileNames.length)] + ".txt";
    const loreNote = packetSniffPhrases[Math.floor(Math.random() * packetSniffPhrases.length)];
    server.writeToTextFile(hintFileName as TextFilePath, loreNote);
    return;
  }

  if (Math.random() < 0.7) {
    const hintFileName = passwordFileNames[Math.floor(Math.random() * passwordFileNames.length)] + ".txt";
    const targetServer = getRandomNearbyServer(server);
    if (targetServer && isDarknetServer(targetServer) && targetServer.darknetData.password) {
      const [containedChar1, containedChar2] = getTwoCharsInPassword(targetServer.darknetData.password);
      const hint = `The password for ${targetServer.hostname} contains ${containedChar1} and ${containedChar2}`;
      server.writeToTextFile(hintFileName as TextFilePath, hint);
      return;
    }
  }
};

const getRandomNearbyServer = (server: BaseServer, disconnected = false) => {
  if (!isDarknetServer(server)) return null;
  return getAllAdjacentNeighbors(server.darknetData.x, server.darknetData.y).find(
    (neighbor) =>
      neighbor &&
      isDarknetServer(neighbor) &&
      !neighbor?.hasAdminRights &&
      neighbor.darknetData.password &&
      (!disconnected || !server.serversOnNetwork.includes(neighbor.hostname)),
  );
};

export const hasDarknetAccess = () => {
  return true; //TODO: enable this later

  const hasSF15 = !!Player.sourceFiles.get(15);
  const isInBN15 = Player.bitNodeN == 15;
  const hasDarkscapeNavigator = Player.hasProgram(CompletedProgramName.darkscape);

  return hasSF15 || isInBN15 || hasDarkscapeNavigator;
};

export const getTwoCharsInPassword = (password: string) => {
  const index1 = Math.floor(Math.random() * password.length);
  const containedChar1 = password[index1];
  let index2 = Math.floor(Math.random() * password.length);
  if (index2 === index1) {
    index2 = (index2 + 1) % password.length;
  }
  const containedChar2 = password[index2];
  return [containedChar1, containedChar2];
};

export const getRamBlockRemoved = (server: BaseServer, threads: number = 1, player: IPerson = Player) => {
  const darknetData = getDarknetData(server);
  const difficulty = darknetData?.difficulty ?? 1;
  const remainingRamBlock = darknetData?.ramBlock ?? 0;
  const charismaFactor = 1 + player.skills.charisma / 100;
  const difficultyFactor = 2 * 0.92 ** (difficulty + 1);
  const baseAmount = 0.02;
  return clampNumber(baseAmount * difficultyFactor * threads * charismaFactor, 0, remainingRamBlock);
};

export const getDarknetVolatilityMult = (symbol: string) => {
  const charges = DarknetState.stockPromotions[symbol] ?? 0;
  const growthRate = 0.001;
  return 1 + (0.6 * (1 - Math.exp(-growthRate * charges)) + 1.4 * (1 - Math.exp(-growthRate * 0.15 * charges)));
};

export const scaleDarknetVolatilityIncreases = (scalar: number) => {
  for (const symbol in DarknetState.stockPromotions) {
    if (DarknetState.stockPromotions[symbol] > 0) {
      DarknetState.stockPromotions[symbol] *= scalar;
    }
  }
};

export const getStasisLinkLimit = (): number => {
  const hasTheBrokenWings = Player.hasAugmentation(AugmentationName.TheBrokenWings);
  const hasTheHammer = Player.hasAugmentation(AugmentationName.TheHammer);
  return 1 + +hasTheBrokenWings + +hasTheHammer;
};

export const getStasisLinkServers = () => getDarknetServers().filter((s) => s.darknetData.hasStasisLink);

export const applyRamBlocks = () => {
  const servers = getDarknetServers();
  for (const server of servers) {
    server.updateRamUsed(server.darknetData?.ramBlock ?? 0);
  }
};

export const chargeServerMigration = (server: BaseServer, threads = 1) => {
  if (!isDarknetServer(server))
    return {
      chargeIncrease: 0,
      newCharge: 0,
      xpGained: 0,
    };
  const chargeIncrease = ((Player.skills.charisma + 50) / (server.darknetData?.difficulty * 4 + 100)) * 0.01 * threads;
  const xpGained = Player.mults.charisma_exp * 50 * ((200 + Player.skills.charisma) / 200) * threads;
  Player.gainCharismaExp(xpGained);
  DarknetState.migrationInductionServers[server.hostname] =
    (DarknetState.migrationInductionServers[server.hostname] ?? 0) + chargeIncrease;
  const result = {
    chargeIncrease,
    newCharge: Math.min(DarknetState.migrationInductionServers[server.hostname], 1),
    xpGained: xpGained,
  }
  if (DarknetState.migrationInductionServers[server.hostname] >= 1) {
    moveServer(server, -1, 5);
    DarknetState.migrationInductionServers[server.hostname] = 0;
  }
  return result;
};

export const isDarknetServer = (server: BaseServer): server is DarknetServer => {
  return server instanceof DarknetServer || (server instanceof Server && !!server.darknetData);
};

export const getDarknetData = (server: BaseServer): DnetServer | null => {
  if (isDarknetServer(server)) {
    return server.darknetData;
  }
  return null;
};
