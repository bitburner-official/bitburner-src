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
import type { DarknetResponseCode } from "@nsdefs";
import type { MinigamesType } from "../Enums";
import { DarknetState } from "./DarknetState";
import { getRamBlock } from "../effects/ramblock";
import { hasFullDarknetAccess } from "../effects/effects";
import { getFriendlyType, TypeAssertionError } from "../../utils/TypeAssertion";
import { isIPAddress } from "../../Types/strings";
import { roundToTwo } from "../../utils/helpers/roundToTwo";

export type PasswordResponse = {
  code: DarknetResponseCode;
  passwordAttempted: string;
  passwordExpected?: string;
  message: string;
  data?: string;
};

export function isPasswordResponse(v: unknown): v is PasswordResponse {
  return (
    v != null &&
    typeof v === "object" &&
    "code" in v &&
    "passwordAttempted" in v &&
    "message" in v &&
    typeof v.passwordAttempted === "string"
  );
}

export function assertPasswordResponse(v: unknown): asserts v is PasswordResponse {
  const type = getFriendlyType(v);
  if (!isPasswordResponse(v)) {
    console.error("The value is not a PasswordResponse. Value:", v);
    throw new TypeAssertionError(`The value is not a PasswordResponse. Its type is ${type}.`, type);
  }
}

export type DarknetServerOptions = {
  password: string;
  modelId: MinigamesType;
  staticPasswordHint: string;
  passwordHintData?: string;
  difficulty: number;
  depth: number;
  leftOffset: number;
  name?: string;
  preventBlockedRam?: boolean;
};

export const DnetServerBuilder = (options: DarknetServerOptions): DarknetServer => {
  const maxRam = getMaxRam(options.difficulty);
  const ramBlock = options.preventBlockedRam ? 0 : getRamBlock(maxRam);
  const name = options.name ?? generateDarknetServerName();

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
    isStationary: false,
  });
  server.updateRamUsed(ramBlock);
  DarknetState.offlineServers.delete(name);
  DarknetState.offlineServers.delete(server.ip);
  AddToAllServers(server);

  return server;
};

export const generateDarknetServerName = (): string => {
  if (Math.random() < 0.03 && DarknetState.offlineServers.size > 0 && hasFullDarknetAccess()) {
    // Reuse a hostname that went offline. Note that we're only reusing hostnames,
    // not IPs. This asymmetry is intentional - people find hostnames easier to
    // work with, and this adds a bit of friction to compensate.

    // Use an iterator to directly skip to the appropriate position. Sets don't
    // have a way to index by offset, and converting to an array would be wasteful.
    const offset = Math.floor(Math.random() * DarknetState.offlineServers.size);
    const it = DarknetState.offlineServers.values();
    for (let i = 0; i < offset; ++i) {
      it.next();
    }
    // The set contains both IPs and hostnames. If we hit an IP, keep going
    // forward until we find a hostname. *If* the Set implements traversal in
    // the same order as insertion, then the fact that we insert IPs first
    // means that we will always find a hostname and the sampling will be
    // unbiased. Otherwise, it will be Mostly Unbiased(TM), and in rare cases
    // we will fall off the end without reusing a name.
    let serverName = it.next().value;
    while (serverName != null && isIPAddress(serverName)) {
      serverName = it.next().value;
    }
    if (serverName != null) {
      return serverName;
    }
  }
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
  let count = 0;
  do {
    if (count++ > 20) {
      // Just in case we hit a lot of the same name mutations, or if the player
      // messes with Math.random(), prevent an infinite loop
      updatedName += `/T${Date.now()}`;
      continue;
    }

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

const getMaxRam = (difficulty: number): number => {
  const baseRam = 16 * 2 ** Math.floor(difficulty / 6);
  const sizeMutations = [0.5, 1, 1, 1.15, 1.4];
  const mutation = sizeMutations[Math.floor(Math.random() * sizeMutations.length)];
  return roundToTwo(Math.max(baseRam * mutation, 16));
};
