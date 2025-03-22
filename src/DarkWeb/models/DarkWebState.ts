import { EventEmitter } from "../../utils/EventEmitter";
import { DarkWebServer } from "./DarkWebServer";
import { getEmptyNetwork, populateDarkWebNetwork } from "../controllers/DarkWebNetworkGenerator";

export const DarkWebNetwork: (DarkWebServer | null)[][] = getEmptyNetwork();

/** Event emitter to allow the UI to subscribe to Go gameplay updates in order to trigger rerenders properly */
export const DarkWebEvents = new EventEmitter();

populateDarkWebNetwork();
