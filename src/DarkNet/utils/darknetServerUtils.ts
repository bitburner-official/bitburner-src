import { DarknetServer } from "../../Server/DarknetServer";
import { GetServer } from "../../Server/AllServers";

export const getDarknetServer = (host: string): DarknetServer | null => {
  const server = GetServer(host);
  if (!server || !(server instanceof DarknetServer)) {
    return null;
  }
  return server;
};

export function getDarknetServerOrThrow(host: string): DarknetServer {
  const server = GetServer(host);
  if (!server) {
    throw new Error(`Server ${host} does not exist.`);
  }
  if (!(server instanceof DarknetServer)) {
    throw new Error(`Server ${host} is not a darknet server.`);
  }
  return server;
}

/**
 * Darknet server data.
 */
export interface DarknetServerData {
  /** Hostname. Must be unique */
  hostname: string;
  /** IP Address. Must be unique */
  ip: string;
  /** Flag indicating whether the player has admin/root access to this server */
  hasAdminRights: boolean;
  /** Flag indicating whether the player's terminal is currently connected to this server */
  isConnectedTo: boolean;
  /** Number of CPU cores */
  cpuCores: number;
  /** Used RAM (GB). i.e. unavailable RAM */
  ramUsed: number;
  /** Max RAM (GB) of this server */
  maxRam: number;
  /** Flag indicating whether this server has a backdoor installed by the player */
  backdoorInstalled: boolean;
  /** If the server has a stasis link applied */
  hasStasisLink: boolean;
  /** The amount of ram blocked by the server owner */
  blockedRam: number;
  /**
   * The model of the server. Similar models have similar vulnerabilities. The model list is intentionally undocumented.
   * You are supposed to experiment and discover the models.
   */
  modelId: string;
  /** The generic password prompt for the server */
  staticPasswordHint: string;
  /** Data associated with the password hint */
  passwordHintData: string;
  /** The difficulty rating of the server, associated with its original depth in the net */
  difficulty: number;
  /** The depth of the server in the net */
  depth: number;
  /** The charisma skill required to heartbleed the server */
  requiredCharismaSkill: number;
  /** The interval at which the server periodically adds to its logs, in seconds. */
  logTrafficInterval: number;
  /** If this darknet server cannot be moved. True for fixed/story servers. */
  isStationary: boolean;
  /** Whether this server was purchased by the player. Always false for darknet servers */
  purchasedByPlayer: boolean;
}
