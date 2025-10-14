import { DarknetServer } from "../../Server/DarknetServer";
import { GetServer } from "../../Server/AllServers";
import { DarknetState } from "../models/DarknetState";

export const getDarknetServerSafely = (hostnameOrIp: string): DarknetServer | null => {
  const server = GetServer(hostnameOrIp);
  if (!server || !(server instanceof DarknetServer)) {
    return null;
  }
  return server;
};

export const isImmutable = (server: DarknetServer) =>
  server === DarknetState.openServer || server.isConnectedTo || server.hasStasisLink;
