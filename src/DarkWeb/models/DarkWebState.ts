import { EventEmitter } from "../../utils/EventEmitter";
import { Server } from "../../Server/Server";
import { BaseServer } from "../../Server/BaseServer";
import { mutateDarkWeb } from "../controllers/DarkWebNetworkMovement";

export const NET_WIDTH = 8;
export const NET_DEPTH = 24;
export const SERVER_DENSITY = 0.4;

/** Event emitter to allow the UI to subscribe to Go gameplay updates in order to trigger rerenders properly */
export const DarkWebEvents = new EventEmitter();

export type DarkWebState = {
  openServer: BaseServer | null;
  DarkWebNetwork: (BaseServer | null)[][];
};

export const DarkWebState: DarkWebState = {
  openServer: null,

  DarkWebNetwork: new Array(NET_DEPTH).fill(null).map(() => new Array(NET_WIDTH).fill(null) as (Server | null)[]),
};

export const startDarkwebMovement = () =>
  setInterval(() => {
    mutateDarkWeb();
  }, 2000);
