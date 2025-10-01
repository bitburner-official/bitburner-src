import { DarknetServer } from "../../Server/DarknetServer";
import { GetServer } from "../../Server/AllServers";
import { BaseServer } from "../../Server/BaseServer";
import { DarknetState } from "../models/DarknetState";
import { DarknetServerData } from "../models/DarknetServerOptions";
import { exampleDarknetServer } from "../Enums";

export const isDarknetServer = (server: unknown): server is DarknetServer => {
  if (typeof server !== "object" || server === null) {
    return false;
  }
  for (const key in exampleDarknetServer) {
    if (!(key in server)) {
      return false;
    }
  }
  return true;
};

export const getDarknetData = (server: BaseServer | null): DarknetServerData | null => {
  if (isDarknetServer(server)) {
    return server;
  }
  return null;
};

export const getDarknetDataOrThrow = (server: BaseServer | null): DarknetServerData => {
  const darknetData = getDarknetData(server);
  if (!darknetData) {
    throw new Error(
      server != null ? `${server.hostname} does not have darknet data` : "null was passed to getDarknetDataOrThrow",
    );
  }
  return darknetData;
};

export const getDarknetServerSafely = (hostnameOrIp: string): DarknetServer | null => {
  const server = GetServer(hostnameOrIp);
  if (!server || !(server instanceof DarknetServer)) {
    return null;
  }
  return server;
};

export const isImmutable = (server: DarknetServer) =>
  server === DarknetState.openServer || server.isConnectedTo || server.hasStasisLink;
