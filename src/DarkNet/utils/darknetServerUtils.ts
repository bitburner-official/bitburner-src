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
