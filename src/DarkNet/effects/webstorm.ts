import { DarknetEvents, DarknetState, triggerNextUpdate } from "../models/DarknetState";
import { SnackbarEvents } from "../../ui/React/Snackbar";
import { CompletedProgramName, ToastVariant } from "@enums";
import {
  addRandomDarknetServers,
  balanceDarknetServers,
  deleteRandomDarknetServers,
  moveRandomDarknetServers,
  restartAllDarknetServers,
  validateDarknetNetwork,
} from "../controllers/NetworkMovement";
import { BaseServer } from "../../Server/BaseServer";
import { getNetDepth } from "./labyrinth";
import { NET_WIDTH } from "../Enums";
import { sleep } from "../../utils/Utility";
import { getAllMovableDarknetServers } from "../utils/darknetNetworkUtils";

const validateDarknetNetworkAndEmitDarknetEvent = (): void => {
  validateDarknetNetwork();
  DarknetEvents.emit("RefreshUI");
};

export const launchWebstorm = async (suppressToast = false) => {
  if (!DarknetState.allowMutating) {
    return;
  }
  // Exit immediately if receivedPrestigeEvent is true. There is no need to set DarknetState.allowMutating to true in
  // that case. That will be done in prestigeDarknetState.
  let receivedPrestigeEvent = false;
  const unsubscribe = DarknetEvents.subscribe((eventType) => {
    if (eventType !== "Prestige") {
      return;
    }
    receivedPrestigeEvent = true;
  });
  DarknetState.allowMutating = false;
  if (!suppressToast) {
    SnackbarEvents.emit(`DARKNET WEBSTORM APPROACHING`, ToastVariant.ERROR, 5000);
  }
  await sleep(5000);
  if (receivedPrestigeEvent) {
    unsubscribe();
    return;
  }

  const serversToDelete = getAllMovableDarknetServers().length * 0.6 + (Math.random() * getNetDepth() - 6);
  deleteRandomDarknetServers(serversToDelete);
  moveRandomDarknetServers((getAllMovableDarknetServers().length - serversToDelete) * 0.6);
  restartAllDarknetServers();
  validateDarknetNetworkAndEmitDarknetEvent();
  triggerNextUpdate();

  await sleep(4000);
  if (receivedPrestigeEvent) {
    unsubscribe();
    return;
  }
  addRandomDarknetServers(NET_WIDTH);
  validateDarknetNetworkAndEmitDarknetEvent();
  triggerNextUpdate();

  await sleep(4000);
  if (receivedPrestigeEvent) {
    unsubscribe();
    return;
  }
  addRandomDarknetServers(NET_WIDTH * 2);
  validateDarknetNetworkAndEmitDarknetEvent();
  triggerNextUpdate();

  await sleep(4000);
  if (receivedPrestigeEvent) {
    unsubscribe();
    return;
  }
  addRandomDarknetServers(NET_WIDTH * 2);
  validateDarknetNetworkAndEmitDarknetEvent();
  triggerNextUpdate();

  await sleep(8000);
  if (receivedPrestigeEvent) {
    unsubscribe();
    return;
  }
  balanceDarknetServers();
  validateDarknetNetworkAndEmitDarknetEvent();
  triggerNextUpdate();

  await sleep(5000);
  unsubscribe();
  DarknetState.allowMutating = true;
};

export const handleStormSeed = (server: BaseServer) => {
  server.programs = server.programs.filter((p) => p !== CompletedProgramName.stormSeed);
  DarknetState.lastStormTime = new Date();
  launchWebstorm().catch((error) => console.error(error));
};
