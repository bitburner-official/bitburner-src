import { EventEmitter } from "../../utils/EventEmitter";
import { addGuaranteedConnection, getDarkWebServers, moveServer } from "../controllers/DarkWebNetworkGenerator";
import { Server } from "../../Server/Server";
import { BaseServer } from "../../Server/BaseServer";

export const NET_WIDTH = 6;
export const NET_DEPTH = 16;

export type DarkWebState = {
  openServer: BaseServer | null;
  DarkWebNetwork: (BaseServer | null)[][];
}

export const DarkWebState : DarkWebState = {
  openServer: null,

  DarkWebNetwork: new Array(NET_DEPTH)
    .fill(null)
    .map(() => new Array(NET_WIDTH).fill(null) as (Server | null)[])
}

/** Event emitter to allow the UI to subscribe to Go gameplay updates in order to trigger rerenders properly */
export const DarkWebEvents = new EventEmitter();

export const startDarkwebMovement = () =>
  setInterval(() => {
    const servers = getDarkWebServers();
    if (servers.length === 0) {
      return;
    }

    const server1 = servers[Math.floor(Math.random() * servers.length)];
    moveServer(server1);

    const server2 = servers[Math.floor(Math.random() * servers.length)];
    addGuaranteedConnection(server2);

  }, 2000);
