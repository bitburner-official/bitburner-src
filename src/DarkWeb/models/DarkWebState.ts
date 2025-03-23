import { EventEmitter } from "../../utils/EventEmitter";
import { moveServer } from "../controllers/DarkWebNetworkGenerator";
import { Server } from "../../Server/Server";

export const NET_WIDTH = 6;
export const NET_DEPTH = 12;

export const DarkWebNetwork: (Server | null)[][] = new Array(NET_DEPTH)
  .fill(null)
  .map(() => new Array(NET_WIDTH).fill(null) as (Server | null)[]);

/** Event emitter to allow the UI to subscribe to Go gameplay updates in order to trigger rerenders properly */
export const DarkWebEvents = new EventEmitter();

export const startDarkwebMovement = () =>
  setInterval(() => {
    const x = Math.floor(Math.random() * DarkWebNetwork.length);
    const y = Math.floor(Math.random() * DarkWebNetwork[0].length);
    const server = DarkWebNetwork[x][y];
    if (server === null) {
      return;
    }
    moveServer(server);
  }, 2000);
