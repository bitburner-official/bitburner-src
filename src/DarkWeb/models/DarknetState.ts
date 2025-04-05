import { EventEmitter } from "../../utils/EventEmitter";
import { Server } from "../../Server/Server";
import { BaseServer } from "../../Server/BaseServer";
import { mutateDarknet } from "../controllers/DarknetNetworkMovement";

export const NET_WIDTH = 8;
export const NET_DEPTH = 24;
export const SERVER_DENSITY = 0.4;

/** Event emitter to allow the UI to subscribe to Go gameplay updates in order to trigger rerenders properly */
export const DarknetEvents = new EventEmitter();

export type DarknetState = {
  isMutating: boolean;
  openServer: BaseServer | null;
  Network: (BaseServer | null)[][];
};

export const DarknetState: DarknetState = {
  isMutating: true,
  openServer: null,

  Network: new Array(NET_DEPTH).fill(null).map(() => new Array(NET_WIDTH).fill(null) as (Server | null)[]),
};

export const startDarknetMovement = () => setInterval(() => mutateDarknet(), 4000);
