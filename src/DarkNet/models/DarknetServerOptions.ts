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
import { DarknetServer as IDarknetServer, ResponseStatusType } from "@nsdefs";
import { MinigamesType } from "../Enums";

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

/** Represents a server on the darknet. Includes fields not revealed to players. */
export interface DarknetServerData extends IDarknetServer {
  /** The icon of the server, used for display */
  icon: Icon | typeof labIcon;
  /** The location of the server in its row on the darknet */
  leftOffset: number;
  /** The password for the server, used for authentication */
  password: string;
}

export const DnetServerBuilder = (
  options: DarknetServerOptions,
  name: string = getDarknetServerName(),
): DarknetServer => {
  const maxRam = 16 * 2 ** Math.floor(options.difficulty / 4);
  const ramBlock = getRamBlock(maxRam);

  const labDetails = getLabyrinthDetails();
  const labDifficulty = labDetails.cha;
  const depth = options.difficulty;
  const depthScaling = depth < 2 ? depth * 10 : (depth / labDetails.depth) ** 1.5 * labDifficulty * 0.85;
  const levelVariance = (Math.random() * 3 - 1) * depth;
  const requiredLevel = Math.max(Math.floor(depthScaling + levelVariance), 1);

  const darknetData = {
    ramBlock,
    icon: options.icon ?? getRandomIcon(),
    password: options.password,
    modelId: options.modelId,
    staticPasswordHint: options.staticPasswordHint,
    passwordHintData: options.passwordHintData ?? "",
    difficulty: options.difficulty ?? 1,
    depth: options.depth ?? -1,
    leftOffset: options.leftOffset ?? -1,
    hasStasisLink: false,
    logTrafficInterval: 1 + 30 * 0.9 ** options.difficulty,
    requiredCharismaSkill: requiredLevel,
  };

  const server = new DarknetServer({
    hostname: name,
    ip: createUniqueRandomIp(),
    organizationName: "darkweb",
    maxRam,
    hasAdminRights: false,
    isConnectedTo: false,
    ramUsed: 0,
    purchasedByPlayer: false,
    ...darknetData,
  });
  server.updateRamUsed(ramBlock);
  AddToAllServers(server);

  return server;
};

export const getDarknetServerName = (): string => {
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
