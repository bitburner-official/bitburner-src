import { EventEmitter } from "../../utils/EventEmitter";
import {
  addGuaranteedConnection,
  addRandomServer,
  disconnectServer,
  getDarkWebServers,
  moveServer,
} from "../controllers/DarkWebNetworkGenerator";
import { Server } from "../../Server/Server";
import { BaseServer } from "../../Server/BaseServer";
import { DeleteServer } from "../../Server/AllServers";

export const NET_WIDTH = 8;
export const NET_DEPTH = 16;
export const SERVER_DENSITY = 0.6;


/** Event emitter to allow the UI to subscribe to Go gameplay updates in order to trigger rerenders properly */
export const DarkWebEvents = new EventEmitter();

export type DarkWebState = {
  openServer: BaseServer | null;
  DarkWebNetwork: (BaseServer | null)[][];
}

export const DarkWebState : DarkWebState = {
  openServer: null,

  DarkWebNetwork: new Array(NET_DEPTH)
    .fill(null)
    .map(() => new Array(NET_WIDTH).fill(null) as (Server | null)[]),
}

export const startDarkwebMovement = () =>
  setInterval(() => {
    const servers = getDarkWebServers();
    if (servers.length === 0) {
      return;
    }

    // remove server
    const serverToDelete = servers[Math.floor(Math.random() * servers.length)];
    disconnectServer(serverToDelete);
    DeleteServer(serverToDelete.hostname);

    // move server
    const server1 = servers[Math.floor(Math.random() * servers.length)];
    moveServer(server1);

    // add connections
    const server2 = servers[Math.floor(Math.random() * servers.length)];
    addGuaranteedConnection(server2);
    addGuaranteedConnection(server2);

    // sever all connections
    const server3 = servers[Math.floor(Math.random() * servers.length)];
    disconnectServer(server3);


    // balance network to stay at a certain density
    while (getDarkWebServers().length < NET_DEPTH * NET_WIDTH * SERVER_DENSITY) {
      addRandomServer();
    }

  }, 2000);
