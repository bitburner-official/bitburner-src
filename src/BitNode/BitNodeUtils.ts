import { GetServer } from "../Server/AllServers";
import { Server } from "../Server/Server";
import { SpecialServers } from "../Server/data/SpecialServers";

export function isBitNodeFinished(): boolean {
  const wd = GetServer(SpecialServers.WorldDaemon);
  if (!(wd instanceof Server)) {
    throw new Error("WorldDaemon is not a normal server. This is a bug. Please contact developers.");
  }
  return wd.backdoorInstalled;
}
