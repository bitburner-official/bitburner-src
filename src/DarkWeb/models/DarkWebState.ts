import { EventEmitter } from "../../utils/EventEmitter";
import { DarkWebServer } from "./DarkWebServer";
import { getEmptyNetwork, moveServer, populateDarkWebNetwork } from "../controllers/DarkWebNetworkGenerator";

export const DarkWebNetwork: (DarkWebServer | null)[][] = getEmptyNetwork();

/** Event emitter to allow the UI to subscribe to Go gameplay updates in order to trigger rerenders properly */
export const DarkWebEvents = new EventEmitter();

populateDarkWebNetwork();

setInterval(() => {
  const x = Math.floor(Math.random() * DarkWebNetwork.length);
  const y = Math.floor(Math.random() * DarkWebNetwork[0].length);
  const server = DarkWebNetwork[x][y];
  if (server === null) {
    return;
  }
  moveServer(server);
}, 2000)