import { getRandomIcon, Minigames } from "../controllers/DarknetServerGenerator";
import { Icon, labIcon } from "../controllers/ServerIcon";
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
import { getLabyrinthDetails } from "./labyrinth";
import { DarknetServer } from "../../Server/DarknetServer";

export const ResponseStatus = {
  SUCCESS: "200 Success",
  AUTH_FAILURE: "401 Unauthorized",
  NOT_FOUND: "404 Not Found",
  TIMEOUT: "408 Request Timeout",
  MOVED_PERMANENTLY: "301 Moved Permanently",
  I_AM_A_TEAPOT: "418 I'm a teapot",
} as const;

export type ResponseStatus = (typeof ResponseStatus)[keyof typeof ResponseStatus];

export type PasswordResponse = {
  status: ResponseStatus;
  passwordAttempted: string;
  message: string;
  data?: string;
  responseTime?: number;
};

export type DnetServerData = {
  icon: Icon | typeof labIcon;
  password: string;
  minigameType: Minigames;
  staticPasswordHint: string;
  passwordHintData?: string;
  difficulty: number;
  x: number;
  y: number;
};

export type DnetServer = DnetServerData & {
  hasStasisLink: boolean;
  ramBlock: number;
  logTrafficInterval: number;
};

export const DnetServerBuilder = (options: DnetServerData, name: string = getName()): DarknetServer => {
  const maxRam = 16 * 2 ** Math.floor(options.difficulty / 4);
  const ramBlock = getRamBlock(maxRam);
  const darknetData: DnetServer = {
    ramBlock,
    icon: options.icon ?? getRandomIcon(),
    password: options.password,
    minigameType: options.minigameType,
    staticPasswordHint: options.staticPasswordHint,
    passwordHintData: options.passwordHintData ?? "",
    difficulty: options.difficulty ?? 1,
    x: options.x ?? -1,
    y: options.y ?? -1,
    hasStasisLink: false,
    logTrafficInterval: 1 + 30 * 0.9 ** options.difficulty,
  };

  const labDetails = getLabyrinthDetails();
  const labDifficulty = labDetails.cha;
  const depth = darknetData.difficulty;
  const depthScaling = depth < 2 ? (depth / labDetails.depth) * labDifficulty * 0.85 : depth * 5;
  const levelVariance = (Math.random() * 3 - 1) * depth;
  const requiredLevel = Math.max(Math.floor(depthScaling + levelVariance), 1);

  const server = new DarknetServer({
    hostname: name,
    ip: createUniqueRandomIp(),
    organizationName: "darkweb",
    maxRam,
    requiredHackingSkill: requiredLevel,
    hackDifficulty: 5 + darknetData.difficulty,
    moneyAvailable: 0,
    numOpenPortsRequired: 69,
    adminRights: false,
    darknetData: darknetData,
  });
  server.updateRamUsed(ramBlock);
  AddToAllServers(server);

  return server;
};

export const getName = (): string => {
  return decorateName(getBaseName());
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

    if (Math.random() < 0.05) {
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

const getRamBlock = (maxRam: number): number => {
  if (maxRam === 16) {
    return [0, 1, 2][Math.floor(Math.random() * 2)];
  }
  if (maxRam <= 32) {
    return [0, 2, 4][Math.floor(Math.random() * 2)];
  }

  if (maxRam <= 64) {
    return [16, 32, maxRam - 8][Math.floor(Math.random() * 3)];
  }

  return [maxRam, maxRam - 8, maxRam - 64, maxRam / 2][Math.floor(Math.random() * 4)];
};
