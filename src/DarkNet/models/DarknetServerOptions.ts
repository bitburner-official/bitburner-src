import { getRandomIcon } from "../controllers/ServerGenerator";
import { Icon, labIcon } from "../ui/ServerIcon";
import { AddToAllServers, createUniqueRandomIp, GetServer } from "../../Server/AllServers";
import {
  commonPasswordDictionary,
  connectors,
  l33t,
  loreNames,
  presetNames,
  ServerNamePrefixes,
  ServerNameSuffixes,
} from "./dictionaryData";
import { getLabyrinthDetails } from "../effects/labyrinth";
import { DarknetServer } from "../../Server/DarknetServer";
import type { ResponseStatusType } from "@nsdefs";
import type { MinigamesType } from "../Enums";
import { DarknetState } from "./DarknetState";
import { getRamBlock } from "../effects/ramblock";

export type PasswordResponse = {
  status: ResponseStatusType;
  passwordAttempted: string;
  message: string;
  data?: string;
  responseTime?: number;
};

export type DarknetServerOptions = {
  icon?: Icon | typeof labIcon;
  password: string;
  modelId: MinigamesType;
  staticPasswordHint: string;
  passwordHintData?: string;
  difficulty: number;
  depth: number;
  leftOffset: number;
};

export const DnetServerBuilder = (options: DarknetServerOptions, name = generateDarknetServerName()): DarknetServer => {
  const maxRam = 16 * 2 ** Math.floor(options.difficulty / 4);
  const ramBlock = getRamBlock(maxRam);

  const labDetails = getLabyrinthDetails();
  const labDifficulty = labDetails.cha;
  const depth = options.difficulty;
  const depthScaling = depth < 2 ? depth * 10 : (depth / labDetails.depth) ** 1.5 * labDifficulty * 0.85;
  const levelVariance = (Math.random() * 3 - 1) * depth;
  const requiredLevel = Math.max(Math.floor(depthScaling + levelVariance), 1);

  const server = new DarknetServer({
    hostname: name,
    ip: createUniqueRandomIp(),
    maxRam,
    icon: options.icon ?? getRandomIcon(),
    password: options.password,
    modelId: options.modelId,
    staticPasswordHint: options.staticPasswordHint,
    passwordHintData: options.passwordHintData ?? "",
    difficulty: options.difficulty,
    depth: options.depth,
    leftOffset: options.leftOffset,
    hasStasisLink: false,
    blockedRam: ramBlock,
    logTrafficInterval: 1 + 30 * 0.9 ** options.difficulty,
    requiredCharismaSkill: requiredLevel,
    isMobile: true,
  });
  server.updateRamUsed(ramBlock);
  removeFromOfflineServers(name);
  AddToAllServers(server);

  return server;
};

export const generateDarknetServerName = (): string => {
  if (Math.random() < 0.03 && DarknetState.offlineServers.length > 0) {
    return DarknetState.offlineServers[Math.floor(Math.random() * DarknetState.offlineServers.length)];
  }
  return decorateName(getBaseName());
};

export const removeFromOfflineServers = (hostname: string): void => {
  DarknetState.offlineServers = DarknetState.offlineServers.filter((server) => server !== hostname);
};

const getBaseName = (): string => {
  if (Math.random() < 0.05) {
    return commonPasswordDictionary[Math.floor(Math.random() * commonPasswordDictionary.length)];
  }

  if (Math.random() < 0.2) {
    return loreNames[Math.floor(Math.random() * loreNames.length)];
  }

  if (Math.random() < 0.3) {
    return presetNames[Math.floor(Math.random() * presetNames.length)];
  }

  const prefix = ServerNamePrefixes[Math.floor(Math.random() * ServerNamePrefixes.length)];
  const suffix = ServerNameSuffixes[Math.floor(Math.random() * ServerNameSuffixes.length)];
  const connector = connectors[Math.floor(Math.random() * connectors.length)];
  return `${prefix}${connector}${suffix}`;
};

const decorateName = (name: string): string => {
  let updatedName = name;
  do {
    const connector = connectors[Math.floor(Math.random() * connectors.length)];

    if (Math.random() < 0.3) {
      updatedName = l33tifyName(name);
    }

    if (Math.random() < 0.05) {
      updatedName = updatedName.split("").reverse().join("");
    }

    if (Math.random() < 0.1) {
      const randomSuffix = ServerNameSuffixes[Math.floor(Math.random() * ServerNameSuffixes.length)];
      updatedName = `${updatedName}${connector}${randomSuffix}`;
    }

    if (Math.random() < 0.1) {
      const randomPrefix = ServerNamePrefixes[Math.floor(Math.random() * ServerNamePrefixes.length)];
      updatedName = `${randomPrefix}${connector}${updatedName}`;
    }

    if (Math.random() < 0.05 && updatedName) {
      updatedName = `${updatedName}:${Math.floor(Math.random() * 10000)}`;
    }
  } while (GetServer(updatedName) !== null);

  return updatedName;
};

const l33tifyName = (name: string): string => {
  let updatedName = name;
  const amount = Math.random() * 3 + 1;
  for (let i = 0; i < amount; i++) {
    const char = Object.keys(l33t)[Math.floor(Math.random() * Object.keys(l33t).length)];
    const replacement: string = l33t[char] ?? "";
    updatedName = updatedName.replaceAll(char, replacement);
  }
  return updatedName;
};
