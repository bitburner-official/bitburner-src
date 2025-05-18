import { DarknetState, NET_WIDTH } from "../models/DarknetState";
import { SnackbarEvents } from "../../ui/React/Snackbar";
import { ToastVariant } from "@enums";
import { sleep } from "../../Go/boardAnalysis/goAI";
import {
  addRandomServers,
  balanceServers,
  getDarknetServers,
  moveRandomServers,
  restartAllServers,
  deleteRandomServers,
} from "./DarknetNetworkMovement";
import { BaseServer } from "../../Server/BaseServer";
import { getNetDepth } from "../effects/labyrinth";

export const WEBSTORM = async (suppressToast = false) => {
  DarknetState.isMutating = false;
  if (!suppressToast) {
    SnackbarEvents.emit(`DARKNET WEBSTORM APPROACHING`, ToastVariant.ERROR, 5000);
  }
  await sleep(5000);

  const serversToDelete = getDarknetServers().length * 0.6 + (Math.random() * getNetDepth() - 6);
  deleteRandomServers(serversToDelete);
  moveRandomServers((getDarknetServers().length - serversToDelete) * 0.6);
  restartAllServers();

  await sleep(4000);
  addRandomServers(NET_WIDTH);
  await sleep(4000);
  addRandomServers(NET_WIDTH * 2);
  await sleep(4000);
  addRandomServers(NET_WIDTH * 2);
  await sleep(8000);
  balanceServers();
  await sleep(5000);
  DarknetState.isMutating = true;
};

// TODO: launch this if the player has been offline for long enough?
export const applyOfflineWebstorm = () => {
  const serversToDelete = getDarknetServers().length * 0.5 + (Math.random() * getNetDepth() - 4);
  deleteRandomServers(serversToDelete);
  restartAllServers();

  balanceServers();
};

export const handleStormSeed = (server: BaseServer) => {
  server.programs = server.programs.filter((p) => p !== "webstorm");
  DarknetState.lastStormTime = new Date();
  void WEBSTORM();
};
